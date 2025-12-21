import { Router, Request, Response } from 'express';
import Docker from 'dockerode';
import { logger } from '../utils/logger.js';
import { demuxStream } from '../utils/dockerStream.js';
import { languageImages, getDefaultFileName, buildExecCommand as getExecutionCommand } from '../utils/execution.js';

export const streamExecutionRouter = Router();
const docker = new Docker();


// Store active sessions
const activeSessions = new Map<string, {
  outputBuffer: string[];
  errorBuffer: string[];
  finished: boolean;
}>();

// Interface for project files
interface ProjectFile {
  name: string;
  content: string;
}


// Start streaming execution
streamExecutionRouter.post('/stream-start', async (req, res) => {
  const { code, language, sessionId, files, mainFile } = req.body;

  // Support both single file (code) and multi-file (files array) modes
  if ((!code && !files) || !language || !sessionId) {
    res.status(400).json({ success: false, error: 'Missing required fields' });
    return;
  }

  try {
    // Determine if this is a multi-file project
    const isMultiFile = files && Array.isArray(files) && files.length > 0;
    const projectFiles: ProjectFile[] = isMultiFile
      ? files
      : [{ name: getDefaultFileName(language, 'stream', code), content: code }];

    // The file to run
    const fileToRun = isMultiFile ? (mainFile || projectFiles[0].name) : projectFiles[0].name;

    // Base directory for files
    const baseDir = '/tmp/stream-exec';

    // Build setup commands
    const setupCommands: string[] = [
      `rm -rf ${baseDir}`,
      `mkdir -p ${baseDir}`
    ];

    // Add directory creation commands for nested files
    const dirs = new Set<string>();
    projectFiles.forEach(f => {
      const parts = f.name.split('/');
      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
          dirs.add(parts.slice(0, i).join('/'));
        }
      }
    });
    dirs.forEach(d => {
      setupCommands.push(`mkdir -p ${baseDir}/${d}`);
    });

    // Add file write commands
    projectFiles.forEach(file => {
      const filePath = `${baseDir}/${file.name}`;
      const escapedContent = file.content.replace(/'/g, "'\\''");
      setupCommands.push(
        `cat > ${filePath} << 'EOFFILE'\n${escapedContent}\nEOFFILE`
      );
    });

    // Get execution command
    const execCommand = getExecutionCommand(language, baseDir, projectFiles, fileToRun);
    setupCommands.push(execCommand);

    // Combine all commands
    const fullCommand = setupCommands.join(';');

    // Initialize session
    activeSessions.set(sessionId, {
      outputBuffer: [],
      errorBuffer: [],
      finished: false
    });

    // Execute asynchronously (don't wait for completion)
    (async () => {
      let attempts = 0;
      let stdout = '';
      let stderr = '';

      while (attempts < 3) {
        try {
          // Use the persistent container from docker-compose
          const containerName = languageImages[language];
          const container = docker.getContainer(containerName);

          logger.info(`Starting execution for ${sessionId} using container ${containerName} (attempt ${attempts + 1})`);

          // Create execution
          const exec = await container.exec({
            Cmd: ['sh', '-c', fullCommand],
            AttachStdout: true,
            AttachStderr: true,
            Tty: false
          });

          // Start stream and immediately attach listeners
          const stream = await exec.start({ hijack: true });

          // Attach listeners BEFORE doing anything else
          const outputPromise = demuxStream(stream);

          // Set timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              stream.destroy();
              reject(new Error('Execution timeout (10 seconds)'));
            }, 10000);
          });

          // Wait for completion
          const result = await Promise.race([outputPromise, timeoutPromise]);
          stdout = result.stdout;
          stderr = result.stderr;

          const session = activeSessions.get(sessionId);
          if (session) {
            if (stdout) session.outputBuffer.push(stdout);
            if (stderr) session.errorBuffer.push(stderr);
            session.finished = true;
          }

          logger.info(`Execution completed for ${sessionId}, output: ${stdout.length} chars, errors: ${stderr.length} chars`);
          break; // Success, exit retry loop
        } catch (error) {
          attempts++;
          logger.error(`Execution error for ${sessionId} (attempt ${attempts}):`, error);

          if (attempts >= 3) {
            const session = activeSessions.get(sessionId);
            if (session) {
              session.errorBuffer.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
              session.finished = true;
            }
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    })();

    res.json({ success: true, sessionId });
  } catch (error) {
    logger.error('Stream execution failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get output stream (SSE)
streamExecutionRouter.get('/stream-output/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Wait for execution to finish with timeout
    let attempts = 0;
    while (!session.finished && attempts < 300) { // 30 second timeout
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    logger.info(`Execution finished for ${sessionId}. Output: ${session.outputBuffer.length} items, Errors: ${session.errorBuffer.length} items`);

    // Send buffered stdout
    for (const output of session.outputBuffer) {
      if (output.length > 0) {
        res.write(`data: ${JSON.stringify({ type: 'stdout', data: output })}\n\n`);
      }
    }

    // Send buffered stderr
    for (const error of session.errorBuffer) {
      if (error.length > 0) {
        res.write(`data: ${JSON.stringify({ type: 'stderr', data: error })}\n\n`);
      }
    }

    // Send end signal
    res.write(`data: ${JSON.stringify({ type: 'end', data: '' })}\n\n`);
    res.end();

    // Cleanup
    activeSessions.delete(sessionId);

  } catch (error) {
    logger.error('Stream output error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', data: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
    res.end();

    // Cleanup
    activeSessions.delete(sessionId);
  }
});

// Send input to stream (not supported in new implementation)
streamExecutionRouter.post('/stream-input', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Interactive input not supported in stream execution'
  });
});

// Stop stream
streamExecutionRouter.post('/stream-stop', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ success: false, error: 'Missing sessionId' });
    return;
  }

  const session = activeSessions.get(sessionId);
  if (session) {
    session.finished = true;
    activeSessions.delete(sessionId);
    logger.info(`Stream stopped: ${sessionId}`);
  }

  res.json({ success: true });
});



