import { create } from 'zustand';
import api from '../api/axios';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    lastSeen?: Date | string;
    isOnline?: boolean;
}

interface Message {
    _id: string;
    conversationId: string;
    sender: User;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    attachments: string[];
    readBy: string[]; // IDs
    status?: 'SENT' | 'DELIVERED' | 'READ';
    deletedFor?: string[];
    isDeletedForEveryone?: boolean;
    createdAt: string;
    linkMetadata?: {
        url: string;
        title: string;
        description: string;
        image: string;
    };
}

interface Conversation {
    _id: string;
    participants: User[];
    type: 'DIRECT' | 'GROUP';
    name?: string;
    groupAvatar?: string;
    admins?: string[];
    lastMessage?: Message;
    updatedAt: string;
    unreadCount?: number;
}

interface ChatStore {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    messages: Message[];
    isLoading: boolean;
    socket: Socket | null;
    onlineUsers: string[];
    highlightMessageId: string | null;
    setHighlightMessageId: (id: string | null) => void;

    // Actions
    connectSocket: () => void;
    disconnectSocket: () => void;

    fetchConversations: () => Promise<void>;
    selectConversation: (conv: Conversation, messageId?: string) => void;

    fetchMessages: (convId: string, page?: number, aroundMessageId?: string) => Promise<void>;
    sendMessage: (content: string, type?: 'TEXT' | 'IMAGE' | 'FILE', attachments?: string[]) => Promise<void>;

    createDirectConversation: (targetUserId: string) => Promise<string>; // returns convId
    createGroupConversation: (name: string, participantIds: string[]) => Promise<string>;
    updateGroupInfo: (convId: string, name?: string, avatar?: string) => Promise<void>;
    addParticipant: (convId: string, userId: string) => Promise<void>;
    removeParticipant: (convId: string, userId: string) => Promise<void>;
    toggleGroupAdmin: (convId: string, userId: string) => Promise<void>;

    markAsRead: (convId: string) => void;
    totalUnreadCount: number;
    toggleChat: () => void;
    isChatOpen: boolean;

    // Typing & Status
    startTyping: () => void;
    stopTyping: () => void;
    typingUsers: Record<string, string[]>; // convId -> userIds[]
    deleteMessage: (messageId: string, deleteForEveryone: boolean) => Promise<void>;

    // Notifications
    notification: { visible: boolean; data: any };
    showNotification: (data: any) => void;
    hideNotification: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    socket: null,
    onlineUsers: [],
    totalUnreadCount: 0,
    isChatOpen: false,
    typingUsers: {},
    notification: { visible: false, data: null },
    highlightMessageId: null,
    setHighlightMessageId: (id) => set({ highlightMessageId: id }),

    showNotification: (data: any) => {
        set({ notification: { visible: true, data } });
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.error('Notification sound failed:', e));
    },
    hideNotification: () => set({ notification: { visible: false, data: null } }),

    toggleChat: () => set(state => {
        const newState = !state.isChatOpen;
        return {
            isChatOpen: newState,
            activeConversation: newState ? state.activeConversation : null // Close conversation when widget closes
        };
    }),

    connectSocket: () => {
        const { socket } = get();
        if (socket?.connected) return;

        const token = useAuthStore.getState().token;
        if (!token) return;

        // Ensure backend URL is correct (use base URL without /api/v1)
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';
        const socketInstance = io(socketUrl);

        socketInstance.on('connect', () => {
            console.log('Chat Socket Connected');
            const user = useAuthStore.getState().user;
            if (user) {
                socketInstance.emit('join_user', user.id);
            }
        });

        socketInstance.on('new_message', (message: Message) => {
            const { activeConversation, messages, conversations, isChatOpen } = get();
            const currentUserId = useAuthStore.getState().user?.id;

            // Ack delivery if it's not our own message
            if (message.sender._id !== currentUserId) {
                socketInstance.emit('message_received', {
                    messageId: message._id,
                    conversationId: message.conversationId
                });
            }

            // If message belongs to active chat AND chat is open, append it
            if (activeConversation?._id === message.conversationId) {
                // Prevent duplicates
                if (messages.some(m => m._id === message._id)) return;

                if (isChatOpen) {
                    set({ messages: [...messages, message] });
                    // Mark as read immediately if open
                    get().markAsRead(activeConversation?._id || '');

                    // Play chat pop sound for incoming messages (not from self)
                    if (message.sender._id !== useAuthStore.getState().user?.id) {
                        const audio = new Audio('/sounds/chat.mp3');
                        audio.play().catch(e => console.error('Chat sound failed:', e));
                    }
                }
            }

            // Update conversation list
            const updatedConvs = conversations.map(c => {
                if (c._id === message.conversationId) {
                    const isUnread = (!isChatOpen || activeConversation?._id !== c._id) && message.sender._id !== useAuthStore.getState().user?.id;
                    return {
                        ...c,
                        lastMessage: message,
                        updatedAt: message.createdAt,
                        unreadCount: isUnread ? (c.unreadCount || 0) + 1 : (c.unreadCount || 0)
                    };
                }
                return c;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            // If new conversation (not in list), fetch all again to be safe or add logic
            if (!conversations.find(c => c._id === message.conversationId)) {
                get().fetchConversations();
            } else {
                const totalUnread = updatedConvs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
                set({ conversations: updatedConvs, totalUnreadCount: totalUnread });
            }

            // Show glass notification if chat is closed or different convo
            if (!isChatOpen || activeConversation?._id !== message.conversationId) {
                if (message.sender._id !== useAuthStore.getState().user?.id) {
                    get().showNotification({
                        id: message._id,
                        sender: message.sender,
                        content: message.type === 'IMAGE' ? 'Sent an image' : message.content,
                        conversationId: message.conversationId
                    });
                }
            }
        });

        socketInstance.on('conversation_updated', ({ conversationId, lastMessage }) => {
            // Logic to update list without appending message if not active
            const { conversations } = get();
            const updatedConvs = conversations.map(c => {
                if (c._id === conversationId) {
                    return { ...c, lastMessage, updatedAt: lastMessage.createdAt };
                }
                return c;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            set({ conversations: updatedConvs });
        });

        socketInstance.on('user_status_changed', ({ userId, status, lastSeen }: { userId: string, status: string, lastSeen?: string }) => {
            const { conversations, onlineUsers } = get();

            // Update online users list
            let newOnlineUsers = [...onlineUsers];
            if (status === 'ONLINE' && !newOnlineUsers.includes(userId)) {
                newOnlineUsers.push(userId);
            } else if (status === 'OFFLINE') {
                newOnlineUsers = newOnlineUsers.filter(id => id !== userId);
            }

            // Update participants status in conversations
            const updatedConvs = conversations.map(conv => ({
                ...conv,
                participants: conv.participants.map(p =>
                    p._id === userId ? { ...p, isOnline: status === 'ONLINE', lastSeen } : p
                )
            }));

            set({ onlineUsers: newOnlineUsers, conversations: updatedConvs });
        });

        socketInstance.on('user_typing', ({ conversationId, userId }) => {
            const { typingUsers } = get();
            const current = typingUsers[conversationId] || [];
            if (!current.includes(userId)) {
                set({ typingUsers: { ...typingUsers, [conversationId]: [...current, userId] } });
            }
        });

        socketInstance.on('user_stopped_typing', ({ conversationId, userId }) => {
            const { typingUsers } = get();
            const current = typingUsers[conversationId] || [];
            set({ typingUsers: { ...typingUsers, [conversationId]: current.filter(id => id !== userId) } });
        });

        socketInstance.on('messages_read', ({ conversationId, readBy }) => {
            const { messages, activeConversation, conversations } = get();

            // 1. Update Active Conversation Messages
            if (activeConversation?._id === conversationId) {
                const updatedMessages = messages.map(m => {
                    if (!m.readBy.includes(readBy)) {
                        return { ...m, readBy: [...m.readBy, readBy], status: 'READ' as const };
                    }
                    return m;
                });
                set({ messages: updatedMessages });
            }

            // 2. Update Conversation List (lastMessage status)
            const updatedConvs = conversations.map(c => {
                if (c._id === conversationId && c.lastMessage) {
                    // Optimistically mark last message as READ if it was sent by us and now read by them
                    // Or generically update it.
                    // If the current user is NOT the one who read it (i.e. we are the sender), show Blue Checks
                    if (readBy !== useAuthStore.getState().user?.id) {
                        return {
                            ...c,
                            lastMessage: { ...c.lastMessage, status: 'READ' as const, readBy: [...(c.lastMessage.readBy || []), readBy] }
                        };
                    }
                }
                return c;
            });
            set({ conversations: updatedConvs });
        });

        // Handle generic status updates (e.g. DELIVERED)
        socketInstance.on('message_status_update', ({ messageId, conversationId, status }) => {
            const { messages, conversations } = get();

            // Update Messages
            set({
                messages: messages.map(m => m._id === messageId ? { ...m, status } : m)
            });

            // Update Conversation List
            set({
                conversations: conversations.map(c =>
                    c._id === conversationId && c.lastMessage?._id === messageId
                        ? { ...c, lastMessage: { ...c.lastMessage!, status } }
                        : c
                )
            });
        });

        socketInstance.on('message_deleted', ({ messageId, conversationId, deleteForEveryone }) => {
            const { messages, activeConversation, conversations } = get();

            // Update active messages if relevant
            if (activeConversation?._id === conversationId) {
                if (deleteForEveryone) {
                    set({
                        messages: messages.map(m =>
                            m._id === messageId
                                ? { ...m, content: '', attachments: [], isDeletedForEveryone: true }
                                : m
                        )
                    });
                } else {
                    set({ messages: messages.filter(m => m._id !== messageId) });
                }
            }
        });

        socketInstance.on('group_updated', (updatedConv: Conversation) => {
            const { activeConversation, conversations } = get();

            // Update list
            const newConvs = conversations.map(c => c._id === updatedConv._id ? updatedConv : c);

            // Update active if matches
            let newActive = activeConversation;
            if (activeConversation?._id === updatedConv._id) {
                newActive = updatedConv;
            }

            set({ conversations: newConvs, activeConversation: newActive });
        });

        socketInstance.on('added_to_group', (conv: Conversation) => {
            const { conversations, socket } = get();

            // Avoid duplicates
            if (!conversations.find(c => c._id === conv._id)) {
                set({ conversations: [conv, ...conversations] });
                if (socket) {
                    socket.emit('join_chat', conv._id);
                }
            }
        });

        // Handle page close/refresh - set status to OFFLINE
        const handleBeforeUnload = () => {
            const user = useAuthStore.getState().user;
            if (socketInstance && user) {
                socketInstance.emit('change_status', { userId: user.id, status: 'OFFLINE' });
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Store cleanup function
        socketInstance.on('disconnect', () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        });

        set({ socket: socketInstance });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    fetchConversations: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/chats/conversations');
            const convs = res.data;
            const total = convs.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
            set({ conversations: convs, totalUnreadCount: total });

            // Join all conversation rooms to receive concurrent updates (typing, etc.)
            const { socket } = get();
            if (socket && socket.connected) {
                convs.forEach((c: any) => socket.emit('join_chat', c._id));
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            set({ isLoading: false });
        }
    },

    selectConversation: async (conv, messageId) => {
        const { activeConversation, socket } = get();

        // Leave previous room if switching or closing
        if (activeConversation && (!conv || activeConversation._id !== conv._id)) {
            socket?.emit('leave_chat', activeConversation._id);
            socket?.emit('user_stopped_typing', { conversationId: activeConversation._id, userId: useAuthStore.getState().user?.id });
        }

        set({ activeConversation: conv, messages: [], highlightMessageId: messageId || null });

        if (!conv) return;

        get().markAsRead(conv._id); // Clear unread count

        if (socket) {
            socket.emit('join_chat', conv._id);
        }
        await get().fetchMessages(conv._id, 1, messageId);
    },

    fetchMessages: async (convId, page = 1, aroundMessageId) => {
        try {
            const url = aroundMessageId
                ? `/chats/conversations/${convId}/messages?aroundMessageId=${aroundMessageId}`
                : `/chats/conversations/${convId}/messages?page=${page}`;

            const res = await api.get(url);
            // Ensure messages are sorted Oldest -> Newest for proper display
            const sortedMessages = res.data.messages.sort((a: Message, b: Message) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            if (page === 1 || aroundMessageId) {
                set({ messages: sortedMessages });
            } else {
                set(state => ({ messages: [...sortedMessages, ...state.messages] })); // Prepend for pagination
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    },

    sendMessage: async (content, type = 'TEXT', attachments = []) => {
        const { activeConversation, messages } = get();
        if (!activeConversation) return;

        // Optimistic UI could happen here
        try {
            const res = await api.post(`/chats/conversations/${activeConversation._id}/messages`, {
                content, type, attachments
            });
            // Socket will handle the incoming message for real-time consistency, 
            // but we can append immediately to feel instant? 
            // Better rely on socket for source of truth or deduplicate.
            // For now, rely on socket event which comes back fast.
        } catch (error) {
            console.error('Failed to send message', error);
        }
    },

    startTyping: () => {
        const { socket, activeConversation } = get();
        const user = useAuthStore.getState().user;
        if (socket && activeConversation && user) {
            socket.emit('start_typing', { conversationId: activeConversation._id, userId: user.id });
        }
    },

    stopTyping: () => {
        const { socket, activeConversation } = get();
        const user = useAuthStore.getState().user;
        if (socket && activeConversation && user) {
            socket.emit('stop_typing', { conversationId: activeConversation._id, userId: user.id });
        }
    },

    deleteMessage: async (messageId, deleteForEveryone) => {
        const { messages, activeConversation } = get();

        // Optimistic update
        if (deleteForEveryone) {
            set({
                messages: messages.map(m =>
                    m._id === messageId
                        ? { ...m, content: '', attachments: [], isDeletedForEveryone: true }
                        : m
                )
            });
        } else {
            // Remove from local list
            set({ messages: messages.filter(m => m._id !== messageId) });
        }

        try {
            await api.delete(`/chats/messages/${messageId}`, { data: { deleteForEveryone } });
        } catch (e) {
            console.error('Failed to delete message', e);
            // Revert logic would be here if strictly robust
        }
    },

    createDirectConversation: async (targetUserId) => {
        try {
            const res = await api.post('/chats/conversations/direct', { targetUserId });
            // Add to list
            const newConv = res.data;
            const { conversations } = get();

            // Check if exists in list
            if (!conversations.find(c => c._id === newConv._id)) {
                set({ conversations: [newConv, ...conversations] });
            }
            return newConv._id;
        } catch (error) {
            throw error;
        }
    },

    createGroupConversation: async (name, participantIds) => {
        try {
            const res = await api.post('/chats/conversations/group', { name, participantIds });
            const newConv = res.data;
            set(state => ({ conversations: [newConv, ...state.conversations] }));
            return newConv._id;
        } catch (error) {
            throw error;
        }
    },

    updateGroupInfo: async (convId, name, avatar) => {
        try {
            await api.put(`/chats/conversations/${convId}`, { name, groupAvatar: avatar });
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    addParticipant: async (convId, userId) => {
        try {
            await api.post(`/chats/conversations/${convId}/participants`, { userId });
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    removeParticipant: async (convId, userId) => {
        try {
            await api.delete(`/chats/conversations/${convId}/participants/${userId}`);
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    toggleGroupAdmin: async (convId, userId) => {
        try {
            await api.put(`/chats/conversations/${convId}/admins/${userId}`);
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    markAsRead: (convId: string) => {
        const { conversations } = get();
        const updatedConvs = conversations.map(c => {
            if (c._id === convId) {
                return { ...c, unreadCount: 0 };
            }
            return c;
        });
        const totalUnread = updatedConvs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        set({ conversations: updatedConvs, totalUnreadCount: totalUnread });
        // Call API to persist read status
        try {
            api.post(`/chats/conversations/${convId}/read`);
        } catch (e) { console.error('Failed to mark read', e); }
    }
}));
