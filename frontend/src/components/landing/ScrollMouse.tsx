import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLandingTheme } from '../../hooks/useLandingTheme';
import { springScrollTo } from '../../utils/springScroll';

export const ScrollMouse = ({ isDark }: { isDark: boolean }) => {
    // const { isDark } = useLandingTheme(); // Removed internal hook to sync with parent
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isUpMode, setIsUpMode] = useState(false);

    // List of Section IDs in order
    const sections = [
        'hero',
        'stats',
        'technology', // Updated from 'engineering' to match LandingPage ID
        'roles',
        'ai',
        'process', // Updated from 'workflow'
        'features',
        'roadmap',
        'vision',
        'contact', // Updated from 'cto'
        'faq',
        'footer'
    ];

    useEffect(() => {
        const handleScroll = () => {
            // Determine current active section
            const scrollPosition = window.scrollY + window.innerHeight / 2;

            // Check endpoints
            const bottomThreshold = document.documentElement.scrollHeight - window.innerHeight - 100;
            const atBottom = window.scrollY >= bottomThreshold;
            const atTop = window.scrollY < 100;

            if (atBottom) {
                setIsUpMode(true);
            } else if (atTop) {
                setIsUpMode(false);
            }

            // Find current section
            for (let i = sections.length - 1; i >= 0; i--) {
                const element = document.getElementById(sections[i]);
                if (element && element.offsetTop - 150 <= scrollPosition) {
                    setCurrentSectionIndex(i);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = () => {
        let targetIndex;

        if (isUpMode) {
            targetIndex = Math.max(0, currentSectionIndex - 1);
        } else {
            targetIndex = Math.min(sections.length - 1, currentSectionIndex + 1);
        }

        const targetId = sections[targetIndex];

        // Use the shared spring scroll utility to ensure identical behavior to mouse wheel
        springScrollTo(targetId);
    };

    return (
        <motion.div
            className={`hidden md:block fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-700 ease-in-out cursor-pointer group/mouse ${isUpMode ? 'top-24' : 'bottom-8'
                }`}
            onClick={handleNavigation}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className={`
                flex flex-col items-center gap-2
                ${isUpMode ? 'flex-col-reverse' : 'flex-col'}
            `}>
                <div className={`w-[30px] h-[50px] rounded-full border-2 flex justify-center p-1 relative overflow-hidden backdrop-blur-sm transition-colors duration-300 ${isDark ? 'border-white/80 bg-white/5' : 'border-gray-900 bg-gray-900' // Dark button in light mode
                    }`}>
                    {/* Animated Dot */}
                    <motion.div
                        className={`w-1.5 h-2 rounded-full z-10 transition-colors duration-300 ${isDark ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' // White dot in both modes
                            }`}
                        animate={{
                            // Simulate wheel movement: 
                            // Down Mode: Move down (0 -> 8 -> 0)
                            // Up Mode: Move up (0 -> -8 -> 0)
                            y: isUpMode ? [0, -8, 0] : [0, 8, 0],
                            opacity: [1, 0.5, 1] // Add fading for realism
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />

                    {/* Arrows */}
                    <div className={`absolute ${isUpMode ? 'bottom-1.5' : 'top-1.5'} inset-x-0 flex justify-center opacity-0 group-hover/mouse:opacity-100 transition-opacity ${isDark ? 'text-white/80' : 'text-white/80' // White arrows in both modes
                        }`}>
                        {isUpMode ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    </div>

                    <div className={`absolute ${isUpMode ? 'top-1.5' : 'bottom-1.5'} inset-x-0 flex justify-center opacity-0 group-hover/mouse:opacity-100 transition-opacity ${isDark ? 'text-white/80' : 'text-white/80' // White arrows in both modes
                        }`}>
                        {isUpMode ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </div>
                </div>

                {/* Text Label (Optional) */}
                <span className={`text-xs font-medium opacity-0 group-hover/mouse:opacity-100 transition-opacity duration-300 ${isDark ? 'text-white/50' : 'text-gray-900' // Text remains dark on light bg
                    }`}>
                    {isUpMode ? 'Prev Section' : 'Next Section'}
                </span>
            </div>

            {/* Glow Effect */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover/mouse:opacity-100 transition-opacity pointer-events-none ${isUpMode ? 'bottom-full mb-2' : 'top-full mt-2'
                }`} />
        </motion.div>
    );
};
