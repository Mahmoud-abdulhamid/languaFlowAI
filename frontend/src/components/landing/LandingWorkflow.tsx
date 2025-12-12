import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, CheckCircle, Send } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

export const LandingWorkflow = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();

    const STEPS = [
        {
            icon: Upload,
            title: t('workflow.steps.upload.title'),
            desc: t('workflow.steps.upload.desc'),
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            icon: Cpu,
            title: t('workflow.steps.ai.title'),
            desc: t('workflow.steps.ai.desc'),
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
        },
        {
            icon: CheckCircle,
            title: t('workflow.steps.review.title'),
            desc: t('workflow.steps.review.desc'),
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            icon: Send,
            title: t('workflow.steps.delivery.title'),
            desc: t('workflow.steps.delivery.desc'),
            color: 'text-pink-400',
            bg: 'bg-pink-500/10'
        }
    ];
    return (
        <div className={`min-h-screen flex flex-col justify-center py-20 relative snap-start ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'
            }`}>
            {/* Connecting Line (Desktop) */}
            <div className={`hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r -translate-y-8 ${isDark ? 'from-transparent via-blue-500/20 to-transparent' : 'from-transparent via-blue-200/50 to-transparent'
                }`} />

            <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center h-full">
                <div className="text-center mb-10 shrink-0">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`text-3xl md:text-5xl font-bold font-outfit mb-4 ${isDark ? 'text-white' : 'text-slate-900'
                            }`}
                    >
                        {t('workflow.title')} <span className="text-blue-500">{t('workflow.title_highlight')}</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 grow-0">
                    {STEPS.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="relative"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-2xl ${step.bg} flex items-center justify-center mb-6 border relative z-10 shadow-lg ${isDark ? 'border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.3)]' : 'border-slate-100 shadow-slate-200/50'
                                    }`}>
                                    <step.icon size={32} className={step.color} />

                                    {/* Step Number Badge */}
                                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${isDark
                                        ? 'bg-[#13131f] border-white/10 text-gray-400'
                                        : 'bg-white border-slate-200 text-slate-500 shadow-sm'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                </div>
                                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'
                                    }`}>{step.title}</h3>
                                <p className={`text-sm leading-relaxed max-w-[200px] ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
