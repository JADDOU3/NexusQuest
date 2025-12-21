import express, { Request, Response } from 'express';
import Docker from 'dockerode';
import { logger } from '../utils/logger.js';
import { languageImages, getDefaultFileName, buildExecCommand } from '../utils/execution.js';

const router = express.Router();
const docker = new Docker();

interface SimplePlaygroundRequest extends Request {
  body: {
    code: string;
    language: 'python' | 'java' | 'javascript' | 'cpp';
    sessionId: string;
  };
}


/**
 * POST /api/simple-playground/execute
 * Execute code and return full output at once (for mobile compatibility)
 */
router.post('/execute', async (req: SimplePlaygroundRequest, res: Response) => {
  const { code, language, sessionId } = req.body;

  if (!code || !language || !sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: code, language, sessionId',
    });
  }

  const containerName = `nexusquest-playground-${sessionId}`;

  try {
    // Check and remove existing container
    try {
      const existingContainer = docker.getContainer(containerName);
      await existingContainer.inspect();
      logger.info(`Removing existing container: ${containerName}`);
      await existingContainer.remove({ force: true });
    } catch (error: any) {
      if (error.statusCode !== 404) {
        logger.warn(`Error checking existing container: ${error.message}`);
      }
    }

    // Create container
    const container = await docker.createContainer({
      Image: languageImages[language],
      name: containerName,
      Cmd: ['sh', '-c', 'while true; do sleep 1; done'],
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      HostConfig: {
        Memory: 256 * 1024 * 1024,
        AutoRemove: false,
        NetworkMode: 'none',
        Tmpfs: {
          '/tmp': 'rw,exec,nosuid,size=50m'
        }
      }
    });

    await container.start();
    logger.info(`Container started: ${containerName}`);

    // Write code to file
    let fileName: string;
    let filePath: string;
    let className: string | undefined;

    // Determine file name using shared helper (keeps historical behavior for simple variant)
    fileName = getDefaultFileName(language, 'simple', code);
    filePath = `/tmp/${fileName}`;
    if (language === 'java') {
      const classMatch = code.match(/public\s+class\s+(\w+)/);
      className = classMatch ? classMatch[1] : 'Main';
      logger.info(`Java class name: ${className}, file: ${fileName}`);
    }

    // Write code using cat with heredoc
    const escapedCode = code.replace(/'/g, "'\\''");
    const writeCmd = [
      `cat > ${filePath} << 'EOFCODE'`,
      escapedCode,
      'EOFCODE'
    ].join('\n');
    
    const writeExec = await container.exec({
      Cmd: ['sh', '-c', writeCmd],
      AttachStdout: true,
      AttachStderr: true
    });
    await writeExec.start({});

    // Prepare execution command
    let execCommand: string;

    if (language === 'python') {
      execCommand = `python3 -u ${filePath}`;
    } else if (language === 'javascript') {
      execCommand = `node ${filePath}`;
    } else if (language === 'cpp') {
      execCommand = `g++ -std=c++20 ${filePath} -o /tmp/a.out && /tmp/a.out`;
    } else if (language === 'java') {
      const finalClassName = className || 'Main';
      execCommand = `cd /tmp && javac ${fileName} && java -cp /tmp ${finalClassName}`;
      logger.info(`Java execution command: ${execCommand}`);
    } else {
      await container.remove({ force: true });
      return res.status(400).json({ success: false, error: 'Unsupported language' });
    }

    // Execute code
    const exec = await container.exec({
      Cmd: ['sh', '-c', execCommand],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });

    const stream = await exec.start({ hijack: true });

    let output = '';
    let hasError = false;

    // Collect all output
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        stream.end();
        reject(new Error('Execution timeout (10s)'));
      }, 10000);

      stream.on('data', (chunk: Buffer) => {
        const data = chunk.toString('utf8').replace(/[\x00-\x08]/g, '');
        output += data;
      });

      stream.on('end', () => {
        clearTimeout(timeout);
        resolve();
      });

      stream.on('error', (err) => {
        clearTimeout(timeout);
        hasError = true;
        reject(err);
      });
    });

    // Clean up container
    try {
      await container.remove({ force: true });
      logger.info(`Container removed: ${containerName}`);
    } catch (err) {
      logger.warn(`Failed to remove container: ${err}`);
    }

    // Send response
    return res.json({
      success: !hasError,
      output: output || 'Code executed (no output)',
      error: hasError ? 'Execution error' : undefined
    });

  } catch (error: any) {
    logger.error(`Playground execution error: ${error.message}`);
    
    // Clean up container on error
    try {
      const container = docker.getContainer(containerName);
      await container.remove({ force: true });
    } catch (err) {
      // Ignore cleanup errors
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute code',
      output: ''
    });
  }
});

export default router;
