import React, { useEffect, useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Clock, Activity } from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';

interface ActivityLog {
    _id: string;
    user: {
        name: string;
        email: string;
        avatar?: string;
        role: string;
    };
    page: string;
    action: string;
    ip?: string;
    timestamp: string;
}

export const ActivityLogWidget = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/activity');
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Poll every 30 seconds for live-ish updates
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && logs.length === 0) {
        return (
            <GlassCard className="p-6 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-0 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-glass-border flex justify-between items-center bg-secondary/5">
                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                    <Activity size={20} className="text-blue-500" />
                    Live Activity Log
                </h3>
                <span className="text-xs text-muted bg-secondary/10 px-2 py-1 rounded">
                   Super Admin View
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 max-h-[400px]">
                {logs.length === 0 ? (
                    <div className="text-center text-muted py-8">No recent activity</div>
                ) : (
                    logs.map((log) => (
                        <div key={log._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/5 transition-colors border border-transparent hover:border-glass-border">
                            {/* Avatar */}
                            <div className="shrink-0">
                                {log.user?.avatar ? (
                                    <img src={log.user.avatar} alt={log.user.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold">
                                        {log.user?.name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-foreground truncate block">
                                        {log.user?.name || 'Unknown User'}
                                    </span>
                                    <span className="text-[10px] text-muted whitespace-nowrap flex items-center gap-1">
                                        <Clock size={10} />
                                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                        {log.action}
                                    </span>
                                    <span className="text-xs text-muted truncate" title={log.page}>
                                        {log.page}
                                    </span>
                                    {log.ip && (
                                         <span className="text-[10px] text-muted/50 hidden sm:inline-block">
                                            ({log.ip})
                                         </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
};
