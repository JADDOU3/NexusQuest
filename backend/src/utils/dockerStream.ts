import { logger } from './logger.js';

// Shared helper to demultiplex Docker multiplexed streams
// Format per Docker: [streamType:1][reserved:3][payloadSize:4][payload:N]
// streamType: 1 = stdout, 2 = stderr
export function demuxStream(stream: any): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let dataReceived = false;

    const timeout = setTimeout(() => {
      if (!dataReceived) {
        logger?.warn?.('No data received from stream after 2 seconds');
      }
    }, 2000);

    stream.on('data', (chunk: Buffer) => {
      dataReceived = true;
      try {
        let offset = 0;
        while (offset < chunk.length) {
          if (chunk.length - offset < 8) break;

          const streamType = chunk.readUInt8(offset);
          const payloadSize = chunk.readUInt32BE(offset + 4);

          if (payloadSize > 0 && offset + 8 + payloadSize <= chunk.length) {
            const payload = chunk.toString('utf8', offset + 8, offset + 8 + payloadSize);
            if (streamType === 1) {
              stdout += payload;
            } else if (streamType === 2) {
              stderr += payload;
            }
          }
          offset += 8 + payloadSize;
        }
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    stream.on('end', () => {
      clearTimeout(timeout);
      resolve({ stdout, stderr });
    });

    stream.on('error', (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
