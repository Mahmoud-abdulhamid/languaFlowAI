import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

export const LandingFAQ = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const FAQS = [
        {
            q: t('faq.questions.ai_help.q'),
            a: t('faq.questions.ai_help.a')
        },
        {
            q: t('faq.questions.multiple_projects.q'),
            a: t('faq.questions.multiple_projects.a')
        },
        {
            q: t('faq.questions.security.q'),
            a: t('faq.questions.security.a')
        },
        {
            q: t('faq.questions.clients.q'),
            a: t('faq.questions.clients.a')
        }
    ];

    return (
        <div className={`min-h-[90dvh] flex items-center py-24 snap-start ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className={`text-3xl md:text-5xl font-bold font-outfit mb-6 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {t('faq.title')} <span className="text-blue-500">{t('faq.title_highlight')}</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`border rounded-2xl overflow-hidden ${isDark ? 'border-white/10 bg-[#13131f]' : 'border-gray-200 bg-white'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className={`w-full flex items-center justify-between p-6 text-left transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                            >
                                <span className={`text-lg font-bold pr-8 ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}>{faq.q}</span>
                                {openIndex === idx ? (
                                    <Minus className="text-blue-500 min-w-[20px]" />
                                ) : (
                                    <Plus className="text-gray-500 min-w-[20px]" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`p-6 pt-0 leading-relaxed border-t ${isDark ? 'text-gray-400 border-white/5' : 'text-gray-600 border-gray-200'}`}>
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};
