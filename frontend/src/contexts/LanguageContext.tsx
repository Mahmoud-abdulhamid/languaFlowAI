import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, type Language } from '../translations/languages';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
    availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('landing-language');
        // Default to english if no saved language or invalid
        return (saved && Object.keys(translations).includes(saved)) ? (saved as Language) : 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('landing-language', lang);
    };

    const dir = translations[language].dir as 'ltr' | 'rtl';

    // Apply direction to document root
    useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = language;

        // Optional: Add specific font class for Arabic
        if (language === 'ar') {
            document.body.classList.add('font-cairo');
        } else {
            document.body.classList.remove('font-cairo');
        }
    }, [dir, language]);

    // Simple nested key retrieval (e.g. t('nav.features'))
    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = translations[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Missing translation for key: ${path} in language: ${language}`);
                // Fallback to English
                let fallback: any = translations['en'];
                for (const k of keys) {
                    fallback = fallback?.[k];
                }
                return fallback || path;
            }
            current = current[key];
        }
        return current;
    };

    const availableLanguages = Object.entries(translations).map(([code, data]) => ({
        code: code as Language,
        name: data.name,
        flag: data.flag
    }));

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir, availableLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
