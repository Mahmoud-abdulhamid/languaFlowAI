import { create } from 'zustand';
import axios from '../api/axios';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    languages?: { source: string; target: string }[];
}

interface UserListState {
    clients: User[];
    translators: User[];
    isLoading: boolean;
    fetchClients: () => Promise<void>;
    fetchTranslators: () => Promise<void>;
}

export const useUserListStore = create<UserListState>((set) => ({
    clients: [],
    translators: [],
    isLoading: false,

    fetchClients: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get('/users/clients');
            set({ clients: res.data });
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTranslators: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get('/users/translators');
            set({ translators: res.data });
        } catch (error) {
            console.error('Failed to fetch translators', error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
