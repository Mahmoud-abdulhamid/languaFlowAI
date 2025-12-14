import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { motion } from 'framer-motion';
import { Users, Globe, Clock, Monitor, Smartphone, MapPin, Activity } from 'lucide-react';

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

export const LiveDashboard = () => {
    const { socket } = useChatStore();
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        if (!socket) return;

        // Subscribe
        socket.emit('admin_subscribe_live');

        // Listen for updates
        const handleUpdate = (data: Session[]) => {
            setSessions(data);
        };

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

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Activity className="text-green-500 animate-pulse" size={28} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Live Traffic</h1>
                        <p className="text-sm text-gray-500">Real-time user monitoring</p>
                    </div>
                </div>
                <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Updating Live...
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={<Users size={20} />} label="Active Users" value={stats.total} color="bg-blue-500/10 text-blue-400" />
                <StatCard icon={<MapPin size={20} />} label="Authenticated" value={stats.members} color="bg-purple-500/10 text-purple-400" />
                <StatCard icon={<Globe size={20} />} label="Guests" value={stats.guests} color="bg-orange-500/10 text-orange-400" />
                <StatCard icon={<Smartphone size={20} />} label="Mobile Devices" value={stats.mobile} color="bg-pink-500/10 text-pink-400" />
            </div>

            {/* Sessions Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-gray-400">
                                <th className="p-4">User</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Page</th>
                                <th className="p-4">Device</th>
                                <th className="p-4">Time</th>
                                <th className="p-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {sessions.map((session) => (
                                <motion.tr 
                                    key={session.socketId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${session.userId ? 'bg-purple-400' : 'bg-gray-500'} animate-pulse`} />
                                            <div>
                                                <div className="font-medium text-white">
                                                    {session.userName || (session.userId ? `User ${session.userId.slice(-4)}` : 'Guest Visitor')}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">{session.socketId.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg" title={session.country}>{getFlagEmoji(session.country)}</span>
                                            <span className="text-gray-300">{session.country}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="max-w-[200px]">
                                            <div className="font-medium text-blue-400 truncate">{session.pageTitle || 'Loading...'}</div>
                                            <div className="text-xs text-gray-500 truncate" title={session.pageUrl}>{session.pageUrl}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            {session.os === 'iOS' || session.os === 'Android' ? <Smartphone size={16} /> : <Monitor size={16} />}
                                            <span>{session.os} / {session.browser}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400 font-mono text-xs">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(session.connectedAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-gray-500">
                                        <div className="bg-black/20 px-2 py-1 rounded inline-block">
                                            {session.ip}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Waiting for active connections...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: any) => (
    <div className={`p-4 rounded-xl border border-white/5 ${color} bg-opacity-10 backdrop-blur-sm flex items-center justify-between`}>
        <div>
            <p className="text-xs text-current opacity-70 mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-white/5`}>
            {icon}
        </div>
    </div>
);

// Fallback flag mapper since we don't have real GeoIP for now
const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode === 'Unknown') return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};
