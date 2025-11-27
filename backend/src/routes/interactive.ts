import { Router } from 'express';
import Docker from 'dockerode';
import { logger } from '../utils/logger.js';

export const interactiveRouter = Router();
const docker = new Docker();

const languageImages: Record<string, string> = {
  python: 'nexusquest-python-runner',
  javascript: 'nexusquest-javascript-runner',
  java: 'nexusquest-java-runner',
  cpp: 'nexusquest-cpp-runner',
  go: 'nexusquest-go-runner'
};

// Store active interactive sessions
const activeSessions = new Map<string, { container: Docker.Container; stream: NodeJS.WritableStream }>();

// Start interactive execution
interactiveRouter.post('/run-interactive', async (req, res) => {
  const { code, language, sessionId } = req.body;

  if (!code || !language || !sessionId) {
    res.status(400).json({ success: false, error: 'Missing required fields' });
    return;
  }

  try {
    const containerName = `nexusquest-interactive-${sessionId}`;
    
    // Create script file based on language
    let scriptContent = '';
    let command: string[] = [];
    
    if (language === 'python') {
      scriptContent = code;
      command = ['python3', '-u', '-c', code];
    } else if (language === 'javascript') {
      scriptContent = code;
      command = ['node', '-e', code];
    } else if (language === 'cpp') {
      // For C++, we need to compile and run
      scriptContent = code;
      command = ['sh', '-c', `echo '${code.replace(/'/g, "'\\''")}' > /tmp/main.cpp && g++ -o /tmp/a.out /tmp/main.cpp && /tmp/a.out`];
    } else if (language === 'java') {
      // Extract class name from code
      const classMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : 'Main';
      command = ['sh', '-c', `echo '${code.replace(/'/g, "'\\''")}' > /tmp/${className}.java && cd /tmp && javac ${className}.java && java ${className}`];
    }

    // Create container with interactive settings
    const container = await docker.createContainer({
      Image: languageImages[language],
      name: containerName,
      Cmd: command,
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      HostConfig: {
        Memory: 256 * 1024 * 1024, // 256MB
        AutoRemove: true,
        NetworkMode: 'none'
      }
    });

    // Start container
    await container.start();

    // Attach to container
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true
    });

    // Store session
    activeSessions.set(sessionId, { container, stream });

    // Setup stream forwarding
    let output = '';
    
    stream.on('data', (chunk: Buffer) => {
      const data = chunk.toString();
      output += data;
    });

    stream.on('end', () => {
      activeSessions.delete(sessionId);
    });

    // Wait a bit for initial output
    await new Promise(resolve => setTimeout(resolve, 100));

    res.json({ 
      success: true, 
      sessionId,
      initialOutput: output
    });

  } catch (error) {
    logger.error('Interactive execution failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Send input to interactive session
interactiveRouter.post('/send-input', async (req, res) => {
  const { sessionId, input } = req.body;

  if (!sessionId || input === undefined) {
    res.status(400).json({ success: false, error: 'Missing sessionId or input' });
    return;
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  try {
    // Write input to container stdin
    session.stream.write(input + '\n');
    
    // Wait for output
    await new Promise(resolve => setTimeout(resolve, 100));
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to send input:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get output from interactive session
interactiveRouter.get('/get-output/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  const session = activeSessions.get(sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  try {
    // Get container logs
    const logs = await session.container.logs({
      stdout: true,
      stderr: true,
      follow: false,
      tail: 100
    });

    res.json({ 
      success: true, 
      output: logs.toString() 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Stop interactive session
interactiveRouter.post('/stop-session', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ success: false, error: 'Missing sessionId' });
    return;
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    res.json({ success: true, message: 'Session already stopped' });
    return;
  }

  try {
    await session.container.stop();
    activeSessions.delete(sessionId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to stop session:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});
