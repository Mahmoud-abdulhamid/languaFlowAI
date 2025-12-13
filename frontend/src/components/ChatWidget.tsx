import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Send, Paperclip, Smile, MoreVertical, Search, Plus, Phone, Video, Info, FileText, Image as ImageIcon, MessageSquare, X, Minimize2, ChevronLeft, Check, CheckCheck, Trash2, Crown, Shield, Star, Sparkles, UserPlus, LogOut, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';
import { format } from 'date-fns';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { EmojiPicker } from './EmojiPicker';
import { VoiceRecorder } from './VoiceRecorder';
import { VoicePlayer } from './VoicePlayer';

const RoleBadge = ({ role }: { role?: string }) => {
    if (!role) return null;
    switch (role) {
        case 'SUPER_ADMIN':
            return (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 border border-purple-500/30 text-[10px] font-bold shadow-sm" title="Super Admin">
                    <Crown size={10} className="fill-purple-500/20" />
                    <span className="uppercase tracking-wider">Super</span>
                </div>
            );
        case 'ADMIN':
            return (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold" title="Admin">
                    <Shield size={10} className="fill-blue-500/10" />
                    <span>ADMIN</span>
                </div>
            );
        case 'HEAD_TRANSLATOR':
            return (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px] font-bold" title="Head Translator">
                    <Star size={10} className="fill-orange-500/10" />
                    <span>HEAD</span>
                </div>
            );
        case 'TRANSLATOR':
            return <div className="px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] font-bold">TRANSLATOR</div>;
        default:
            // Optional: Badge for others or null
            return null;
    }
};

export const ChatWidget = () => {
    const {
        conversations, activeConversation, messages,
        sendMessage, fetchConversations, selectConversation,
        markAsRead, isLoading, onlineUsers, typingUsers,
        startTyping, stopTyping, totalUnreadCount,
        highlightMessageId, setHighlightMessageId,
        toggleChat, isChatOpen,
        createGroupConversation,
        addParticipant,
        deleteMessage,
        toggleGroupAdmin,
        removeParticipant,
        createDirectConversation,
        notification,
        hideNotification
    } = useChatStore();
    const { user } = useAuthStore();

    // UI State
    const [msgInput, setMsgInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Media & Emoji State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [conversationSearchQuery, setConversationSearchQuery] = useState('');
    const [searchResultsList, setSearchResultsList] = useState<any[] | null>(null); // Null means showing all

    const [isGroupMode, setIsGroupMode] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
    const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false); // Group Info Modal State
    const [isAddingMember, setIsAddingMember] = useState(false); // Add Member Mode

    // Voice Recording State
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (conversationSearchQuery.trim().length > 0) {
                try {
                    const res = await api.get(`/chats/search?query=${conversationSearchQuery}`);
                    setSearchResultsList(res.data);
                } catch (e) {
                    console.error("Search failed", e);
                }
            } else {
                setSearchResultsList(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [conversationSearchQuery]);

    useEffect(() => {
        if (!highlightMessageId) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isChatOpen, activeConversation, highlightMessageId]);

    // Scroll to highlighted message
    useEffect(() => {
        if (highlightMessageId && messages.length > 0) {
            // Delay slightly to ensure render
            setTimeout(() => {
                const element = document.getElementById(`msg-${highlightMessageId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('bg-blue-500/10'); // Flash/Highlight
                }
            }, 100);
        }
    }, [messages, highlightMessageId]);

    // Auto-hide notification
    useEffect(() => {
        if (notification.visible) {
            const timer = setTimeout(() => hideNotification(), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.visible, hideNotification]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMsgInput(e.target.value);

        if (e.target.value.trim()) {
            startTyping();

            // Clear existing timeout
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            // Set new timeout to stop typing after 3 seconds
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping();
            }, 3000);
        } else {
            stopTyping();
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!msgInput.trim() && selectedFiles.length === 0) return;

        // Stop typing immediately
        stopTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        let attachments: string[] = [];
        let type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT';

        if (selectedFiles.length > 0) {
            setIsUploading(true);
            const formData = new FormData();
            selectedFiles.forEach(file => formData.append('files', file));

            try {
                const res = await api.post('/chats/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                attachments = res.data.urls;

                // Determine type based on first file
                if (selectedFiles[0].type.startsWith('image/')) type = 'IMAGE';
                else type = 'FILE';

            } catch (error) {
                console.error('Upload failed', error);
                toast.error('Failed to upload files');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        await sendMessage(msgInput, type, attachments);
        setMsgInput('');
        setSelectedFiles([]);
        setShowEmojiPicker(false);
    };

    const handleVoiceNote = async (audioBlob: Blob, duration: number, waveform: number[]) => {
        if (!activeConversation) return;

        try {
            setIsUploading(true);
            setIsRecordingVoice(false);

            // Convert blob to File for upload
            const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('files', audioFile);

            // Upload audio file
            const uploadRes = await api.post('/chats/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const audioUrl = uploadRes.data.urls[0];

            // Send using chat store's sendMessage function
            // Use FILE type (backend doesn't support VOICE type yet)
            // Store metadata in message content as JSON
            const metadata = { duration, waveform, isVoice: true };
            await sendMessage(
                JSON.stringify(metadata),
                'FILE', // Use FILE instead of VOICE for now
                [audioUrl]
            );

            setIsUploading(false);
            toast.success('Voice note sent!');
        } catch (error) {
            console.error('Failed to send voice note:', error);
            toast.error('Failed to send voice note');
            setIsUploading(false);
            setIsRecordingVoice(false);
        }
    };

    const handleSearchUsers = async (query: string) => {
        setSearchUserQuery(query);
        if (query.length > 1) {
            try {
                const res = await api.get(`/chats/colleagues?search=${query}`);
                setSearchResults(res.data);
            } catch (e) {
                console.error(e);
            }
        } else {
            setSearchResults([]);
        }
    };

    const startChat = async (targetId: string) => {
        try {
            const convId = await createDirectConversation(targetId);
            const conv = conversations.find(c => c._id === convId) || await (await api.get('/chats/conversations')).data.find((c: any) => c._id === convId);
            if (conv) selectConversation(conv);
            setIsNewChatOpen(false);
            setSearchUserQuery('');
        } catch (e) {
            toast.error('Failed to start chat');
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedParticipants.length === 0) {
            toast.error('Group name and participants required');
            return;
        }

        try {
            const res = await api.post('/chats/conversations/group', {
                name: groupName,
                participantIds: selectedParticipants.map(u => u._id)
            });
            selectConversation(res.data);
            setIsNewChatOpen(false);
            setGroupName('');
            setSelectedParticipants([]);
            setIsGroupMode(false);
            setSearchUserQuery('');
            setSearchResults([]);
        } catch (e) {
            console.error(e);
            toast.error('Failed to create group');
        }
    };

    const toggleParticipant = (u: any) => {
        if (selectedParticipants.find(p => p._id === u._id)) {
            setSelectedParticipants(prev => prev.filter(p => p._id !== u._id));
        } else {
            setSelectedParticipants(prev => [...prev, u]);
        }
    };

    const getChatName = (conv: any) => {
        if (conv.type === 'GROUP') return conv.name;
        const other = conv.participants.find((p: any) => p._id !== user?.id);
        return other?.name || 'Note to Self';
    };

    const getChatAvatar = (conv: any) => {
        if (conv.type === 'GROUP') return null;
        const other = conv.participants.find((p: any) => p._id !== user?.id);
        return other || (user as any);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            {/* Glass Notification Overlay */}
            <AnimatePresence>
                {notification.visible && notification.data && (
                    <motion.button
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        onClick={() => {
                            const targetConv = conversations.find(c => c._id === notification.data.conversationId);
                            if (targetConv) selectConversation(targetConv);
                            hideNotification();
                        }}
                        className="fixed top-24 right-6 z-[10000] w-[350px] bg-surface/95 backdrop-blur-xl border border-glass-border p-3 rounded-xl shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-surface transition-colors text-left"
                    >
                        <div className="shrink-0 relative">
                            <UserAvatar user={notification.data.sender} size="sm" />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-surface" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-foreground truncate">{notification.data.sender.name}</h4>
                                <span className="text-[10px] text-blue-500 font-bold">New Message</span>
                            </div>
                            <p className="text-[11px] text-muted truncate mt-0.5">{notification.data.content}</p>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-4 right-4 w-[380px] h-[600px] bg-surface/90 backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface/50">
                            <div className="flex items-center gap-2">
                                {activeConversation ? (
                                    <button onClick={() => selectConversation(null as any)} className="mr-2 hover:bg-secondary/10 p-1 rounded-full transition-colors">
                                        <ChevronLeft size={20} />
                                    </button>
                                ) : <MessageSquare size={20} className="text-blue-500" />}
                                {activeConversation ? (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold text-lg font-outfit text-foreground leading-none">
                                                {getChatName(activeConversation)}
                                            </h2>
                                            {activeConversation.type !== 'GROUP' && (
                                                <RoleBadge role={getChatAvatar(activeConversation)?.role} />
                                            )}
                                        </div>
                                        {activeConversation.type !== 'GROUP' && (
                                            <div className="flex items-center gap-1 mt-1">
                                                {useChatStore.getState().onlineUsers.includes(getChatAvatar(activeConversation)?._id) ? (
                                                    <>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                        <span className="text-[10px] text-muted">Online</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-muted">
                                                        {getChatAvatar(activeConversation)?.lastSeen
                                                            ? `Last seen ${format(new Date(getChatAvatar(activeConversation).lastSeen), 'MMM d, HH:mm')}`
                                                            : 'Offline'}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <h2 className="font-bold text-lg font-outfit text-foreground">Messages</h2>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {!activeConversation && (
                                    <button
                                        onClick={() => {
                                            setIsNewChatOpen(true);
                                            setSearchUserQuery('');
                                            setSearchResults([]);
                                        }}
                                        className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                                        title="New Chat"
                                    >
                                        <Plus size={20} />
                                    </button>
                                )}
                                {activeConversation?.type === 'GROUP' && (
                                    <button onClick={() => setIsGroupInfoOpen(true)} className="p-2 hover:bg-secondary/10 rounded-full transition-colors" title="Group Info">
                                        <MoreVertical size={20} />
                                    </button>
                                )}
                                <button onClick={toggleChat} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            {!activeConversation ? (
                                // Conversation List
                                // Conversation List
                                <div className="h-full flex flex-col">
                                    <div className="p-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                            <input
                                                placeholder="Search..."
                                                value={conversationSearchQuery}
                                                onChange={(e) => setConversationSearchQuery(e.target.value)}
                                                className="w-full bg-surface border pl-9 pr-8 py-2 rounded-xl text-xs border-glass-border focus:border-blue-500 outline-none text-foreground"
                                            />
                                            {conversationSearchQuery && (
                                                <button
                                                    onClick={() => setConversationSearchQuery('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-0.5"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {(searchResultsList || conversations).map(conv => (
                                            <div
                                                key={conv._id}
                                                onClick={() => selectConversation(conv, (conv as any).matchedMessage?._id)}
                                                className="p-3 flex items-center gap-3 cursor-pointer hover:bg-secondary/10 transition-colors border-l-4 border-transparent hover:border-blue-500"
                                            >
                                                <div className="relative">
                                                    <UserAvatar user={getChatAvatar(conv)} size="md" />
                                                    {/* Online Status Dot */}
                                                    {useChatStore.getState().onlineUsers.includes(getChatAvatar(conv)?._id) && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
                                                    )}

                                                    {/* Unread Badge */}
                                                    {conv.unreadCount && conv.unreadCount > 0 ? (
                                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                                                            {conv.unreadCount}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <h3 className="font-semibold text-sm truncate">{getChatName(conv)}</h3>
                                                            {conv.type !== 'GROUP' && <RoleBadge role={getChatAvatar(conv)?.role} />}
                                                        </div>
                                                        <span className="text-[10px] text-muted shrink-0 ml-2">{conv.updatedAt ? format(new Date(conv.updatedAt), 'HH:mm') : ''}</span>
                                                    </div>
                                                    {typingUsers[conv._id]?.length > 0 ? (
                                                        <p className="text-xs truncate font-bold text-purple-500 animate-pulse">
                                                            Typing...
                                                        </p>
                                                    ) : (
                                                        <p className={`text-xs truncate ${conv.unreadCount ? 'font-bold text-foreground' : 'text-muted'} flex items-center gap-1`}>
                                                            {(conv as any).matchedMessage ? (
                                                                <span className="text-blue-500 font-medium italic">
                                                                    Found: {(conv as any).matchedMessage.content}
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {conv.lastMessage?.sender._id === user?.id && (
                                                                        <span className="shrink-0">
                                                                            {conv.lastMessage?.status === 'READ' ? (
                                                                                <CheckCheck size={12} className="text-purple-500 inline" />
                                                                            ) : conv.lastMessage?.status === 'DELIVERED' ? (
                                                                                <CheckCheck size={12} className="text-gray-400 inline" />
                                                                            ) : (
                                                                                <Check size={12} className="text-gray-400 inline" />
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    <span className="truncate">
                                                                        {conv.lastMessage?.sender._id === user?.id ? 'You: ' : ''}
                                                                        {conv.lastMessage?.type === 'IMAGE' ? '📷 Image' : conv.lastMessage?.content}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {(searchResultsList || conversations).length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-40 text-muted">
                                                <MessageSquare size={32} className="mb-2 opacity-50" />
                                                <p className="text-xs">No conversations found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // Active Chat
                                <div className="flex-1 flex flex-col h-full bg-surface/20">
                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col">
                                        {messages.map((msg, idx) => {
                                            // Date Separator Logic
                                            const currentDate = new Date(msg.createdAt);
                                            const prevDate = idx > 0 ? new Date(messages[idx - 1].createdAt) : null;
                                            const showDateSeparator = !prevDate ||
                                                currentDate.toDateString() !== prevDate.toDateString();

                                            const getDateLabel = (date: Date) => {
                                                const today = new Date();
                                                const yesterday = new Date(today);
                                                yesterday.setDate(yesterday.getDate() - 1);

                                                if (date.toDateString() === today.toDateString()) {
                                                    return 'Today';
                                                } else if (date.toDateString() === yesterday.toDateString()) {
                                                    return 'Yesterday';
                                                } else {
                                                    return format(date, 'MMM d, yyyy');
                                                }
                                            };

                                            if (msg.type === 'SYSTEM') {
                                                return (
                                                    <div key={msg._id} className="flex justify-center my-2">
                                                        <span className="bg-gray-500/10 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-[11px] font-medium border border-gray-500/10 backdrop-blur-sm text-center max-w-[90%]">
                                                            {msg.content}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            const isMe = msg.sender._id === user?.id;
                                            return (
                                                <>
                                                    {/* Date Separator */}
                                                    {showDateSeparator && (
                                                        <div className="flex justify-center my-4">
                                                            <span className="bg-surface/80 backdrop-blur-sm text-muted px-3 py-1 rounded-full text-[11px] font-medium border border-glass-border shadow-sm">
                                                                {getDateLabel(currentDate)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <motion.div
                                                        key={msg._id}
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        id={`msg-${msg._id}`}
                                                        className={`flex items-end gap-2 group ${isMe ? 'flex-row-reverse' : ''} ${highlightMessageId === msg._id ? 'bg-blue-500/10 p-2 -mx-2 rounded-lg transition-all duration-1000' : ''}`}
                                                    >
                                                        {!isMe && activeConversation?.type === 'GROUP' && <UserAvatar user={msg.sender} size="xs" />}

                                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                                            <div className={`px-3 py-2 rounded-2xl shadow-sm text-[15px] ${isMe
                                                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-sm'
                                                                : 'bg-surface border border-glass-border text-foreground rounded-bl-sm'
                                                                }`}>
                                                                {msg.isDeletedForEveryone ? (
                                                                    <span className="italic opacity-50 text-xs flex items-center gap-1"><Trash2 size={12} /> Message deleted</span>
                                                                ) : (
                                                                    <>
                                                                        {/* Attachments */}
                                                                        {msg.attachments && msg.attachments.length > 0 && (
                                                                            <div className="mb-2 space-y-2">
                                                                                {msg.attachments.map((url, i) => {
                                                                                    // Fix: Remove /api/v1 from base URL to get server root for uploads
                                                                                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
                                                                                    const serverRoot = apiBase.replace('/api/v1', '');
                                                                                    const fullUrl = url.startsWith('http') ? url : `${serverRoot}${url}`;

                                                                                    // Check if it's a voice note (sent as FILE type with isVoice flag)
                                                                                    let isVoiceNote = false;
                                                                                    let metadata = { duration: 0, waveform: [] };
                                                                                    try {
                                                                                        const parsed = JSON.parse(msg.content || '{}');
                                                                                        if (parsed.isVoice) {
                                                                                            isVoiceNote = true;
                                                                                            metadata = parsed;
                                                                                        }
                                                                                    } catch (e) {
                                                                                        // Not a voice note
                                                                                    }

                                                                                    // Render voice player if it's a voice note
                                                                                    if (isVoiceNote) {
                                                                                        return (
                                                                                            <VoicePlayer
                                                                                                key={i}
                                                                                                audioUrl={fullUrl}
                                                                                                duration={metadata.duration || 0}
                                                                                                waveform={metadata.waveform || []}
                                                                                                isMe={isMe}
                                                                                            />
                                                                                        );
                                                                                    }

                                                                                    return msg.type === 'IMAGE' ? (
                                                                                        <img
                                                                                            key={i}
                                                                                            src={fullUrl}
                                                                                            alt="Attachment"
                                                                                            onClick={() => setViewingImage(fullUrl)}
                                                                                            className="rounded-lg max-w-full max-h-[200px] object-cover border border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                                                                                        />
                                                                                    ) : (
                                                                                        <a
                                                                                            key={i}
                                                                                            href={fullUrl}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="flex items-center gap-2 bg-black/20 p-2 rounded-lg hover:bg-black/30 transition-colors"
                                                                                        >
                                                                                            <FileText size={16} />
                                                                                            <span className="truncate text-xs underline">View File</span>
                                                                                        </a>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                        {/* Text Content - hide if it's voice metadata */}
                                                                        {msg.content && (() => {
                                                                            try {
                                                                                const parsed = JSON.parse(msg.content);
                                                                                if (parsed.isVoice) return null; // Don't show JSON metadata
                                                                            } catch (e) {
                                                                                // Not JSON, show as text
                                                                            }
                                                                            return <p className="whitespace-pre-wrap break-words">{msg.content}</p>;
                                                                        })()}

                                                                        {/* Link Preview */}
                                                                        {(msg as any).linkMetadata && (
                                                                            <a
                                                                                href={(msg as any).linkMetadata.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className={`block mt-2 rounded-lg overflow-hidden border transition-colors max-w-[250px] ${isMe ? 'bg-black/20 border-white/10 hover:bg-black/30' : 'bg-secondary/50 border-glass-border hover:bg-secondary/70'}`}
                                                                            >
                                                                                {(msg as any).linkMetadata.image && (
                                                                                    <img src={(msg as any).linkMetadata.image} alt={(msg as any).linkMetadata.title} className="w-full h-32 object-cover" />
                                                                                )}
                                                                                <div className="p-2">
                                                                                    <h4 className="text-xs font-bold truncate">{(msg as any).linkMetadata.title || (msg as any).linkMetadata.url}</h4>
                                                                                    {(msg as any).linkMetadata.description && (
                                                                                        <p className="text-[10px] opacity-70 line-clamp-2">{(msg as any).linkMetadata.description}</p>
                                                                                    )}
                                                                                </div>
                                                                            </a>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>

                                                            <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start ml-1'}`}>
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                                                </span>

                                                                {/* Admin/Self Delete Action */}
                                                                {!msg.isDeletedForEveryone && (isMe || (activeConversation?.type === 'GROUP' && activeConversation.admins?.includes(user?.id || ''))) && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm('Delete this message for everyone?')) {
                                                                                deleteMessage(msg._id, true);
                                                                            }
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-0.5 rounded transition-all ml-1"
                                                                        title="Delete for everyone"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                )}

                                                                {isMe && (
                                                                    <span>
                                                                        {msg.status === 'READ' ? <CheckCheck size={12} className="text-purple-500" /> :
                                                                            msg.status === 'DELIVERED' ? <CheckCheck size={12} className="text-gray-400" /> :
                                                                                <Check size={12} className="text-gray-400" />}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Typing Indicator */}
                                    {activeConversation && typingUsers[activeConversation._id]?.length > 0 && (
                                        <div className="px-4 py-1 text-xs text-purple-500 font-medium flex items-center gap-1">
                                            <span className="animate-pulse">Typing...</span>
                                        </div>
                                    )}

                                    {/* Selected Files Preview */}
                                    {selectedFiles.length > 0 && (
                                        <div className="px-4 py-2 bg-surface/50 border-t border-glass-border flex gap-2 overflow-x-auto">
                                            {selectedFiles.map((file, idx) => (
                                                <div key={idx} className="relative group shrink-0">
                                                    <div className="w-16 h-16 rounded-lg bg-surface border border-glass-border flex items-center justify-center overflow-hidden">
                                                        {file.type.startsWith('image/') ? (
                                                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FileText size={20} className="text-muted" />
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(idx)}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input */}
                                    {/* Input Area / Read-Only Banner */}
                                    {(activeConversation?.participants.some(p => p._id === user?.id) || activeConversation?.type === 'DIRECT') ? (
                                        <div className="p-3 border-t border-glass-border bg-surface/60 backdrop-blur-md relative">
                                            {/* Emoji Picker Popover */}
                                            <AnimatePresence>
                                                {showEmojiPicker && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                        className="absolute bottom-full left-0 mb-2 z-50"
                                                    >
                                                        <EmojiPicker onSelect={(emoji) => setMsgInput(prev => prev + emoji)} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <form onSubmit={handleSend} className="flex items-end gap-2 bg-surface rounded-xl border border-glass-border p-1 focus-within:ring-2 ring-blue-500/20 transition-all shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? 'text-blue-500 bg-blue-500/10' : 'text-muted hover:text-foreground hover:bg-secondary/10'}`}
                                                >
                                                    <Smile size={20} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 text-muted hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                                                >
                                                    <Paperclip size={20} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setIsRecordingVoice(true)}
                                                    className="p-2 text-muted hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                                                    title="Voice note"
                                                >
                                                    <Mic size={20} />
                                                </button>

                                                <input
                                                    type="file"
                                                    multiple
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    onChange={handleFileSelect}
                                                />

                                                <input
                                                    value={msgInput}
                                                    onChange={handleInput}
                                                    placeholder="Message..."
                                                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 px-2 text-foreground placeholder:text-muted"
                                                />

                                                <button
                                                    type="submit"
                                                    disabled={(!msgInput.trim() && selectedFiles.length === 0) || isUploading}
                                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center"
                                                >
                                                    {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 bg-surface/20 border-t border-glass-border backdrop-blur-md">
                                            <p className="text-sm font-medium opacity-70">You are no longer a participant in this group</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* New Chat Modal Overlay (inside widget) */}
                        {/* New Chat Modal Overlay (inside widget) */}
                        {isNewChatOpen && (
                            <div className="absolute inset-0 z-50 bg-surface flex flex-col">
                                <div className="p-3 border-b border-glass-border flex justify-between items-center">
                                    <h3 className="font-bold font-outfit">{isAddingMember ? 'Add Member' : 'New Conversation'}</h3>
                                    <button onClick={() => { setIsNewChatOpen(false); setIsAddingMember(false); }} className="p-1 hover:bg-secondary/10 rounded-full"><X size={18} /></button>
                                </div>

                                {/* Toggle Mode */}
                                {!isAddingMember && (
                                    <div className="flex p-2 gap-2">
                                        <button
                                            onClick={() => setIsGroupMode(false)}
                                            className={`flex-1 py-1 text-xs rounded-lg transition-all ${!isGroupMode ? 'bg-blue-500/20 text-blue-500 font-bold' : 'hover:bg-secondary/10 text-muted'}`}
                                        >
                                            Direct Message
                                        </button>
                                        <button
                                            onClick={() => setIsGroupMode(true)}
                                            className={`flex-1 py-1 text-xs rounded-lg transition-all ${isGroupMode ? 'bg-blue-500/20 text-blue-500 font-bold' : 'hover:bg-secondary/10 text-muted'}`}
                                        >
                                            New Group
                                        </button>
                                    </div>
                                )}

                                {/* Group Name Input */}
                                {isGroupMode && (
                                    <div className="px-3 pb-2 transition-all">
                                        <input
                                            value={groupName}
                                            onChange={e => setGroupName(e.target.value)}
                                            placeholder="Group Name"
                                            className="w-full bg-secondary/10 border border-glass-border rounded-xl px-3 py-2 outline-none text-sm font-bold mb-2"
                                        />
                                        {selectedParticipants.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2 max-h-20 overflow-y-auto">
                                                {selectedParticipants.map(u => (
                                                    <div key={u._id} className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                                        {u.name}
                                                        <button onClick={() => toggleParticipant(u)} className="hover:text-red-500"><X size={10} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="px-3 pb-2">
                                    <input
                                        autoFocus
                                        value={searchUserQuery}
                                        onChange={e => handleSearchUsers(e.target.value)}
                                        placeholder={isGroupMode ? "Add members..." : isAddingMember ? "Search to add member..." : "To: Name..."}
                                        className="w-full bg-secondary/10 border border-glass-border rounded-xl px-3 py-2 outline-none text-sm"
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto px-2">
                                    {searchResults.map(u => {
                                        const isSelected = isGroupMode && selectedParticipants.find(p => p._id === u._id);
                                        return (
                                            <div
                                                key={u._id}
                                                onClick={async () => {
                                                    if (isAddingMember && activeConversation) {
                                                        try {
                                                            // Prevent adding if already in group (though backend checks too)
                                                            if (activeConversation.participants.some((p: any) => p._id === u._id)) {
                                                                toast.error('User is already a member');
                                                                return;
                                                            }
                                                            await addParticipant(activeConversation._id, u._id);
                                                            toast.success('Member added');
                                                            setIsNewChatOpen(false);
                                                            setIsAddingMember(false);
                                                            setIsGroupInfoOpen(true); // Re-open info to show list? Check preference.
                                                        } catch (e) { toast.error('Failed to add member'); }
                                                    } else if (isGroupMode) {
                                                        toggleParticipant(u);
                                                    } else {
                                                        startChat(u._id);
                                                    }
                                                }}
                                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-secondary/10'}`}
                                            >
                                                <div className="relative">
                                                    <UserAvatar user={u} size="sm" />
                                                    {isSelected && <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5"><Check size={8} /></div>}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold text-sm">{u.name}</div>
                                                        <RoleBadge role={u.role} />
                                                    </div>
                                                    <div className="text-xs text-muted">{u.role}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {isGroupMode && (
                                    <div className="p-3 border-t border-glass-border">
                                        <button
                                            onClick={handleCreateGroup}
                                            className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!groupName.trim() || selectedParticipants.length === 0}
                                        >
                                            Create Group ({selectedParticipants.length})
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Group Info Modal */}
                        {isGroupInfoOpen && activeConversation?.type === 'GROUP' && (
                            <div className="absolute inset-0 z-50 bg-surface flex flex-col">
                                <div className="p-3 border-b border-glass-border flex justify-between items-center">
                                    <h3 className="font-bold font-outfit">Group Info</h3>
                                    <button onClick={() => setIsGroupInfoOpen(false)} className="p-1 hover:bg-secondary/10 rounded-full"><X size={18} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {/* Group Header */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                            {(activeConversation.groupAvatar || activeConversation.name || '?')[0].toUpperCase()}
                                        </div>
                                        <div className="text-center">
                                            <h2 className="font-bold text-lg">{activeConversation.name}</h2>
                                            <p className="text-xs text-muted">{activeConversation.participants.length} participants</p>
                                        </div>
                                    </div>

                                    {/* Participants List */}
                                    <div>
                                        <h4 className="border-b border-glass-border pb-1 mb-2 font-semibold text-sm flex justify-between items-center">
                                            Participants
                                            {/* Add Member Button (Admin only) - Simplified for now, allows searching main list */}
                                            {user?.id && activeConversation.admins?.includes(user.id) && (
                                                <button
                                                    onClick={() => {
                                                        setIsGroupInfoOpen(false);
                                                        setIsAddingMember(true);
                                                        setIsNewChatOpen(true);
                                                        setSearchUserQuery('');
                                                        setSearchResults([]);
                                                    }}
                                                    className="text-blue-500 text-xs flex items-center gap-1 hover:underline"
                                                >
                                                    <UserPlus size={12} /> Add
                                                </button>
                                            )}
                                        </h4>
                                        <div className="space-y-2">
                                            {activeConversation.participants.map((p: any) => {
                                                const isAdmin = activeConversation.admins?.includes(p._id);
                                                const isHeAdmin = user?.id && activeConversation.admins?.includes(user.id);
                                                return (
                                                    <div key={p._id} className="flex items-center justify-between p-2 hover:bg-secondary/10 rounded-lg group">
                                                        <div className="flex items-center gap-2">
                                                            <UserAvatar user={p} size="sm" />
                                                            <div>
                                                                <div className="text-sm font-medium flex items-center gap-1">
                                                                    {p.name}
                                                                    {isAdmin && <span title="Admin"><Shield size={10} className="text-blue-500" /></span>}
                                                                </div>
                                                                <div className="text-[10px] text-muted">{p.role === 'ADMIN' ? 'System Admin' : 'Member'}</div>
                                                            </div>
                                                        </div>
                                                        {isHeAdmin && p._id !== user?.id && (
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => {
                                                                        toggleGroupAdmin(activeConversation._id, p._id);
                                                                        toast.success('Admin role updated');
                                                                    }}
                                                                    className={`p-1 rounded hover:bg-blue-500/10 ${isAdmin ? 'text-blue-500' : 'text-muted'}`}
                                                                    title={isAdmin ? "Remove Admin" : "Make Admin"}
                                                                >
                                                                    <Shield size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        // Confirm remove
                                                                        if (confirm('Remove this user?')) {
                                                                            removeParticipant(activeConversation._id, p._id);
                                                                            toast.success('Removed');
                                                                        }
                                                                    }}
                                                                    className="p-1 rounded hover:bg-red-500/10 text-red-500"
                                                                    title="Remove from group"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Leave Group */}
                                    <button
                                        onClick={() => {
                                            if (confirm('Leave this group?')) {
                                                removeParticipant(activeConversation._id, user?.id || '');
                                                setIsGroupInfoOpen(false);
                                                selectConversation(null as any);
                                            }
                                        }}
                                        className="w-full py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                    >
                                        <LogOut size={16} /> Leave Group
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Voice Recorder Overlay */}
                        {isRecordingVoice && (
                            <VoiceRecorder
                                onSend={handleVoiceNote}
                                onCancel={() => setIsRecordingVoice(false)}
                            />
                        )}
                    </motion.div>
                )}

                {/* Image Lightbox */}
                {viewingImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewingImage(null)}
                        className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
                    >
                        <button
                            onClick={() => setViewingImage(null)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
                        >
                            <X size={32} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={viewingImage}
                            alt="Full size"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

        </>
    );
};
