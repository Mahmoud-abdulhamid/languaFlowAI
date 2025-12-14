import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocketStore } from '../store/useSocketStore';

export const usePageTracking = () => {
    const location = useLocation();
    const { socket } = useSocketStore();

    useEffect(() => {
        if (socket) {
            const pageData = {
                path: location.pathname,
                title: document.title
            };
            socket.emit('page_view', pageData);
        }
    }, [location, socket]);
};
