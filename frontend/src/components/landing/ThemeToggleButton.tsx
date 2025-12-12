import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggleButton = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${isDark
                ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
                : 'bg-gray-200 hover:bg-gray-300 text-yellow-600'
                }`}
            aria-label="Toggle theme"
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};
