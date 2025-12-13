import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { SearchableSelect } from '../components/SearchableSelect';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuthStore } from '../store/useAuthStore';
import { useSystemStore } from '../store/useSystemStore';
import { Database, ToggleLeft, ToggleRight, Trash2, Bot, RefreshCw, MessageSquare, ShieldAlert, Lock, MessageCircle, HardDrive, Activity, Save, Upload as UploadIcon, Download, RotateCcw, Cpu, Server } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
    const { user, token } = useAuthStore();
    const { updateSetting, fetchSettings: fetchStoreSettings } = useSystemStore();
    const [activeTab, setActiveTab] = useState<'system' | 'chat' | 'ai' | 'notes' | 'domains' | 'maintenance'>('system');
    const [systemSettings, setSystemSettings] = useState<any>({});
    const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const navigate = useNavigate();

    // Maintenance State
    const [systemStats, setSystemStats] = useState<any>(null);
    const [backups, setBackups] = useState<any[]>([]);
    const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false);

    // Domain Management State
    const [newDomain, setNewDomain] = useState('');

    useEffect(() => {
        if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            navigate('/');
            return;
        }
        fetchSettings();
    }, [user, navigate]);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSystemSettings(res.data);
        } catch (error) {
            console.error('Failed to load settings');
        }
    };

    const handleSystemSettingChange = async (key: string, value: any) => {
        try {
            setSystemSettings((prev: any) => {
                const newState = { ...prev, [key]: value };
                return newState;
            });

            // Sync with global store immediately
            updateSetting(key, value);

            await api.post('/settings', { key, value });

            toast.success('Setting saved', { id: key }); // Deduplicate toasts by key
        } catch (error) {
            toast.error('Failed to save setting');
            fetchSettings();
            fetchStoreSettings(); // Re-sync store on error
        }
    };

    const fetchModels = async () => {
        setIsLoadingModels(true);
        const toastId = toast.loading('Fetching models...');
        try {
            const res = await api.get('/settings/ai/models');
            const models = res.data;
            setAvailableModels(models);
            toast.success(`Found ${models.length} models`, { id: toastId });

            if (models.length > 0 && !systemSettings.ai_model) {
                handleSystemSettingChange('ai_model', models[0].id);
            }
        } catch (e: any) {
            toast.error('Failed to fetch models. Check Provider/API Key.', { id: toastId });
        } finally {
            setIsLoadingModels(false);
        }
    };

    const handleAddDomain = () => {
        if (!newDomain.trim()) return;
        const currentDomains = systemSettings.project_domains || ['General', 'Legal', 'Medical', 'Technical', 'Financial', 'Marketing', 'Literary', 'Scientific'];
        if (currentDomains.includes(newDomain.trim())) {
            toast.error('Domain already exists');
            return;
        }
        const updated = [...currentDomains, newDomain.trim()];
        handleSystemSettingChange('project_domains', updated);
        setNewDomain('');
        toast.success('Domain added');
    };

    const handleRemoveDomain = (domain: string) => {
        const currentDomains = systemSettings.project_domains || ['General', 'Legal', 'Medical', 'Technical', 'Financial', 'Marketing', 'Literary', 'Scientific'];
        const updated = currentDomains.filter((d: string) => d !== domain);
        handleSystemSettingChange('project_domains', updated);
        toast.success('Domain removed');
    };

    const fetchMaintenanceData = async () => {
        setIsMaintenanceLoading(true);
        try {
            const [statsRes, backupsRes] = await Promise.all([
                api.get('/maintenance/stats'),
                api.get('/maintenance/backups')
            ]);
            setSystemStats(statsRes.data);
            setBackups(backupsRes.data);
        } catch (e) {
            toast.error('Failed to load maintenance data');
        } finally {
            setIsMaintenanceLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        const toastId = toast.loading('Creating backup...');
        try {
            await api.post('/maintenance/backups/create');
            toast.success('Backup created', { id: toastId });
            fetchMaintenanceData();
        } catch (e) {
            toast.error('Backup failed', { id: toastId });
        }
    };

    const handleRestoreBackup = async (filename: string) => {
        if (!window.confirm(`Are you sure you want to restore ${filename}? Current data will be overwritten.`)) return;

        const toastId = toast.loading('Restoring system...');
        try {
            await api.post('/maintenance/backups/restore', { filename });
            toast.success('System restored successfully', { id: toastId });
        } catch (e) {
            toast.error('Restore failed', { id: toastId });
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        if (!window.confirm(`Delete backup ${filename}?`)) return;
        try {
            await api.delete(`/maintenance/backups/${filename}`);
            toast.success('Backup deleted');
            setBackups(prev => prev.filter(b => b.filename !== filename));
        } catch (e) {
            toast.error('Failed to delete backup');
        }
    };

    const handleClearCache = async () => {
        const toastId = toast.loading('Clearing Cache...');
        try {
            await api.post('/maintenance/cache/clear');
            toast.success('Cache cleared', { id: toastId });
        } catch (e) {
            toast.error('Failed', { id: toastId });
        }
    };

    const handleKillSessions = async () => {
        if (!window.confirm('Are you sure? All users will be forced to log out.')) return;
        try {
            await api.post('/maintenance/sessions/kill');
            toast.success('All sessions invalidated');
        } catch (e) {
            toast.error('Failed');
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const loadData = async () => {
            if (activeTab === 'system') {
                // fetch system settings
                // ... existing logic if any
            } else if (activeTab === 'maintenance') {
                await fetchMaintenanceData();
                // Start polling for real-time stats
                interval = setInterval(() => {
                    api.get('/maintenance/stats').then(res => setSystemStats(res.data)).catch(() => { });
                }, 2000);
            }
        };

        loadData();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTab]);

    // If not admin, return null (redirection handled in useEffect)
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') return null;

    const tabs = [
        { id: 'system', label: 'System Configuration', icon: Database },
        { id: 'maintenance', label: 'Maintenance & Backup', icon: Server },
        { id: 'chat', label: 'Chat System', icon: MessageCircle },
        { id: 'notes', label: 'Notes System', icon: MessageSquare },
        { id: 'ai', label: 'AI Configuration', icon: Bot },
        { id: 'domains', label: 'Domains', icon: ShieldAlert },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold font-outfit text-foreground">System Settings</h1>
                <p className="text-muted mt-2">Manage global system configurations and integrations.</p>
            </div>

            <div className="flex gap-4 border-b border-glass-border pb-4 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-secondary/10 text-muted hover:bg-secondary/20 hover:text-foreground'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <GlassCard className="p-4 md:p-8">
                {activeTab === 'system' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Toggles */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary/10 rounded-lg border border-glass-border">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-foreground">Maintenance Mode</h3>
                                <p className="text-sm text-muted">Disable access for non-admin users.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSystemSettingChange('maintenance_mode', !systemSettings.maintenance_mode)}
                                className={`text-2xl ${systemSettings.maintenance_mode ? 'text-green-500' : 'text-muted'} transition-colors`}
                            >
                                {systemSettings.maintenance_mode ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary/10 rounded-lg border border-glass-border">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-foreground">Show Demo Login</h3>
                                <p className="text-sm text-muted">Show demo accounts sidebar on login page.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSystemSettingChange('show_demo_login', !systemSettings.show_demo_login)}
                                className={`text-2xl ${systemSettings.show_demo_login ? 'text-green-500' : 'text-muted'} transition-colors`}
                            >
                                {systemSettings.show_demo_login ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary/10 rounded-lg border border-glass-border">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-foreground">Enable Clear Translation Button</h3>
                                <p className="text-sm text-muted">Allow users to clear all translations for a file.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSystemSettingChange('enable_clear_translation', !systemSettings.enable_clear_translation)}
                                className={`text-2xl ${systemSettings.enable_clear_translation ? 'text-green-500' : 'text-muted'} transition-colors`}
                            >
                                {systemSettings.enable_clear_translation ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary/10 rounded-lg border border-glass-border">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-foreground">Allow Clients to Assign Translators</h3>
                                <p className="text-sm text-muted">Allow clients to add/remove translators from their own projects.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSystemSettingChange('allow_client_assign_translators', !systemSettings.allow_client_assign_translators)}
                                className={`text-2xl ${systemSettings.allow_client_assign_translators ? 'text-green-500' : 'text-muted'} transition-colors`}
                            >
                                {systemSettings.allow_client_assign_translators ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-muted mb-2 text-sm font-medium">System Name</label>
                                <input
                                    value={systemSettings.system_name || ''}
                                    onChange={e => handleSystemSettingChange('system_name', e.target.value)}
                                    className="w-full bg-secondary/10 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-muted mb-2 text-sm font-medium">Support Email</label>
                                <input
                                    value={systemSettings.support_email || ''}
                                    onChange={e => handleSystemSettingChange('support_email', e.target.value)}
                                    className="w-full bg-secondary/10 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-glass-border">
                            <div>
                                <label className="block text-muted mb-2 text-sm font-medium">System Logo</label>
                                <div className="flex items-center gap-4">
                                    {systemSettings.system_logo && (
                                        <div className="w-12 h-12 rounded bg-secondary/10 p-2 border border-glass-border relative group">
                                            <img
                                                src={systemSettings.system_logo.startsWith('http') ? systemSettings.system_logo : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000'}${systemSettings.system_logo}`}
                                                className="w-full h-full object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleSystemSettingChange('system_logo', '')}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                title="Remove Logo"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                const formData = new FormData();
                                                formData.append('file', e.target.files[0]);
                                                try {
                                                    const res = await api.post('/settings/upload', formData);
                                                    handleSystemSettingChange('system_logo', res.data.url);
                                                } catch (err) {
                                                    toast.error('Upload failed');
                                                }
                                            }
                                        }}
                                        className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-muted mb-2 text-sm font-medium">System Favicon</label>
                                <div className="flex items-center gap-4">
                                    {systemSettings.system_favicon && (
                                        <div className="w-8 h-8 rounded bg-secondary/10 p-1 border border-glass-border relative group">
                                            <img
                                                src={systemSettings.system_favicon.startsWith('http') ? systemSettings.system_favicon : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000'}${systemSettings.system_favicon}`}
                                                className="w-full h-full object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleSystemSettingChange('system_favicon', '')}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                title="Remove Favicon"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/x-icon,image/png,image/svg+xml"
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                const formData = new FormData();
                                                formData.append('file', e.target.files[0]);
                                                try {
                                                    const res = await api.post('/settings/upload', formData);
                                                    handleSystemSettingChange('system_favicon', res.data.url);
                                                } catch (err) {
                                                    toast.error('Upload failed');
                                                }
                                            }
                                        }}
                                        className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-muted mb-2 text-sm font-medium">Allowed File Types</label>
                            <input
                                value={Array.isArray(systemSettings.allowed_file_types) ? systemSettings.allowed_file_types.join(', ') : systemSettings.allowed_file_types || ''}
                                onChange={e => handleSystemSettingChange('allowed_file_types', e.target.value.split(',').map((s: string) => s.trim()))}
                                className="w-full bg-secondary/10 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                            />
                            <p className="text-xs text-muted mt-1">Comma separated</p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'chat' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Master Switch */}
                        <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border">
                            <div>
                                <h3 className="text-lg font-medium text-foreground">Enable Chat System</h3>
                                <p className="text-sm text-muted">Global switch to enable or disable chat functionality for all users.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSystemSettingChange('chat_enabled', systemSettings.chat_enabled === undefined ? false : !systemSettings.chat_enabled)}
                                className={`text-2xl ${systemSettings.chat_enabled ? 'text-green-500' : 'text-muted'} transition-colors`}
                            >
                                {systemSettings.chat_enabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>

                        {/* If Enabled, show other settings */}
                        {systemSettings.chat_enabled && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pl-4 border-l-2 border-glass-border">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Group Creation */}
                                    <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-glass-border">
                                        <div>
                                            <h3 className="text-sm font-medium text-foreground">Allow Group Creation</h3>
                                            <p className="text-xs text-muted">Regular users can create groups.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleSystemSettingChange('chat_allow_group_creation', !systemSettings.chat_allow_group_creation)}
                                            className={`text-2xl ${systemSettings.chat_allow_group_creation ? 'text-green-400' : 'text-muted'} transition-colors`}
                                        >
                                            {systemSettings.chat_allow_group_creation ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>

                                    {/* File Sharing */}
                                    <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-glass-border">
                                        <div>
                                            <h3 className="text-sm font-medium text-foreground">Allow File Sharing</h3>
                                            <p className="text-xs text-muted">Users can upload files/images.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleSystemSettingChange('chat_allow_file_sharing', !systemSettings.chat_allow_file_sharing)}
                                            className={`text-2xl ${systemSettings.chat_allow_file_sharing ? 'text-green-400' : 'text-muted'} transition-colors`}
                                        >
                                            {systemSettings.chat_allow_file_sharing ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>
                                </div>

                                {/* File Settings (if sharing allowed) */}
                                {systemSettings.chat_allow_file_sharing && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div>
                                            <label className="block text-muted mb-2 text-sm font-medium">Max File Size (MB)</label>
                                            <input
                                                type="number"
                                                value={systemSettings.chat_max_file_size || 5}
                                                onChange={e => handleSystemSettingChange('chat_max_file_size', Number(e.target.value))}
                                                className="w-full bg-secondary/10 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-muted mb-2 text-sm font-medium">Allowed Extensions</label>
                                            <input
                                                value={Array.isArray(systemSettings.chat_allowed_file_types) ? systemSettings.chat_allowed_file_types.join(', ') : (systemSettings.chat_allowed_file_types || 'jpg, jpeg, png, webp, heic, pdf, docx')}
                                                onChange={e => handleSystemSettingChange('chat_allowed_file_types', e.target.value.split(',').map((s: string) => s.trim()))}
                                                className="w-full bg-secondary/10 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                                placeholder="jpg, jpeg, png, webp, heic, pdf..."
                                            />
                                            <p className="text-xs text-muted mt-1">Comma separated</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'notes' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border">
                            <div>
                                <h3 className="text-lg font-medium text-foreground">Enable Team Notes System</h3>
                                <p className="text-sm text-muted">Allow users to post notes and discuss projects.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSystemSettingChange('notes_system_enabled', !systemSettings.notes_system_enabled)}
                                className={`text-2xl ${systemSettings.notes_system_enabled ? 'text-green-500' : 'text-muted'} transition-colors`}
                            >
                                {systemSettings.notes_system_enabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>
                        {systemSettings.notes_system_enabled && (
                            <>
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border pl-8 border-l-4 border-l-pink-500/50">
                                    <div>
                                        <h3 className="text-lg font-medium text-foreground">Allow New Replies</h3>
                                        <p className="text-sm text-muted">If disabled, users can view existing notes but cannot reply.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSystemSettingChange('notes_replies_enabled', !systemSettings.notes_replies_enabled)}
                                        className={`text-2xl ${systemSettings.notes_replies_enabled ? 'text-green-500' : 'text-muted'} transition-colors`}
                                    >
                                        {systemSettings.notes_replies_enabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                    </button>
                                </motion.div>
                                {systemSettings.notes_replies_enabled && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border pl-8 border-l-4 border-l-pink-500/50">
                                        <div>
                                            <h3 className="text-lg font-medium text-foreground">Allow File Attachments</h3>
                                            <p className="text-sm text-muted">Allow users to upload images and files in notes.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleSystemSettingChange('notes_allow_attachments', !systemSettings.notes_allow_attachments)}
                                            className={`text-2xl ${systemSettings.notes_allow_attachments ? 'text-green-500' : 'text-muted'} transition-colors`}
                                        >
                                            {systemSettings.notes_allow_attachments ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                        </button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}

                {activeTab === 'domains' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Project Domains</h3>
                            <p className="text-muted mb-4">Manage the list of domains available for projects and translator specializations.</p>

                            <div className="flex gap-2 mb-6 max-w-md">
                                <input
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    placeholder="Add new domain..."
                                    className="flex-1 bg-secondary/10 border border-glass-border rounded-lg px-4 py-2 text-foreground outline-none focus:border-blue-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                                />
                                <button
                                    onClick={handleAddDomain}
                                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-medium"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(systemSettings.project_domains || ['General', 'Legal', 'Medical', 'Technical', 'Financial', 'Marketing', 'Literary', 'Scientific']).map((domain: string) => (
                                    <div key={domain} className="flex justify-between items-center p-3 bg-secondary/5 rounded-lg border border-glass-border">
                                        <span className="text-foreground">{domain}</span>
                                        <button
                                            onClick={() => handleRemoveDomain(domain)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 p-2 hover:bg-red-500/10 rounded"
                                            title="Remove Domain"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'maintenance' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        {/* System Health */}
                        {/* System Health Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Uptime */}
                            <div className="col-span-1 md:col-span-1">
                                {systemStats ? (
                                    <div className="h-full flex flex-col items-center justify-center p-6 bg-secondary/10 rounded-2xl border border-glass-border relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <Activity className="w-8 h-8 text-green-500 mb-4" />
                                            <div className="flex gap-2 text-center items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-3xl font-bold font-outfit text-foreground leading-none">{Math.floor(systemStats.uptime / 3600)}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Hours</span>
                                                </div>
                                                <span className="text-2xl font-bold text-muted-foreground/50 mb-3">:</span>
                                                <div className="flex flex-col">
                                                    <span className="text-3xl font-bold font-outfit text-foreground leading-none">{Math.floor((systemStats.uptime % 3600) / 60).toString().padStart(2, '0')}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Mins</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 text-sm font-medium text-muted-foreground">System Uptime</div>
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                                            </div>
                                        </div>
                                    </div>
                                ) : <div className="h-40 bg-secondary/10 rounded-2xl animate-pulse" />}
                            </div>

                            {/* Memory Pie */}
                            <div className="col-span-1 md:col-span-1">
                                {systemStats ? (
                                    <div className="h-full flex flex-col items-center justify-center p-6 bg-secondary/10 rounded-2xl border border-glass-border relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative w-32 h-32">
                                            <svg className="transform -rotate-90 w-full h-full">
                                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary/30" />
                                                <circle cx="64" cy="64" r="56" stroke="#3B82F6" strokeWidth="12" fill="transparent"
                                                    strokeDasharray={2 * Math.PI * 56}
                                                    strokeDashoffset={(2 * Math.PI * 56) - ((systemStats.usedMem / systemStats.totalMem) * (2 * Math.PI * 56))}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold font-outfit text-foreground">{Math.round((systemStats.usedMem / systemStats.totalMem) * 100)}%</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <div className="text-sm font-medium text-foreground">Memory Usage</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {Math.round(systemStats.usedMem / 1024 / 1024)} / {Math.round(systemStats.totalMem / 1024 / 1024)} MB
                                            </div>
                                        </div>
                                    </div>
                                ) : <div className="h-40 bg-secondary/10 rounded-2xl animate-pulse" />}
                            </div>

                            {/* CPU Pie */}
                            <div className="col-span-1 md:col-span-1">
                                {systemStats ? (
                                    <div className="h-full flex flex-col items-center justify-center p-6 bg-secondary/10 rounded-2xl border border-glass-border relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative w-32 h-32">
                                            <svg className="transform -rotate-90 w-full h-full">
                                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary/30" />
                                                <circle cx="64" cy="64" r="56" stroke="#A855F7" strokeWidth="12" fill="transparent"
                                                    strokeDasharray={2 * Math.PI * 56}
                                                    strokeDashoffset={(2 * Math.PI * 56) - (Math.min(systemStats.cpuLoad[0], 100) / 100) * (2 * Math.PI * 56)}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold font-outfit text-foreground">{systemStats.cpuLoad[0].toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <div className="text-sm font-medium text-foreground">CPU Load</div>
                                            <div className="text-xs text-muted-foreground mt-1">{systemStats.cpus} Cores Active</div>
                                        </div>
                                    </div>
                                ) : <div className="h-40 bg-secondary/10 rounded-2xl animate-pulse" />}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border">
                                <div>
                                    <h3 className="text-md font-medium text-foreground">Clear System Cache</h3>
                                    <p className="text-xs text-muted">Flush temporary data and Redis cache.</p>
                                </div>
                                <button onClick={handleClearCache} className="px-3 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-sm font-medium transition-colors">
                                    Clear Cache
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border">
                                <div>
                                    <h3 className="text-md font-medium text-red-500">Emergency Logout</h3>
                                    <p className="text-xs text-muted">Force logout all users immediately.</p>
                                </div>
                                <button onClick={handleKillSessions} className="px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors">
                                    Kill Sessions
                                </button>
                            </div>
                        </div>

                        {/* Backups */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-foreground">Database Backups</h3>
                                <button
                                    onClick={handleCreateBackup}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    <Save size={16} /> Create Backup
                                </button>
                            </div>

                            <div className="border border-glass-border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary/10 text-muted border-b border-glass-border">
                                        <tr>
                                            <th className="p-3">Filename</th>
                                            <th className="p-3">Size</th>
                                            <th className="p-3">Created</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-glass-border">
                                        {backups.map((backup) => (
                                            <tr key={backup.filename} className="hover:bg-secondary/5 transition-colors">
                                                <td className="p-3 font-mono text-foreground">{backup.filename}</td>
                                                <td className="p-3 text-muted">{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                                                <td className="p-3 text-muted">{new Date(backup.createdAt).toLocaleString()}</td>
                                                <td className="p-3 flex justify-end gap-2">
                                                    <a
                                                        href={`${api.defaults.baseURL}/maintenance/backups/${backup.filename}?token=${token}`}
                                                        download
                                                        className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Download"
                                                        target="_blank" rel="noreferrer"
                                                    >
                                                        <Download size={16} />
                                                    </a>

                                                    <button
                                                        onClick={() => handleRestoreBackup(backup.filename)}
                                                        className="p-1.5 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                        title="Restore"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBackup(backup.filename)}
                                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {backups.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted">No backups found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Upload Restore */}
                            <div className="p-4 bg-secondary/5 border border-dashed border-glass-border rounded-xl text-center">
                                <input
                                    type="file"
                                    id="backup-upload"
                                    className="hidden"
                                    accept=".gz,.archive"
                                    onChange={async (e) => {
                                        if (e.target.files?.[0]) {
                                            const file = e.target.files[0];
                                            const formData = new FormData();
                                            formData.append('backupFile', file);
                                            const toastId = toast.loading('Uploading backup...');
                                            try {
                                                await api.post('/maintenance/backups/upload', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                toast.success('Uploaded', { id: toastId });
                                                fetchMaintenanceData();
                                            } catch (err) {
                                                toast.error('Upload failed', { id: toastId });
                                            }
                                        }
                                    }}
                                />
                                <label htmlFor="backup-upload" className="cursor-pointer flex flex-col items-center gap-2 text-muted hover:text-foreground transition-colors">
                                    <UploadIcon size={24} />
                                    <span className="text-sm font-medium">Upload Backup File to Restore</span>
                                </label>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'ai' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* --- AI Settings Section --- */}
                        <div className="bg-gradient-to-r from-purple-900/10 to-blue-900/10 p-6 rounded-xl border border-glass-border space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AI Configuration</h3>
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">Super Admin</span>
                                </div>
                                <div className="flex items-center gap-3 bg-secondary/10 px-4 py-2 rounded-lg border border-glass-border">
                                    <span className={`text-sm font-medium ${systemSettings.enable_ai_features ? 'text-green-400' : 'text-muted'}`}>
                                        {systemSettings.enable_ai_features ? 'AI Features Enabled' : 'AI Features Disabled'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleSystemSettingChange('enable_ai_features', !systemSettings.enable_ai_features)}
                                        className={`text-2xl ${systemSettings.enable_ai_features ? 'text-green-500' : 'text-muted'} transition-colors`}
                                        title="Master Switch to Enable/Disable All AI Features"
                                    >
                                        {systemSettings.enable_ai_features ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                    </button>
                                </div>
                            </div>

                            {/* Feature Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border">
                                    <div>
                                        <h3 className="text-sm font-medium text-foreground">Single AI Suggestion</h3>
                                        <p className="text-xs text-muted">Enable "Magic Wand" button for single segments.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSystemSettingChange('enable_ai_single_suggestion', !systemSettings.enable_ai_single_suggestion)}
                                        className={`text-2xl ${systemSettings.enable_ai_single_suggestion ? 'text-blue-400' : 'text-muted'} transition-colors`}
                                        disabled={!systemSettings.enable_ai_features}
                                    >
                                        {systemSettings.enable_ai_single_suggestion ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border">
                                    <div>
                                        <h3 className="text-sm font-medium text-foreground">Full File Translation</h3>
                                        <p className="text-xs text-muted">Allow translating entire files via background job.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSystemSettingChange('enable_ai_translation_all', !systemSettings.enable_ai_translation_all)}
                                        className={`text-2xl ${systemSettings.enable_ai_translation_all ? 'text-blue-400' : 'text-muted'} transition-colors`}
                                        disabled={!systemSettings.enable_ai_features}
                                    >
                                        {systemSettings.enable_ai_translation_all ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-glass-border">
                                    <div>
                                        <h3 className="text-sm font-medium text-foreground">AI Bulk Glossary</h3>
                                        <p className="text-xs text-muted">Enable background job for bulk glossary generation.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSystemSettingChange('enable_ai_glossary_gen', !systemSettings.enable_ai_glossary_gen)}
                                        className={`text-2xl ${systemSettings.enable_ai_glossary_gen ? 'text-blue-400' : 'text-muted'} transition-colors`}
                                        disabled={!systemSettings.enable_ai_features}
                                    >
                                        {systemSettings.enable_ai_glossary_gen ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                            </div>

                            <hr className="border-glass-border" />

                            {/* Providers */}
                            <div className={!systemSettings.enable_ai_features ? 'opacity-50 pointer-events-none' : ''}>
                                <label className="block text-muted mb-2 text-sm font-medium">AI Provider</label>
                                <div className="flex gap-4">
                                    {['openai', 'google'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => {
                                                handleSystemSettingChange('ai_provider', p);
                                                setAvailableModels([]); // Reset models when provider changes
                                            }}
                                            className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 capitalize transition-all ${systemSettings.ai_provider === p
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/20'
                                                : 'bg-secondary/10 border-glass-border text-muted hover:border-muted hover:text-foreground'
                                                }`}
                                        >
                                            {p === 'google' ? 'Google Gemini' : 'OpenAI'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* API Key */}
                            <div className={!systemSettings.enable_ai_features ? 'opacity-50 pointer-events-none' : ''}>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-muted text-sm font-medium">API Key</label>
                                    {systemSettings.ai_api_key === '********' && (
                                        <span className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                            <Lock size={10} /> Securely Saved
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder={systemSettings.ai_api_key === '********' ? '••••••••••••••••••••••••' : 'Enter API Key'}
                                        onBlur={(e) => {
                                            if (e.target.value) handleSystemSettingChange('ai_api_key', e.target.value);
                                            e.target.value = '';
                                        }}
                                        className={`w-full bg-secondary/10 border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none placeholder-muted ${systemSettings.ai_api_key === '********' ? 'border-green-500/30 focus:border-green-500' : 'border-glass-border'}`}
                                    />
                                </div>
                                <p className="text-xs text-muted mt-2 flex items-center gap-1">
                                    <Lock size={12} /> The key is encrypted in the database.
                                </p>
                            </div>

                            {/* Model Selection */}
                            <div className={!systemSettings.enable_ai_features ? 'opacity-50 pointer-events-none' : ''}>
                                <label className="block text-muted mb-2 text-sm font-medium">Selected Model</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        {isLoadingModels ? (
                                            <Skeleton className="h-[46px] w-full rounded-lg bg-secondary/10 border border-glass-border" />
                                        ) : (
                                            <SearchableSelect
                                                value={systemSettings.ai_model || ''}
                                                onChange={(val) => handleSystemSettingChange('ai_model', val as string)}
                                                options={availableModels.length > 0
                                                    ? availableModels.map(m => ({ value: m.id, label: m.name }))
                                                    : (systemSettings.ai_model ? [{ value: systemSettings.ai_model, label: systemSettings.ai_model }] : [])
                                                }
                                                placeholder="Select a model..."
                                            />
                                        )}
                                    </div>

                                    <button
                                        onClick={fetchModels}
                                        disabled={isLoadingModels}
                                        className="bg-secondary/20 hover:bg-secondary/30 border border-glass-border rounded-lg px-4 text-sm font-medium text-foreground transition-colors flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {isLoadingModels ? (
                                            <>
                                                <RefreshCw size={16} className="animate-spin" /> Fetching...
                                            </>
                                        ) : (
                                            'Test & Fetch Models'
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-muted mt-2">
                                    Can't find your model? Click "Test & Fetch Models" to update the list from your provider.
                                </p>
                            </div>

                            <hr className="border-glass-border" />

                            <div className={!systemSettings.enable_ai_features ? 'opacity-50 pointer-events-none' : ''}>
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldAlert className="text-red-400" size={20} />
                                    <h3 className="text-lg font-bold text-foreground">Content Moderation</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <div>
                                            <h3 className="text-sm font-medium text-foreground">Detect Contact Information</h3>
                                            <p className="text-xs text-muted">Automatically detect and block/hide messages containing contact info (email, phone, etc) from clients.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleSystemSettingChange('ai_moderation_contact_info', !systemSettings.ai_moderation_contact_info)}
                                            className={`text-2xl ${systemSettings.ai_moderation_contact_info ? 'text-red-500' : 'text-muted/50'} transition-colors`}
                                        >
                                            {systemSettings.ai_moderation_contact_info ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                        </button>
                                    </div>

                                    {systemSettings.ai_moderation_contact_info && (
                                        <div className="p-4 bg-secondary/10 rounded-lg border border-glass-border space-y-4">
                                            <div>
                                                <label className="block text-muted mb-2 text-sm font-medium">Moderation Action</label>
                                                <select
                                                    value={systemSettings.ai_moderation_action || 'block'}
                                                    onChange={(e) => handleSystemSettingChange('ai_moderation_action', e.target.value)}
                                                    className="w-full bg-secondary/10 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="block" className="bg-surface text-foreground">Block Message (User cannot send)</option>
                                                    <option value="hide" className="bg-surface text-foreground">Hide Message (Sent but hidden from others)</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                                                <div>
                                                    <h3 className="text-sm font-medium text-foreground">Notify Admins on Violation</h3>
                                                    <p className="text-xs text-muted">Send notification to all admins when contact info is detected.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSystemSettingChange('ai_moderation_notify_admins', !systemSettings.ai_moderation_notify_admins)}
                                                    className={`text-2xl ${systemSettings.ai_moderation_notify_admins !== false ? 'text-green-500' : 'text-muted'} transition-colors`}
                                                >
                                                    {systemSettings.ai_moderation_notify_admins !== false ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}

            </GlassCard>
        </div>
    );
};
