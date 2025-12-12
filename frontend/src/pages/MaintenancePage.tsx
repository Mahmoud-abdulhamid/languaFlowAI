import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { AlertTriangle, Settings } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const MaintenancePage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-main flex items-center justify-center p-4">
            <GlassCard className="p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-yellow-500/20 text-yellow-400">
                        <AlertTriangle size={48} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                    Under Maintenance
                </h1>

                <p className="text-muted mb-8 leading-relaxed">
                    We are currently performing scheduled maintenance to improve our systems.
                    Please check back soon.
                </p>

                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') ? (
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Settings size={20} />
                        Access Admin Dashboard
                    </button>
                ) : (
                    <p className="text-sm text-gray-500">
                        If you are an administrator, please log in via the dedicated portal.
                    </p>
                )}
            </GlassCard>
        </div>
    );
};
