import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, Trash2, X, Mail } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
    const {
        notifications, unreadCount,
        fetchNotifications, fetchUnreadCount,
        markAsRead, markAsUnread, markAllAsRead, deleteNotification,
        connectSocket, disconnectSocket
    } = useNotificationStore();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        connectSocket();
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s as fallback
        return () => {
            disconnectSocket();
            clearInterval(interval);
        };
    }, []);

    // Toggle dropdown
    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (note: any) => {
        if (!note.isRead) markAsRead(note._id);
        if (note.link) {
            setIsOpen(false);
            navigate(note.link);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-foreground/70 dark:text-foreground/90 hover:text-foreground transition-colors relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed inset-0 w-full h-full sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl z-[5000] overflow-hidden sm:max-h-[500px] flex flex-col sm:rounded-xl"
                    >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10 shrink-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="sm:hidden p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-xs text-blue-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Mark all read
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    No notifications yet
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {notifications.map((note) => (
                                        <div
                                            key={note._id}
                                            className={clsx(
                                                "p-4 transition-colors cursor-pointer relative group",
                                                !note.isRead ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            )}
                                        >
                                            <div onClick={() => handleNotificationClick(note)}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={clsx(
                                                        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                                                        note.type === 'SUCCESS' && "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
                                                        note.type === 'ERROR' && "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
                                                        note.type === 'INFO' && "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
                                                        note.type === 'WARNING' && "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
                                                    )}>
                                                        {note.type}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                        {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <h4 className={clsx("text-sm font-medium mb-1", !note.isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400")}>
                                                    {note.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {note.message}
                                                </p>
                                            </div>

                                            <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 dark:bg-black/50 rounded p-1 backdrop-blur-sm shadow-sm">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(note._id); }}
                                                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                {!note.isRead ? (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(note._id); }}
                                                        className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); markAsUnread(note._id); }}
                                                        className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                                                        title="Mark as unread"
                                                    >
                                                        <Mail size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
