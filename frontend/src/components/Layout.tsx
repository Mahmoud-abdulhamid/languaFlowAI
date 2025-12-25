import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, Code2, UserPlus, Languages, Users, Shield, User, Menu, X, Sun, Moon, BookOpen, PanelLeftOpen, PanelLeftClose, MessageSquare, ChevronDown, Activity } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import clsx from 'clsx';
import { useSystemStore } from '../store/useSystemStore';
import { useThemeStore } from '../store/useThemeStore';
import { FaviconManager } from './FaviconManager';
import { NotificationBell } from './NotificationBell';
import { useChatStore } from '../store/useChatStore';
import { ChatWidget } from './ChatWidget';
import { CopyrightFooter } from './CopyrightFooter';
import { UserAvatar } from './UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { formatNumber } from '../utils/formatNumber';
import { GlassNotification } from './GlassNotification';
import api from '../api/axios';

// --- Sidebar Item Component with Custom Tooltip ---
const SidebarItem = ({ item, isCollapsed, isActive }: { item: any, isCollapsed: boolean, isActive: boolean }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [coords, setCoords] = React.useState({ top: 0, left: 0 });
    const itemRef = React.useRef<HTMLDivElement>(null);
    const Icon = item.icon;

    const handleMouseEnter = () => {
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + rect.height / 2,
                left: rect.right + 10
            });
            setIsHovered(true);
        }
    };

    return (
        <div
            ref={itemRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                to={item.path}
                className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap relative z-10',
                    isActive
                        ? 'bg-blue-600/20 text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                        : 'text-muted hover:bg-secondary/10 hover:text-foreground',
                    isCollapsed && 'lg:justify-center lg:px-2'
                )}
            >
                <Icon size={20} className="min-w-[20px]" />
                <span className={clsx("font-medium transition-all duration-300 flex-1", isCollapsed ? "lg:w-0 lg:opacity-0 lg:overflow-hidden" : "w-auto opacity-100")}>
                    {item.label}
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                    <span className={clsx(
                        "ml-auto bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full transition-all duration-300",
                        isCollapsed ? "lg:hidden" : "opacity-100"
                    )}>
                        {formatNumber(item.badge)}
                    </span>
                )}
            </Link>

            {/* Smart Tooltip - Portaled to Body to escape clipping */}
            {isCollapsed && isHovered && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -5, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left,
                            zIndex: 9999,
                            transform: 'translateY(-50%)'
                        }}
                        className="pointer-events-none"
                    >
                        <div className="bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl backdrop-blur-md flex items-center gap-2 border border-white/10 dark:border-black/5 relative -translate-y-1/2">
                            {item.label}
                            {/* Little arrow pointing left */}
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900/90 dark:border-r-white/90" />
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};
export const Layout = () => {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
    const { theme, toggleTheme } = useThemeStore();
    const { settings } = useSystemStore();
    const [stats, setStats] = React.useState<any>(null);
    const { totalUnreadCount, toggleChat, connectSocket, fetchConversations, notification, hideNotification, selectConversation } = useChatStore();

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch stats');
            }
        };

        if (user) {
            fetchStats();
            connectSocket(); // Initialize chat socket
            fetchConversations(); // Fetch unread counts
            
            // Listen for Forced Logout
            const socket = useChatStore.getState().socket;
            if (socket) {
                socket.on('force_logout', () => {
                    handleLogout();
                    // Optional: Show toast
                    alert('Your session has been revoked.');
                });
            }
        }
        
        return () => {
             const socket = useChatStore.getState().socket;
             if (socket) {
                 socket.off('force_logout');
             }
        };
    }, [user, connectSocket]); // Added connectSocket dependency or handle properly

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: FileText, label: 'Projects', path: '/projects', badge: stats?.projects?.total },
        { icon: Users, label: 'Users', path: '/users', badge: stats?.totalUsers },
        ...(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? [
            {
                icon: Languages,
                label: 'Languages',
                path: '/languages',
                badge: stats?.totalLanguages
            }
        ] : []),
        ...(user?.role === 'SUPER_ADMIN' ? [
            { icon: Shield, label: 'Roles', path: '/roles' }
        ] : []),
        ...(user?.role === 'SUPER_ADMIN' ? [
            { icon: Activity, label: 'Activity Log', path: '/activity' }
        ] : []),
        ...(user?.role !== 'CLIENT' ? [{
            icon: BookOpen,
            label: 'Glossary',
            path: '/glossary',
            badge: stats?.totalGlossaryTerms
        }] : []),
        ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? [
            { icon: Settings, label: 'Settings', path: '/settings' }
        ] : []),
    ];

    return (
        <div className="flex min-h-screen bg-main text-foreground transition-colors duration-300">
            <FaviconManager />

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center px-4 z-40 justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
                        {settings.system_logo ? (
                            <img
                                src={settings.system_logo.startsWith('http') ? settings.system_logo : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000'}${settings.system_logo}`}
                                alt="Logo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Languages className="text-white" size={18} />
                        )}
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {settings.system_name || 'LinguaFlow AI'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {user?.role !== 'CLIENT' && (
                        <button onClick={toggleChat} className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors relative" title="Messages">
                            <MessageSquare size={20} />
                            {totalUnreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                            )}
                        </button>
                    )}
                    <NotificationBell />
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed left-0 top-0 h-full glass-card m-0 lg:m-4 border-r border-glass-border lg:rounded-2xl flex flex-col z-50 transition-all duration-300 group/sidebar",
                    isCollapsed ? "lg:w-20" : "lg:w-64", // Desktop width
                    "w-64", // Mobile width constant
                    // Mobile visibility logic
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Floating Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-9 z-50 w-6 h-6 bg-white dark:bg-gray-900 border border-glass-border rounded-full items-center justify-center shadow-md text-muted hover:text-blue-500 hover:scale-110 transition-all"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
                </button>

                <div className="p-6 flex items-center justify-between">
                    <div className={clsx("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed && "lg:justify-center")}>
                        <div className="w-8 h-8 min-w-[2rem] rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
                            {settings.system_logo ? (
                                <img
                                    src={settings.system_logo.startsWith('http') ? settings.system_logo : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000'}${settings.system_logo}`}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Languages className="text-white" size={18} />
                            )}
                        </div>
                        <h1 className={clsx("text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent truncate transition-all duration-300", isCollapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : "w-auto opacity-100")}>
                            {settings.system_name || 'LinguaFlow AI'}
                        </h1>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden p-1 hover:bg-secondary/10 rounded-lg text-muted hover:text-foreground transition-colors ml-auto"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-visible">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            item={item}
                            isCollapsed={isCollapsed}
                            isActive={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className="p-4 mt-auto space-y-4">
                    {(!isCollapsed || isMobileOpen) && settings.support_email && (
                        <a
                            href={`mailto:${settings.support_email}`}
                            className="block px-4 py-2 text-xs text-center text-muted hover:text-blue-500 transition-colors border border-glass-border rounded-lg bg-secondary/10 hover:bg-secondary/20 truncate"
                        >
                            Need Support?
                        </a>
                    )}

                    <button
                        onClick={toggleTheme}
                        className={clsx(
                            "flex items-center gap-3 w-full px-4 py-3 text-muted hover:text-foreground hover:bg-secondary/10 rounded-xl transition-colors",
                            isCollapsed && "lg:justify-center lg:px-2"
                        )}
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span className={clsx("transition-all duration-300", isCollapsed ? "lg:w-0 lg:opacity-0 lg:overflow-hidden" : "w-auto opacity-100")}>
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </button>

                    <Link
                        to="/profile"
                        className={clsx(
                            "glass-card p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors group cursor-pointer",
                            isCollapsed && "lg:justify-center lg:p-2"
                        )}
                        title="My Profile"
                    >
                        <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden group-hover:ring-2 ring-blue-500/50 transition-all">
                            <UserAvatar user={user} size="md" />
                        </div>
                        <div className={clsx("transition-all duration-300", isCollapsed ? "lg:w-0 lg:opacity-0 lg:overflow-hidden" : "w-auto opacity-100")}>
                            <div className="text-sm font-medium truncate w-32 text-foreground group-hover:text-blue-400 transition-colors">{user?.name}</div>
                            <div className="text-xs text-muted truncate w-32">{user?.role}</div>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors",
                            isCollapsed && "lg:justify-center lg:px-2"
                        )}
                        title="Logout"
                    >
                        <LogOut size={20} />
                        <span className={clsx("transition-all duration-300", isCollapsed ? "lg:w-0 lg:opacity-0 lg:overflow-hidden" : "w-auto opacity-100")}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={clsx(
                "flex-1 flex flex-col p-4 lg:p-8 transition-all duration-300 pt-20 lg:pt-8", // added padding top for mobile header (16 + 4 = 20)
                isCollapsed ? "lg:ml-28" : "lg:ml-72",
                "ml-0" // Reset margin for mobile
            )}>
                {/* Desktop Top Bar */}
                <div className="hidden lg:flex justify-end mb-6 relative z-[100]">
                    <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border border-glass-border rounded-xl p-2 shadow-sm relative overflow-visible">
                        {user?.role !== 'CLIENT' && (
                            <button
                                onClick={toggleChat}
                                className="relative p-2 rounded-lg hover:bg-secondary/10 text-muted hover:text-blue-500 transition-colors"
                                title="Messages"
                            >
                                <MessageSquare size={20} />
                                {totalUnreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                                )}
                            </button>
                        )}
                        <NotificationBell />

                        {/* User Profile (Desktop Header) - Dropdown */}
                        {user && (
                            <div className="relative ml-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-3 px-2 py-1.5 hover:bg-secondary/10 rounded-lg transition-colors group outline-none"
                                >
                                    <div className="text-right hidden xl:block">
                                        <div className="text-sm font-bold text-foreground leading-none group-hover:text-blue-500 transition-colors">{user.name}</div>
                                        <div className="text-[10px] text-muted font-medium uppercase tracking-wide">{user.role}</div>
                                    </div>
                                    <UserAvatar user={user} className="w-9 h-9 ring-2 ring-background group-hover:scale-105 transition-transform" />
                                    <ChevronDown size={14} className={`text-muted transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="fixed inset-0 w-full h-[100dvh] sm:h-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 sm:rounded-xl shadow-xl z-50 p-2 flex flex-col gap-1"
                                            >
                                                <div className="flex sm:hidden justify-between items-center p-3 border-b border-glass-border mb-2 shrink-0">
                                                    <h3 className="font-bold text-lg">Profile</h3>
                                                    <button onClick={() => setIsProfileMenuOpen(false)} className="p-1 hover:bg-secondary/10 rounded-full">
                                                        <X size={24} />
                                                    </button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto w-full">
                                                    <div className="px-3 py-2 border-b border-glass-border mb-1">
                                                        <p className="font-bold text-foreground text-sm truncate">{user.name}</p>
                                                        <p className="text-xs text-muted truncate">{user.email}</p>
                                                    </div>

                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setIsProfileMenuOpen(false)}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                                                    >
                                                        <User size={16} /> My Profile
                                                    </Link>
                                                    {['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '') && (
                                                        <Link
                                                            to="/activity"
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                                                        >
                                                            <Activity size={16} /> Activity
                                                        </Link>
                                                    )}
                                                    {/* Settings for Admins */}
                                                    {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                                        <Link
                                                            to="/settings"
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                                                        >
                                                            <Settings size={16} /> Settings
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left w-full mt-1 border-t border-glass-border"
                                                    >
                                                        <LogOut size={16} /> Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border border-glass-border rounded-2xl p-0 md:p-8 min-h-[calc(100vh-8rem)] shadow-sm relative z-0">
                    <Outlet />
                </div>

                {/* Floating Chat Widget */}
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TRANSLATOR') && (
                    <ChatWidget />
                )}

                <CopyrightFooter />
            </main>
        </div>
    );
};
