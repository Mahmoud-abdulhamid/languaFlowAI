"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideNote = exports.deleteNote = exports.createProjectNote = exports.getProjectNotes = void 0;
const ProjectNote_1 = require("../models/ProjectNote");
const Project_1 = require("../models/Project");
const SystemSetting_1 = require("../models/SystemSetting");
const aiService_1 = require("../services/aiService");
// Helper to get system settings
const getNoteSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    const keys = [
        'notes_system_enabled',
        'notes_replies_enabled',
        'notes_allow_attachments',
        'ai_moderation_contact_info',
        'ai_moderation_action',
        'ai_moderation_notify_admins'
    ];
    const settings = yield SystemSetting_1.SystemSetting.find({ key: { $in: keys } });
    const getVal = (k, d) => { var _a, _b; return (_b = (_a = settings.find((s) => s.key === k)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : d; };
    return {
        enabled: getVal('notes_system_enabled', true),
        repliesEnabled: getVal('notes_replies_enabled', true),
        allowAttachments: getVal('notes_allow_attachments', false),
        aiModeration: getVal('ai_moderation_contact_info', false),
        aiAction: getVal('ai_moderation_action', 'block'),
        notifyAdmins: getVal('ai_moderation_notify_admins', true)
    };
});
const getProjectNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        let query = { project: projectId };
        // If not admin, only show non-hidden notes
        if (!isAdmin) {
            query.isHidden = false;
        }
        const notes = yield ProjectNote_1.ProjectNote.find(query)
            .populate('user', 'name role avatar')
            .sort({ createdAt: 1 });
        res.json(notes);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProjectNotes = getProjectNotes;
const createProjectNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const { content, parentId } = req.body;
        const settings = yield getNoteSettings();
        console.log('DEBUG: Note Settings:', JSON.stringify(settings, null, 2));
        console.log('DEBUG: User Role:', req.user.role);
        // Handle File Uploads
        let processedAttachments = [];
        if (req.files && Array.isArray(req.files)) {
            processedAttachments = req.files.map(file => ({
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
        const project = yield Project_1.Project.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
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
            const check = yield (0, aiService_1.detectContactInfo)(content);
            if (check.detected) {
                const { notifyUser } = yield Promise.resolve().then(() => __importStar(require('../services/socketService')));
                const { Notification } = yield Promise.resolve().then(() => __importStar(require('../models/Notification')));
                // Notify Admins if enabled
                if (settings.notifyAdmins) {
                    const { User } = yield Promise.resolve().then(() => __importStar(require('../models/User'))); // Dynamic import
                    const admins = yield User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });
                    // Fetch user name since req.user might only contain token payload
                    const currentUser = yield User.findById(req.user.id);
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
                            const notif = yield Notification.create(Object.assign(Object.assign({}, adminNotifData), { user: admin._id }));
                            notifyUser(admin._id.toString(), notif);
                        }
                        catch (e) {
                            console.error('Failed to notify admin', e);
                        }
                    }
                }
                if (settings.aiAction === 'block') {
                    // Create Notification for User
                    const notif = yield Notification.create({
                        user: req.user.id,
                        type: 'WARNING',
                        title: 'Message Blocked',
                        message: 'Your message was blocked because it contained prohibited contact information.',
                        isRead: false
                    });
                    notifyUser(req.user.id, notif);
                    return res.status(400).json({ message: 'Message contains prohibited contact information.' });
                }
                else if (settings.aiAction === 'hide') {
                    // Create Notification for User
                    const notif = yield Notification.create({
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
        const note = yield ProjectNote_1.ProjectNote.create(noteData);
        const noteWithUser = yield ProjectNote_1.ProjectNote.findById(note._id).populate('user', 'name role avatar');
        // --- Notification Logic ---
        try {
            const { notifyUser } = yield Promise.resolve().then(() => __importStar(require('../services/socketService')));
            const { Notification } = yield Promise.resolve().then(() => __importStar(require('../models/Notification')));
            // Determine recipients: Client and Translators (exclude sender)
            const recipients = new Set();
            // 1. Client
            // @ts-ignore
            const clientId = project.clientId || project.client; // Handle potential schema inconsistencies/legacy
            if (clientId && clientId.toString() !== req.user.id) {
                recipients.add(clientId.toString());
            }
            // 2. Assigned Translators (Array)
            if (project.assignedTranslators && Array.isArray(project.assignedTranslators)) {
                project.assignedTranslators.forEach((t) => {
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
                const notif = yield Notification.create(Object.assign(Object.assign({}, notificationData), { user: recipientId }));
                notifyUser(recipientId, notif);
            }
        }
        catch (notifError) {
            console.error('Notification Error:', notifError);
            // Don't fail the request if notification fails
        }
        // Real-time note update to project room
        try {
            const { getIO } = yield Promise.resolve().then(() => __importStar(require('../services/socketService')));
            getIO().to(`project_${projectId}`).emit('note_new', noteWithUser);
        }
        catch (e) {
            console.error('Socket Emit Error:', e);
        }
        res.status(201).json(noteWithUser);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createProjectNote = createProjectNote;
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const note = yield ProjectNote_1.ProjectNote.findById(id);
        if (!note)
            return res.status(404).json({ message: 'Note not found' });
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isOwner = note.user.toString() === req.user.id; // Corrected: user is ObjectId ref
        if (isAdmin) {
            yield note.deleteOne();
            return res.json({ message: 'Note deleted by admin' });
        }
        if (isOwner) {
            const hoursSinceCreation = (Date.now() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60);
            if (hoursSinceCreation > 1) {
                return res.status(403).json({ message: 'Cannot delete note after 1 hour' });
            }
            yield note.deleteOne();
            return res.json({ message: 'Note deleted' });
        }
        res.status(403).json({ message: 'Unauthorized' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteNote = deleteNote;
const hideNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        if (!isAdmin)
            return res.status(403).json({ message: 'Unauthorized' });
        const note = yield ProjectNote_1.ProjectNote.findById(id);
        if (!note)
            return res.status(404).json({ message: 'Note not found' });
        note.isHidden = !note.isHidden;
        yield note.save();
        res.json({ message: note.isHidden ? 'Note hidden' : 'Note visible', isHidden: note.isHidden });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.hideNote = hideNote;
