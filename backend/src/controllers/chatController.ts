import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { SystemSetting } from '../models/SystemSetting';
import { getIO } from '../services/socketService';
import axios from 'axios';

// Get all conversations for current user
export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const currentUserId = req.user.id;
        const conversations = await Conversation.find({
            $or: [
                { participants: currentUserId },
                { 'leftParticipants.user': currentUserId }
            ]
        })
            .populate('participants', 'name email role avatar lastSeen')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        // Calculate unread counts
        const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                sender: { $ne: currentUserId },
                readBy: { $ne: currentUserId }
            });
            return {
                ...conv.toObject(),
                unreadCount
            };
        }));

        res.json(conversationsWithUnread);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create or Get Direct Conversation
export const createDirectConversation = async (req: AuthRequest, res: Response) => {
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
        } else {
            query = {
                type: 'DIRECT',
                participants: {
                    $size: 2,
                    $all: [currentUserId, targetUserId]
                }
            };
        }

        const existing = await Conversation.findOne(query).populate('participants', 'name email role avatar lastSeen');

        if (existing) {
            return res.json(existing);
        }

        // Create new
        const newConv = await Conversation.create({
            type: 'DIRECT',
            participants: [currentUserId, targetUserId]
        });

        const populated = await Conversation.findById(newConv._id).populate('participants', 'name email role avatar');

        // Notify target user via socket? Optional, they will see it when msg comes.
        res.status(201).json(populated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create Group Conversation
export const createGroupConversation = async (req: AuthRequest, res: Response) => {
    try {
        const { name, participantIds, groupAvatar } = req.body;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        // Check System Settings (Global Kill Switch)
        const chatEnabled = await SystemSetting.findOne({ key: 'chat_enabled' });
        if (chatEnabled && chatEnabled.value === false) {
            return res.status(503).json({ message: 'Chat system is currently disabled by administrator.' });
        }

        // Check Group Creation Policy (Admin Override)
        const allowGroups = await SystemSetting.findOne({ key: 'chat_allow_group_creation' });
        if (allowGroups && allowGroups.value === false && currentUserRole !== 'ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Group creation is currently disabled for your role.' });
        }

        if (!name || !participantIds || participantIds.length < 2) {
            return res.status(400).json({ message: 'Name and participants required' });
        }

        // Add current user to participants
        const allParticipants = [...new Set([...participantIds, currentUserId])];

        const newGroup = await Conversation.create({
            type: 'GROUP',
            name,
            participants: allParticipants,
            groupAvatar,
            admins: [currentUserId]
        });

        const populated = await newGroup.populate('participants', 'name email role avatar');

        // Notify added users
        const io = getIO();
        populated.participants.forEach((p: any) => {
            // Notify each user to add to their list (including creator, though they get response)
            // Ideally creator handles response, but event is fine too as long as we handle dupes
            io.to(`user_${p._id}`).emit('added_to_group', populated);
        });

        res.status(201).json(populated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get Messages for a Conversation
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50, aroundMessageId } = req.query;

        // Check participation (active or left)
        const conversation = await Conversation.findOne({
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
        let query: any = { conversationId };

        // If removed/left, limit history
        const leftData = (conversation as any).leftParticipants?.find(
            (p: any) => p.user.toString() === req.user.id
        );
        if (leftData) {
            query.createdAt = { $lte: leftData.leftAt };
        }

        let messages;
        let pageNum = Number(page);
        let total = 0;

        if (aroundMessageId) {
            // Contextual fetch
            const targetMsg = await Message.findById(aroundMessageId);
            if (!targetMsg) return res.status(404).json({ message: 'Message not found' });

            const older_messages = await Message.find({
                conversationId,
                createdAt: { $lte: targetMsg.createdAt } // includes target
            })
                .sort({ createdAt: -1 })
                .limit(25)
                .populate('sender', 'name email role avatar');

            const newer_messages = await Message.find({
                conversationId,
                createdAt: { $gt: targetMsg.createdAt }
            })
                .sort({ createdAt: 1 })
                .limit(25)
                .populate('sender', 'name email role avatar');

            messages = [...older_messages.reverse(), ...newer_messages];
            // Total logic is tricky here, but for "jump to" we might not need accurate pages immediately.
            // Just returning the slice.
            total = await Message.countDocuments({ conversationId });
            pageNum = 1; // Reset to 1 implies this is the "current view"

        } else {
            // Standard pagination
            messages = await Message.find(query)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * Number(limit))
                .limit(Number(limit))
                .populate('sender', 'name email role avatar');

            messages = messages.reverse();
            total = await Message.countDocuments({ conversationId });
        }

        res.json({
            messages: messages,
            page: pageNum,
            pages: Math.ceil(total / Number(limit))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to extract first URL
const extractUrl = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
};

// Helper to fetch OG metadata
const fetchLinkMetadata = async (url: string) => {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 5000
        });
        const html = response.data;

        // Simple regex parsing for OG tags
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/) || html.match(/<meta name="description" content="([^"]+)"/);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

        if (!titleMatch && !descMatch) return null;

        return {
            url,
            title: titleMatch ? titleMatch[1] : '',
            description: descMatch ? descMatch[1] : '',
            image: imageMatch ? imageMatch[1] : ''
        };
    } catch (e) {
        console.error('Failed to fetch link metadata', e);
        return null;
    }
};

// Send Message
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        // Check System Settings (Global Kill Switch)
        const chatEnabled = await SystemSetting.findOne({ key: 'chat_enabled' });
        if (chatEnabled && chatEnabled.value === false) {
            // Allow Super Admins to bypass? Maybe not for now.
            return res.status(503).json({ message: 'Chat system is currently disabled by administrator.' });
        }

        const { conversationId } = req.params;
        const { content, type = 'TEXT', attachments = [] } = req.body;
        const senderId = req.user.id;

        const conversation = await Conversation.findOne({
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
                linkMetadata = await fetchLinkMetadata(url);
            }
        }

        const newMessage = await Message.create({
            conversationId,
            sender: senderId,
            content,
            type,
            attachments,
            readBy: [senderId],
            status: 'SENT',
            linkMetadata
        });

        const populatedMsg = await newMessage.populate('sender', 'name email role avatar');

        // Update Conversation lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
            updatedAt: new Date()
        });

        // Socket Emit
        try {
            const io = getIO();
            // Emit to room `chat_{conversationId}` (Legacy/Active room support)
            io.to(`chat_${conversationId}`).emit('new_message', populatedMsg);

            // Emit to ALL participants via personal rooms to ensure delivery (Notification support)
            conversation.participants.forEach((pId: any) => {
                io.to(`user_${pId.toString()}`).emit('new_message', populatedMsg);
            });

        } catch (err) {
            console.error('Socket emit failed', err);
        }

        res.status(201).json(populatedMsg);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Search Colleagues (exclude Clients)
export const searchColleagues = async (req: AuthRequest, res: Response) => {
    try {
        const { search } = req.query;
        if (!search) return res.json([]);

        const users = await User.find({
            role: { $ne: 'CLIENT' },
            name: { $regex: search as string, $options: 'i' }
        }).select('name email role avatar').limit(20);

        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Mark messages as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        await Message.updateMany(
            { conversationId, readBy: { $ne: userId } },
            {
                $addToSet: { readBy: userId },
                $set: { status: 'READ' }
            }
        );

        // Notify sender that messages were read
        const io = getIO();
        io.to(`chat_${conversationId}`).emit('messages_read', { conversationId, readBy: userId });

        // Also notify participants individually (for List View updates)
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            conversation.participants.forEach((p: any) => {
                io.to(`user_${p.toString()}`).emit('messages_read', { conversationId, readBy: userId });
            });
        }

        res.status(200).json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Search Conversations (by participant name or message content)
export const searchConversations = async (req: AuthRequest, res: Response) => {
    try {
        const { query } = req.query;
        const userId = req.user.id;

        if (!query) return res.json([]);

        // 1. Find matching users
        const matchingUsers = await User.find({
            name: { $regex: query as string, $options: 'i' }
        }).distinct('_id');

        // 2. Find matching messages in user's conversations
        const userConversationsIds = await Conversation.find({ participants: userId }).distinct('_id');

        const matchingMessages = await Message.find({
            conversationId: { $in: userConversationsIds },
            content: { $regex: query as string, $options: 'i' }
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
        const conversations = await Conversation.find({
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
        const result = await Promise.all(conversations.map(async (conv) => {
            const plainConv = conv.toObject();

            // Attach matched message if exists
            if (msgMap.has(conv._id.toString())) {
                (plainConv as any).matchedMessage = msgMap.get(conv._id.toString());
            }

            // Calculate unread count
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            });

            return { ...plainConv, unreadCount };
        }));

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Message
export const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { messageId } = req.params;
        const { deleteForEveryone } = req.body;
        const userId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        if (deleteForEveryone) {
            // Check if sender, global admin, or group admin
            const conversation = await Conversation.findById(message.conversationId);
            const isGroupAdmin = conversation?.admins?.some(a => a.toString() === userId);

            if (message.sender.toString() !== userId && req.user.role !== 'ADMIN' && !isGroupAdmin) {
                return res.status(403).json({ message: 'Not authorized to delete for everyone' });
            }

            message.isDeletedForEveryone = true;
            message.content = ''; // Clear content
            message.attachments = [];
            await message.save();

            const io = getIO();
            io.to(`chat_${message.conversationId}`).emit('message_deleted', {
                messageId,
                conversationId: message.conversationId,
                deleteForEveryone: true
            });

        } else {
            // Delete for me
            if (!message.deletedFor.includes(userId)) {
                message.deletedFor.push(userId);
                await message.save();
            }
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Add Participant
export const addToGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;
        const adminId = req.user.id;

        const conv = await Conversation.findById(conversationId);
        if (!conv) return res.status(404).json({ message: 'Conversation not found' });

        if (!conv.admins.includes(adminId as any)) return res.status(403).json({ message: 'Admin only' });

        if (!conv.participants.includes(userId)) {
            conv.participants.push(userId);
            await conv.save();
            await conv.populate('participants', 'name email role avatar lastSeen');

            const io = getIO();
            io.to(`chat_${conversationId}`).emit('group_updated', conv);
            io.to(`user_${userId}`).emit('added_to_group', conv);

            // System Message
            const adminUser = await User.findById(adminId);
            const targetUser = await User.findById(userId);
            if (adminUser && targetUser) {
                const sysMsg = await Message.create({
                    conversationId,
                    sender: adminId,
                    content: `${adminUser.name} added ${targetUser.name}`,
                    type: 'SYSTEM',
                    readBy: [adminId]
                });
                await sysMsg.populate('sender', 'name avatar');
                io.to(`chat_${conversationId}`).emit('new_message', sysMsg);
            }
        }

        res.json(conv);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

// Remove Participant
export const removeFromGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId, userId } = req.params;
        const requesterId = req.user.id;

        const conv = await Conversation.findById(conversationId);
        if (!conv) return res.status(404).json({ message: 'Conversation not found' });

        const isSelf = userId === requesterId;
        const isAdmin = conv.admins.includes(requesterId as any);

        if (!isSelf && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

        // Get names before removing? Or just findById
        const targetUser = await User.findById(userId);
        const requesterUser = await User.findById(requesterId);

        // Remove from participants
        conv.participants = conv.participants.filter(p => p.toString() !== userId);
        // Remove from admins
        conv.admins = conv.admins.filter(a => a.toString() !== userId);

        // Add to leftParticipants for history retention
        if (!(conv as any).leftParticipants) {
            (conv as any).leftParticipants = [];
        }
        (conv as any).leftParticipants.push({ user: userId, leftAt: new Date() });

        await conv.save();
        await conv.populate('participants', 'name email role avatar lastSeen');

        const io = getIO();
        io.to(`chat_${conversationId}`).emit('group_updated', conv);

        // System Message
        if (targetUser && requesterUser) {
            const content = isSelf ? `${requesterUser.name} left the group` : `${requesterUser.name} removed ${targetUser.name}`;
            const sysMsg = await Message.create({
                conversationId,
                sender: requesterId,
                content,
                type: 'SYSTEM',
                readBy: [requesterId]
            });
            await sysMsg.populate('sender', 'name avatar');
            io.to(`chat_${conversationId}`).emit('new_message', sysMsg);
        }

        res.json(conv);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

// Toggle Admin
export const toggleGroupAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId, userId } = req.params;
        const adminId = req.user.id;

        const conv = await Conversation.findById(conversationId);
        if (!conv) return res.status(404).json({ message: 'Conversation not found' });

        if (!conv.admins.includes(adminId as any)) return res.status(403).json({ message: 'Admin only' });

        const isAlreadyAdmin = conv.admins.some(a => a.toString() === userId);
        let action = '';

        if (isAlreadyAdmin) {
            conv.admins = conv.admins.filter(a => a.toString() !== userId);
            action = 'removed Admin role from';
        } else {
            conv.admins.push(userId as any);
            action = 'promoted to Admin:';
        }

        await conv.save();
        await conv.populate('participants', 'name email role avatar lastSeen');

        const io = getIO();
        io.to(`chat_${conversationId}`).emit('group_updated', conv);

        // System Message
        const adminUser = await User.findById(adminId);
        const targetUser = await User.findById(userId);
        if (adminUser && targetUser) {
            // "Admin promoted User" or "Admin removed Admin role from User"
            const content = isAlreadyAdmin
                ? `${adminUser.name} removed Admin role from ${targetUser.name}`
                : `${adminUser.name} promoted ${targetUser.name} to Admin`;

            const sysMsg = await Message.create({
                conversationId,
                sender: adminId,
                content,
                type: 'SYSTEM',
                readBy: [adminId]
            });
            await sysMsg.populate('sender', 'name avatar');
            io.to(`chat_${conversationId}`).emit('new_message', sysMsg);
        }

        res.json(conv);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

// Update Group Info
export const updateGroupInfo = async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { name, groupAvatar } = req.body;
        const adminId = req.user.id;

        const conv = await Conversation.findById(conversationId);
        if (!conv) return res.status(404).json({ message: 'Conversation not found' });

        if (!conv.admins.includes(adminId as any)) return res.status(403).json({ message: 'Admin only' });

        if (name) conv.name = name;
        if (groupAvatar) conv.groupAvatar = groupAvatar;

        await conv.save();
        await conv.populate('participants', 'name email role avatar lastSeen');

        const io = getIO();
        io.to(`chat_${conversationId}`).emit('group_updated', conv);

        // System Message
        const adminUser = await User.findById(adminId);
        if (adminUser) {
            const sysMsg = await Message.create({
                conversationId,
                sender: adminId,
                content: `${adminUser.name} updated group info`,
                type: 'SYSTEM',
                readBy: [adminId]
            });
            await sysMsg.populate('sender', 'name avatar');
            io.to(`chat_${conversationId}`).emit('new_message', sysMsg);
        }

        res.json(conv);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};
