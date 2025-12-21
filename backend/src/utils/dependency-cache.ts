import crypto from 'crypto';
import { logger } from './logger.js';

/**
 * Check if dependencies are cached and copy them if available
 * Returns true if cache was used, false if fresh install is needed
 */
export async function checkAndUseDependencyCache(
    container: any,
    dependencies: Record<string, string>,
    baseDir: string
): Promise<boolean> {
    // Generate hash of dependencies for caching
    const depsHash = crypto.createHash('md5').update(JSON.stringify(dependencies)).digest('hex');
    const cacheDir = `/dependencies/js-${depsHash}`;

    // Check if dependencies are already cached
    logger.info('[dependency-cache] Checking cache:', cacheDir);
    const checkCacheExec = await container.exec({
        Cmd: ['sh', '-c', `[ -d "${cacheDir}/node_modules" ] && [ -f "${cacheDir}/.cache-complete" ] && echo "cache_exists" || echo "cache_missing"`],
        AttachStdout: true,
        AttachStderr: true
    });
    const cacheCheckStream = await checkCacheExec.start({});
    let cacheCheckOutput = '';
    await new Promise((resolve) => {
        cacheCheckStream.on('data', (chunk: Buffer) => {
            cacheCheckOutput += chunk.toString();
        });
        cacheCheckStream.on('end', resolve);
        cacheCheckStream.on('error', resolve);
        setTimeout(resolve, 1000);
    });

    const cacheExists = cacheCheckOutput.trim().includes('cache_exists');

    if (cacheExists) {
        logger.info('✓ [dependency-cache] Using cached dependencies');
        // Copy cached node_modules to project directory
        const copyCacheExec = await container.exec({
            Cmd: ['sh', '-c', `cp -r ${cacheDir}/node_modules ${baseDir}/`],
            AttachStdout: true,
            AttachStderr: true
        });
        const copyStream = await copyCacheExec.start({});
        copyStream.resume();
        await new Promise((resolve) => {
            copyStream.on('end', resolve);
            copyStream.on('error', resolve);
            setTimeout(resolve, 2000);
        });
        logger.info('[dependency-cache] Cached dependencies copied successfully');
        return true;
    } else {
        logger.info('⚙ [dependency-cache] Cache miss - fresh install required');
        return false;
    }
}

/**
 * Cache the installed dependencies for future use
 */
export async function cacheDependencies(
    container: any,
    dependencies: Record<string, string>,
    baseDir: string
): Promise<void> {
    const depsHash = crypto.createHash('md5').update(JSON.stringify(dependencies)).digest('hex');
    const cacheDir = `/dependencies/js-${depsHash}`;

    try {
        logger.info('[dependency-cache] Caching dependencies to', cacheDir);
        // Create cache directory and copy node_modules
        const cacheDepsExec = await container.exec({
            Cmd: ['sh', '-c', `mkdir -p ${cacheDir} && cp -r ${baseDir}/node_modules ${cacheDir}/ && touch ${cacheDir}/.cache-complete`],
            AttachStdout: true,
            AttachStderr: true
        });
        const cacheStream = await cacheDepsExec.start({});
        cacheStream.resume();
        await new Promise((resolve) => {
            cacheStream.on('end', resolve);
            cacheStream.on('error', resolve);
            setTimeout(resolve, 3000);
        });
        logger.info('✓ [dependency-cache] Dependencies cached successfully');
    } catch (err: any) {
        logger.warn('[dependency-cache] Failed to cache dependencies:', err.message);
    }
}
