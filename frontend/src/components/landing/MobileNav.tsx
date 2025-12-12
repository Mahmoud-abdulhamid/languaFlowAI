import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
}

const menuItems = [
    { label: 'Features', href: '#features' },
    { label: 'Technology', href: '#technology' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'Contact', href: '#contact' },
    { label: 'Login', href: '/login', isPrimary: true },
];

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, isDark }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm z-[100] md:hidden border-l shadow-2xl ${isDark
                            ? 'bg-[#0a0a0f] border-white/10'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <span className={`text-xl font-bold font-outfit ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Menu
                                </span>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-full transition-colors ${isDark
                                        ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Links */}
                            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-2">
                                {menuItems.map((item, idx) => (
                                    <motion.a
                                        key={item.label}
                                        href={item.href}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={onClose}
                                        className={`flex items-center justify-between p-4 rounded-xl text-lg font-medium transition-all group ${item.isPrimary
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                                            : isDark
                                                ? 'text-gray-300 hover:bg-white/5'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.label}
                                        {!item.isPrimary && (
                                            <ChevronRight
                                                size={16}
                                                className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-gray-400' : 'text-gray-400'
                                                    }`}
                                            />
                                        )}
                                    </motion.a>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className={`p-6 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                                <div className="flex justify-center gap-6">
                                    {[
                                        { icon: Linkedin, href: 'https://linkedin.com' },
                                        { icon: Twitter, href: 'https://twitter.com' },
                                        { icon: Github, href: 'https://github.com' },
                                        { icon: Mail, href: 'mailto:contact@example.com' },
                                    ].map((social, idx) => (
                                        <motion.a
                                            key={idx}
                                            href={social.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + idx * 0.05 }}
                                            className={`p-2 rounded-lg transition-colors ${isDark
                                                ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                                                : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                                                }`}
                                        >
                                            <social.icon size={20} />
                                        </motion.a>
                                    ))}
                                </div>
                                <p className={`text-center text-xs mt-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    © 2024 LinguaFlow AI
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
