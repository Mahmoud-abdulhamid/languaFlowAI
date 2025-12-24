import React, { useEffect, useState } from 'react';
import {
    TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3, Activity,
    Zap, Brain, Users, FileText, Settings, Shield, Plus, Calendar,
    Cpu, Database, ArrowRight, Sparkles, DollarSign, PieChart, Layers, Type,
    Award, Medal, Crown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useDashboardStore } from '../store/useDashboardStore';
import { Skeleton } from '../components/ui/Skeleton';
import { UserAvatar } from '../components/UserAvatar';

// --- SVG Chart Components ---

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-50">
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                vectorEffect="non-scaling-stroke"
                className={color}
            />
            <path
                d={`M 0 100 L 0 ${100 - ((data[0] - min) / range) * 100} ${points.split(' ').map(p => `L ${p}`).join(' ')} L 100 100 Z`}
                fill="currentColor"
                className={`${color} opacity-20`}
                stroke="none"
            />
        </svg>
    );
};

const PieChartSVG = ({ data }: { data: { name: string; value: number }[] }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0) || 1;
    let accumulatedAngle = 0;
    const colors = ['text-blue-500', 'text-indigo-500', 'text-purple-500', 'text-pink-500', 'text-cyan-500'];
    const bgColors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];

    return (
        <div className="flex flex-col items-center gap-6 h-full justify-center">
            <div className="w-40 h-40 relative flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.map((slice, i) => {
                        const percentage = slice.value / total;
                        const angle = percentage * 360;
                        const largeArcFlag = percentage > 0.5 ? 1 : 0;
                        const startX = 50 + 50 * Math.cos((accumulatedAngle * Math.PI) / 180);
                        const startY = 50 + 50 * Math.sin((accumulatedAngle * Math.PI) / 180);
                        accumulatedAngle += angle;
                        const endX = 50 + 50 * Math.cos((accumulatedAngle * Math.PI) / 180);
                        const endY = 50 + 50 * Math.sin((accumulatedAngle * Math.PI) / 180);

                        return (
                            <path
                                key={i}
                                d={`M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                className={`fill-current ${colors[i % colors.length]}`}
                                stroke="transparent" // Gap handled by parent bg or remove
                            />
                        );
                    })}
                    {/* Inner Circle for Donut */}
                    <circle cx="50" cy="50" r="30" className="fill-surface" />
                </svg>
            </div>
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
                {data.map((slice, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className={`w-2.5 h-2.5 flex-shrink-0 rounded-full ${bgColors[i % bgColors.length]}`} />
                            <span className="text-foreground truncate max-w-[80px]" title={slice.name}>{slice.name}</span>
                        </div>
                        <span className="text-muted font-mono">{Math.round((slice.value / total) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EnhancedStatCard = ({ icon: Icon, label, value, trend, color, delay, data, prefix = '' }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 }}
    >
        <GlassCard hoverEffect={true} className="p-6 relative overflow-hidden group h-full">
            <div className={`absolute inset-0 bg-gradient-to-br ${color.replace('text-', 'from-').replace('500', '500/5')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-secondary/10 ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className={color} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-bold ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'} bg-secondary/20 px-2 py-1 rounded-full backdrop-blur-sm`}>
                            {trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                            <span>{trend}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-muted text-xs font-medium uppercase tracking-wider">{label}</h3>
                    <div className="text-3xl font-bold text-foreground font-outfit truncate">{prefix}{value}</div>
                </div>

                <div className="h-12 mt-4 -mx-2">
                    <Sparkline data={data || [5, 15, 10, 25, 20, 30, 45]} color={color} />
                </div>
            </div>
        </GlassCard>
    </motion.div>
);

const AINexusWidget = ({ metrics }: { metrics: any }) => (
    <GlassCard className="p-0 relative overflow-hidden h-full group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-transparent" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Brain size={20} />
                    </div>
                    <div>
                        <h3 className="text-foreground font-bold text-lg">AI Center</h3>
                        <p className="text-xs text-muted">Smart Translation Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${metrics?.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${metrics?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </span>
                    <span className={`text-xs font-medium ${metrics?.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}`}>{metrics?.status || 'OFFLINE'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-surface/50 rounded-xl p-3 border border-glass-border backdrop-blur-sm">
                    <div className="text-xs text-muted mb-1 flex items-center gap-1">
                        <Zap size={12} className="text-yellow-500" /> Processed
                    </div>
                    <div className="text-xl font-bold text-foreground">
                        {metrics?.processedWords ? (metrics.processedWords / 1000).toFixed(1) + 'k' : '0'}
                    </div>
                </div>
                <div className="bg-surface/50 rounded-xl p-3 border border-glass-border backdrop-blur-sm">
                    <div className="text-xs text-muted mb-1 flex items-center gap-1">
                        <Clock size={12} className="text-blue-500" /> Saved
                    </div>
                    <div className="text-xl font-bold text-foreground">{metrics?.hoursSaved || 0}h</div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-glass-border">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Current Model:</span>
                    <span className="text-indigo-400 font-medium flex items-center gap-1">
                        <Sparkles size={12} /> {metrics?.modelName || 'Unknown'}
                    </span>
                </div>
            </div>
        </div>
    </GlassCard>
);

const QuickAction = ({ icon: Icon, label, desc, onClick, color }: any) => (
    <button
        onClick={onClick}
        className="flex items-center gap-4 p-4 rounded-xl bg-secondary/5 border border-glass-border hover:bg-secondary/10 hover:border-blue-500/30 transition-all text-left group w-full h-full"
    >
        <div className={`p-3 rounded-xl bg-secondary/10 ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <div className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">{label}</div>
            <div className="text-xs text-muted">{desc}</div>
        </div>
        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-muted transition-opacity -translate-x-2 group-hover:translate-x-0" />
    </button>
);

const DateWidget = () => {
    const [date, setDate] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="flex flex-col items-end">
            <div className="text-3xl font-bold text-foreground font-outfit">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-muted flex items-center gap-2">
                <Calendar size={14} />
                {date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </div>
    );
};

import { ActivityLogWidget } from '../components/dashboard/ActivityLogWidget';

// ... (existing imports)

export const Dashboard = () => {
    const { user } = useAuthStore();
    const { stats, fetchStats, isLoading } = useDashboardStore();
    const [duration, setDuration] = useState('week');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats(duration);
    }, [fetchStats, duration]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (!stats && isLoading) return <div className="p-10 text-center text-muted">Loading specific dashboard data...</div>;
    if (!stats) return null;

    // Determine Role Specific Stats
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isClient = user?.role === 'CLIENT';

    // Mock sparkline data generators
    const sparkActivity = stats.activity?.length === 7 ? stats.activity : [0, 0, 0, 0, 0, 0, 0];
    const sparkRandom = () => Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold font-outfit text-foreground tracking-tight">
                            {getGreeting()}, {user?.name?.split(' ')[0]}
                        </h1>
                        <span className="px-3 py-1 bg-secondary/20 rounded-full text-xs font-semibold text-blue-500 border border-blue-500/20 tracking-wider">
                            {user?.role || 'User'}
                        </span>
                    </motion.div>
                    <p className="text-muted text-lg">
                        {isAdmin ? 'System overview and performance metrics.' : 'Here is what’s happening with your projects today.'}
                    </p>
                </div>
                <DateWidget />
            </div>

            {/* Layout Grid - Masonry Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* 0. SUPER ADMIN: Activity Log (Full Width on Mobile, Col-span-2 on Desktop) */}


                {/* 1. New: Active Workload Hub ... */}

                {/* 1. New: Active Workload Hub (Combines Pending, Review) */}
                <GlassCard className="p-6 relative overflow-hidden group h-full flex flex-col justify-between hover:shadow-lg transition-all border-orange-500/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex justify-between items-start mb-6 z-10 relative">
                        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform duration-300">
                            <Layers size={24} />
                        </div>
                        <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <Activity size={12} /> Live
                        </div>
                    </div>

                    <div className="flex items-end justify-between z-10 relative">
                        <div>
                            <h3 className="text-muted text-xs font-medium uppercase tracking-wider mb-1">Active Projects</h3>
                            <div className="text-4xl font-bold text-foreground font-outfit">
                                {stats.projects.pending + stats.projects.review}
                            </div>
                        </div>
                        {/* Mini Breakdown */}
                        <div className="text-right space-y-1.5">
                            <div className="text-xs text-muted flex items-center justify-end gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="font-medium text-foreground">{stats.projects.pending}</span> Pending
                            </div>
                            <div className="text-xs text-muted flex items-center justify-end gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75" />
                                <span className="font-medium text-foreground">{stats.projects.review}</span> Review
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden flex z-10 relative">
                        <div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${(stats.projects.pending / (Math.max(stats.projects.total, 1))) * 100}%` }} />
                        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${(stats.projects.review / (Math.max(stats.projects.total, 1))) * 100}%` }} />
                    </div>
                </GlassCard>

                {/* 2. Completed Projects */}
                <EnhancedStatCard
                    icon={CheckCircle}
                    label="Completed"
                    value={stats.projects.completed}
                    trend="+12%"
                    color="text-green-500"
                    data={sparkRandom()}
                    delay={1}
                />

                {/* 3. AI Center (Wide Widget - Spans 2 Columns) */}
                <div className="md:col-span-2 xl:col-span-2 h-full">
                    <AINexusWidget metrics={stats.aiMetrics} />
                </div>

                {/* 2. Middle Row: Activity Chart (Wide) & Language Pie (Square) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2 xl:col-span-3 h-[400px]"
                >
                    <GlassCard className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Weekly Activity</h2>
                                <p className="text-sm text-muted">Projects created (Last 7 Days)</p>
                            </div>
                        </div>

                        <div className="flex-1 w-full h-full min-h-[200px]">
                            {(() => {
                                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                const today = new Date();
                                const labels: string[] = [];
                                for (let i = 6; i >= 0; i--) {
                                    const d = new Date(today);
                                    d.setDate(today.getDate() - i);
                                    labels.push(days[d.getDay()]);
                                }

                                const data = sparkActivity;
                                const total = data.reduce((a, b) => a + b, 0);
                                const maxVal = Math.max(...data, 10);
                                const todayVal = data[6];
                                const yesterdayVal = data[5];
                                const trend = yesterdayVal > 0 ? ((todayVal - yesterdayVal) / yesterdayVal) * 100 : 0;
                                const isPositive = trend >= 0;

                                return (
                                    <div className="flex flex-col md:flex-row h-full gap-8">
                                        {/* Left: Insights & Summary */}
                                        <div className="md:w-1/3 flex flex-col justify-center space-y-6 pl-2">
                                            <div>
                                                <div className="text-5xl font-bold font-outfit text-foreground tracking-tight flex items-baseline gap-2">
                                                    {total}
                                                    <span className="text-sm font-normal text-muted-foreground">projects</span>
                                                </div>
                                                <div className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Total this week</div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    {isPositive ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                                                    <span>{Math.abs(trend).toFixed(0)}% {isPositive ? 'Up' : 'Down'}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {isPositive
                                                        ? "You're on a roll! More activity than yesterday."
                                                        : "Slight dip in activity. Perfect time to start a new project."}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => navigate('/projects/new')}
                                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                                            >
                                                Start New Project <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>

                                        {/* Right: Modern Bar Chart */}
                                        <div className="md:w-2/3 relative h-full min-h-[220px] bg-secondary/5 rounded-2xl border border-glass-border p-4">
                                            <div className="absolute inset-x-4 inset-y-4 flex items-end justify-between gap-2 pb-6">
                                                {data.map((val, i) => {
                                                    const height = Math.max((val / maxVal) * 100, 4); // Min height for 0
                                                    const isToday = i === 6;

                                                    return (
                                                        <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group relative">

                                                            {/* Bar Container */}
                                                            <div className="relative w-full max-w-[40px] h-full flex items-end justify-center rounded-xl bg-secondary/10 overflow-hidden group-hover:bg-secondary/20 transition-colors">

                                                                {/* The Bar */}
                                                                <div
                                                                    style={{ height: `${height}%` }}
                                                                    className={`w-full absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-700 ease-out ${isToday
                                                                        ? 'bg-gradient-to-t from-blue-600 to-cyan-400 opacity-100'
                                                                        : 'bg-gray-400/40 dark:bg-gray-600/40 group-hover:bg-blue-500/60'
                                                                        }`}
                                                                >
                                                                    {isToday && <div className="absolute inset-0 bg-white/20 shimmer" />}
                                                                </div>

                                                                {/* Floating Value (Always visible for Today, Hover for others) */}
                                                                <div className={`absolute -top-8 transition-all duration-300 font-bold text-xs ${isToday ? 'opacity-100 -translate-y-0 text-blue-500' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 text-foreground'}`}>
                                                                    {val}
                                                                </div>
                                                            </div>

                                                            {/* Label */}
                                                            <span className={`absolute -bottom-6 text-[11px] font-medium transition-colors ${isToday ? 'text-blue-500 font-bold' : 'text-muted-foreground'}`}>
                                                                {labels[i]}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-2 xl:col-span-1 h-[400px]"
                >
                    <GlassCard className="p-6 h-full flex flex-col">
                        <h2 className="text-xl font-bold text-foreground mb-6">Languages</h2>
                        <div className="flex-1 flex items-center justify-center">
                            {stats.languageDistribution && stats.languageDistribution.length > 0 ? (
                                <PieChartSVG data={stats.languageDistribution} />
                            ) : (
                                <div className="text-center text-muted">
                                    <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                                    No data yet
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* 3. Bottom Row: Quick Actions, Translator Stats & Recent Projects */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="md:col-span-2 xl:col-span-2"
                >
                    <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. New Project - CLIENT & ADMIN */}
                        {(isClient || isAdmin) && (
                            <QuickAction
                                icon={Plus}
                                label="New Project"
                                desc="Start a translation"
                                color="text-blue-500"
                                onClick={() => navigate('/projects/new')}
                            />
                        )}

                        {/* Client Specifics */}
                        {isClient && (
                            <QuickAction
                                icon={Layers}
                                label="My Projects"
                                desc="Track progress"
                                color="text-indigo-500"
                                onClick={() => navigate('/projects')}
                            />
                        )}

                        {/* 2. Admin Specifics */}
                        {isAdmin && (
                            <>
                                <QuickAction
                                    icon={Users}
                                    label="Manage Users"
                                    desc="Add or edit users"
                                    color="text-purple-500"
                                    onClick={() => navigate('/admin/users')}
                                />
                                <QuickAction
                                    icon={Database}
                                    label="Glossary"
                                    desc="Manage terms"
                                    color="text-green-500"
                                    onClick={() => navigate('/glossary')}
                                />
                                <QuickAction
                                    icon={Settings}
                                    label="Settings"
                                    desc="System config"
                                    color="text-gray-500"
                                    onClick={() => navigate('/settings')}
                                />
                            </>
                        )}

                        {/* 3. Translator Specifics */}
                        {user?.role === 'TRANSLATOR' && (
                            <>
                                <QuickAction
                                    icon={FileText}
                                    label="My Jobs"
                                    desc="View assigned tasks"
                                    color="text-indigo-500"
                                    onClick={() => navigate('/projects')}
                                />
                                <QuickAction
                                    icon={Database}
                                    label="Glossary"
                                    desc="Term references"
                                    color="text-green-500"
                                    onClick={() => navigate('/glossary')}
                                />
                            </>
                        )}
                    </div>

                    {/* Translator Stats - Admin & Translators */}
                    {(isAdmin || user?.role === 'TRANSLATOR') && stats.translatorStats && stats.translatorStats.length > 0 && (
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-foreground">Top Translators</h2>
                                <div className="flex gap-1 bg-secondary/10 p-1 rounded-lg">
                                    {['week', 'month', 'year'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => {
                                                setDuration(range);
                                                fetchStats(range);
                                            }}
                                            className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${duration === range
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-muted hover:text-foreground hover:bg-secondary/20'
                                                }`}
                                        >
                                            This {range}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {stats.translatorStats.map((translator: any, index: number) => {
                                    const rank = index + 1;
                                    const isTop = index === 0;

                                    // Top Performer Logic (Rank 1)
                                    let rankIcon = null;
                                    let rankColor = "text-muted bg-secondary/20";
                                    let avatarBorder = "border-glass-border";
                                    let cardBg = "";
                                    let glow = "";

                                    if (index === 0) {
                                        rankIcon = <Crown size={20} className="text-yellow-100" fill="currentColor" />;
                                        rankColor = "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30";
                                        avatarBorder = "border-yellow-400 border-4 shadow-[0_0_20px_rgba(234,179,8,0.4)]";
                                        cardBg = "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30";
                                        glow = "shadow-[0_0_30px_rgba(234,179,8,0.15)]";
                                    } else if (index === 1) {
                                        rankIcon = <Medal size={14} className="text-slate-100" fill="currentColor" />;
                                        rankColor = "bg-gradient-to-r from-slate-400 to-slate-600 text-white shadow-md";
                                        avatarBorder = "border-slate-400 border-2";
                                    } else if (index === 2) {
                                        rankIcon = <Medal size={14} className="text-orange-100" fill="currentColor" />;
                                        rankColor = "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md";
                                        avatarBorder = "border-orange-400 border-2";
                                    }

                                    return (
                                        <div key={translator.id} className={`${isTop ? 'col-span-2' : 'col-span-1'}`}>
                                            <GlassCard
                                                className={`p-4 flex items-center gap-4 group relative overflow-visible h-full ${cardBg} ${glow}`}
                                                hoverEffect={true}
                                            >
                                                {/* Rank Number on Card Corner */}
                                                <div className={`absolute top-0 right-[-15px]  px-3 py-1 rounded-bl-xl text-xs font-bold z-10 ${rankColor}`}>
                                                    #{rank}
                                                </div>

                                                <div className="relative w-fit">
                                                    <div className={`transition-all duration-300 ${isTop ? 'scale-110' : ''}`}>
                                                        <UserAvatar
                                                            user={{ name: translator.name, avatar: translator.avatar }}
                                                            size={isTop ? 'xl' : 'lg'}
                                                            className={`transition-all ${avatarBorder} ${isTop ? 'w-20 h-20' : 'w-14 h-14'}`}
                                                        />
                                                    </div>

                                                    {/* Icon on Avatar */}
                                                    {rankIcon && (
                                                        <div className={`absolute -top-1 -right-1 rounded-full flex items-center justify-center border-2 border-surface z-20 ${index === 0 ? 'bg-yellow-500 w-8 h-8' : index === 1 ? 'bg-slate-500 w-6 h-6' : 'bg-orange-500 w-6 h-6'}`}>
                                                            {rankIcon}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 pt-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className={`font-bold text-foreground truncate flex items-center gap-2 ${isTop ? 'text-lg' : ''}`}>
                                                                {translator.name}
                                                                {isTop && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">Top Performer</span>}
                                                            </h3>
                                                            <div className="text-xs text-muted truncate">{translator.email}</div>
                                                        </div>
                                                    </div>

                                                    <div className={`flex items-center gap-4 mt-3 ${isTop ? 'mt-4' : ''}`}>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted">
                                                            <CheckCircle size={12} className="text-green-500" />
                                                            <span className="font-medium text-foreground">{translator.completedProjects}</span> Jobs
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted">
                                                            <Type size={12} className="text-blue-500" />
                                                            <span className="font-medium text-foreground">{(translator.totalWords / 1000).toFixed(1)}k</span> Words
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted ml-auto">
                                                            <Sparkles size={12} className="text-yellow-500" fill="currentColor" />
                                                            <span className="font-medium text-foreground">{translator.rating}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                    }
                </motion.div >

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="md:col-span-2 xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
                >
                    {/* Left: Recent Projects */}
                    <GlassCard className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Recent Projects</h2>
                            <button onClick={() => navigate('/projects')} className="text-xs text-blue-500 hover:underline">View All</button>
                        </div>
                        <div className="space-y-3">
                            {stats.recentProjects.length === 0 ? (
                                <div className="text-muted text-center py-8">No recent projects</div>
                            ) : (
                                stats.recentProjects.slice(0, 8).map((project: any) => (
                                    <div
                                        key={project._id}
                                        onClick={() => navigate(`/projects/${project._id}`)}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/10 border border-transparent hover:border-glass-border transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                                            {project.sourceLang.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-foreground group-hover:text-blue-500 transition-colors truncate">
                                                {project.title}
                                            </div>
                                            <div className="text-xs text-muted flex items-center gap-2">
                                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-muted/50" />
                                                <span>{project.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>

                    {/* Right: Recent Clients (Admin Only) or More Stats */}
                    {isAdmin && (
                        <GlassCard className="p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-foreground">Recent Clients</h2>
                                <button onClick={() => navigate('/users')} className="text-xs text-blue-500 hover:underline">View All</button>
                            </div>
                            <div className="space-y-3">
                                {stats.recentClients && stats.recentClients.length > 0 ? (
                                    stats.recentClients.map((client: any) => (
                                        <div
                                            key={client._id}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/10 border border-transparent hover:border-glass-border transition-all group"
                                        >
                                            <UserAvatar user={client} size="sm" className="w-10 h-10" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-foreground group-hover:text-blue-500 transition-colors truncate">
                                                    {client.name}
                                                </div>
                                                <div className="text-xs text-muted">
                                                    Joined {new Date(client.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Link
                                                to={`/u/${client._id}`}
                                                target='_blank'
                                                className="p-2 rounded-lg bg-secondary/10 hover:bg-blue-500 hover:text-white transition-colors"
                                            >
                                                <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-muted text-center py-8">No recent clients</div>
                                )}
                            </div>
                        </GlassCard>
                    )}
                </motion.div>

            </div >
        </div >
    );
};
