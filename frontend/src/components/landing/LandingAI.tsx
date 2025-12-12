import React from 'react';
import { Sparkles, Brain, Cpu, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const LandingAI = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();
    return (
        <div className={`min-h-[90dvh] flex items-center py-24 relative overflow-hidden snap-start ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'
            }`}>
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-900/10 to-transparent blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25 mb-6"
                    >
                        <Brain className="text-white" size={32} />
                    </motion.div>

                    <h2 className={`text-4xl md:text-5xl font-bold font-outfit mb-6 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {t('ai.badge')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t('ai.title_highlight')}</span>
                    </h2>
                    <p className={`text-lg max-w-2xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('ai.desc')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className={`p-8 rounded-2xl border relative group overflow-hidden ${isDark ? 'bg-[#13131f] border-white/5' : 'bg-white border-gray-200'
                        }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Cpu className="text-purple-400 mb-6" size={32} />
                        <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>{t('ai.features.multimodel.title')}</h3>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('ai.features.multimodel.desc')}
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className={`p-8 rounded-2xl border relative group overflow-hidden ${isDark ? 'bg-[#13131f] border-white/5' : 'bg-white border-gray-200'
                        }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Sparkles className="text-pink-400 mb-6" size={32} />
                        <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>{t('ai.features.context.title')}</h3>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('ai.features.context.desc')}
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className={`p-8 rounded-2xl border relative group overflow-hidden ${isDark ? 'bg-[#13131f] border-white/5' : 'bg-white border-gray-200'
                        }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MessageSquareText className="text-blue-400 mb-6" size={32} />
                        <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>{t('ai.features.assistant.title')}</h3>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('ai.features.assistant.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
