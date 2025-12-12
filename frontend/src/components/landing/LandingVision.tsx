import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

export const LandingVision = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();
    return (
        <div className={`min-h-[90dvh] flex items-center py-24 relative overflow-hidden snap-start ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'
            }`}>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Vision Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`p-8 md:p-16 rounded-3xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border text-center relative overflow-hidden ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10" />

                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", delay: 0.2 }}
                    >
                        <Rocket className="mx-auto text-blue-400 mb-6" size={48} />
                    </motion.div>

                    <h2 className={`text-3xl md:text-4xl font-bold mb-6 font-outfit ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {t('vision.title')}
                    </h2>

                    <p className={`text-lg max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('vision.desc')} <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>{t('vision.join_us')}</span>
                    </p>
                </motion.div>
            </div>
        </div >
    );
};
