import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useLandingTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Check localStorage first
        const saved = localStorage.getItem('landing-theme');
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        // Default to dark
        return 'dark';
    });

    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('landing-theme', theme);

        // Apply to document root for CSS
        document.documentElement.setAttribute('data-landing-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return { theme, toggleTheme, isDark: theme === 'dark' };
};
