import express from 'express';
import {
    getConversations,
    createDirectConversation,
    createGroupConversation,
    getMessages,
    sendMessage,
    searchColleagues,
    markAsRead,
    deleteMessage,
    searchConversations,
    addToGroup,
    removeFromGroup,
    toggleGroupAdmin,
    updateGroupInfo
} from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { SystemSetting } from '../models/SystemSetting';
import fs from 'fs';
import path from 'path';

// ... (existing router definition)

const router = express.Router();

router.use(protect); // All chat routes protected

router.get('/conversations', getConversations);
router.get('/search', searchConversations);
router.post('/conversations/direct', createDirectConversation);
router.post('/conversations/group', createGroupConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

// Upload endpoint for chat attachments with Policy Enforcement
router.post('/upload',
    async (req: any, res: any, next: any) => {
        try {
            const settings = await SystemSetting.find({
                key: { $in: ['chat_enabled', 'chat_allow_file_sharing'] }
            });
            const chatEnabled = settings.find(s => s.key === 'chat_enabled');
            const fileSharing = settings.find(s => s.key === 'chat_allow_file_sharing');

            if (chatEnabled && chatEnabled.value === false) {
                return res.status(503).json({ message: 'Chat system is disabled.' });
            }
            if (fileSharing && fileSharing.value === false && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ message: 'File sharing is currently disabled.' });
            }
            next();
        } catch (e) {
            next(e);
        }
    },
    upload.array('files', 5),
    async (req: any, res: any) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        try {
            const settings = await SystemSetting.find({
                key: { $in: ['chat_max_file_size', 'chat_allowed_file_types'] }
            });
            const maxSizeMB = settings.find(s => s.key === 'chat_max_file_size')?.value || 5;
            const allowedTypes = settings.find(s => s.key === 'chat_allowed_file_types')?.value || ['jpg', 'png', 'pdf', 'docx'];

            const validFiles: any[] = [];
            const invalidFiles: any[] = [];

            for (const file of req.files) {
                const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
                const sizeMB = file.size / (1024 * 1024);

                // Check extension and Size
                if ((!allowedTypes.includes(ext) && !allowedTypes.includes(ext.toUpperCase())) || sizeMB > maxSizeMB) {
                    invalidFiles.push(file);
                    // Delete invalid file immediately
                    fs.unlink(file.path, (err) => { if (err) console.error('Failed to delete invalid file', err); });
                } else {
                    validFiles.push(file);
                }
            }

            if (invalidFiles.length > 0 && validFiles.length === 0) {
                return res.status(400).json({ message: `Validation failed. Allowed: ${allowedTypes.join(', ')}. Max: ${maxSizeMB}MB.` });
            }

            const urls = validFiles.map((file: any) => `/uploads/${file.filename}`);
            res.json({
                urls,
                message: invalidFiles.length > 0 ? `${invalidFiles.length} files were rejected due to type or size limits.` : undefined
            });

        } catch (e: any) {
            res.status(500).json({ message: e.message });
        }
    });

router.get('/colleagues', searchColleagues);

router.post('/conversations/:conversationId/read', protect, markAsRead);
router.delete('/messages/:messageId', protect, deleteMessage);

// Group Management
router.put('/conversations/:conversationId', protect, updateGroupInfo);
router.post('/conversations/:conversationId/participants', protect, addToGroup);
router.delete('/conversations/:conversationId/participants/:userId', protect, removeFromGroup);
router.put('/conversations/:conversationId/admins/:userId', protect, toggleGroupAdmin);

export default router;
