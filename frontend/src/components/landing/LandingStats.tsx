import React from 'react';
import { motion } from 'framer-motion';

import { useLanguage } from '../../contexts/LanguageContext';

export const LandingStats = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();

    const STATS = [
        { label: t('stats.words_processed'), value: '10M+', color: 'text-blue-400' },
        { label: t('stats.active_projects'), value: '500+', color: 'text-purple-400' },
        { label: t('stats.languages'), value: '120+', color: 'text-green-400' },
        { label: t('stats.uptime'), value: '99.9%', color: 'text-pink-400' },
    ];
    return (
        <div className={`min-h-screen flex items-center py-20 border-y relative snap-start ${isDark ? 'border-white/5 bg-[#0f0f16]' : 'border-gray-200 bg-gray-50'
            }`}>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-center"
                        >
                            <div className={`text-4xl md:text-5xl font-bold font-outfit mb-2 ${stat.color}`}>
                                {stat.value}
                            </div>
                            <div className={`font-medium tracking-wide uppercase text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'
                                }`}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
