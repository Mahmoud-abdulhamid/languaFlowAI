import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import axios from '../api/axios';
import { useAuthStore } from './useAuthStore';
import { toast } from 'react-hot-toast';

interface Notification {
    _id: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    socket: Socket | null;

    // Actions
    connectSocket: () => void;
    disconnectSocket: () => void;
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAsUnread: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    socket: null,

    connectSocket: () => {
        const { socket } = get();
        // Prevent multiple connections
        if (socket) return;

        const { user } = useAuthStore.getState();
        if (!user) return;

        // Use standard URL if not defined
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

        const newSocket = io(socketUrl);

        newSocket.on('connect', () => {
            console.log('Socket connected');
            newSocket.emit('join_user', user.id);
        });

        newSocket.on('notification', (note: Notification) => {
            const { notifications, unreadCount } = get();

            // Prevent duplicates
            if (notifications.some(n => n._id === note._id)) return;

            // Play sound?
            // new Audio('/notification.mp3').play().catch(() => {});

            // Show Toast
            if (note.type === 'SUCCESS') toast.success(note.title);
            else if (note.type === 'ERROR') toast.error(note.title);
            else toast(note.title, { icon: '🔔' });

            // Update State
            set({
                notifications: [note, ...notifications],
                unreadCount: unreadCount + 1
            });
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.removeAllListeners();
            socket.disconnect();
            set({ socket: null });
        }
    },

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const { data } = await axios.get('/notifications');
            set({ notifications: data });
        } catch (error) {
            console.error('Failed to fetch notifications');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const { data } = await axios.get('/notifications/unread-count');
            set({ unreadCount: data.count });
        } catch (error) {
            console.error('Failed to fetch count');
        }
    },

    markAsRead: async (id) => {
        try {
            await axios.put(`/notifications/${id}/read`);
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Error marking as read');
        }
    },

    markAsUnread: async (id) => {
        try {
            await axios.put(`/notifications/${id}/unread`);
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === id ? { ...n, isRead: false } : n
                ),
                unreadCount: state.unreadCount + 1
            }));
        } catch (error) {
            console.error('Error marking as unread');
        }
    },

    markAllAsRead: async () => {
        try {
            await axios.put('/notifications/mark-all-read');
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Error marking all read');
        }
    },

    deleteNotification: async (id) => {
        try {
            await axios.delete(`/notifications/${id}`);
            set(state => ({
                notifications: state.notifications.filter(n => n._id !== id),
                unreadCount: state.notifications.find(n => n._id === id && !n.isRead)
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount
            }));
        } catch (error) {
            console.error('Error deleting notification');
        }
    }
}));
