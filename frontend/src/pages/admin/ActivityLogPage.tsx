import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Clock, Activity, Shield, Laptop, Globe, Users, MapPin, Smartphone, Monitor } from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { useChatStore } from '../../store/useChatStore';
import { motion } from 'framer-motion';

// --- Interfaces ---
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

interface Session {
    socketId: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    role?: string;
    ip: string;
    country: string;
    pageTitle?: string;
    pageUrl?: string;
    browser?: string;
    os?: string;
    connectedAt: string;
    lastActive: string;
}

// --- Live Monitor Component (From old LiveDashboard) ---
const LiveMonitorTab = ({ socket }: { socket: any }) => {
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        if (!socket) return;
        socket.emit('admin_subscribe_live');
        const handleUpdate = (data: Session[]) => setSessions(data);
        socket.on('live_users_update', handleUpdate);
        return () => {
            socket.emit('admin_unsubscribe_live');
            socket.off('live_users_update', handleUpdate);
        };
    }, [socket]);

    const stats = {
        total: sessions.length,
        members: sessions.filter(s => s.userId).length,
        guests: sessions.filter(s => !s.userId).length,
        mobile: sessions.filter(s => s.os === 'iOS' || s.os === 'Android').length
    };

    const getFlagEmoji = (countryCode: string) => {
        if (!countryCode || countryCode === 'Unknown') return '🌍';
        if (countryCode === 'LOCAL' || countryCode === 'Local') return '💻';
        try {
            return String.fromCodePoint(...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0)));
        } catch (e) { return '🌍'; }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex justify-between items-center">
                   <div><p className="text-sm text-blue-500 mb-1">Active Users</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div>
                   <Users className="text-blue-500" />
               </div>
               <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex justify-between items-center">
                   <div><p className="text-sm text-purple-500 mb-1">Authenticated</p><p className="text-2xl font-bold text-foreground">{stats.members}</p></div>
                   <MapPin className="text-purple-500" />
               </div>
               <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 flex justify-between items-center">
                   <div><p className="text-sm text-orange-500 mb-1">Guests</p><p className="text-2xl font-bold text-foreground">{stats.guests}</p></div>
                   <Globe className="text-orange-500" />
               </div>
               <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5 flex justify-between items-center">
                   <div><p className="text-sm text-pink-500 mb-1">Mobile</p><p className="text-2xl font-bold text-foreground">{stats.mobile}</p></div>
                   <Smartphone className="text-pink-500" />
               </div>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/5 border-b border-glass-border">
                            <tr>
                                <th className="p-4 font-semibold text-muted">User</th>
                                <th className="p-4 font-semibold text-muted">Location</th>
                                <th className="p-4 font-semibold text-muted">Page</th>
                                <th className="p-4 font-semibold text-muted">Device</th>
                                <th className="p-4 font-semibold text-muted">Time</th>
                                <th className="p-4 font-semibold text-muted">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {sessions.map((s) => (
                                <tr key={s.socketId} className="hover:bg-secondary/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${s.userId ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
                                            <div>
                                                <div className="font-medium text-foreground">{s.userName || (s.userId ? 'User' : 'Guest')}</div>
                                                <div className="text-xs text-muted font-mono">{s.socketId.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span>{getFlagEmoji(s.country)}</span>
                                            <span className="text-muted">{s.country}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="max-w-[200px] truncate">
                                            <div className="text-blue-500 font-medium truncate">{s.pageTitle || 'Loading...'}</div>
                                            <div className="text-xs text-muted truncate">{s.pageUrl}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-muted">
                                             {s.os === 'iOS' || s.os === 'Android' ? <Smartphone size={14} /> : <Monitor size={14} />}
                                             <span>{s.os} / {s.browser}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted font-mono text-xs">
                                        {format(new Date(s.connectedAt), 'HH:mm:ss')}
                                    </td>
                                    <td className="p-4 text-muted font-mono text-xs">
                                        {s.ip}
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted">Waiting for active connections...</td></tr>}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

// --- History Log Component (The previous implementation) ---
const ActivityHistoryTab = ({ socket }: { socket: any }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
        if (socket) {
            socket.emit('join_super_admin_activity');
            const handler = (newLog: ActivityLog) => setLogs(prev => [newLog, ...prev]);
            socket.on('new_activity', handler);
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
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
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
    );
};

// --- Main Page Component ---
export const ActivityLogPage = () => {
    const { socket } = useChatStore();
    const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');

    return (
        <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-foreground">System Monitoring</h1>
                        <p className="text-muted">Real-time traffic and activity logs.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-secondary/10 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'live' ? 'bg-background text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
                    >
                        Live Traffic
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-background text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
                    >
                        Activity History
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'live' ? <LiveMonitorTab socket={socket} /> : <ActivityHistoryTab socket={socket} />}
            </motion.div>
        </div>
    );
};
