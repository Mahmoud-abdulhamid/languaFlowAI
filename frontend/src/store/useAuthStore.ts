import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';
import { useChatStore } from './useChatStore';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    languages?: { source: string; target: string }[];
    permissions?: string[];
    bio?: string;
    jobTitle?: string;
    username?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        website?: string;
    };
    achievements?: any[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    createUser: (data: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: () => boolean;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            setUser: (user) => set({ user }),
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post('/auth/login', { email, password });
                    set({ user: res.data.user, token: res.data.token, isLoading: false });
                } catch (error: any) {
                    set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
                    throw error;
                }
            },
            register: async (data: any) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post('/auth/register', data);
                    set({ user: res.data.user, token: res.data.token, isLoading: false });
                } catch (error: any) {
                    set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
                    throw error;
                }
            },
            createUser: async (data: any) => {
                set({ isLoading: true, error: null });
                try {
                    await api.post('/users/create', data);
                    set({ isLoading: false });
                } catch (error: any) {
                    set({ error: error.response?.data?.message || 'Failed to create user', isLoading: false });
                    throw error;
                }
            },
            logout: () => {
                const { socket, disconnectSocket } = useChatStore.getState();
                const currentUser = get().user;

                // Explicitly set status to OFFLINE before disconnecting
                if (socket && currentUser) {
                    socket.emit('change_status', { userId: currentUser.id, status: 'OFFLINE' });
                }

                disconnectSocket();
                set({ user: null, token: null });
            },
            isAuthenticated: () => !!get().token
        }),
        {
            name: 'auth-storage'
        }
    )
);
