import { animate } from 'framer-motion';

export const springScrollTo = (elementId: string | number) => {
    let targetY = 0;

    if (typeof elementId === 'number') {
        targetY = elementId;
    } else {
        const element = document.getElementById(elementId);
        if (!element) return;
        // Calculate target positions - offset by header height if needed (64px)
        const rect = element.getBoundingClientRect();
        targetY = window.scrollY + rect.top - 64; // Adjust for header
    }

    const startY = window.scrollY;

    animate(startY, targetY, {
        type: "spring",
        stiffness: 400,   // Strong snap
        damping: 15,      // Low damping for swing
        mass: 2,          // Heavy feel
        onUpdate: (value) => {
            window.scrollTo({ top: value, behavior: 'auto' });
        }
    });
};
