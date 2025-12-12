import React from 'react';
import { Server, ShieldCheck, Zap, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

import { useLanguage } from '../../contexts/LanguageContext';

export const LandingEngineering = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();

    const PRINCIPLES = [
        {
            icon: Layers,
            title: t('engineering.principles.microservices.title'),
            desc: t('engineering.principles.microservices.desc'),
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10'
        },
        {
            icon: Zap,
            title: t('engineering.principles.performance.title'),
            desc: t('engineering.principles.performance.desc'),
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10'
        },
        {
            icon: ShieldCheck,
            title: t('engineering.principles.security.title'),
            desc: t('engineering.principles.security.desc'),
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            icon: Server,
            title: t('engineering.principles.scalability.title'),
            desc: t('engineering.principles.scalability.desc'),
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        }
    ];
    return (
        <div className={`min-h-screen flex items-center py-24 relative snap-start ${isDark ? 'bg-[#08080c]' : 'bg-gray-50'
            }`}>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Text Content */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`inline-block px-4 py-1.5 rounded-full border text-sm font-bold mb-6 ${isDark ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700'
                                }`}
                        >
                            {t('engineering.badge')}
                        </motion.div>
                        <h2 className={`text-4xl md:text-5xl font-bold font-outfit mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            {t('engineering.title')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('engineering.title_highlight')}</span>
                        </h2>
                        <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {t('engineering.desc')}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {PRINCIPLES.map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border transition-colors ${isDark ? 'border-white/5 bg-[#13131f] hover:border-white/10' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}>
                                    <item.icon className={`mb-3 ${item.color}`} size={24} />
                                    <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                                        }`}>{item.title}</h4>
                                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'
                                        }`}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Code Visualization */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20" />
                        <div className={`relative rounded-2xl border p-6 font-mono text-sm overflow-hidden shadow-2xl ${isDark ? 'bg-[#0e0e14] border-white/10' : 'bg-white border-gray-200'
                            }`}>
                            <div className={`flex gap-2 mb-4 border-b pb-4 ${isDark ? 'border-white/5' : 'border-gray-200'
                                }`}>
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                            <div className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <div className="flex">
                                    <span className="text-purple-400 w-8">1</span>
                                    <span><span className="text-blue-400">class</span> <span className="text-yellow-400">SystemCore</span> <span className="text-white">{'{'}</span></span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-8">2</span>
                                    <span className="pl-4"><span className="text-purple-400">readonly</span> <span className="text-blue-300">reliability</span> = <span className="text-green-400">0.9999</span>;</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-8">3</span>
                                    <span className="pl-4"><span className="text-purple-400">private</span> <span className="text-blue-300">securityModule</span> = <span className="text-cyan-400">new</span> SecurityLayer();</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-8">4</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-8">5</span>
                                    <span className="pl-4"><span className="text-blue-400">async</span> <span className="text-yellow-400">scale</span>() <span className="text-white">{'{'}</span></span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-8">6</span>
                                    <span className="pl-8"><span className="text-purple-400">await</span> <span className="text-white">this</span>.loadBalancer.<span className="text-yellow-400">distribute</span>();</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-8">7</span>
                                    <span className="pl-8"><span className="text-purple-400">return</span> <span className="text-green-400">"Optimized"</span>;</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-8">8</span>
                                    <span className="pl-4"><span className="text-white">{'}'}</span></span>
                                </div>
                                <div className="flex">
                                    <span className="text-purple-400 w-8">9</span>
                                    <span className="text-white">{'}'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};
