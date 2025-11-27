import { Server, Socket } from 'socket.io';
import Docker from 'dockerode';
import { logger } from '../utils/logger.js';

const docker = new Docker();

const languageImages: Record<string, string> = {
  python: 'nexusquest-python-runner',
  javascript: 'nexusquest-javascript-runner',
  java: 'nexusquest-java-runner',
  cpp: 'nexusquest-cpp-runner',
  go: 'nexusquest-go-runner'
};

interface ActiveSession {
  container: Docker.Container;
  stream: any;
}

const activeSessions = new Map<string, ActiveSession>();

export function setupInteractiveExecution(io: Server) {
  io.on('connection', (socket: Socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('execute-code', async (data: { code: string; language: string }) => {
      const { code, language } = data;
      const sessionId = socket.id;

      try {
        logger.info(`Starting interactive execution for session ${sessionId}, language: ${language}`);

        // Clean up any existing session
        const existingSession = activeSessions.get(sessionId);
        if (existingSession) {
          try {
            await existingSession.container.stop();
            await existingSession.container.remove();
          } catch (err) {
            // Ignore cleanup errors
          }
          activeSessions.delete(sessionId);
        }

        const containerName = `nexusquest-interactive-${sessionId.substring(0, 8)}`;
        
        // Prepare command based on language
        let command: string[];
        if (language === 'python') {
          command = ['python3', '-u', '-c', code];
        } else if (language === 'javascript') {
          command = ['node', '-e', code];
        } else if (language === 'cpp') {
          // For C++, write code to file, compile, and run
          const escapedCode = code.replace(/'/g, "'\\''");
          command = ['sh', '-c', `echo '${escapedCode}' > /tmp/main.cpp && g++ -std=c++20 /tmp/main.cpp -o /tmp/a.out && /tmp/a.out`];
        } else if (language === 'java') {
          // Extract class name
          const classMatch = code.match(/public\s+class\s+(\w+)/);
          const className = classMatch ? classMatch[1] : 'Main';
          const escapedCode = code.replace(/'/g, "'\\''");
          command = ['sh', '-c', `echo '${escapedCode}' > /tmp/${className}.java && javac /tmp/${className}.java && java -cp /tmp ${className}`];
        } else {
          socket.emit('execution-error', { error: `Unsupported language: ${language}` });
          return;
        }

        // Create container with TTY and stdin
        const container = await docker.createContainer({
          Image: languageImages[language],
          name: containerName,
          Cmd: command,
          Tty: false,
          OpenStdin: true,
          StdinOnce: false,
          AttachStdin: true,
          AttachStdout: true,
          AttachStderr: true,
          HostConfig: {
            Memory: 256 * 1024 * 1024,
            CpuQuota: 50000,
            NetworkMode: 'none',
            AutoRemove: true,
            Tmpfs: {
              '/tmp': 'rw,exec,nosuid,size=100m'
            }
          }
        });

        // Start container
        await container.start();

        // Attach to container streams
        const stream = await container.attach({
          stream: true,
          stdin: true,
          stdout: true,
          stderr: true
        });

        // Store session
        activeSessions.set(sessionId, { container, stream });

        // Demultiplex Docker stream and send to client
        let stdoutBuffer = '';
        let stderrBuffer = '';

        const processDockerStream = (chunk: Buffer) => {
          let offset = 0;
          while (offset < chunk.length) {
            if (chunk.length - offset < 8) break;

            const header = chunk.readUInt8(offset);
            const payloadSize = chunk.readUInt32BE(offset + 4);

            if (payloadSize === 0 || offset + 8 + payloadSize > chunk.length) {
              offset++;
              continue;
            }

            const payload = chunk.toString('utf8', offset + 8, offset + 8 + payloadSize);

            if (header === 1) {
              // stdout
              stdoutBuffer += payload;
              socket.emit('execution-output', { output: payload, type: 'stdout' });
            } else if (header === 2) {
              // stderr
              stderrBuffer += payload;
              socket.emit('execution-output', { output: payload, type: 'stderr' });
            }

            offset += 8 + payloadSize;
          }
        };

        stream.on('data', processDockerStream);

        stream.on('end', () => {
          socket.emit('execution-complete', { 
            stdout: stdoutBuffer, 
            stderr: stderrBuffer 
          });
          activeSessions.delete(sessionId);
          logger.info(`Session ${sessionId} execution completed`);
        });

        stream.on('error', (err: Error) => {
          socket.emit('execution-error', { error: err.message });
          activeSessions.delete(sessionId);
        });

        // Send ready signal
        socket.emit('execution-started', { sessionId });

        // Setup timeout
        setTimeout(async () => {
          const session = activeSessions.get(sessionId);
          if (session) {
            try {
              await session.container.stop();
              socket.emit('execution-error', { error: 'Execution timeout (30 seconds)' });
            } catch (err) {
              // Already stopped
            }
            activeSessions.delete(sessionId);
          }
        }, 30000);

      } catch (error) {
        logger.error('Interactive execution failed:', error);
        socket.emit('execution-error', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    socket.on('send-input', async (data: { input: string }) => {
      const session = activeSessions.get(socket.id);
      if (!session) {
        socket.emit('execution-error', { error: 'No active execution session' });
        return;
      }

      try {
        // Write input to container stdin
        session.stream.write(data.input + '\n');
      } catch (error) {
        socket.emit('execution-error', { 
          error: error instanceof Error ? error.message : 'Failed to send input' 
        });
      }
    });

    socket.on('stop-execution', async () => {
      const session = activeSessions.get(socket.id);
      if (session) {
        try {
          await session.container.stop();
          activeSessions.delete(socket.id);
          socket.emit('execution-stopped', {});
        } catch (error) {
          socket.emit('execution-error', { 
            error: error instanceof Error ? error.message : 'Failed to stop execution' 
          });
        }
      }
    });

    socket.on('disconnect', async () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
      const session = activeSessions.get(socket.id);
      if (session) {
        try {
          await session.container.stop();
        } catch (err) {
          // Ignore errors
        }
        activeSessions.delete(socket.id);
      }
    });
  });
}
