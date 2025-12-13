import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Sparkles, Eye, EyeOff, LogIn, ChevronRight, ChevronLeft, Users, Shield, Globe, User, Languages } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { FormInput } from '../components/FormInput';
import { CopyrightFooter } from '../components/CopyrightFooter';
import { clsx } from 'clsx';
import { useSystemStore } from '../store/useSystemStore';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
    { role: 'Super Admin', email: 'super@example.com', pass: '123456', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { role: 'Admin', email: 'admin@example.com', pass: '123456', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { role: 'Client', email: 'client@example.com', pass: '123456', icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { role: 'Mike Client', email: 'mike@example.com', pass: '123456', icon: User, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { role: 'Translator (AR)', email: 'translator@example.com', pass: '123456', icon: Globe, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { role: 'Sarah Translator (ES)', email: 'sarah@example.com', pass: '123456', icon: Globe, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
];

export const Login = () => {
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const { settings, fetchSettings } = useSystemStore();
    const [showDemo, setShowDemo] = useState(true);

    const from = location.state?.from?.pathname || '/dashboard';

    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            await login(data.email, data.password);
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
        }
    };

    const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

    useEffect(() => {
        fetchSettings();
        fetchDemoUsers();
    }, []);

    const fetchDemoUsers = async () => {
        try {
            // Hardcoded fallback in case backend fails or returns empty
            const fallback = [
                { role: 'Super Admin', email: 'super@example.com', pass: '123456', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                { role: 'Admin', email: 'admin@example.com', pass: '123456', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            ];

            // Try fetching
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/users/public/demo-users`);
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    // Map backend data to UI format
                    const mapped = data.map(u => {
                        let icon = User;
                        let color = 'text-gray-400';
                        let bg = 'bg-gray-500/10 border-gray-500/20';

                        if (u.role.includes('Admin')) { icon = Shield; color = 'text-red-400'; bg = 'bg-red-500/10 border-red-500/20'; }
                        else if (u.role.includes('Client')) { icon = User; color = 'text-purple-400'; bg = 'bg-purple-500/10 border-purple-500/20'; }
                        else if (u.role.includes('Translator')) { icon = Globe; color = 'text-green-400'; bg = 'bg-green-500/10 border-green-500/20'; }

                        return {
                            ...u,
                            icon,
                            color,
                            bg
                        };
                    });
                    setDemoAccounts(mapped);
                } else {
                    setDemoAccounts(fallback);
                }
            } catch (e) {
                console.error("Failed to fetch demo users", e);
                setDemoAccounts(fallback);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (settings.show_demo_login !== undefined) {
            setShowDemo(settings.show_demo_login);
        }
    }, [settings.show_demo_login]);

    const fillDemo = (email: string, pass: string) => {
        setValue('email', email);
        setValue('password', pass);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Background Ambient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />

            <div className="flex flex-col lg:flex-row w-full max-w-5xl gap-6 relative z-10 transition-all duration-500">
                {/* Login Form Section */}
                <motion.div
                    layout
                    className={clsx("w-full lg:flex-1 transition-all duration-500", showDemo ? "lg:max-w-md mx-auto lg:mx-0" : "max-w-md mx-auto")}
                >
                    <GlassCard hoverEffect={true} className="p-8 sm:p-10 h-full flex flex-col justify-center">
                        <div className="mb-8 flex flex-col items-center">
                            {settings.system_logo ? (
                                <div className="p-3 bg-blue-500/10 rounded-xl mb-4 text-blue-400 overflow-hidden">
                                    <div className="w-12 h-12">
                                        <img
                                            src={settings.system_logo.startsWith('http') ? settings.system_logo : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000'}${settings.system_logo}`}
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-secondary/5 border border-glass-border">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Languages className="text-white" size={20} />
                                    </div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {settings.system_name || 'LinguaFlow'}
                                    </h1>
                                </div>
                            )}
                            <h2 className="text-3xl font-bold text-foreground font-outfit">
                                Welcome Back
                            </h2>
                            <p className="text-muted mt-2 text-center text-sm">Sign in to continue to {settings.system_name}</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <FormInput
                                label="Email Address"
                                type="email"
                                placeholder="name@example.com"
                                error={errors.email}
                                {...register('email')}
                            />

                            <div className="relative">
                                <FormInput
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    error={errors.password}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-muted hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? 'Signing In...' : <><LogIn size={20} /> Sign In</>}
                            </motion.button>
                        </form>

                        {settings.show_demo_login && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => setShowDemo(!showDemo)}
                                    className="text-xs text-muted hover:text-foreground flex items-center gap-1 transition-colors"
                                >
                                    {showDemo ? 'Hide Demo Accounts' : 'Show Demo Accounts'}
                                    {showDemo ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                                </button>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>

                {/* Demo Accounts Section - Collapsible */}
                <AnimatePresence mode='wait'>
                    {showDemo && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: 'auto' }}
                            exit={{ opacity: 0, x: 20, width: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="w-full lg:w-auto overflow-hidden"
                        >
                            <div className="w-full lg:w-[380px] h-full">
                                <GlassCard className="p-8 h-full flex flex-col bg-surface/50 border-glass-border">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-foreground mb-2">Demo Access</h3>
                                        <p className="text-muted text-sm">Use these pre-configured accounts to test the platform's features across different roles.</p>
                                    </div>

                                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[350px]">
                                        {demoAccounts.map((account, idx) => (
                                            <motion.div
                                                key={account._id || account.email}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                onClick={() => fillDemo(account.email, account.pass)}
                                                className={clsx(
                                                    "p-4 rounded-xl border cursor-pointer transition-all group relative overflow-hidden",
                                                    account.bg,
                                                    "hover:bg-opacity-20 hover:border-opacity-50"
                                                )}
                                            >
                                                <div className="flex items-start justify-between relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className={clsx("p-2 rounded-lg bg-secondary/10", account.color)}>
                                                            <account.icon size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={clsx("font-bold text-sm", account.color)}>{account.role}</h4>
                                                                {account.projectCount > 0 && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted font-mono">
                                                                        {account.projectCount} {account.projectCount === 1 ? 'project' : 'projects'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-muted text-xs mt-0.5">{account.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between border-t border-glass-border pt-2 relative z-10">
                                                    <div className="flex gap-1">
                                                        {[...Array(6)].map((_, i) => (
                                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted/20" />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted/50 group-hover:text-foreground transition-colors">Click to Fill</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-glass-border text-center">
                                        <p className="text-xs text-muted">
                                            Only available in development mode.<br />
                                            Passwords are reset daily.
                                        </p>
                                    </div>
                                </GlassCard>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="absolute bottom-0 w-full z-20">
                <CopyrightFooter />
            </div>
        </div>
    );
};
