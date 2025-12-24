import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Clock, Activity, Shield, Laptop, Globe } from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { useChatStore } from '../../store/useChatStore';

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

export const ActivityLogPage = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useChatStore();

    useEffect(() => {
        fetchLogs();

        // Real-time listener
        if (socket) {
            // Join Room
            socket.emit('join_super_admin_activity');

            socket.on('new_activity', (newLog: ActivityLog) => {
                setLogs(prev => [newLog, ...prev]);
            });

            return () => {
                socket.off('new_activity');
                socket.emit('leave_super_admin_activity');
            };
        }
    }, [socket]);

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

    return (
        <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Activity size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-foreground">Activity Log</h1>
                    <p className="text-muted">Real-time monitoring of user actions across the system.</p>
                </div>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/5 border-b border-glass-border">
                            <tr>
                                <th className="p-4 font-semibold text-muted">User</th>
                                <th className="p-4 font-semibold text-muted">Action & Page</th>
                                <th className="p-4 font-semibold text-muted">IP & Device</th>
                                <th className="p-4 font-semibold text-muted">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-muted">Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-muted">No activity found.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-secondary/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {log.user?.avatar ? (
                                                    <img src={log.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {log.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-foreground">{log.user?.name || 'Unknown User'}</div>
                                                    <div className="text-xs text-muted flex items-center gap-1">
                                                        <Shield size={10} className="text-blue-500" /> {log.user?.role}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                        {log.action}
                                                    </span>
                                                </div>
                                                <div className="text-foreground font-mono text-xs">{log.page}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1 text-xs text-muted">
                                                <div className="flex items-center gap-1">
                                                    <Globe size={12} /> {log.ip || 'N/A'}
                                                </div>
                                                {/* Parsing User Agent could go here if we stored it */}
                                                <div className="flex items-center gap-1 opacity-50">
                                                    <Laptop size={12} /> Unknown Device
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-medium">
                                                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                                                </span>
                                                <span className="text-xs text-muted">
                                                    {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};
