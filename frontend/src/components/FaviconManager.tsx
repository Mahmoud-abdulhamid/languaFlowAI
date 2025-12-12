import { useEffect } from 'react';
import { useSystemStore } from '../store/useSystemStore';

export const FaviconManager = () => {
    const { settings } = useSystemStore();

    useEffect(() => {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            document.head.appendChild(newLink);
        }

        if (settings.system_favicon) {
            // If it's a relative path from our upload logic
            const faviconUrl = settings.system_favicon.startsWith('http')
                ? settings.system_favicon
                : `${(import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace('/api/v1', '')}${settings.system_favicon}`;

            (document.querySelector("link[rel~='icon']") as HTMLLinkElement).href = faviconUrl;
        } else {
            // Default favicon if none set (optional, or just leave as is)
            // (document.querySelector("link[rel~='icon']") as HTMLLinkElement).href = '/vite.svg';
        }
    }, [settings.system_favicon]);

    return null;
};
