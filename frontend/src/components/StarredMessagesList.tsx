import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X, MessageSquare, ArrowRight, Star, FileText } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface StarredMessagesListProps {
    onClose: () => void;
}

export const StarredMessagesList = ({ onClose }: StarredMessagesListProps) => {
    const { starredMessages, fetchStarredMessages, starMessage, selectConversation, isLoading } = useChatStore();

    useEffect(() => {
        fetchStarredMessages();
    }, []);

    const handleJump = (msg: any) => {
        // Msg.conversationId is populated with conversation details
        const conversation = msg.conversationId;
        if (conversation) {
            selectConversation(conversation, msg._id);
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 bg-surface/95 backdrop-blur-xl z-50 flex flex-col">
            <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface/50">
                <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-current" size={20} />
                    <h2 className="font-bold text-lg font-outfit text-foreground">Starred Messages</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-secondary/10 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {isLoading ? (
                    <div className="flex justify-center py-8 text-muted">Loading...</div>
                ) : starredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted">
                        <Star size={40} className="mb-2 opacity-20" />
                        <p className="text-sm">No starred messages</p>
                    </div>
                ) : (
                    starredMessages.map((msg: any) => (
                        <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface border border-glass-border p-3 rounded-xl shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={msg.sender} size="xs" />
                                    <span className="font-bold text-xs">{msg.sender.name}</span>
                                    <span className="text-[10px] text-muted">• {format(new Date(msg.createdAt), 'MMM d, HH:mm')}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); starMessage(msg._id); }}
                                        className="text-yellow-400 hover:text-yellow-500 transition-colors p-1"
                                        title="Unstar"
                                    >
                                        <Star size={14} className="fill-current" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-2 pl-7">
                                {msg.content && <p className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap">{msg.content}</p>}
                                {msg.attachments?.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                                        <FileText size={12} />
                                        <span>{msg.attachments.length} Attachment(s)</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-glass-border pt-2 mt-2">
                                <span className="text-[10px] text-muted font-medium bg-secondary/20 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                                    {msg.conversationId?.name || (msg.conversationId?.type === 'DIRECT' ? 'Direct Message' : 'Group Chat')}
                                </span>
                                <button
                                    onClick={() => handleJump(msg)}
                                    className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
                                >
                                    Jump to Chat <ArrowRight size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
