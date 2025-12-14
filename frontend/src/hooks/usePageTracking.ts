import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';

export const usePageTracking = () => {
    const location = useLocation();
    const { socket } = useChatStore();

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
