import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project } from '../models/Project';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { Segment } from '../models/Segment';

export const downloadProjectFiles = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Authorization: Admin, Client (Owner), or Assigned Translator
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;
        // @ts-ignore
        const isAssigned = project.assignedTranslators.includes(req.user.id);

        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'Not authorized to download files for this project' });
        }

        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        res.attachment(`${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_files.zip`);

        archive.pipe(res);

        // Add files from project
        for (const file of project.files as any[]) {
            // Use 'path' as per schema, fallback to 'storagePath' if legacy data exists
            const fileLocation = file.path || file.storagePath;
            if (!fileLocation) {
                console.warn(`File path missing for ${file.originalName}`);
                continue;
            }
            const filePath = path.resolve(fileLocation);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: file.originalName });
            } else {
                console.warn(`File not found: ${filePath}`);
                // Optional: Allow download to continue even if a file is missing?
                // For now, valid files will be added.
            }
        }

        await archive.finalize();

    } catch (error: any) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate download' });
        }
    }
};

export const downloadDeliverable = async (req: AuthRequest, res: Response) => {
    try {
        const { id, fileId } = req.params;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;
        // @ts-ignore
        const isAssigned = project.assignedTranslators.includes(req.user.id);

        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'Not authorized to download files for this project' });
        }

        // @ts-ignore
        const deliverable = project.deliverables.find((d: any) => d._id.toString() === fileId);
        if (!deliverable) return res.status(404).json({ message: 'File not found' });

        if (!deliverable.path || !deliverable.name) {
            return res.status(400).json({ message: 'Invalid deliverable file record' });
        }

        const filePath = path.resolve(deliverable.path);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File on disk not found' });
        }

        res.download(filePath, deliverable.name);

    } catch (error: any) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to download file' });
        }
    }
};

export const exportTranslatedFile = async (req: AuthRequest, res: Response) => {
    try {
        const { id, fileId } = req.params;
        const { targetLang } = req.query;

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Authorization
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;
        // @ts-ignore
        const isAssigned = project.assignedTranslators.includes(req.user.id);

        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'Not authorized to export files for this project' });
        }

        const fileIndex = parseInt(fileId);
        // @ts-ignore
        const file = project.files[fileIndex];
        if (!file) return res.status(404).json({ message: 'File not found' });

        const activeLang = (targetLang as string) || (project.targetLangs && project.targetLangs[0]) || 'en';

        const segments = await Segment.find({
            project: id,
            fileIndex: fileIndex,
            targetLang: activeLang
        }).sort({ sequence: 1 });

        if (!segments || segments.length === 0) {
            return res.status(404).json({ message: 'No translation segments found' });
        }

        const content = segments.map(s => s.targetText || s.sourceText).join('\n'); // Fallback

        const originalExt = path.extname(file.originalName || '');
        const baseName = path.basename(file.originalName || '', originalExt);

        // Format: [ProjectTitle]-[OriginalName]-[Timestamp]-[Lang].txt
        const sanitizedTitle = project.title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        const fileName = `${sanitizedTitle}-${baseName}-${timestamp}-${activeLang}.txt`;

        res.attachment(fileName);
        res.set('Content-Type', 'text/plain');
        res.send(content);

    } catch (error: any) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Failed to export file' });
    }
};
