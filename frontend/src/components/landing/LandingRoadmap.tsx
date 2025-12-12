import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, PieChart, RefreshCw, Layers } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

export const LandingRoadmap = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();

    const ROADMAP_ITEMS = [
        {
            icon: Users,
            title: t('roadmap.items.hr.title'),
            desc: t('roadmap.items.hr.desc'),
            status: t('roadmap.items.hr.status'),
            color: 'text-pink-400',
            border: 'border-pink-500/20'
        },
        {
            icon: Briefcase,
            title: t('roadmap.items.erp.title'),
            desc: t('roadmap.items.erp.desc'),
            status: t('roadmap.items.erp.status'),
            color: 'text-purple-400',
            border: 'border-purple-500/20'
        },
        {
            icon: PieChart,
            title: t('roadmap.items.crm.title'),
            desc: t('roadmap.items.crm.desc'),
            status: t('roadmap.items.crm.status'),
            color: 'text-blue-400',
            border: 'border-blue-500/20'
        }
    ];
    return (
        <div className={`min-h-[90dvh] flex items-center py-24 relative overflow-hidden snap-start ${isDark ? 'bg-[#08080c]' : 'bg-gray-50'
            }`}>
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold mb-6"
                        >
                            <RefreshCw size={12} className="animate-spin-slow" />
                            {t('roadmap.weekly_updates')}
                        </motion.div>
                        <h2 className={`text-4xl md:text-5xl font-bold font-outfit mb-6 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            {t('roadmap.title_prefix')} <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('roadmap.title_highlight')}</span>
                        </h2>
                        <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('roadmap.desc')}
                            <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('roadmap.desc_highlight')}</span>
                            {t('roadmap.desc_suffix')}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {ROADMAP_ITEMS.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-8 rounded-2xl border ${item.border} relative group overflow-hidden ${isDark ? 'bg-[#0e0e14]' : 'bg-white'}`}
                        >
                            <div className={`absolute top-0 right-0 px-4 py-1.5 bg-[#1a1a24] rounded-bl-xl text-xs font-bold ${item.color}`}>
                                {item.status}
                            </div>

                            <div className={`w-14 h-14 rounded-xl bg-[#1a1a24] flex items-center justify-center mb-6 ${item.color}`}>
                                <item.icon size={28} />
                            </div>

                            <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                {item.title}
                            </h3>
                            <p className={`leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.desc}
                            </p>

                            <div className="w-full h-1 bg-[#1a1a24] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '40%' }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className={`h-full bg-current ${item.color}`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div >
    );
};
