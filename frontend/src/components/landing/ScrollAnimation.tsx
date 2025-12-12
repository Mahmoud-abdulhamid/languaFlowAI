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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isMobile) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
