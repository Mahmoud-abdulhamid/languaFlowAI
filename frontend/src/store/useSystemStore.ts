import { create } from 'zustand';
import api from '../api/axios';

interface SystemSettings {
    system_name: string;
    system_logo?: string;
    system_favicon?: string;
    support_email: string;
    allowed_file_types: string[];
    maintenance_mode: boolean;
    show_demo_login: boolean;
    max_file_size_mb: number;
    enable_ai_translation_all: boolean;
    enable_clear_translation: boolean;
    allow_client_assign_translators: boolean;
    enable_ai_features?: boolean;
    enable_ai_single_suggestion?: boolean;
    ai_model?: string;
    notes_system_enabled?: boolean;
    notes_replies_enabled?: boolean;
    notes_allow_attachments?: boolean;
    ai_moderation_contact_info?: boolean;
    enable_ai_glossary_gen?: boolean;
    project_domains?: string[];
}

interface SystemStore {
    settings: SystemSettings;
    isLoading: boolean;
    fetchSettings: () => Promise<void>;
    updateSetting: (key: string, value: any) => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
    settings: {
        system_name: 'LinguaFlow',
        system_logo: '',
        system_favicon: '',
        support_email: '',
        allowed_file_types: ['.pdf', '.docx', '.txt'],
        maintenance_mode: false,
        show_demo_login: true,
        max_file_size_mb: 10,
        enable_ai_translation_all: false,
        enable_clear_translation: true,
        allow_client_assign_translators: false,
        notes_system_enabled: false,
        notes_replies_enabled: false,
        notes_allow_attachments: false,
        ai_moderation_contact_info: false,
        enable_ai_glossary_gen: false,
    },
    isLoading: false,
    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/public-settings');
            set(state => ({
                settings: { ...state.settings, ...res.data },
                isLoading: false
            }));
        } catch (error) {
            console.error('Failed to fetch system settings:', error);
            set({ isLoading: false });
        }
    },
    updateSetting: (key: string, value: any) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } }))
}));
