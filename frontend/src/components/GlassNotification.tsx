import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';
import { X } from 'lucide-react';

interface NotificationProps {
    t: any;
    data: {
        id: string;
        sender: {
            name: string;
            avatar?: string;
        };
        content: string;
        conversationId: string;
    };
    onOpen: (convId: string) => void;
    onDismiss: () => void;
}

export const GlassNotification = ({ t, data, onOpen, onDismiss }: NotificationProps) => {
    useEffect(() => {
        if (t.visible) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 5000); // 5 seconds duration
            return () => clearTimeout(timer);
        }
    }, [t.visible, onDismiss]);

    return (
        <AnimatePresence>
            {t.visible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl z-50 overflow-visible"
                    style={{ pointerEvents: 'auto' }}
                >
                    {/* Arrow pointing up to the icon */}
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-800 transform rotate-45" />

                    <div className="relative z-10 p-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors" onClick={() => { onOpen(data.conversationId); onDismiss(); }}>
                        <div className="flex-shrink-0 pt-1">
                            <UserAvatar user={data.sender} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {data.sender.name}
                                </p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-20 relative"
                                    title="Dismiss"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                {data.content}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
