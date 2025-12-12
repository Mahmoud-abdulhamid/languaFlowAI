import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

interface PermissionGuardProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children, fallback = null }) => {
    const { user } = useAuthStore();

    if (!user) return <>{fallback}</>;

    // Super Admin Bypass
    if (user.role === 'SUPER_ADMIN') {
        return <>{children}</>;
    }

    // Check Permissions
    // Note: permissions might be undefined if user hasn't re-logged in after update, handle gracefully
    const hasPermission = user.permissions?.includes('*') || user.permissions?.includes(permission);

    if (hasPermission) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
