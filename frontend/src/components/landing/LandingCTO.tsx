import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Code2, Terminal, Phone, Mail, MessageCircle } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

export const LandingCTO = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();
    return (
        <div className={`min-h-[90dvh] flex items-center py-24 relative overflow-hidden snap-start ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'
            }`}>
            {/* Abstract Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`backdrop-blur-xl border rounded-2xl p-8 md:p-12 relative overflow-hidden ${isDark ? 'bg-[#13131f]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}
                    >
                        {/* Decorative Header */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Avatar / Icon */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border overflow-hidden ${isDark ? 'bg-[#0a0a0f] border-white/10' : 'bg-gray-100 border-gray-300'}`}>
                                    {/* Placeholder for CTO Image */}
                                    <Terminal size={48} className="text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 rounded-full border-4 border-[#0a0a0f] flex items-center justify-center">
                                    <Code2 size={14} className="text-white" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center md:text-left flex-1">
                                <h2 className={`text-3xl font-bold font-outfit mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {t('cto.meet')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{t('cto.architect')}</span>
                                </h2>
                                <p className="text-blue-400 font-medium mb-4">{t('cto.role')}</p>

                                <div className="relative mb-8">
                                    <p className={`leading-relaxed italic text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        "{t('cto.quote')}"
                                    </p>
                                    <motion.div
                                        initial={{ opacity: 0, pathLength: 0 }}
                                        whileInView={{ opacity: 1, pathLength: 1 }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className="mt-4 flex justify-end"
                                    >
                                        <div className="relative">
                                            <span className={`font-['Pinyon_Script'] text-3xl md:text-4xl transform -rotate-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                Mahmoud Abdelhameid
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <a
                                        href="https://www.linkedin.com/in/mahmoud-abdelhameid-dev/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 hover:border-[#0077b5]/40 transition-all group"
                                    >
                                        <Linkedin size={18} className="text-[#0077b5]" />
                                        <span className={`text-sm font-medium ${isDark ? 'group-hover:text-white text-gray-300' : 'group-hover:text-gray-900 text-gray-700'}`}>{t('cto.social.linkedin')}</span>
                                    </a>

                                    <a
                                        href="https://wa.me/201122022201"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 transition-all group"
                                    >
                                        <MessageCircle size={18} className="text-green-500" />
                                        <span className={`text-sm font-medium ${isDark ? 'group-hover:text-white text-gray-300' : 'group-hover:text-gray-900 text-gray-700'}`}>{t('cto.social.whatsapp')}</span>
                                    </a>

                                    <a
                                        href="mailto:develper.net@gmail.com"
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all group"
                                    >
                                        <Mail size={18} className="text-red-500" />
                                        <span className={`text-sm font-medium ${isDark ? 'group-hover:text-white text-gray-300' : 'group-hover:text-gray-900 text-gray-700'}`}>{t('cto.social.email')}</span>
                                    </a>

                                    <a
                                        href="tel:+201122022201"
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 hover:border-blue-400/40 transition-all group"
                                    >
                                        <Phone size={18} className="text-blue-400" />
                                        <span className={`text-sm font-medium ${isDark ? 'group-hover:text-white text-gray-300' : 'group-hover:text-gray-900 text-gray-700'}`}>{t('cto.social.call')}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div >
    );
};
