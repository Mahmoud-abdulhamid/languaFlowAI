import { create } from 'zustand';
import axios from '../api/axios';

export interface Language {
    _id: string;
    code: string;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
}

interface LanguageState {
    languages: Language[];
    isLoading: boolean;
    fetchLanguages: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
    languages: [],
    isLoading: false,

    fetchLanguages: async () => {
        set({ isLoading: true });
        try {
            const { data } = await axios.get('/languages');
            // Ensure we filter only active languages if needed, or rely on backend to send all
            // Ideally backend might send all, frontend filters.
            // Let's assume we want to show all active languages
            set({ languages: data });
        } catch (error) {
            console.error('Failed to fetch languages', error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
