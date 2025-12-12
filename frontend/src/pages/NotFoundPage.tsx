import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { CopyrightFooter } from '../components/CopyrightFooter';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    // Multilingual "Not Found" texts
    const notFoundTexts = [
        { lang: 'en', text: 'Page Not Found' },
        { lang: 'es', text: 'Página No Encontrada' },
        { lang: 'fr', text: 'Page Non Trouvée' },
        { lang: 'de', text: 'Seite Nicht Gefunden' },
        { lang: 'ja', text: 'ページが見つかりません' },
        { lang: 'ar', text: 'الصفحة غير موجودة' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-between p-4 relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -right-[20%] w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, -45, 0],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute -bottom-[20%] -left-[20%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[100px]"
                />
            </div>

            <div className="w-full h-20" /> {/* Spacer for top balance */}

            <div className="relative z-10 w-full max-w-2xl text-center my-auto">
                <GlassCard className="p-12 md:p-16 border-white/5 backdrop-blur-xl bg-black/40">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* 404 Glitch Effect */}
                        <div className="relative inline-block mb-8">
                            <motion.h1
                                className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-outfit"
                                animate={{
                                    textShadow: [
                                        "0 0 0px rgba(59,130,246,0)",
                                        "2px 2px 0px rgba(59,130,246,0.5)",
                                        "-2px -2px 0px rgba(168,85,247,0.5)",
                                        "0 0 0px rgba(59,130,246,0)"
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                            >
                                404
                            </motion.h1>
                            <motion.div
                                className="absolute -top-4 -right-8 text-6xl"
                                animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                🛸
                            </motion.div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-6">Lost in Translation?</h2>

                        {/* Changing Text Animation */}
                        <div className="h-8 mb-8 overflow-hidden relative">
                            <motion.div
                                animate={{ y: [0, -32 * 5] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                            >
                                {[...notFoundTexts, ...notFoundTexts].map((item, index) => (
                                    <div key={index} className="h-8 flex items-center justify-center text-gray-400 text-lg">
                                        {item.text}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
                            The page you are looking for seems to have drifted into an unknown sector of the galaxy.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all group"
                            >
                                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                                Go Back
                            </button>

                            <Link
                                to="/"
                                className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                            >
                                <Home size={20} />
                                Return Home
                            </Link>
                        </div>
                    </motion.div>
                </GlassCard>

                <div className="mt-8 text-gray-600 text-sm flex items-center justify-center gap-2">
                    <Compass size={14} className="animate-spin-slow" />
                    <span>Coordinates: Unknown Sector</span>
                </div>
            </div>

            <div className="w-full z-10">
                <CopyrightFooter />
            </div>
        </div>
    );
};
