import React from 'react';
import { GlassCard } from '../GlassCard';
import { MessageSquare, Bot, Sparkles, BookOpen, Clock, Lock, Globe, Zap } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

export const FeatureShowcase = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();

    const FEATURES = [
        {
            icon: Bot,
            title: t('features.items.ai_nexus.title'),
            desc: t('features.items.ai_nexus.desc'),
            color: 'text-purple-400',
            bg: 'from-purple-500/20 to-indigo-500/5'
        },
        {
            icon: MessageSquare,
            title: t('features.items.chat_hub.title'),
            desc: t('features.items.chat_hub.desc'),
            color: 'text-blue-400',
            bg: 'from-blue-500/20 to-cyan-500/5'
        },
        {
            icon: BookOpen,
            title: t('features.items.smart_glossary.title'),
            desc: t('features.items.smart_glossary.desc'),
            color: 'text-yellow-400',
            bg: 'from-yellow-500/20 to-orange-500/5'
        },
        {
            icon: Clock,
            title: t('features.items.smart_deadlines.title'),
            desc: t('features.items.smart_deadlines.desc'),
            color: 'text-red-400',
            bg: 'from-red-500/20 to-pink-500/5'
        },
        {
            icon: Globe,
            title: t('features.items.multi_lingual.title'),
            desc: t('features.items.multi_lingual.desc'),
            color: 'text-green-400',
            bg: 'from-green-500/20 to-emerald-500/5'
        },
        {
            icon: Zap,
            title: t('features.items.instant_qa.title'),
            desc: t('features.items.instant_qa.desc'),
            color: 'text-orange-400',
            bg: 'from-orange-500/20 to-red-500/5'
        }
    ];

    return (
        <div className={`min-h-screen flex flex-col justify-center py-20 relative snap-start ${isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'}`} id="features">
            <div className="container mx-auto px-4 h-full flex flex-col justify-center">
                <div className="text-center mb-8 shrink-0">
                    <span className="text-xs font-bold tracking-wider text-blue-500 uppercase mb-2 block">{t('features.label')}</span>
                    <h2 className={`text-3xl md:text-5xl font-bold font-outfit ${isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                        {t('features.title_prefix')} <br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">{t('features.title_gradient')}</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 grow-0">
                    {FEATURES.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`group relative p-1 rounded-2xl bg-gradient-to-b to-transparent hover:from-blue-500/50 transition-all duration-500 ${isDark ? 'from-white/10' : 'from-slate-200'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl" />

                            <div className={`relative h-full rounded-xl p-8 border transition-colors shadow-sm ${isDark
                                ? 'bg-[#13131f] border-white/5 group-hover:border-white/10'
                                : 'bg-white border-slate-200 group-hover:border-blue-200 group-hover:shadow-md'
                                }`}>
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon size={24} className={feature.color} />
                                </div>
                                <h3 className={`text-xl font-bold mb-3 font-outfit ${isDark ? 'text-white' : 'text-slate-900'
                                    }`}>{feature.title}</h3>
                                <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
