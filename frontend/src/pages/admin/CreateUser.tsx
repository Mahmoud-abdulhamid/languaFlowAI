import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { GlassCard } from '../../components/GlassCard';
import { SearchableSelect } from '../../components/SearchableSelect';
import { UserPlus, Save, ArrowLeft, Plus, X, RefreshCw, Key, Camera, Eye, EyeOff, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const CreateUser = () => {
    const navigate = useNavigate();
    const { createUser, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CLIENT',
        avatar: '',
        languages: [] as { source: string; target: string }[]
    });

    // Language pair input state
    const [langPair, setLangPair] = useState({ source: '', target: '' });
    const [availableLangs, setAvailableLangs] = useState<{ code: string; name: string }[]>([]);
    const [roles, setRoles] = useState<{ name: string }[]>([]);

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchLanguages();
        fetchRoles();
    }, []);

    const fetchLanguages = async () => {
        try {
            const res = await api.get('/languages');
            setAvailableLangs(res.data);
        } catch (error) {
            console.error('Failed to fetch languages');
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get('/roles');
            setRoles(res.data);
        } catch (error) {
            console.error('Failed to fetch roles');
        }
    };

    const handleAddLanguage = () => {
        if (langPair.source && langPair.target) {
            setFormData(prev => ({
                ...prev,
                languages: [...prev.languages, langPair]
            }));
            setLangPair({ source: '', target: '' });
        }
    };

    const handleRemoveLanguage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.filter((_, i) => i !== index)
        }));
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setIsUploading(true);
        try {
            const res = await api.post('/users/upload-avatar', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            // Update formData. We assume CreateUser logic might use 'avatar' in formData. 
            // NOTE: CreateUser initial state DOES NOT HAVE AVATAR.
            // I need to add avatar to CreateUser's formData state first in Step 3557 if it wasn't there.
            // Looking at Step 3487, formData didn't have avatar.
            // I will fix state type below implicitly by using 'any' spread or I need to add avatar to state.
            setFormData(prev => ({ ...prev, avatar: res.data.url }));
            toast.success('Avatar uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createUser(formData);
            toast.success('User created successfully!');
            navigate('/projects'); // Redirect to dashboard/projects
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    const canCreateAdmin = user?.role === 'SUPER_ADMIN';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white font-outfit">Create New User</h1>
                    <p className="text-gray-400 text-sm">Add a new user to the system with specific roles.</p>
                </div>
            </div>

            <GlassCard className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 bg-black/40">
                                {formData.avatar ? (
                                    <img
                                        src={formData.avatar.startsWith('http') || formData.avatar.startsWith('data:') ? formData.avatar : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000'}${formData.avatar}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <div className="text-4xl">?</div>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full hover:bg-blue-500 text-white shadow-lg transition-colors"
                            >
                                {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Full Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-blue-500 outline-none"
                                        placeholder="Min 6 chars..."
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors border border-purple-500/30"
                                    title="Generate Password"
                                >
                                    <RefreshCw size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(formData.password)}
                                    className="p-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors border border-green-500/30"
                                    title="Copy Password"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Role</label>
                            <SearchableSelect
                                label=""
                                value={formData.role}
                                onChange={(val) => setFormData({ ...formData, role: val as string })}
                                options={roles.map(r => ({
                                    value: r.name,
                                    label: r.name
                                }))}
                                placeholder="Select Role"
                            />
                        </div>
                    </div>

                    {/* Translator Languages */}
                    {formData.role === 'TRANSLATOR' && (
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-lg font-semibold text-white">Language Capabilities</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Source Language</label>
                                    <SearchableSelect
                                        value={langPair.source}
                                        onChange={(val) => setLangPair({ ...langPair, source: val as string })}
                                        options={availableLangs.map(l => ({ value: l.code, label: `${l.name} (${l.code})` }))}
                                        placeholder="Select Source"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs text-gray-400">Target Language</label>
                                        <SearchableSelect
                                            value={langPair.target}
                                            onChange={(val) => setLangPair({ ...langPair, target: val as string })}
                                            options={availableLangs.map(l => ({ value: l.code, label: `${l.name} (${l.code})` }))}
                                            placeholder="Select Target"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddLanguage}
                                        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-white"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            {formData.languages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.languages.map((l, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                                            <span>{l.source} → {l.target}</span>
                                            <button type="button" onClick={() => handleRemoveLanguage(i)} className="hover:text-white"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : (
                                <>
                                    <Save size={20} />
                                    Create User
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};
