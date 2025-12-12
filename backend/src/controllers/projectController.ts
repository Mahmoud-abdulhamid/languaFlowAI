import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { Language } from '../models/Language';
import { getSystemSetting } from './settingController';

import { Notification } from '../models/Notification';
import { notifyUser } from '../services/socketService';
import { Segment } from '../models/Segment';
import { parseFile } from '../utils/fileParser';

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, sourceLang, targetLangs, deadline, clientId, assignedTranslators } = req.body;
        const files = req.files as Express.Multer.File[];

        // Validate Languages
        const sourceExists = await Language.findOne({ code: sourceLang });
        if (!sourceExists) {
            return res.status(400).json({ message: `Invalid source language code: ${sourceLang}. Please add it to Language Management first.` });
        }

        // Parse targetLangs first
        let parsedTargetLangs = targetLangs;
        if (typeof targetLangs === 'string') {
            parsedTargetLangs = targetLangs.split(',').filter((l: string) => l);
        }

        const targetDocs = await Language.find({ code: { $in: parsedTargetLangs } });
        if (targetDocs.length !== parsedTargetLangs.length) {
            return res.status(400).json({ message: 'One or more target language codes are invalid.' });
        }

        // --- NEW: Client & Translator Handling ---
        let finalClientId = req.user.id;
        if (clientId && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
            const clientUser = await User.findById(clientId);
            if (!clientUser || clientUser.role !== 'CLIENT') {
                return res.status(400).json({ message: 'Invalid Client ID provided.' });
            }
            finalClientId = clientId;
        }

        let parsedTranslators: string[] = [];
        if (assignedTranslators) {
            if (typeof assignedTranslators === 'string') {
                parsedTranslators = assignedTranslators.split(',').filter((id: string) => id);
            } else if (Array.isArray(assignedTranslators)) {
                parsedTranslators = assignedTranslators;
            }
        }
        // -----------------------------------------

        const processedFiles = [];
        const allSegmentsToInsert: any[] = [];

        // Process Files (Validate & Parse)
        // Using loop to handle async parsing sequentially
        for (let i = 0; i < (files || []).length; i++) {
            const file = files[i];

            // Validate Type & Size
            const allowedTypes = await getSystemSetting('allowed_file_types') as string[];
            const maxMB = await getSystemSetting('max_file_size_mb') as number;

            const fileExt = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
            if (allowedTypes && !allowedTypes.includes(fileExt)) {
                // Should technically delete the uploaded file here if error
                throw new Error(`File type ${fileExt} not allowed. Allowed: ${allowedTypes.join(', ')}`);
            }
            if (maxMB && file.size > maxMB * 1024 * 1024) {
                throw new Error(`File ${file.originalname} exceeds limit of ${maxMB}MB`);
            }

            // Parse Content
            const extractedTexts = await parseFile(file.path, file.originalname);
            const wordCount = extractedTexts.reduce((acc: number, t: string) => acc + t.trim().split(/\s+/).length, 0);

            processedFiles.push({
                originalName: file.originalname,
                path: `uploads/${file.filename}`,
                mimeType: file.mimetype,
                size: file.size,
                wordCount: wordCount,
                status: 'PENDING'
            });

            // Prepare Segments for DB
            // We need project ID but we don't have it yet. We'll assign it later.
            parsedTargetLangs.forEach((tLang: string) => {
                extractedTexts.forEach((text: string, idx: number) => {
                    allSegmentsToInsert.push({
                        project: null, // Will set after project creation
                        fileIndex: i,
                        sequence: idx + 1,
                        sourceText: text,
                        targetText: '',
                        targetLang: tLang,
                        status: 'DRAFT'
                    });
                });
            });
        }

        // Default Deadline
        let finalDeadline = deadline;
        if (!finalDeadline) {
            const defaultDays = await getSystemSetting('default_deadline_days') as number;
            const d = new Date();
            d.setDate(d.getDate() + (defaultDays || 7));
            finalDeadline = d;
        }

        const project = await Project.create({
            title,
            description,
            sourceLang,
            targetLangs: parsedTargetLangs,
            deadline: finalDeadline ? new Date(finalDeadline) : undefined,
            clientId: finalClientId,
            assignedTranslators: parsedTranslators,
            files: processedFiles
        });

        // Insert Segments
        if (allSegmentsToInsert.length > 0) {
            allSegmentsToInsert.forEach(s => s.project = project._id);
            await Segment.insertMany(allSegmentsToInsert);
        }

        // --- NOTIFICATIONS ---

        // 1. Notify Creator
        const clientNote = await Notification.create({
            user: req.user.id,
            type: 'SUCCESS',
            title: 'Project Created',
            message: `Your project "${title}" has been created successfully.`,
            link: `/projects/${project._id}`
        });
        notifyUser(finalClientId, clientNote);

        // 1.5 Notify Assigned Translators
        if (parsedTranslators.length > 0) {
            await Promise.all(parsedTranslators.map(async (tId) => {
                const tNote = await Notification.create({
                    user: tId,
                    type: 'INFO',
                    title: 'New Project Assignment',
                    message: `You have been assigned to project: "${title}"`,
                    link: `/projects/${project._id}`
                });
                notifyUser(tId, tNote);
            }));
        }

        // 2. Notify Admins
        const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });
        await Promise.all(admins.map(async (admin) => {
            if (admin._id.toString() === req.user.id) return;

            const adminNote = await Notification.create({
                user: admin._id,
                type: 'INFO',
                title: 'New Project Submitted',

                message: `User ${req.user.name} submitted a new project: "${title}"${finalClientId !== req.user.id ? ` for client ID ${finalClientId}` : ''}.`,
                link: `/projects`
            });
            notifyUser(admin._id.toString(), adminNote);
        }));

        res.status(201).json(project);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        // Base query (role-based access)
        let query: any = {};
        if (req.user.role === 'CLIENT') {
            query.clientId = req.user.id;
        } else if (req.user.role === 'TRANSLATOR') {
            query.assignedTranslators = req.user.id;
        }

        // Search filter
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Status filter
        if (req.query.status && req.query.status !== 'ALL') {
            query.status = req.query.status;
        }

        // Source language filter
        if (req.query.sourceLang && req.query.sourceLang !== 'ALL') {
            query.sourceLang = req.query.sourceLang;
        }

        // Target language filter
        if (req.query.targetLang && req.query.targetLang !== 'ALL') {
            query.targetLangs = req.query.targetLang;
        }

        // Domain filter
        if (req.query.domain && req.query.domain !== 'ALL') {
            query.domain = req.query.domain;
        }

        // Client filter (Admin/SuperAdmin only)
        if (req.query.clientId && req.query.clientId !== 'ALL' && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
            query.clientId = req.query.clientId;
        }

        // Sorting
        let sort: any = { createdAt: -1 }; // default: newest
        if (req.query.sortBy === 'oldest') {
            sort = { createdAt: 1 };
        } else if (req.query.sortBy === 'deadline') {
            sort = { deadline: 1 };
        } else if (req.query.sortBy === 'title_asc') {
            sort = { title: 1 };
        } else if (req.query.sortBy === 'title_desc') {
            sort = { title: -1 };
        }

        const total = await Project.countDocuments(query);
        const projects = await Project.find(query)
            .sort(sort)
            .populate('clientId', 'name email avatar')
            .populate('assignedTranslators', 'name email avatar')
            .skip(skip)
            .limit(limit);

        res.json({
            data: projects,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('clientId', 'name email avatar')
            .populate('assignedTranslators', 'name email avatar');

        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const ownerId = (project.clientId as any)?._id?.toString();
        const isOwner = ownerId === req.user.id;
        const isAssigned = project.assignedTranslators.some((t: any) => t?._id?.toString() === req.user.id);

        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(401).json({ message: 'Not authorized to view this project' });
        }

        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const assignTranslator = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, translatorId } = req.body;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && project.clientId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to assign translators' });
        }

        // Check if Client is allowed to assign
        if (req.user.role === 'CLIENT') {
            const allowAssign = await getSystemSetting('allow_client_assign_translators');
            if (!allowAssign) {
                return res.status(403).json({ message: 'Client assignment of translators is disabled by administrator' });
            }
        }

        const translator = await User.findById(translatorId);
        if (!translator || translator.role !== 'TRANSLATOR') {
            return res.status(400).json({ message: 'Invalid translator' });
        }

        /*
        const hasMatchingPair = translator.languages?.some((lang: any) =>
            lang.source.toLowerCase() === project.sourceLang.toLowerCase() &&
            project.targetLangs.map((t: string) => t.toLowerCase()).includes(lang.target.toLowerCase())
        );

        if (!hasMatchingPair) {
            return res.status(400).json({
                message: `Translator does not support the project language pair`
            });
        }
        */



        if (!project.assignedTranslators.includes(translatorId)) {
            project.assignedTranslators.push(translatorId);
            await project.save();

            // Notify Translator
            const notification = await Notification.create({
                user: translatorId,
                type: 'INFO',
                title: 'New Project Assignment',
                message: `You have been assigned to project: "${project.title}"`,
                link: `/projects/${project._id}`
            });
            notifyUser(translatorId, notification);
        }

        const updatedProject = await Project.findById(projectId)
            .populate('clientId', 'name email avatar')
            .populate('assignedTranslators', 'name email avatar');

        res.json(updatedProject);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const removeTranslator = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, translatorId } = req.body;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && project.clientId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to remove translators' });
        }

        // Check if Client is allowed to remove
        if (req.user.role === 'CLIENT') {
            const allowAssign = await getSystemSetting('allow_client_assign_translators');
            if (!allowAssign) {
                return res.status(403).json({ message: 'Client management of translators is disabled by administrator' });
            }
        }

        project.assignedTranslators = project.assignedTranslators.filter(
            (id: any) => id.toString() !== translatorId
        );
        await project.save();

        // Notify Translator of removal
        const notification = await Notification.create({
            user: translatorId,
            type: 'WARNING',
            title: 'Project Unassigned',
            message: `You have been removed from project: "${project.title}"`,
            link: `/projects`
        });
        notifyUser(translatorId, notification);

        const updatedProject = await Project.findById(projectId)
            .populate('clientId', 'name email avatar')
            .populate('assignedTranslators', 'name email avatar');

        res.json(updatedProject);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Logic: Admins, Owners, and Assigned Translators can update status
        const isAssignedTranslator = project.assignedTranslators.some((t: any) => t.toString() === req.user.id);



        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && project.clientId.toString() !== req.user.id && !isAssignedTranslator) {
            return res.status(401).json({ message: 'Not authorized to update project status' });
        }

        project.status = status;
        await project.save();

        // Gamification Check
        if (status === 'COMPLETED') {
            // Check for Client
            import('./userController').then(m => m.checkAchievementsInternal(project.clientId.toString()));
            // Check for Translators
            project.assignedTranslators.forEach((tId: any) => {
                import('./userController').then(m => m.checkAchievementsInternal(tId.toString()));
            });
        }

        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProjectClient = async (req: AuthRequest, res: Response) => {
    try {
        const { clientId } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Only admins can update project client' });
        }

        const client = await User.findById(clientId);
        if (!client || client.role !== 'CLIENT') {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        project.clientId = clientId;
        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('clientId', 'name email avatar')
            .populate('assignedTranslators', 'name email avatar');

        res.json(updatedProject);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Only ADMIN can delete? Or owner if DRAFT?
        // Current route middleware says authorize('ADMIN'), so double check here not strictly needed but good for safety
        // Only ADMIN and SUPER_ADMIN can delete
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Only admins can delete projects' });
        }

        if (project.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Project can only be deleted when in DRAFT status' });
        }

        await project.deleteOne();
        res.json({ message: 'Project deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProjectFile = async (req: AuthRequest, res: Response) => {
    try {
        const { id, fileId } = req.params;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Authorization
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete files from this project' });
        }

        if (project.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Files can only be deleted when project is in DRAFT status' });
        }

        // Remove file logic
        // Assuming project.files is an array of objects/subdocuments
        const fileIndex = project.files.findIndex((f: any) => f._id?.toString() === fileId || f === fileId || (f as any)._id === fileId); // Check schema

        // Actually, let's just use $pull or filter
        // If files are subdocuments with _id
        // We'll trust fileId is the index if it's an array index, or _id if subdoc?
        // Route was /:id/files/:fileId. 
        // Frontend uses index `i` in map. `navigate(\`/editor/\${project.id}/\${i}\`)`
        // But the delete route in frontend: `useProjectStore.getState().deleteProjectFile(project.id, i)`
        // So fileId passed from frontend is likely the INDEX.

        const index = parseInt(fileId);
        if (isNaN(index) || index < 0 || index >= project.files.length) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Remove from array at index
        project.files.splice(index, 1);
        await project.save();

        res.json({ message: 'File deleted', files: project.files });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjectProgress = async (req: AuthRequest, res: Response) => {
    try {
        const projectId = req.params.id;

        // Authorization check happens in route (permission middleware)
        // But we should ensure user has access to THIS project
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;
        // @ts-ignore
        const isAssigned = project.assignedTranslators.includes(req.user.id);

        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'Not authorized to view this project progress' });
        }

        const progress = await Segment.aggregate([
            { $match: { project: project._id } },
            {
                $group: {
                    _id: "$fileIndex",
                    totalSegments: { $sum: 1 },
                    completedSegments: {
                        $sum: {
                            $cond: [{ $or: [{ $eq: ["$status", "CONFIRMED"] }, { $eq: ["$status", "TRANSLATED"] }] }, 1, 0]
                        }
                    },
                    confirmedSegments: {
                        $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] }
                    }
                }
            }
        ]);

        // Calculate project totals
        const projectTotal = progress.reduce((acc, curr) => acc + curr.totalSegments, 0);
        const projectCompleted = progress.reduce((acc, curr) => acc + curr.completedSegments, 0); // Translated or Confirmed
        const projectConfirmed = progress.reduce((acc, curr) => acc + curr.confirmedSegments, 0);

        res.json({
            files: progress.reduce((acc: any, curr) => {
                acc[curr._id] = {
                    total: curr.totalSegments,
                    completed: curr.completedSegments,
                    confirmed: curr.confirmedSegments,
                    percent: curr.totalSegments > 0 ? Math.round((curr.completedSegments / curr.totalSegments) * 100) : 0
                };
                return acc;
            }, {}),
            overall: {
                total: projectTotal,
                completed: projectCompleted,
                confirmed: projectConfirmed,
                percent: projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0
            }
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
export const addProjectFiles = async (req: AuthRequest, res: Response) => {
    try {
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Authorization
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to add files to this project' });
        }

        if (project.status !== 'DRAFT' && project.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Files can only be added when project is in DRAFT or ACTIVE status' });
        }

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files provided' });
        }

        const processedFiles = [];
        const allSegmentsToInsert: any[] = [];
        const startIndex = project.files.length; // Start index for new files

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileIndex = startIndex + i;

            // Validate Type & Size
            const allowedTypes = await getSystemSetting('allowed_file_types') as string[];
            const maxMB = await getSystemSetting('max_file_size_mb') as number;

            const fileExt = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
            if (allowedTypes && !allowedTypes.includes(fileExt)) {
                throw new Error(`File type ${fileExt} not allowed. Allowed: ${allowedTypes.join(', ')}`);
            }
            if (maxMB && file.size > maxMB * 1024 * 1024) {
                throw new Error(`File ${file.originalname} exceeds limit of ${maxMB}MB`);
            }

            // Parse Content
            const extractedTexts = await parseFile(file.path, file.originalname);
            const wordCount = extractedTexts.reduce((acc: number, t: string) => acc + t.trim().split(/\s+/).length, 0);

            processedFiles.push({
                originalName: file.originalname,
                path: `uploads/${file.filename}`,
                mimeType: file.mimetype,
                size: file.size,
                wordCount: wordCount,
                status: 'PENDING'
            });

            // Prepare Segments
            project.targetLangs.forEach((tLang: string) => {
                extractedTexts.forEach((text: string, idx: number) => {
                    allSegmentsToInsert.push({
                        project: project._id,
                        fileIndex: fileIndex,
                        sequence: idx + 1,
                        sourceText: text,
                        targetText: '',
                        targetLang: tLang,
                        status: 'DRAFT'
                    });
                });
            });
        }

        // Update Project
        project.files.push(...processedFiles);
        await project.save();

        // Insert Segments
        if (allSegmentsToInsert.length > 0) {
            await Segment.insertMany(allSegmentsToInsert);
        }

        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProjectDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, deadline, notesStatus, domain } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Authorization: Admin, SuperAdmin, or Owner
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to update project details' });
        }

        if (title) project.title = title;
        if (description !== undefined) project.description = description;
        if (deadline) project.deadline = new Date(deadline);
        if (domain) project.domain = domain;

        // Only admins can change note status? Or owner too?
        // Let's allow admins only for now to follow 'Admin controls' request, 
        // OR allow owner if it's their project. 
        // User request: "Admin and SuperAdmin can stop notes". Doesn't mention Owner.
        // But usually Owner should have control. Let's allow both for flexibility, or stick to Admin as requested.
        // Request: "Add option Super Admin and Admin can stop notes..."
        // I will restrict notesStatus update to Admins for safety per explicit request.
        if (notesStatus && isAdmin) {
            project.notesStatus = notesStatus;
        }

        await project.save();

        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadDeliverable = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;
        // @ts-ignore
        const isAssignedTranslator = project.assignedTranslators.some((t: any) => t.toString() === req.user.id);

        if (!isAdmin && !isOwner && !isAssignedTranslator) {
            return res.status(403).json({ message: 'Not authorized to upload deliverables for this project' });
        }

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files provided' });
        }

        const newDeliverables = files.map(f => ({
            name: f.originalname,
            path: `uploads/${f.filename}`,
            uploadedBy: req.user.id,
            uploadedAt: new Date()
        }));

        // @ts-ignore
        project.deliverables.push(...newDeliverables);
        await project.save();

        // Notify Client if uploaded by Translator or Admin
        if (project.clientId.toString() !== req.user.id) {
            const notification = await Notification.create({
                user: project.clientId,
                type: 'SUCCESS',
                title: 'Final Files Uploaded',
                message: `New deliverables uploaded for project: "${project.title}"`,
                link: `/projects/${project._id}`
            });
            notifyUser(project.clientId.toString(), notification);
        }

        const updatedProject = await Project.findById(id)
            .populate('clientId', 'name email avatar')
            .populate('assignedTranslators', 'name email avatar')
            .populate('deliverables.uploadedBy', 'name email avatar');

        res.json(updatedProject);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDeliverable = async (req: AuthRequest, res: Response) => {
    try {
        const { id, fileId } = req.params;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Find the deliverable
        // @ts-ignore
        const deliverable = project.deliverables.find((d: any) => d._id.toString() === fileId);
        if (!deliverable) return res.status(404).json({ message: 'Deliverable not found' });

        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isUploader = deliverable.uploadedBy?.toString() === req.user.id;

        if (!isAdmin && !isUploader) {
            return res.status(403).json({ message: 'Not authorized to delete this deliverable' });
        }

        // @ts-ignore
        project.deliverables = project.deliverables.filter((d: any) => d._id.toString() !== fileId);
        await project.save();

        const updatedProject = await Project.findById(id)
            .populate('clientId', 'name email avatar')
            .populate('assignedTranslators', 'name email avatar')
            .populate('deliverables.uploadedBy', 'name email avatar');

        res.json(updatedProject);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
