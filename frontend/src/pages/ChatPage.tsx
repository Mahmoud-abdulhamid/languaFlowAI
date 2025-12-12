import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Send, Paperclip, Smile, MoreVertical, Search, Plus, Phone, Video, Info, FileText, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../components/UserAvatar';
import { format } from 'date-fns';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const ChatPage = () => {
    const {
        conversations,
        activeConversation,
        selectConversation,
        fetchConversations,
        messages,
        sendMessage,
        connectSocket,
        disconnectSocket,
        createDirectConversation
    } = useChatStore();
    const { user } = useAuthStore();

    // UI State
    const [msgInput, setMsgInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        connectSocket();
        fetchConversations();
        return () => disconnectSocket();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!msgInput.trim()) return;

        await sendMessage(msgInput);
        setMsgInput('');
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

    const getChatName = (conv: any) => {
        if (conv.type === 'GROUP') return conv.name;
        const other = conv.participants.find((p: any) => p._id !== user?.id);
        return other?.name || 'Unknown User';
    };

    const getChatAvatar = (conv: any) => {
        if (conv.type === 'GROUP') return null; // Default group icon
        const other = conv.participants.find((p: any) => p._id !== user?.id);
        return other; // User object for Avatar
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex bg-surface/50 backdrop-blur-xl rounded-2xl border border-glass-border overflow-hidden shadow-2xl">
            {/* Sidebar */}
            <div className="w-80 border-r border-glass-border flex flex-col bg-surface/30">
                <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface/50">
                    <h2 className="font-bold text-xl font-outfit text-foreground">Messages</h2>
                    <button onClick={() => setIsNewChatOpen(true)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            placeholder="Search conversations..."
                            className="w-full bg-surface border pl-10 pr-4 py-2 rounded-xl text-sm border-glass-border focus:border-blue-500 outline-none text-foreground placeholder:text-muted"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.map(conv => (
                        <div
                            key={conv._id}
                            onClick={() => selectConversation(conv)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/10 transition-colors border-r-4 ${activeConversation?._id === conv._id ? 'bg-blue-500/10 border-blue-500' : 'border-transparent'}`}
                        >
                            <div className="relative">
                                <UserAvatar user={getChatAvatar(conv)} size="md" />
                                {conv.type === 'GROUP' && <div className="absolute inset-0 bg-purple-500/20 rounded-full flex items-center justify-center font-bold text-purple-700 text-xs">GP</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-sm truncate">{getChatName(conv)}</h3>
                                    <span className="text-[10px] text-muted">{conv.updatedAt ? format(new Date(conv.updatedAt), 'HH:mm') : ''}</span>
                                </div>
                                <p className="text-xs text-muted truncate">
                                    {conv.lastMessage?.sender._id === user?.id ? 'You: ' : ''}
                                    {conv.lastMessage?.type === 'IMAGE' ? '📷 Image' : conv.lastMessage?.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            {activeConversation ? (
                <div className="flex-1 flex flex-col bg-surface/20 relative">
                    {/* Header */}
                    <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface/60 backdrop-blur-md z-10">
                        <div className="flex items-center gap-3">
                            <UserAvatar user={getChatAvatar(activeConversation)} size="sm" />
                            <div>
                                <h3 className="font-bold font-outfit text-foreground">{getChatName(activeConversation)}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-xs text-muted">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted">
                            <button className="p-2 hover:bg-secondary/10 rounded-full transition-colors"><Phone size={20} /></button>
                            <button className="p-2 hover:bg-secondary/10 rounded-full transition-colors"><Video size={20} /></button>
                            <button className="p-2 hover:bg-secondary/10 rounded-full transition-colors"><Info size={20} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar flex flex-col-reverse">
                        {/* Note: Messages are rendered latest first if reversed, but standard array is usually oldest first. 
                           If we use flex-col-reverse, we need messages array to be reversed (newest first).
                           Backend returns newest first? No, backend usually returns newest first for pagination optimization?
                           Controller: sort created -1. Reverse before sending?
                           Let's assume messages array from store is [Oldest -> Newest]. 
                           So we just render normally and scroll to bottom. */}
                        <div ref={messagesEndRef} />
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender._id === user?.id;
                            return (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                                >
                                    {!isMe && <UserAvatar user={msg.sender} size="xs" />}
                                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${isMe
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-none'
                                        : 'bg-surface border border-glass-border text-foreground rounded-bl-none'
                                        }`}>
                                        {msg.type === 'TEXT' && <p className="text-sm">{msg.content}</p>}
                                        {msg.type === 'IMAGE' && (
                                            <div className="mb-1 rounded-lg overflow-hidden">
                                                <img src={msg.content} alt="attachment" className="max-w-full h-auto" />
                                            </div>
                                        )}
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-muted'}`}>
                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-glass-border bg-surface/60 backdrop-blur-md">
                        <form onSubmit={handleSend} className="flex items-end gap-2 bg-surface rounded-2xl border border-glass-border p-2 focus-within:ring-2 ring-blue-500/20 transition-all shadow-sm">
                            <button type="button" className="p-2 text-muted hover:text-blue-500 transition-colors"><Paperclip size={20} /></button>
                            <input
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none outline-none text-sm py-2 text-foreground placeholder:text-muted"
                            />
                            <button type="button" className="p-2 text-muted hover:text-yellow-500 transition-colors"><Smile size={20} /></button>
                            <button
                                type="submit"
                                disabled={!msgInput.trim()}
                                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted bg-secondary/5">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <MessageSquare size={40} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">TeamFlow Chat</h3>
                    <p>Select a conversation to start messaging</p>
                </div>
            )}

            {/* New Chat Modal */}
            <AnimatePresence>
                {isNewChatOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsNewChatOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-surface border border-glass-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 font-outfit">New Message</h3>
                            <input
                                autoFocus
                                value={searchUserQuery}
                                onChange={e => handleSearchUsers(e.target.value)}
                                placeholder="Search colleague name..."
                                className="w-full bg-secondary/10 border border-glass-border rounded-xl px-4 py-3 outline-none mb-4"
                            />

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {searchResults.map(u => (
                                    <div
                                        key={u._id}
                                        onClick={() => startChat(u._id)}
                                        className="flex items-center gap-3 p-3 hover:bg-secondary/10 rounded-xl cursor-pointer transition-colors"
                                    >
                                        <UserAvatar user={u} size="sm" />
                                        <div>
                                            <div className="font-semibold text-sm">{u.name}</div>
                                            <div className="text-xs text-muted">{u.role}</div>
                                        </div>
                                    </div>
                                ))}
                                {searchUserQuery && searchResults.length === 0 && (
                                    <p className="text-center text-muted py-4">No colleagues found</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
