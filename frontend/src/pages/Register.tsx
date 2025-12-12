import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { GlassCard } from '../components/GlassCard';
import { User, Mail, Lock, Globe, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export const Register = () => {
    const navigate = useNavigate();
    const { register, error, isLoading } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'CLIENT' | 'TRANSLATOR'>('CLIENT');

    // Language Pairs for Translators
    const [languages, setLanguages] = useState<{ source: string, target: string }[]>([{ source: '', target: '' }]);

    const handleAddLanguage = () => {
        setLanguages([...languages, { source: '', target: '' }]);
    };

    const handleRemoveLanguage = (index: number) => {
        setLanguages(languages.filter((_, i) => i !== index));
    };

    const handleLanguageChange = (index: number, field: 'source' | 'target', value: string) => {
        const newLangs = [...languages];
        newLangs[index][field] = value.toLowerCase(); // Normalized
        setLanguages(newLangs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let payload: any = { name, email, password, role };
        if (role === 'TRANSLATOR') {
            // Filter out empty pairs
            const validLangs = languages.filter(l => l.source && l.target);
            if (validLangs.length === 0) {
                toast.error('Please add at least one language pair');
                return;
            }
            payload.languages = validLangs;
        }

        try {
            await register(payload);
            navigate('/');
        } catch (err) {
            // Error handled by store
        }
    };

    return (
        <div className="min-h-screen bg-main flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

            <GlassCard className="max-w-md w-full p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                        Join LinguaFlow
                    </h1>
                    <p className="text-muted">Create your new account</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-secondary/10 border border-glass-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder-muted focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary/10 border border-glass-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder-muted focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-secondary/10 border border-glass-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder-muted focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setRole('CLIENT')}
                            className={`p-3 rounded-xl border transition-all text-sm font-medium
                                ${role === 'CLIENT'
                                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                    : 'bg-secondary/10 border-glass-border text-muted hover:bg-secondary/20'}`}
                        >
                            Client
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('TRANSLATOR')}
                            className={`p-3 rounded-xl border transition-all text-sm font-medium
                                ${role === 'TRANSLATOR'
                                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-400'
                                    : 'bg-secondary/10 border-glass-border text-muted hover:bg-secondary/20'}`}
                        >
                            Translator
                        </button>
                    </div>

                    {/* Translator Languages */}
                    <AnimatePresence>
                        {role === 'TRANSLATOR' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pt-2"
                            >
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <Globe size={14} /> Languages (Source → Target)
                                </label>
                                {languages.map((lang, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="From (e.g. en)"
                                            value={lang.source}
                                            onChange={(e) => handleLanguageChange(index, 'source', e.target.value)}
                                            className="w-full bg-secondary/10 border border-glass-border rounded-lg p-2 text-sm text-foreground focus:border-purple-500/50 outline-none"
                                            maxLength={2}
                                        />
                                        <span className="text-muted">→</span>
                                        <input
                                            type="text"
                                            placeholder="To (e.g. ar)"
                                            value={lang.target}
                                            onChange={(e) => handleLanguageChange(index, 'target', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-purple-500/50 outline-none"
                                            maxLength={2}
                                        />
                                        {languages.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveLanguage(index)} className="text-red-400 hover:bg-red-500/10 p-1 rounded">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddLanguage} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                    <Plus size={14} /> Add another pair
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign In
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
};
