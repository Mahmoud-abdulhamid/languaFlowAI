import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, LayoutDashboard, ShieldCheck, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const LandingHero = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();
    return (
        // Use min-h-screen to ensure full height but allow growth for content
        <div className={`relative min-h-[90dvh] flex items-center justify-center overflow-hidden snap-start py-20 lg:py-0 ${isDark ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'
            }`}>
            {/* Abstract Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-600/5 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[inherit]">
                {/* Text Content */}
                <div className="space-y-6 lg:space-y-8 text-center lg:text-start pt-20 lg:pt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${isDark
                            ? 'bg-white/5 border-white/10 text-blue-400'
                            : 'bg-white border-slate-200 text-blue-600 shadow-sm'
                            }`}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        {t('hero.system_online')}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-7xl font-bold font-outfit tracking-tight"
                    >
                        <span className={isDark ? 'text-white' : 'text-slate-900'}>{t('hero.title_prefix')}</span><br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text leading-tight py-2 inline-block">{t('hero.title_gradient')}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'
                            }`}
                    >
                        {t('hero.description')}
                    </motion.p>


                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                    >
                        <Link
                            to="/login"
                            className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 ${isDark
                                ? 'bg-white text-black hover:bg-gray-100'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                        >
                            {t('hero.launch_demo')}
                            <ArrowRight size={18} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className={`w-full sm:w-auto px-8 py-4 font-medium rounded-xl border transition-all flex items-center justify-center gap-2 ${isDark
                                ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-sm'
                                }`}
                        >
                            <LayoutDashboard size={18} />
                            {t('hero.explore_features')}
                        </a>
                    </motion.div>

                    {/* Trust/Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className={`pt-8 flex items-center justify-center lg:justify-start gap-8 ${isDark ? 'border-t border-white/5' : 'border-t border-slate-200'}`}
                    >
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                            <ShieldCheck size={16} className="text-green-500" />
                            <span>{t('hero.stats.enterprise')}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                            <Globe2 size={16} className="text-blue-500" />
                            <span>{t('hero.stats.multi_lang')}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                            <Sparkles size={16} className="text-purple-500" />
                            <span>{t('hero.stats.ai_powered')}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Visual Content (Dashboard Preview) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative mt-8 lg:mt-0 lg:perspective-1000"
                >
                    {/* Glowing Backdrop - Desktop only */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-3xl opacity-20 transform scale-95 translate-y-4 lg:block" />

                    {/* Main Screenshot Card */}
                    <motion.div
                        className={`relative rounded-2xl border shadow-2xl overflow-hidden group ${isDark ? 'border-white/10 bg-[#13131f]' : 'border-slate-200 bg-white'}`}
                        animate={{
                            rotateY: typeof window !== 'undefined' && window.innerWidth >= 1024 ? -12 : 0,
                            rotateX: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 5 : 0
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Browser Chrome */}
                        <div className={`relative top-0 w-full h-8 flex items-center gap-2 px-4 ${isDark ? 'bg-[#1a1a2e] border-b border-white/5' : 'bg-slate-50 border-b border-slate-200'}`}>
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            {/* Fake URL Bar */}
                            <div className={`hidden sm:block mx-4 flex-1 h-4 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-200/50'}`} />
                        </div>

                        <div className="relative aspect-video bg-black/50">
                            <img
                                src="/screenshots/dashboard_admin.png"
                                alt="Dashboard Interface"
                                className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-700"
                                loading="eager"
                            />
                            {/* Overlay gradient for depth */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Floating Badge - Responsive positioning */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 sm:p-4 rounded-xl backdrop-blur-md border shadow-xl flex items-center gap-3 sm:gap-4 ${isDark ? 'bg-black/60 border-white/10' : 'bg-white/90 border-slate-200 shadow-slate-200/50'}`}
                        >
                            <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                <Sparkles size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <div className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-slate-500 font-medium'}`}>{t('hero.badge.label')}</div>
                                <div className={`text-sm sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('hero.badge.value')}</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};
