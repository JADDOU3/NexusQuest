import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

const LIBRARIES_BASE_PATH = path.join(process.cwd(), 'uploads', 'libraries');

interface CustomLibrary {
  projectId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  uploadedAt: Date;
}

/**
 * Ensures the project libraries directory exists
 */
export async function ensureProjectLibraryDir(projectId: string): Promise<string> {
  const projectLibDir = path.join(LIBRARIES_BASE_PATH, projectId);
  await fs.mkdir(projectLibDir, { recursive: true });
  logger.info(`[customLibraryService] Ensured project library directory: ${projectLibDir}`);
  return projectLibDir;
}

/**
 * Saves a custom library file for a project
 */
export async function saveCustomLibrary(
  projectId: string,
  fileName: string,
  fileContent: Buffer,
  originalName: string
): Promise<{ success: boolean; filePath: string; error?: string }> {
  try {
    const projectLibDir = await ensureProjectLibraryDir(projectId);
    const filePath = path.join(projectLibDir, fileName);

    await fs.writeFile(filePath, fileContent);
    logger.info(`[customLibraryService] Saved custom library: ${filePath}`);

    return {
      success: true,
      filePath
    };
  } catch (error: any) {
    logger.error('[customLibraryService] Error saving custom library:', error);
    return {
      success: false,
      filePath: '',
      error: error.message || 'Failed to save custom library'
    };
  }
}

/**
 * Gets the path to a custom library file
 */
export function getCustomLibraryPath(projectId: string, fileName: string): string {
  return path.join(LIBRARIES_BASE_PATH, projectId, fileName);
}

/**
 * Checks if a custom library exists for a project
 */
export async function customLibraryExists(projectId: string, fileName: string): Promise<boolean> {
  try {
    const libPath = getCustomLibraryPath(projectId, fileName);
    await fs.access(libPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all custom libraries for a project
 */
export async function getProjectLibraries(projectId: string): Promise<CustomLibrary[]> {
  try {
    const projectLibDir = path.join(LIBRARIES_BASE_PATH, projectId);

    try {
      await fs.access(projectLibDir);
    } catch {
      logger.info(`[customLibraryService] No libraries directory for project ${projectId}`);
      return [];
    }

    const files = await fs.readdir(projectLibDir);
    const libraries: CustomLibrary[] = [];

    for (const file of files) {
      const filePath = path.join(projectLibDir, file);
      const stats = await fs.stat(filePath);

      libraries.push({
        projectId,
        fileName: file,
        originalName: file,
        fileType: path.extname(file),
        uploadedAt: stats.mtime
      });
    }

    logger.info(`[customLibraryService] Found ${libraries.length} libraries for project ${projectId}`);
    return libraries;
  } catch (error: any) {
    logger.error('[customLibraryService] Error getting project libraries:', error);
    return [];
  }
}

/**
 * Deletes a custom library from a project
 */
export async function deleteCustomLibrary(projectId: string, fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const libPath = getCustomLibraryPath(projectId, fileName);
    await fs.unlink(libPath);
    logger.info(`[customLibraryService] Deleted custom library: ${libPath}`);

    return { success: true };
  } catch (error: any) {
    logger.error('[customLibraryService] Error deleting custom library:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete custom library'
    };
  }
}

/**
 * Deletes all custom libraries for a project
 */
export async function deleteProjectLibraries(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const projectLibDir = path.join(LIBRARIES_BASE_PATH, projectId);

    try {
      await fs.rm(projectLibDir, { recursive: true, force: true });
      logger.info(`[customLibraryService] Deleted all libraries for project ${projectId}`);
    } catch (error) {
      logger.warn(`[customLibraryService] No libraries to delete for project ${projectId}`);
    }

    return { success: true };
  } catch (error: any) {
    logger.error('[customLibraryService] Error deleting project libraries:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete project libraries'
    };
  }
}

/**
 * Reads the content of a custom library file
 */
export async function readCustomLibrary(projectId: string, fileName: string): Promise<{ success: boolean; content?: Buffer; error?: string }> {
  try {
    const libPath = getCustomLibraryPath(projectId, fileName);
    const content = await fs.readFile(libPath);
    return {
      success: true,
      content
    };
  } catch (error: any) {
    logger.error('[customLibraryService] Error reading custom library:', error);
    return {
      success: false,
      error: error.message || 'Failed to read custom library'
    };
  }
}

/**
 * Gets the project libraries base directory
 */
export function getProjectLibrariesBasePath(): string {
  return LIBRARIES_BASE_PATH;
}

