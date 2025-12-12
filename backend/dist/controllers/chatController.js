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
exports.updateGroupInfo = exports.toggleGroupAdmin = exports.removeFromGroup = exports.addToGroup = exports.deleteMessage = exports.searchConversations = exports.markAsRead = exports.searchColleagues = exports.sendMessage = exports.getMessages = exports.createGroupConversation = exports.createDirectConversation = exports.getConversations = void 0;
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
const SystemSetting_1 = require("../models/SystemSetting");
const socketService_1 = require("../services/socketService");
const axios_1 = __importDefault(require("axios"));
// Get all conversations for current user
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const conversations = yield Conversation_1.Conversation.find({
            $or: [
                { participants: currentUserId },
                { 'leftParticipants.user': currentUserId }
            ]
        })
            .populate('participants', 'name email role avatar lastSeen')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        // Calculate unread counts
        const conversationsWithUnread = yield Promise.all(conversations.map((conv) => __awaiter(void 0, void 0, void 0, function* () {
            const unreadCount = yield Message_1.Message.countDocuments({
                conversationId: conv._id,
                sender: { $ne: currentUserId },
                readBy: { $ne: currentUserId }
            });
            return Object.assign(Object.assign({}, conv.toObject()), { unreadCount });
        })));
        res.json(conversationsWithUnread);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getConversations = getConversations;
// Create or Get Direct Conversation
const createDirectConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.id;
        if (!targetUserId) {
            return res.status(400).json({ message: 'Target user required' });
        }
        // Check if exists
        let query;
        if (currentUserId.toString() === targetUserId.toString()) {
            query = {
                type: 'DIRECT',
                participants: {
                    $size: 2,
                    $not: { $elemMatch: { $ne: currentUserId } }
                }
            };
        }
        else {
            query = {
                type: 'DIRECT',
                participants: {
                    $size: 2,
                    $all: [currentUserId, targetUserId]
                }
            };
        }
        const existing = yield Conversation_1.Conversation.findOne(query).populate('participants', 'name email role avatar lastSeen');
        if (existing) {
            return res.json(existing);
        }
        // Create new
        const newConv = yield Conversation_1.Conversation.create({
            type: 'DIRECT',
            participants: [currentUserId, targetUserId]
        });
        const populated = yield Conversation_1.Conversation.findById(newConv._id).populate('participants', 'name email role avatar');
        // Notify target user via socket? Optional, they will see it when msg comes.
        res.status(201).json(populated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createDirectConversation = createDirectConversation;
// Create Group Conversation
const createGroupConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, participantIds, groupAvatar } = req.body;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;
        // Check System Settings (Global Kill Switch)
        const chatEnabled = yield SystemSetting_1.SystemSetting.findOne({ key: 'chat_enabled' });
        if (chatEnabled && chatEnabled.value === false) {
            return res.status(503).json({ message: 'Chat system is currently disabled by administrator.' });
        }
        // Check Group Creation Policy (Admin Override)
        const allowGroups = yield SystemSetting_1.SystemSetting.findOne({ key: 'chat_allow_group_creation' });
        if (allowGroups && allowGroups.value === false && currentUserRole !== 'ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Group creation is currently disabled for your role.' });
        }
        if (!name || !participantIds || participantIds.length < 2) {
            return res.status(400).json({ message: 'Name and participants required' });
        }
        // Add current user to participants
        const allParticipants = [...new Set([...participantIds, currentUserId])];
        const newGroup = yield Conversation_1.Conversation.create({
            type: 'GROUP',
            name,
            participants: allParticipants,
            groupAvatar,
            admins: [currentUserId]
        });
        const populated = yield newGroup.populate('participants', 'name email role avatar');
        // Notify added users
        const io = (0, socketService_1.getIO)();
        populated.participants.forEach((p) => {
            // Notify each user to add to their list (including creator, though they get response)
            // Ideally creator handles response, but event is fine too as long as we handle dupes
            io.to(`user_${p._id}`).emit('added_to_group', populated);
        });
        res.status(201).json(populated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createGroupConversation = createGroupConversation;
// Get Messages for a Conversation
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50, aroundMessageId } = req.query;
        // Check participation (active or left)
        const conversation = yield Conversation_1.Conversation.findOne({
            _id: conversationId,
            $or: [
                { participants: req.user.id },
                { 'leftParticipants.user': req.user.id }
            ]
        });
        if (!conversation) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Base query for messages
        let query = { conversationId };
        // If removed/left, limit history
        const leftData = (_a = conversation.leftParticipants) === null || _a === void 0 ? void 0 : _a.find((p) => p.user.toString() === req.user.id);
        if (leftData) {
            query.createdAt = { $lte: leftData.leftAt };
        }
        let messages;
        let pageNum = Number(page);
        let total = 0;
        if (aroundMessageId) {
            // Contextual fetch
            const targetMsg = yield Message_1.Message.findById(aroundMessageId);
            if (!targetMsg)
                return res.status(404).json({ message: 'Message not found' });
            const older_messages = yield Message_1.Message.find({
                conversationId,
                createdAt: { $lte: targetMsg.createdAt } // includes target
            })
                .sort({ createdAt: -1 })
                .limit(25)
                .populate('sender', 'name email role avatar');
            const newer_messages = yield Message_1.Message.find({
                conversationId,
                createdAt: { $gt: targetMsg.createdAt }
            })
                .sort({ createdAt: 1 })
                .limit(25)
                .populate('sender', 'name email role avatar');
            messages = [...older_messages.reverse(), ...newer_messages];
            // Total logic is tricky here, but for "jump to" we might not need accurate pages immediately.
            // Just returning the slice.
            total = yield Message_1.Message.countDocuments({ conversationId });
            pageNum = 1; // Reset to 1 implies this is the "current view"
        }
        else {
            // Standard pagination
            messages = yield Message_1.Message.find(query)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * Number(limit))
                .limit(Number(limit))
                .populate('sender', 'name email role avatar');
            messages = messages.reverse();
            total = yield Message_1.Message.countDocuments({ conversationId });
        }
        res.json({
            messages: messages,
            page: pageNum,
            pages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMessages = getMessages;
// Helper to extract first URL
const extractUrl = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
};
// Helper to fetch OG metadata
const fetchLinkMetadata = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 5000
        });
        const html = response.data;
        // Simple regex parsing for OG tags
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/) || html.match(/<meta name="description" content="([^"]+)"/);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (!titleMatch && !descMatch)
            return null;
        return {
            url,
            title: titleMatch ? titleMatch[1] : '',
            description: descMatch ? descMatch[1] : '',
            image: imageMatch ? imageMatch[1] : ''
        };
    }
    catch (e) {
        console.error('Failed to fetch link metadata', e);
        return null;
    }
});
// Send Message
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check System Settings (Global Kill Switch)
        const chatEnabled = yield SystemSetting_1.SystemSetting.findOne({ key: 'chat_enabled' });
        if (chatEnabled && chatEnabled.value === false) {
            // Allow Super Admins to bypass? Maybe not for now.
            return res.status(503).json({ message: 'Chat system is currently disabled by administrator.' });
        }
        const { conversationId } = req.params;
        const { content, type = 'TEXT', attachments = [] } = req.body;
        const senderId = req.user.id;
        const conversation = yield Conversation_1.Conversation.findOne({
            _id: conversationId,
            participants: senderId
        });
        if (!conversation) {
            return res.status(403).json({ message: 'Conversation not found or access denied' });
        }
        let linkMetadata = undefined;
        if (type === 'TEXT' && content) {
            const url = extractUrl(content);
            if (url) {
                console.log('Fetching metadata for:', url);
                linkMetadata = yield fetchLinkMetadata(url);
            }
        }
        const newMessage = yield Message_1.Message.create({
            conversationId,
            sender: senderId,
            content,
            type,
            attachments,
            readBy: [senderId],
            status: 'SENT',
            linkMetadata
        });
        const populatedMsg = yield newMessage.populate('sender', 'name email role avatar');
        // Update Conversation lastMessage
        yield Conversation_1.Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
            updatedAt: new Date()
        });
        // Socket Emit
        try {
            const io = (0, socketService_1.getIO)();
            // Emit to room `chat_{conversationId}` (Legacy/Active room support)
            io.to(`chat_${conversationId}`).emit('new_message', populatedMsg);
            // Emit to ALL participants via personal rooms to ensure delivery (Notification support)
            conversation.participants.forEach((pId) => {
                io.to(`user_${pId.toString()}`).emit('new_message', populatedMsg);
            });
        }
        catch (err) {
            console.error('Socket emit failed', err);
        }
        res.status(201).json(populatedMsg);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.sendMessage = sendMessage;
// Search Colleagues (exclude Clients)
const searchColleagues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        if (!search)
            return res.json([]);
        const users = yield User_1.User.find({
            role: { $ne: 'CLIENT' },
            name: { $regex: search, $options: 'i' }
        }).select('name email role avatar').limit(20);
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.searchColleagues = searchColleagues;
// Mark messages as read
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        yield Message_1.Message.updateMany({ conversationId, readBy: { $ne: userId } }, {
            $addToSet: { readBy: userId },
            $set: { status: 'READ' }
        });
        // Notify sender that messages were read
        const io = (0, socketService_1.getIO)();
        io.to(`chat_${conversationId}`).emit('messages_read', { conversationId, readBy: userId });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.markAsRead = markAsRead;
// Search Conversations (by participant name or message content)
const searchConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        const userId = req.user.id;
        if (!query)
            return res.json([]);
        // 1. Find matching users
        const matchingUsers = yield User_1.User.find({
            name: { $regex: query, $options: 'i' }
        }).distinct('_id');
        // 2. Find matching messages in user's conversations
        const userConversationsIds = yield Conversation_1.Conversation.find({ participants: userId }).distinct('_id');
        const matchingMessages = yield Message_1.Message.find({
            conversationId: { $in: userConversationsIds },
            content: { $regex: query, $options: 'i' }
        })
            .populate('sender', 'name email role avatar')
            .sort({ createdAt: -1 }); // Reading file first
        // Map conversationId -> Matched Message (first one found is result of sort)
        const msgMap = new Map();
        const msgConversationIds = new Set();
        matchingMessages.forEach(msg => {
            const cid = msg.conversationId.toString();
            if (!msgMap.has(cid)) {
                msgMap.set(cid, msg);
                msgConversationIds.add(msg.conversationId);
            }
        });
        // 3. Fetch all relevant conversations
        // (From name match OR message match)
        const conversations = yield Conversation_1.Conversation.find({
            $or: [
                { _id: { $in: Array.from(msgConversationIds) } },
                { participants: { $in: matchingUsers, $all: [userId] } }
            ],
            participants: userId
        })
            .populate('participants', 'name email role avatar')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        // 4. Process results
        const result = yield Promise.all(conversations.map((conv) => __awaiter(void 0, void 0, void 0, function* () {
            const plainConv = conv.toObject();
            // Attach matched message if exists
            if (msgMap.has(conv._id.toString())) {
                plainConv.matchedMessage = msgMap.get(conv._id.toString());
            }
            // Calculate unread count
            const unreadCount = yield Message_1.Message.countDocuments({
                conversationId: conv._id,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            });
            return Object.assign(Object.assign({}, plainConv), { unreadCount });
        })));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.searchConversations = searchConversations;
// Delete Message
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messageId } = req.params;
        const { deleteForEveryone } = req.body;
        const userId = req.user.id;
        const message = yield Message_1.Message.findById(messageId);
        if (!message)
            return res.status(404).json({ message: 'Message not found' });
        if (deleteForEveryone) {
            // Check if sender, global admin, or group admin
            const conversation = yield Conversation_1.Conversation.findById(message.conversationId);
            const isGroupAdmin = (_a = conversation === null || conversation === void 0 ? void 0 : conversation.admins) === null || _a === void 0 ? void 0 : _a.some(a => a.toString() === userId);
            if (message.sender.toString() !== userId && req.user.role !== 'ADMIN' && !isGroupAdmin) {
                return res.status(403).json({ message: 'Not authorized to delete for everyone' });
            }
            message.isDeletedForEveryone = true;
            message.content = ''; // Clear content
            message.attachments = [];
            yield message.save();
            const io = (0, socketService_1.getIO)();
            io.to(`chat_${message.conversationId}`).emit('message_deleted', {
                messageId,
                conversationId: message.conversationId,
                deleteForEveryone: true
            });
        }
        else {
            // Delete for me
            if (!message.deletedFor.includes(userId)) {
                message.deletedFor.push(userId);
                yield message.save();
            }
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteMessage = deleteMessage;
// Add Participant
const addToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;
        const adminId = req.user.id;
        const conv = yield Conversation_1.Conversation.findById(conversationId);
        if (!conv)
            return res.status(404).json({ message: 'Conversation not found' });
        if (!conv.admins.includes(adminId))
            return res.status(403).json({ message: 'Admin only' });
        if (!conv.participants.includes(userId)) {
            conv.participants.push(userId);
            yield conv.save();
            yield conv.populate('participants', 'name email role avatar lastSeen');
            const io = (0, socketService_1.getIO)();
            io.to(`chat_${conversationId}`).emit('group_updated', conv);
            io.to(`user_${userId}`).emit('added_to_group', conv);
            // System Message
            const adminUser = yield User_1.User.findById(adminId);
            const targetUser = yield User_1.User.findById(userId);
            if (adminUser && targetUser) {
                const sysMsg = yield Message_1.Message.create({
                    conversationId,
                    sender: adminId,
                    content: `${adminUser.name} added ${targetUser.name}`,
                    type: 'SYSTEM',
                    readBy: [adminId]
                });
                yield sysMsg.populate('sender', 'name avatar');
                io.to(`chat_${conversationId}`).emit('new_message', sysMsg);
            }
        }
        res.json(conv);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.addToGroup = addToGroup;
// Remove Participant
const removeFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, userId } = req.params;
        const requesterId = req.user.id;
        const conv = yield Conversation_1.Conversation.findById(conversationId);
        if (!conv)
            return res.status(404).json({ message: 'Conversation not found' });
        const isSelf = userId === requesterId;
        const isAdmin = conv.admins.includes(requesterId);
        if (!isSelf && !isAdmin)
            return res.status(403).json({ message: 'Not authorized' });
        // Get names before removing? Or just findById
        const targetUser = yield User_1.User.findById(userId);
        const requesterUser = yield User_1.User.findById(requesterId);
        // Remove from participants
        conv.participants = conv.participants.filter(p => p.toString() !== userId);
        // Remove from admins
        conv.admins = conv.admins.filter(a => a.toString() !== userId);
        // Add to leftParticipants for history retention
        if (!conv.leftParticipants) {
            conv.leftParticipants = [];
        }
        conv.leftParticipants.push({ user: userId, leftAt: new Date() });
        yield conv.save();
        yield conv.populate('participants', 'name email role avatar lastSeen');
        const io = (0, socketService_1.getIO)();
        io.to(`chat_${conversationId}`).emit('group_updated', conv);
        // System Message
        if (targetUser && requesterUser) {
            const content = isSelf ? `${requesterUser.name} left the group` : `${requesterUser.name} removed ${targetUser.name}`;
            const sysMsg = yield Message_1.Message.create({
                conversationId,
                sender: requesterId,
                content,
                type: 'SYSTEM',
                readBy: [requesterId]
            });
            yield sysMsg.populate('sender', 'name avatar');
            io.to(`chat_${conversationId}`).emit('new_message', sysMsg);
        }
        res.json(conv);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.removeFromGroup = removeFromGroup;
// Toggle Admin
const toggleGroupAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, userId } = req.params;
        const adminId = req.user.id;
        const conv = yield Conversation_1.Conversation.findById(conversationId);
        if (!conv)
            return res.status(404).json({ message: 'Conversation not found' });
        if (!conv.admins.includes(adminId))
            return res.status(403).json({ message: 'Admin only' });
        const isAlreadyAdmin = conv.admins.some(a => a.toString() === userId);
        let action = '';
        if (isAlreadyAdmin) {
            conv.admins = conv.admins.filter(a => a.toString() !== userId);
            action = 'removed Admin role from';
        }
        else {
            conv.admins.push(userId);
            action = 'promoted to Admin:';
        }
        yield conv.save();
        yield conv.populate('participants', 'name email role avatar lastSeen');
        const io = (0, socketService_1.getIO)();
        io.to(`chat_${conversationId}`).emit('group_updated', conv);
        // System Message
        const adminUser = yield User_1.User.findById(adminId);
        const targetUser = yield User_1.User.findById(userId);
        if (adminUser && targetUser) {
            // "Admin promoted User" or "Admin removed Admin role from User"
            const content = isAlreadyAdmin
                ? `${adminUser.name} removed Admin role from ${targetUser.name}`
                : `${adminUser.name} promoted ${targetUser.name} to Admin`;
            const sysMsg = yield Message_1.Message.create({
                conversationId,
                sender: adminId,
                content,
                type: 'SYSTEM',
                readBy: [adminId]
            });
            yield sysMsg.populate('sender', 'name avatar');
            io.to(`chat_${conversationId}`).emit('new_message', sysMsg);
        }
        res.json(conv);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.toggleGroupAdmin = toggleGroupAdmin;
// Update Group Info
const updateGroupInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const { name, groupAvatar } = req.body;
        const adminId = req.user.id;
        const conv = yield Conversation_1.Conversation.findById(conversationId);
        if (!conv)
            return res.status(404).json({ message: 'Conversation not found' });
        if (!conv.admins.includes(adminId))
            return res.status(403).json({ message: 'Admin only' });
        if (name)
            conv.name = name;
        if (groupAvatar)
            conv.groupAvatar = groupAvatar;
        yield conv.save();
        yield conv.populate('participants', 'name email role avatar lastSeen');
        const io = (0, socketService_1.getIO)();
        io.to(`chat_${conversationId}`).emit('group_updated', conv);
        // System Message
        const adminUser = yield User_1.User.findById(adminId);
        if (adminUser) {
            const sysMsg = yield Message_1.Message.create({
                conversationId,
                sender: adminId,
                content: `${adminUser.name} updated group info`,
                type: 'SYSTEM',
                readBy: [adminId]
            });
            yield sysMsg.populate('sender', 'name avatar');
            io.to(`chat_${conversationId}`).emit('new_message', sysMsg);
        }
        res.json(conv);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.updateGroupInfo = updateGroupInfo;
