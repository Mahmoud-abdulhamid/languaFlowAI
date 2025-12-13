import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check, X } from 'lucide-react';
import { useLandingTheme } from '../hooks/useLandingTheme';

export const LanguageSwitcher = () => {
    const { language, setLanguage, availableLanguages } = useLanguage();
    const { isDark } = useLandingTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = availableLanguages.find(l => l.code === language);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700'
                    }`}
            >
                <img src={currentLang?.flag} alt={language} className="w-5 h-auto rounded-sm shadow-sm" />
                <span className="text-sm font-medium uppercase hidden sm:block">{language}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed inset-0 w-full h-[100dvh] sm:h-auto sm:absolute sm:inset-auto sm:top-full sm:mt-2 sm:right-0 sm:w-48 sm:rounded-xl shadow-xl border overflow-hidden z-50 flex flex-col ${isDark
                            ? 'bg-[#1a1a2e] border-white/10'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className="flex sm:hidden justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="font-bold text-lg">Select Language</h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                            {availableLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${language === lang.code
                                        ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                                        : isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={lang.flag} alt={lang.name} className="w-5 h-auto rounded-sm shadow-sm" />
                                        <span className="font-medium">{lang.name}</span>
                                    </div>
                                    {language === lang.code && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
