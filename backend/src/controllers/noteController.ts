import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ProjectNote } from '../models/ProjectNote';
import { Project } from '../models/Project';
import { SystemSetting } from '../models/SystemSetting';
import { detectContactInfo } from '../services/aiService';

// Helper to get system settings
const getNoteSettings = async () => {
    const keys = [
        'notes_system_enabled',
        'notes_replies_enabled',
        'notes_allow_attachments',
        'ai_moderation_contact_info',
        'ai_moderation_action',
        'ai_moderation_notify_admins'
    ];
    const settings = await SystemSetting.find({ key: { $in: keys } });
    const getVal = (k: string, d: any) => settings.find((s: any) => s.key === k)?.value ?? d;
    return {
        enabled: getVal('notes_system_enabled', true),
        repliesEnabled: getVal('notes_replies_enabled', true),
        allowAttachments: getVal('notes_allow_attachments', false),
        aiModeration: getVal('ai_moderation_contact_info', false),
        aiAction: getVal('ai_moderation_action', 'block'),
        notifyAdmins: getVal('ai_moderation_notify_admins', true)
    };
};

export const getProjectNotes = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

        let query: any = { project: projectId };
        // If not admin, only show non-hidden notes
        if (!isAdmin) {
            query.isHidden = false;
        }

        const notes = await ProjectNote.find(query)
            .populate('user', 'name role avatar')
            .sort({ createdAt: 1 });

        res.json(notes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProjectNote = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const { content, parentId } = req.body;
        const settings = await getNoteSettings();
        console.log('DEBUG: Note Settings:', JSON.stringify(settings, null, 2));
        console.log('DEBUG: User Role:', req.user.role);

        // Handle File Uploads
        let processedAttachments: any[] = [];
        if (req.files && Array.isArray(req.files)) {
            processedAttachments = (req.files as Express.Multer.File[]).map(file => ({
                name: file.originalname,
                url: `/uploads/${file.filename}`,
                type: file.mimetype
            }));
        }

        console.log('DEBUG: processedAttachments:', processedAttachments);
        console.log('DEBUG: req.body.attachments:', req.body.attachments);

        // 1. Global Checks
        if (!settings.enabled && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Notes system is currently disabled' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // 2. Project Check: DISABLED
        // fallback to 'ENABLED' if undefined (migration safe)
        const notesStatus = project.notesStatus || 'ENABLED';
        if (notesStatus === 'DISABLED' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Notes are disabled for this project' });
        }

        // 3. Read-Only Mode Check (System-wide OR Project-specific)
        // Block if System Replies Disabled OR Project is READ_ONLY
        if ((!settings.repliesEnabled || notesStatus === 'READ_ONLY') && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Posting new notes is currently disabled for this project' });
        }

        // 4. Attachments Check
        if (processedAttachments.length > 0 && !settings.allowAttachments && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Attachments are currently disabled' });
        }

        // 5. AI Moderation (Clients & Translators)
        let isHidden = false;
        // Check if user is NOT admin (meaning Client or Translator) and moderation enabled
        const isSubjectToModeration = ['CLIENT', 'TRANSLATOR'].includes(req.user.role);

        if (isSubjectToModeration && settings.aiModeration) {
            const check = await detectContactInfo(content);
            if (check.detected) {
                const { notifyUser } = await import('../services/socketService');
                const { Notification } = await import('../models/Notification');

                // Notify Admins if enabled
                if (settings.notifyAdmins) {
                    const { User } = await import('../models/User'); // Dynamic import
                    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });

                    // Fetch user name since req.user might only contain token payload
                    const currentUser = await User.findById(req.user.id);
                    const userName = currentUser ? currentUser.name : (req.user.name || 'User');

                    const adminNotifData = {
                        type: 'WARNING',
                        title: 'Contact Info Detected',
                        message: `User ${userName} attempted to share contact info in project notes. Action: ${settings.aiAction.toUpperCase()}.`,
                        link: `/projects/${projectId}`, // Link to the project to review
                        isRead: false
                    };

                    for (const admin of admins) {
                        try {
                            const notif = await Notification.create({ ...adminNotifData, user: admin._id });
                            notifyUser(admin._id.toString(), notif);
                        } catch (e) {
                            console.error('Failed to notify admin', e);
                        }
                    }
                }

                if (settings.aiAction === 'block') {
                    // Create Notification for User
                    const notif = await Notification.create({
                        user: req.user.id,
                        type: 'WARNING',
                        title: 'Message Blocked',
                        message: 'Your message was blocked because it contained prohibited contact information.',
                        isRead: false
                    });
                    notifyUser(req.user.id, notif);

                    return res.status(400).json({ message: 'Message contains prohibited contact information.' });
                } else if (settings.aiAction === 'hide') {
                    // Create Notification for User
                    const notif = await Notification.create({
                        user: req.user.id,
                        type: 'WARNING',
                        title: 'Message Hidden',
                        message: 'Your system note has been hidden from others because it contains contact information.',
                        isRead: false
                    });
                    notifyUser(req.user.id, notif);

                    isHidden = true; // Still save but hide
                }
            }
        }

        const noteData = {
            project: projectId,
            user: req.user.id,
            content,
            parentId: parentId || null,
            attachments: processedAttachments,
            isHidden
        };
        console.log('DEBUG: creating note with data:', JSON.stringify(noteData, null, 2));

        const note = await ProjectNote.create(noteData);

        const noteWithUser = await ProjectNote.findById(note._id).populate('user', 'name role avatar');

        // --- Notification Logic ---
        try {
            const { notifyUser } = await import('../services/socketService');
            const { Notification } = await import('../models/Notification');

            // Determine recipients: Client and Translators (exclude sender)
            const recipients = new Set<string>();

            // 1. Client
            // @ts-ignore
            const clientId = project.clientId || project.client; // Handle potential schema inconsistencies/legacy
            if (clientId && clientId.toString() !== req.user.id) {
                recipients.add(clientId.toString());
            }

            // 2. Assigned Translators (Array)
            if (project.assignedTranslators && Array.isArray(project.assignedTranslators)) {
                project.assignedTranslators.forEach((t: any) => {
                    if (t && t.toString() !== req.user.id) {
                        recipients.add(t.toString());
                    }
                });
            }

            // Add Project Owner if different? Usually Client is Owner.
            // Notify Admins? Start with just participants for less noise.

            const notificationData = {
                type: 'NOTE_NEW',
                title: 'New Project Note',
                message: `New note in project "${project.title}" by ${req.user.name || 'User'}`,
                link: `/projects/${projectId}`,
                isRead: false
            };

            for (const recipientId of recipients) {
                const notif = await Notification.create({ ...notificationData, user: recipientId });
                notifyUser(recipientId, notif);
            }
        } catch (notifError) {
            console.error('Notification Error:', notifError);
            // Don't fail the request if notification fails
        }

        // Real-time note update to project room
        try {
            const { getIO } = await import('../services/socketService');
            getIO().to(`project_${projectId}`).emit('note_new', noteWithUser);
        } catch (e) {
            console.error('Socket Emit Error:', e);
        }

        res.status(201).json(noteWithUser);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const note = await ProjectNote.findById(id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isOwner = note.user.toString() === req.user.id; // Corrected: user is ObjectId ref

        if (isAdmin) {
            await note.deleteOne();
            return res.json({ message: 'Note deleted by admin' });
        }

        if (isOwner) {
            const hoursSinceCreation = (Date.now() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60);
            if (hoursSinceCreation > 1) {
                return res.status(403).json({ message: 'Cannot delete note after 1 hour' });
            }
            await note.deleteOne();
            return res.json({ message: 'Note deleted' });
        }

        res.status(403).json({ message: 'Unauthorized' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const hideNote = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        if (!isAdmin) return res.status(403).json({ message: 'Unauthorized' });

        const note = await ProjectNote.findById(id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        note.isHidden = !note.isHidden;
        await note.save();
        res.json({ message: note.isHidden ? 'Note hidden' : 'Note visible', isHidden: note.isHidden });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
