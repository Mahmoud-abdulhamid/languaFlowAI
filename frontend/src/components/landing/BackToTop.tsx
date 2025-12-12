import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUp, Rocket, X } from 'lucide-react';
import { useLandingTheme } from '../../hooks/useLandingTheme';
import { useLanguage } from '../../contexts/LanguageContext';

export const BackToTop = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showBasementBubble, setShowBasementBubble] = useState(false);
    const { isDark } = useLandingTheme();

    const { scrollYProgress } = useScroll();

    // Map 0-99% scroll to 0-100% path to ensure completion
    const adjustedProgress = useTransform(scrollYProgress, [0, 0.99], [0, 1]);

    const scaleX = useSpring(adjustedProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Rotation linked to scroll for the galaxy
    const rotate = useTransform(scaleX, [0, 1], [0, 360]);

    // Progress Ring Math
    const radius = 22; // Reduced from 36
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = useTransform(scaleX, [0, 1], [circumference, 0]);

    useEffect(() => {
        const handleScroll = () => {
            // Visibility Check
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setShowBasementBubble(false); // Reset to hidden when scrolling up
            }

            // Basement Check (Bottom of Page)
            const bottomThreshold = 50; // pixels from bottom
            // Check if we've reached the bottom
            const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - bottomThreshold;

            if (isAtBottom && isVisible && !showBasementBubble) {
                // Only show if visible logic is true and not already shown
                setShowBasementBubble(true);
            } else if (!isAtBottom && showBasementBubble) {
                // Hide if user starts scrolling up (leaves the bottom area)
                setShowBasementBubble(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isVisible, showBasementBubble]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
        setShowBasementBubble(false);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">

            {/* Basement Bubble */}
            <AnimatePresence>
                {showBasementBubble && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        className={`pointer-events-auto max-w-xs p-4 rounded-2xl shadow-xl backdrop-blur-md border relative mb-2 ${isDark
                            ? 'bg-[#1a1a2e]/90 border-white/10 text-gray-200'
                            : 'bg-white/95 border-gray-200 text-gray-800'
                            }`}
                        style={{ transformOrigin: 'bottom right' }}
                    >
                        {/* Tail */}
                        <div className={`absolute -bottom-2 right-6 w-4 h-4 rotate-45 border-r border-b ${isDark ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-gray-200'
                            }`} />

                        <div className="relative z-10 text-left">
                            <h4 className="font-bold mb-1 text-sm">{t('back_to_top.basement_title')}</h4>
                            <p className="text-xs leading-relaxed mb-3 opacity-90">
                                {t('back_to_top.basement_desc')}
                            </p>
                            <p className="text-xs font-medium mb-3">
                                {t('back_to_top.basement_prompt')}
                            </p>

                            <div className="flex bg-black/5 rounded-lg p-1 gap-1">
                                <button
                                    onClick={scrollToTop}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${isDark
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500'
                                        : 'bg-white text-blue-600 shadow-sm hover:bg-gray-50'
                                        }`}>
                                    <Rocket size={12} />
                                    {t('back_to_top.elevator')}
                                </button>
                                <button
                                    onClick={() => setShowBasementBubble(false)}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${isDark
                                        ? 'hover:bg-white/10 text-gray-400'
                                        : 'hover:bg-gray-200/50 text-gray-500'
                                        }`}>
                                    <ArrowUp size={12} />
                                    {t('back_to_top.stairs')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Main Button Container */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className="relative pointer-events-auto"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        onClick={scrollToTop}
                    >
                        {/* Progress Ring SVG - Scaled Down */}
                        <svg className="w-[44px] h-[44px] -rotate-90 pointer-events-none absolute -top-[11px] -left-[11px]">
                            {/* Track */}
                            <circle
                                cx="22"
                                cy="22"
                                r={radius}
                                stroke={isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
                                strokeWidth="2"
                                fill="transparent"
                                className="opacity-10"
                            />
                            {/* Indicator */}
                            <motion.circle
                                cx="22"
                                cy="22"
                                r={radius}
                                stroke={isDark ? "#60A5FA" : "#3B82F6"} // Blue-400 / Blue-500
                                strokeWidth="2"
                                fill="transparent"
                                strokeDasharray={circumference}
                                style={{ strokeDashoffset }}
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Button Content - Scaled Down */}
                        <button
                            className={`w-[22px] h-[22px] flex items-center justify-center rounded-full shadow-lg backdrop-blur-md relative overflow-hidden group ${isDark
                                ? 'bg-[#1a1a2e] text-white border border-white/20'
                                : 'bg-white text-gray-900 border border-gray-200'
                                }`}
                        >
                            {/* Hover Galaxy Effect */}
                            <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: isDark
                                        ? 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.3), transparent)'
                                        : 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                                    rotate
                                }}
                            />

                            {/* Icon - Scaled Down */}
                            <div className="relative z-10 transform group-hover:-translate-y-1 transition-transform duration-300">
                                {isHovered ? <Rocket size={11} className="text-blue-500" /> : <ArrowUp size={11} />}
                            </div>

                            {/* "Top" Text */}
                            <span className="absolute bottom-[2px] text-[5px] font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                TOP
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
