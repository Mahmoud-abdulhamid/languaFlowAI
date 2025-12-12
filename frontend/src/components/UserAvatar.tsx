import React from 'react';
import clsx from 'clsx';
import { User } from 'lucide-react';

interface UserAvatarProps {
    user?: {
        name?: string;
        avatar?: string;
    } | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    noBorder?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className, noBorder = false }) => {
    // Generate initials: First letter of first name + First letter of second name (if exists)
    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    // Size mapping
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl'
    };

    // Consistent background color generation based on name length
    const getBgColor = (name: string) => {
        if (!name) return 'bg-gray-500';
        const colors = [
            'bg-blue-600',
            'bg-purple-600',
            'bg-green-600',
            'bg-red-600',
            'bg-yellow-600',
            'bg-pink-600',
            'bg-indigo-600',
            'bg-teal-600'
        ];
        // Simple hash
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const userName = user?.name || '?';

    if (!user) {
        return (
            <div className={clsx(
                "rounded-full bg-secondary/10 flex items-center justify-center text-muted overflow-hidden",
                !noBorder && "border border-white/10",
                sizeClasses[size],
                className
            )}>
                <User className="w-[60%] h-[60%]" />
            </div>
        );
    }

    if (user.avatar) {
        return (
            <img
                src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000'}${user.avatar}`}
                alt={userName}
                className={clsx(
                    "rounded-full object-cover",
                    !noBorder && "border border-white/10",
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div className={clsx(
            "rounded-full flex items-center justify-center font-bold text-white select-none",
            !noBorder && "border border-white/10",
            getBgColor(userName),
            sizeClasses[size],
            className
        )}>
            {getInitials(userName)}
        </div>
    );
};
