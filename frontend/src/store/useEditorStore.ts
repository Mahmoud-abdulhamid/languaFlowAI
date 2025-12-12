import { create } from 'zustand';
import api from '../api/axios';
import { useAuthStore } from './useAuthStore';

interface Segment {
    _id: string; // The backend uses _id for segments now
    sequence: number;
    sourceText: string;
    targetText: string;
    status: 'DRAFT' | 'TRANSLATED' | 'CONFIRMED';
    aiSuggestion?: string;
}

interface EditorState {
    segments: Segment[];
    activeSegmentId: string | null;
    isLoading: boolean;
    isSaving: boolean;
    isTranslatingAll: boolean;
    generatingAiSegmentIds: string[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        total: number;
    },
    filterStatus: 'ALL' | 'UNTRANSLATED' | 'TRANSLATED' | 'CONFIRMED';

    setPage: (page: number) => void;
    setFilterStatus: (status: 'ALL' | 'UNTRANSLATED' | 'TRANSLATED' | 'CONFIRMED') => void;

    loadSegments: (projectId: string, fileId: string, targetLang?: string, page?: number) => Promise<void>;
    updateSegmentLocal: (id: string, text: string) => void;
    saveSegment: (id: string) => Promise<void>;
    confirmSegment: (id: string) => Promise<void>;
    generateAI: (id: string) => Promise<void>;
    translateAll: (projectId: string, fileId: string, targetLang: string, segmentIds?: string[]) => Promise<string>;
    stopTranslation: (projectId: string, fileId: string) => Promise<void>;
    clearTranslations: (projectId: string, fileId: string, targetLang: string) => Promise<void>;
    setActiveSegment: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    segments: [],
    activeSegmentId: null,
    isLoading: false,
    isSaving: false,
    isTranslatingAll: false,
    generatingAiSegmentIds: [],
    pagination: {
        page: 1,
        limit: 50,
        totalPages: 1,
        total: 0
    },
    filterStatus: 'ALL',

    setPage: (page) => set(state => ({ pagination: { ...state.pagination, page } })),
    setFilterStatus: (filterStatus) => set(state => ({ filterStatus, pagination: { ...state.pagination, page: 1 } })),

    loadSegments: async (projectId, fileId, targetLang, page = 1) => {
        set({ isLoading: true });
        try {
            const { limit } = get().pagination;
            const { filterStatus } = get();

            const res = await api.get(`/projects/${projectId}/files/${fileId}/segments`, {
                params: { targetLang, page, limit, status: filterStatus }
            });

            // Handle both legacy (array) and new (paginated) response for safety during migration
            const segments = Array.isArray(res.data) ? res.data : res.data.segments;
            const pagination = Array.isArray(res.data) ? { ...get().pagination } : res.data.pagination;

            set({
                segments,
                pagination,
                isLoading: false,
                activeSegmentId: segments[0]?._id || null
            });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    },

    updateSegmentLocal: (id, text) => {
        set(state => ({
            segments: state.segments.map(s => s._id === id ? { ...s, targetText: text } : s)
        }));
    },

    saveSegment: async (id) => {
        const segment = get().segments.find(s => s._id === id);
        if (!segment) return;

        set({ isSaving: true });
        try {
            await api.patch(`/projects/segments/${id}`,
                { targetText: segment.targetText, status: 'TRANSLATED' }
            );
            set(state => ({
                segments: state.segments.map(s => s._id === id ? { ...s, status: 'TRANSLATED' } : s),
                isSaving: false
            }));
        } catch (error) {
            console.error(error);
            set({ isSaving: false });
        }
    },

    confirmSegment: async (id) => {
        const segment = get().segments.find(s => s._id === id);
        if (!segment) return;

        set({ isSaving: true });
        try {
            await api.patch(`/projects/segments/${id}`,
                { targetText: segment.targetText, status: 'CONFIRMED' }
            );

            // Move to next
            const idx = get().segments.findIndex(s => s._id === id);
            const nextId = get().segments[idx + 1]?._id;

            set(state => ({
                segments: state.segments.map(s => s._id === id ? { ...s, status: 'CONFIRMED' } : s),
                activeSegmentId: nextId || id,
                isSaving: false
            }));
        } catch (error) {
            set({ isSaving: false });
        }
    },

    generateAI: async (id) => {
        set(state => ({ generatingAiSegmentIds: [...state.generatingAiSegmentIds, id] }));
        try {
            const res = await api.post(`/projects/segments/${id}/ai`, {});
            set(state => ({
                segments: state.segments.map(s => s._id === id ? { ...s, aiSuggestion: res.data.suggestion } : s),
                generatingAiSegmentIds: state.generatingAiSegmentIds.filter(sid => sid !== id)
            }));
        } catch (error) {
            console.error(error);
            set(state => ({ generatingAiSegmentIds: state.generatingAiSegmentIds.filter(sid => sid !== id) }));
        }
    },

    translateAll: async (projectId: string, fileId: string, targetLang: string, segmentIds?: string[]) => {
        set({ isTranslatingAll: true });
        try {
            // Response will be "started in background"
            const res = await api.post(`/projects/${projectId}/files/${fileId}/translate-all`,
                { targetLang, segmentIds }
            );

            set({ isTranslatingAll: false });
            return res.data.message; // Return message for UI to display
        } catch (error: any) {
            console.error(error);
            set({ isTranslatingAll: false });
            throw error;
        }
    },

    stopTranslation: async (projectId: string, fileId: string) => {
        try {
            await api.post(`/projects/${projectId}/files/${fileId}/stop`, {});
            set({ isTranslatingAll: false });
        } catch (error) {
            console.error(error);
        }
    },

    clearTranslations: async (projectId: string, fileId: string, targetLang: string) => {
        set({ isLoading: true });
        try {
            await api.post(`/projects/${projectId}/files/${fileId}/clear`,
                { targetLang }
            );
            await get().loadSegments(projectId, fileId, targetLang);
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
    },

    setActiveSegment: (id) => set({ activeSegmentId: id })
}));
