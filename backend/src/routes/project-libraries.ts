import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Project } from '../models/Project.js';
import { auth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import Docker from 'dockerode';

const router = express.Router();
const docker = new Docker();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'libraries');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedExtensions = ['.jar', '.whl', '.so', '.dll', '.dylib', '.a', '.lib', '.tar.gz', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext) || ext === '.gz') {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    }
});

router.post('/:projectId/libraries', auth, upload.single('library'), async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = (req as any).user.userId;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const project = await Project.findOne({ _id: projectId, owner: userId });
        if (!project) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Project not found' });
        }

        const library = {
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileType: path.extname(req.file.originalname).substring(1),
            size: req.file.size,
            uploadedAt: new Date()
        };

        if (!project.customLibraries) {
            project.customLibraries = [];
        }
        project.customLibraries.push(library as any);

        if (project.dependencyMetadata) {
            project.dependencyMetadata.installed = false;
        }

        await project.save();

        const containerName = `nexusquest-${project.language}`;
        try {
            const container = docker.getContainer(containerName);
            const info = await container.inspect();

            if (info.State.Running) {
                const customLibDir = `/custom-libs/${projectId}`;

                await container.exec({
                    Cmd: ['sh', '-c', `mkdir -p ${customLibDir}`],
                    AttachStdout: false,
                    AttachStderr: false,
                }).then(exec => exec.start({}));

                const fileContent = fs.readFileSync(req.file.path);
                const base64Content = fileContent.toString('base64');

                await container.exec({
                    Cmd: ['sh', '-c', `echo "${base64Content}" | base64 -d > ${customLibDir}/${req.file.filename}`],
                    AttachStdout: true,
                    AttachStderr: true,
                }).then(exec => exec.start({ hijack: true }));

                logger.info(`[libraries] Uploaded ${req.file.originalname} to container ${containerName}`);
            }
        } catch (error) {
            logger.warn(`[libraries] Could not upload to container: ${error}`);
        }

        res.json({
            success: true,
            library: {
                id: project.customLibraries[project.customLibraries.length - 1]._id,
                ...library
            }
        });
    } catch (error: any) {
        logger.error('[libraries] Upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || 'Failed to upload library' });
    }
});

router.get('/:projectId/libraries', auth, async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = (req as any).user.userId;

        const project = await Project.findOne({ _id: projectId, owner: userId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({
            success: true,
            libraries: project.customLibraries || []
        });
    } catch (error: any) {
        logger.error('[libraries] List error:', error);
        res.status(500).json({ error: error.message || 'Failed to list libraries' });
    }
});

router.delete('/:projectId/libraries/:libraryId', auth, async (req: Request, res: Response) => {
    try {
        const { projectId, libraryId } = req.params;
        const userId = (req as any).user.userId;

        const project = await Project.findOne({ _id: projectId, owner: userId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const libraryIndex = project.customLibraries?.findIndex(
            (lib: any) => lib._id.toString() === libraryId
        );

        if (libraryIndex === undefined || libraryIndex === -1) {
            return res.status(404).json({ error: 'Library not found' });
        }

        const library = project.customLibraries![libraryIndex];
        const filePath = path.join(UPLOAD_DIR, library.fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        project.customLibraries!.splice(libraryIndex, 1);

        if (project.dependencyMetadata) {
            project.dependencyMetadata.installed = false;
        }

        await project.save();

        const containerName = `nexusquest-${project.language}`;
        try {
            const container = docker.getContainer(containerName);
            const customLibDir = `/custom-libs/${projectId}`;

            await container.exec({
                Cmd: ['sh', '-c', `rm -f ${customLibDir}/${library.fileName}`],
                AttachStdout: false,
                AttachStderr: false,
            }).then(exec => exec.start({}));

            logger.info(`[libraries] Deleted ${library.originalName} from container`);
        } catch (error) {
            logger.warn(`[libraries] Could not delete from container: ${error}`);
        }

        res.json({ success: true, message: 'Library deleted successfully' });
    } catch (error: any) {
        logger.error('[libraries] Delete error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete library' });
    }
});

router.post('/:projectId/dependencies/clear-cache', auth, async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = (req as any).user.userId;

        const project = await Project.findOne({ _id: projectId, owner: userId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.dependencyMetadata) {
            project.dependencyMetadata.installed = false;
            project.dependencyMetadata.hash = undefined;
            project.dependencyMetadata.installedAt = undefined;
        }

        await project.save();

        const containerName = `nexusquest-${project.language}`;
        try {
            const container = docker.getContainer(containerName);
            const depDir = `/dependencies/${projectId}`;

            await container.exec({
                Cmd: ['sh', '-c', `rm -rf ${depDir}`],
                AttachStdout: false,
                AttachStderr: false,
            }).then(exec => exec.start({}));

            logger.info(`[dependencies] Cleared cache for project ${projectId}`);
        } catch (error) {
            logger.warn(`[dependencies] Could not clear container cache: ${error}`);
        }

        res.json({ success: true, message: 'Dependency cache cleared successfully' });
    } catch (error: any) {
        logger.error('[dependencies] Clear cache error:', error);
        res.status(500).json({ error: error.message || 'Failed to clear cache' });
    }
});

export default router;
