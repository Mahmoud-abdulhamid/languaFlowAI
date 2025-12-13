import React from 'react';
import { motion } from 'framer-motion';

interface ScrollAnimationProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const ScrollAnimation = ({ children, className = "", delay = 0 }: ScrollAnimationProps) => {
    // Note: A true responsiveness check usually needs a hook (useWindowSize).
    // For simplicity/perf, we can just use CSS media queries or check initially.
    // But since this is a React component, changing classes is safer.
    // However, to strictly remove the motion effect we ideally conditional render.

    // Better approach: Use motion.div always, but with conditional variants.
    // OR simply use the 'md:' prefix in parent classes if we wanted to hide it.
    // But here we want to remove the EFFECT.

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
