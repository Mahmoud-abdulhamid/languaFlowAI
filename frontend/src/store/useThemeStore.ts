import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'dark', // Default aligned with original "Midnight" theme
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'theme-storage',
        }
    )
);
