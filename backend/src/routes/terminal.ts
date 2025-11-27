import { Router } from 'express';
import Docker from 'dockerode';
import { logger } from '../utils/logger.js';

const router = Router();
const docker = new Docker();

const languageImages: Record<string, string> = {
  'python': 'nexusquest-python:latest',
  'javascript': 'nexusquest-javascript:latest',
  'java': 'nexusquest-java:latest',
  'cpp': 'nexusquest-cpp:latest',
  'go': 'nexusquest-go:latest',
};

// Execute terminal command in language container
router.post('/terminal', async (req, res) => {
  try {
    const { command, language } = req.body;

    if (!command || !language) {
      return res.status(400).json({ error: 'Command and language are required' });
    }

    const imageName = languageImages[language.toLowerCase()];
    if (!imageName) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    logger.info(`Executing terminal command in ${language}: ${command}`);

    // Get shell based on language
    let shellCommand: string[];
    switch (language.toLowerCase()) {
      case 'python':
        shellCommand = ['python3', '-c', command];
        break;
      case 'javascript':
        shellCommand = ['node', '-e', command];
        break;
      case 'java':
        shellCommand = ['sh', '-c', command];
        break;
      case 'cpp':
        shellCommand = ['sh', '-c', command];
        break;
      case 'go':
        shellCommand = ['sh', '-c', command];
        break;
      default:
        shellCommand = ['sh', '-c', command];
    }

    const container = await docker.createContainer({
      Image: imageName,
      Cmd: shellCommand,
      Tty: false,
      AttachStdout: true,
      AttachStderr: true,
      HostConfig: {
        AutoRemove: true,
        Memory: 128 * 1024 * 1024, // 128MB
        MemorySwap: 128 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000,
        NetworkMode: 'none',
        Tmpfs: {
          '/tmp': 'rw,exec,nosuid,size=100m'
        },
      },
    });

    await container.start();

    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    let output = '';
    let error = '';

    stream.on('data', (chunk: Buffer) => {
      const str = chunk.toString('utf8');
      // Docker adds 8-byte header to logs
      const cleaned = str.slice(8);
      if (chunk[0] === 1) {
        output += cleaned;
      } else {
        error += cleaned;
      }
    });

    await new Promise<void>((resolve) => {
      stream.on('end', resolve);
      setTimeout(resolve, 10000); // 10 second timeout
    });

    res.json({
      output: output || error || 'Command executed (no output)',
      error: error && !output ? error : null,
    });

  } catch (error) {
    logger.error('Terminal execution error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to execute command'
    });
  }
});

export default router;
