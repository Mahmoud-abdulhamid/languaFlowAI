import { create } from 'zustand';
import api from '../api/axios';
import { useAuthStore } from './useAuthStore';

interface Project {
    id: string; // mapped from _id
    title: string;
    description?: string;
    sourceLang: string;
    targetLangs: string[];
    status: string;
    wordCount?: number;
    deadline?: string;
    files: any[];
    createdAt: string;
    updatedAt?: string;
    clientId?: any;
    assignedTranslators?: any[];
    deliverables?: any[];
    domain?: string; // Optional domain field
}

export interface GlossaryTerm {
    _id: string;
    term: string;
    translation: string;
    sourceLang: string;
    targetLang: string;
    projectId: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface ProjectFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sourceLang?: string;
    targetLang?: string;
    domain?: string;
    clientId?: string;
    sortBy?: string;
}

interface ProjectState {
    projects: Project[];
    pagination: Pagination;
    activeProject: Project | null;
    isLoading: boolean;
    error: string | null;
    fetchProjects: (filters?: ProjectFilters) => Promise<void>;
    fetchProject: (id: string) => Promise<void>;
    createProject: (data: any) => Promise<void>;
    assignTranslator: (projectId: string, translatorId: string) => Promise<void>;
    removeTranslator: (projectId: string, translatorId: string) => Promise<void>;
    updateStatus: (projectId: string, status: string) => Promise<void>;
    addProjectFiles: (projectId: string, formData: FormData) => Promise<void>;
    updateProjectDetails: (id: string, data: any) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    deleteProjectFile: (projectId: string, fileId: number) => Promise<void>;
    uploadDeliverable: (projectId: string, formData: FormData) => Promise<void>;
    deleteDeliverable: (projectId: string, fileId: string) => Promise<void>;
    glossaryTerms: GlossaryTerm[];
    fetchGlossary: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    activeProject: null,
    isLoading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 1
    },
    glossaryTerms: [],
    fetchGlossary: async (projectId: string) => {
        try {
            // We don't set global loading here to avoid flickering the whole page
            const token = useAuthStore.getState().token;
            const res = await api.get(`/glossaries/project/${projectId}`);
            set({ glossaryTerms: res.data });
        } catch (error) {
            console.error("Failed to fetch glossary", error);
        }
    },
    fetchProjects: async (filters: ProjectFilters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            if (!token) throw new Error("Not authenticated");

            // Build query string from filters
            const params = new URLSearchParams();
            params.append('page', String(filters.page || 1));
            params.append('limit', String(filters.limit || 12));

            if (filters.search) params.append('search', filters.search);
            if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
            if (filters.sourceLang && filters.sourceLang !== 'ALL') params.append('sourceLang', filters.sourceLang);
            if (filters.targetLang && filters.targetLang !== 'ALL') params.append('targetLang', filters.targetLang);
            if (filters.domain && filters.domain !== 'ALL') params.append('domain', filters.domain);
            if (filters.clientId && filters.clientId !== 'ALL') params.append('clientId', filters.clientId);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);

            const res = await api.get(`/projects?${params.toString()}`);

            // Handle new response structure { data: [], pagination: {} }
            const { data, pagination } = res.data;

            // Map _id to id for frontend consistency
            const mappedProjects = data.map((p: any) => ({
                ...p,
                id: p._id
            }));

            set({ projects: mappedProjects, pagination, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },
    createProject: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/projects', data);
            // Refresh list or add to state optimistically? For now, fetch all.
            await useProjectStore.getState().fetchProjects();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },
    fetchProject: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/projects/${id}`);

            const mappedProject = { ...res.data, id: res.data._id };
            set({ activeProject: mappedProject, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },
    assignTranslator: async (projectId: string, translatorId: string) => {
        try {
            const res = await api.post('/projects/assign', { projectId, translatorId });
            const mappedProject = { ...res.data, id: res.data._id };
            set({ activeProject: mappedProject });
        } catch (error: any) {
            throw error;
        }
    },
    removeTranslator: async (projectId: string, translatorId: string) => {
        try {
            const res = await api.post('/projects/remove-translator', { projectId, translatorId });
            const mappedProject = { ...res.data, id: res.data._id };
            set({ activeProject: mappedProject });
        } catch (error: any) {
            throw error;
        }
    },
    updateStatus: async (projectId: string, status: string) => {
        try {
            await api.patch(`/projects/${projectId}`, { status });
            await useProjectStore.getState().fetchProject(projectId);
        } catch (error: any) {
            throw error;
        }
    },
    deleteProject: async (projectId: string) => {
        try {
            await api.delete(`/projects/${projectId}`);
        } catch (error: any) {
            throw error;
        }
    },
    deleteProjectFile: async (projectId: string, fileId: number) => {
        try {
            await api.delete(`/projects/${projectId}/files/${fileId}`);
            // Refresh project to update file list
            await useProjectStore.getState().fetchProject(projectId);
        } catch (error: any) {
            throw error;
        }
    },
    addProjectFiles: async (projectId: string, formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/projects/${projectId}/files`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await useProjectStore.getState().fetchProject(projectId);
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to add files', isLoading: false });
            throw error;
        }
    },
    updateProjectDetails: async (id, data) => {
        try {
            const res = await api.patch(`/projects/${id}/details`, data);
            await useProjectStore.getState().fetchProject(id);
        } catch (error: any) {
            throw error;
        }
    },
    uploadDeliverable: async (projectId: string, formData: FormData) => {
        try {
            const res = await api.post(`/projects/${projectId}/deliverables`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const mappedProject = { ...res.data, id: res.data._id };
            set({ activeProject: mappedProject });
        } catch (error: any) {
            throw error;
        }
    },
    deleteDeliverable: async (projectId: string, fileId: string) => {
        try {
            const res = await api.delete(`/projects/${projectId}/deliverables/${fileId}`);
            const mappedProject = { ...res.data, id: res.data._id };
            set({ activeProject: mappedProject });
        } catch (error: any) {
            throw error;
        }
    }
}));
