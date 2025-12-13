import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { X, MessageSquare, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface StarredMessagesListProps {
    onClose: () => void;
    onJumpToMessage: (message: any) => void;
}

export const StarredMessagesList: React.FC<StarredMessagesListProps> = ({ onClose, onJumpToMessage }) => {
    const { starredMessages, fetchStarredMessages, starMessage, isLoading } = useChatStore();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchStarredMessages();
    }, []);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <span className="text-yellow-500">★</span> Starred Messages
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full text-gray-400">Loading...</div>
                ) : starredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <span className="text-4xl grayscale opacity-50">⭐</span>
                        <p>No starred messages yet</p>
                    </div>
                ) : (
                    starredMessages.map((msg) => (
                        <div key={msg._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group relative">
                            {/* Header: Sender & Date */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <img src={msg.sender.avatar || `https://ui-avatars.com/api/?name=${msg.sender.name}`} alt="" className="w-6 h-6 rounded-full" />
                                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{msg.sender.name}</span>
                                    <span className="text-xs text-gray-500">{format(new Date(msg.createdAt), 'MMM d, HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); starMessage(msg._id); }}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-yellow-500"
                                        title="Unstar"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-sm text-gray-800 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                                {msg.type === 'IMAGE' ? (
                                    <div className="flex items-center gap-2 text-blue-500">
                                        <MessageSquare size={16} /> <span>Sent an image</span>
                                    </div>
                                ) : msg.content}
                            </div>

                            {/* Context/Jump */}
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                    in {typeof msg.conversationId === 'object' ? (msg.conversationId as any).name || 'Private Chat' : 'Chat'}
                                </span>
                                <button
                                    onClick={() => onJumpToMessage(msg)}
                                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    Go to message <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


