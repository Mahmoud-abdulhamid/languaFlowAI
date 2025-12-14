import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';

export const usePageTracking = () => {
    const location = useLocation();
    const { socket, connectSocket } = useChatStore();

    // Auto-connect socket if not connected
    useEffect(() => {
        if (!socket) {
            connectSocket();
        }
    }, [socket, connectSocket]);

    // Track page views
    useEffect(() => {
        if (socket && socket.connected) {
            const pageData = {
                path: location.pathname,
                title: document.title
            };
            socket.emit('page_view', pageData);
        }
    }, [location, socket]);
};
