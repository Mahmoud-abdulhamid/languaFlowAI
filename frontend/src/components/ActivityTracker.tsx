import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';

export const ActivityTracker = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const lastPath = useRef(location.pathname);

    useEffect(() => {
        // Only log if path changed and user is logged in
        if (user && location.pathname !== lastPath.current) {
            
            // Debounce or filter? 
            // For now, simple logging of "Page Visit"
            const logVisit = async () => {
                try {
                    await api.post('/activity', {
                        page: location.pathname
                    });
                } catch (error) {
                    // Silent fail
                }
            };
            
            logVisit();
            lastPath.current = location.pathname;
        } else if (user && !lastPath.current) {
             // Initial load
             lastPath.current = location.pathname;
             api.post('/activity', { page: location.pathname }).catch(() => {});
        }
    }, [location, user]);

    return null; // Renderless component
};
