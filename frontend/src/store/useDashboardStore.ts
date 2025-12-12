import { create } from 'zustand';
import api from '../api/axios';
import { useAuthStore } from './useAuthStore';

interface DashboardStats {
    projects: {
        total: number;
        pending: number;
        review: number;
        completed: number;
    };
    wordsTranslated: number;
    activity: number[];
    recentProjects: any[];
    aiMetrics?: {
        processedWords: number;
        hoursSaved: number;
    };
    languageDistribution?: { name: string; value: number }[];
    revenue?: number;
    totalUsers?: number;
    translatorStats?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        completedProjects: number;
        totalWords: number;
        rating: number;
    }[];
    recentClients?: any[];
    totalLanguages?: number;
    totalGlossaryTerms?: number;
}

interface DashboardState {
    stats: DashboardStats | null;
    isLoading: boolean;
    error: string | null;
    fetchStats: (duration?: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    isLoading: false,
    error: null,
    fetchStats: async (duration: string = 'week') => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/dashboard/stats?duration=${duration}`);

            set({ stats: res.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    }
}));
