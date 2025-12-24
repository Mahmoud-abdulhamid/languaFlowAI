"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const SystemSetting_1 = require("../models/SystemSetting");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ... (existing router definition)
const router = express_1.default.Router();
router.use(authMiddleware_1.protect); // All chat routes protected
router.get('/conversations', chatController_1.getConversations);
router.get('/search', chatController_1.searchConversations);
router.post('/conversations/direct', chatController_1.createDirectConversation);
router.post('/conversations/group', chatController_1.createGroupConversation);
router.get('/conversations/:conversationId/messages', chatController_1.getMessages);
router.post('/conversations/:conversationId/messages', chatController_1.sendMessage);
// Upload endpoint for chat attachments with Policy Enforcement
router.post('/upload', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield SystemSetting_1.SystemSetting.find({
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
    }
    catch (e) {
        next(e);
    }
}), uploadMiddleware_1.upload.array('files', 5), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    try {
        const settings = yield SystemSetting_1.SystemSetting.find({
            key: { $in: ['chat_max_file_size', 'chat_allowed_file_types'] }
        });
        const maxSizeMB = ((_a = settings.find(s => s.key === 'chat_max_file_size')) === null || _a === void 0 ? void 0 : _a.value) || 10;
        const allowedTypes = ((_b = settings.find(s => s.key === 'chat_allowed_file_types')) === null || _b === void 0 ? void 0 : _b.value) || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'docx', 'doc', 'webm', 'mp3', 'm4a', 'ogg', 'heic', 'heif'];
        const validFiles = [];
        const invalidFiles = [];
        for (const file of req.files) {
            const ext = path_1.default.extname(file.originalname).toLowerCase().replace('.', '');
            const sizeMB = file.size / (1024 * 1024);
            // Check extension and Size
            if ((!allowedTypes.includes(ext) && !allowedTypes.includes(ext.toUpperCase())) || sizeMB > maxSizeMB) {
                invalidFiles.push(file);
                // Delete invalid file immediately
                fs_1.default.unlink(file.path, (err) => { if (err)
                    console.error('Failed to delete invalid file', err); });
            }
            else {
                validFiles.push(file);
            }
        }
        if (invalidFiles.length > 0 && validFiles.length === 0) {
            return res.status(400).json({ message: `Validation failed. Allowed: ${allowedTypes.join(', ')}. Max: ${maxSizeMB}MB.` });
        }
        const urls = validFiles.map((file) => `/uploads/${file.filename}`);
        res.json({
            urls,
            message: invalidFiles.length > 0 ? `${invalidFiles.length} files were rejected due to type or size limits.` : undefined
        });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
}));
router.get('/colleagues', chatController_1.searchColleagues);
router.post('/conversations/:conversationId/read', authMiddleware_1.protect, chatController_1.markAsRead);
router.delete('/messages/:messageId', authMiddleware_1.protect, chatController_1.deleteMessage);
// Group Management
router.put('/conversations/:conversationId', authMiddleware_1.protect, chatController_1.updateGroupInfo);
router.post('/conversations/:conversationId/participants', authMiddleware_1.protect, chatController_1.addToGroup);
router.delete('/conversations/:conversationId/participants/:userId', authMiddleware_1.protect, chatController_1.removeFromGroup);
router.put('/conversations/:conversationId/admins/:userId', authMiddleware_1.protect, chatController_1.toggleGroupAdmin);
exports.default = router;
