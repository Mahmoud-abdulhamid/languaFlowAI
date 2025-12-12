import { useEffect, useRef } from 'react';
import { springScrollTo } from '../utils/springScroll';

export const useScrollStepper = (sectionIds: string[]) => {
    const isScrolling = useRef(false);
    const lastScrollTime = useRef(0);
    const touchStartY = useRef(0);

    useEffect(() => {

        const handleWheel = (e: WheelEvent) => {
            if (window.innerWidth < 768) return; // runtime check
            e.preventDefault();

            const now = Date.now();
            // Cooldown to prevent double-skipping
            if (isScrolling.current || now - lastScrollTime.current < 1000) return;

            // Find the current section index based on viewport position
            // We find the section closest to the top of the viewport (considering header offset)
            let currentIndex = 0;
            let minDistance = Infinity;
            const headerOffset = 80; // Slightly more than 64 to catch "just arrived" sections

            sectionIds.forEach((id, index) => {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // Distance from the "snap point" (top of viewport + offset)
                    const distance = Math.abs(rect.top - headerOffset);
                    if (distance < minDistance) {
                        minDistance = distance;
                        currentIndex = index;
                    }
                }
            });

            // Determine target index
            let targetIndex = currentIndex;

            if (e.deltaY > 0) {
                // Scrolling DOWN
                if (currentIndex < sectionIds.length - 1) {
                    targetIndex = currentIndex + 1;
                }
            } else if (e.deltaY < 0) {
                // Scrolling UP
                if (currentIndex > 0) {
                    targetIndex = currentIndex - 1;
                }
            }

            if (targetIndex !== currentIndex) {
                scrollToSection(targetIndex);
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            // Disable touch gestures for stepper on mobile
            if (window.innerWidth < 768) return;
            try {
                if (!e.touches || !e.touches.length) return;
                touchStartY.current = e.touches[0].clientY;
            } catch (err) {
                console.warn('Touch start error:', err);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (window.innerWidth < 768) return;
            try {
                if (!e.changedTouches || !e.changedTouches.length) return;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaY = touchStartY.current - touchEndY;

                // Threshold for swipe detection (e.g., 50px)
                if (Math.abs(deltaY) < 50) return;

                const now = Date.now();
                if (isScrolling.current || now - lastScrollTime.current < 1000) return;

                // --- REUSED LOGIC START ---
                // ( Ideally calculateCurrentIndex logic should be extracted to a function to avoid duplication,
                //   but for minimal diff we can duplicate or extract inside useEffect )

                let currentIndex = 0;
                let minDistance = Infinity;
                const headerOffset = 80;

                sectionIds.forEach((id, index) => {
                    const el = document.getElementById(id);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        const distance = Math.abs(rect.top - headerOffset);
                        if (distance < minDistance) {
                            minDistance = distance;
                            currentIndex = index;
                        }
                    }
                });

                let targetIndex = currentIndex;
                if (deltaY > 0) {
                    // Swipe UP -> Scroll DOWN
                    if (currentIndex < sectionIds.length - 1) {
                        targetIndex = currentIndex + 1;
                    }
                } else {
                    // Swipe DOWN -> Scroll UP
                    if (currentIndex > 0) {
                        targetIndex = currentIndex - 1;
                    }
                }

                if (targetIndex !== currentIndex) {
                    scrollToSection(targetIndex);
                }
            } catch (err) {
                console.warn('Touch end error:', err);
            }
        };

        const scrollToSection = (index: number) => {
            isScrolling.current = true;
            lastScrollTime.current = Date.now();
            const id = sectionIds[index];
            springScrollTo(id);

            // Unlock after animation
            setTimeout(() => {
                isScrolling.current = false;
            }, 1000);
        };

        // Add passive: false to allow preventDefault
        window.addEventListener('wheel', handleWheel, { passive: false });
        // Touch events
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [sectionIds]);
};
