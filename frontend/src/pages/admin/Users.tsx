import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { GlassCard } from '../../components/GlassCard';
import { Pagination } from '../../components/Pagination';
import { useAuthStore } from '../../store/useAuthStore';
import { Users as UsersIcon, Edit2, Trash2, Save, X, Search, UserPlus, Plus, RefreshCw, Key, Mail, Camera, Eye, EyeOff, Copy, LayoutGrid, List, UserX, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { UserAvatar } from '../../components/UserAvatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { SearchableSelect } from '../../components/SearchableSelect';
import { formatNumber } from '../../utils/formatNumber';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    languages?: { source: string; target: string }[];
    isActive: boolean;
    createdAt?: string;
}

interface Role {
    name: string;
}

export const UsersPage = () => {
    const { token, user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest'); // Added smart sorting state
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(window.innerWidth < 768 ? 'grid' : 'list');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12); // Default to 12

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1); // Reset to first page
    };

    // Language Editor State
    const [langPair, setLangPair] = useState({ source: '', target: '' });
    const [availableLangs, setAvailableLangs] = useState<{ code: string; name: string }[]>([]);

    // UI State
    const [isUploading, setIsUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: 'CLIENT',
        email: '',
        password: '',
        avatar: '',
        languages: [] as { source: string; target: string }[]
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });

    useEffect(() => {
        fetchUsers(1);
        fetchRoles();
        fetchLanguages();
    }, [selectedRole]); // Refetch when role changes

    const fetchLanguages = async () => {
        try {
            const res = await api.get('/languages');
            setAvailableLangs(res.data);
        } catch (error) {
            console.error('Failed to fetch languages');
        }
    };

    const fetchUsers = async (page = 1) => {
        setIsLoading(true);
        try {
            const roleQuery = selectedRole !== 'ALL' ? `&role=${selectedRole}` : '';
            const res = await api.get(`/users?page=${page}&limit=10${roleQuery}`);
            // Handle new response structure { data, pagination }
            if (res.data.data && res.data.pagination) {
                setUsers(res.data.data);
                setPagination(res.data.pagination);
            } else {
                setUsers(res.data); // Fallback if API hasn't updated yet or different structure
            }
        } catch (error) {
            console.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
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

    const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} ${name}?`)) return;
        try {
            await api.put(`/users/${id}/status`, { isActive: !currentStatus });
            setUsers(users.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
            toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsLoading(true);
        try {
            const res = await api.put(`/users/${editingUser._id}`, formData);
            setUsers(users.map(u => u._id === editingUser._id ? res.data : u));
            closeModal();
            toast.success('User updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '', // Don't show current password
            avatar: user.avatar || '', // Assuming User interface has avatar logic handled elsewhere if missing
            languages: user.languages || []
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    // Calculate Role Counts
    const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRole('ALL');
        setSortBy('newest');
    };

    const filteredUsers = users
        .filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                case 'oldest':
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'role':
                    return a.role.localeCompare(b.role);
                default:
                    return 0;
            }
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedRole, sortBy]);

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

    const canManageUser = (targetUser: User): boolean => {
        if (!currentUser) return false;

        // 1. Cannot manage self
        if (currentUser.id === targetUser._id) return false;

        // 2. Super Admin Protection: No one can touch a Super Admin
        // "Super admin can disable and delete any type of account EXCEPT himself OR a super admin like him"
        if (targetUser.role === 'SUPER_ADMIN') return false;

        // 3. Admin logic
        if (currentUser.role === 'ADMIN') {
            // Cannot manage other Admins
            if (targetUser.role === 'ADMIN') return false;
            return true;
        }

        // 4. Super Admin logic
        if (currentUser.role === 'SUPER_ADMIN') {
            return true;
        }

        return false;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                        <UsersIcon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground font-outfit">User Management</h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-glass-border text-xs font-mono text-muted">
                                {formatNumber(users.length)}
                            </span>
                        </div>
                        <p className="text-muted text-sm">Manage user accounts and roles.</p>
                    </div>
                </div>
                <Link
                    to="/users/create"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                >
                    <UserPlus size={18} />
                    <span>Create User</span>
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 flex items-center bg-secondary/5 border border-glass-border rounded-xl p-3">
                    <Search size={20} className="text-muted mr-3" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-foreground w-full placeholder-muted"
                    />
                </div>

                <div className="flex flex-wrap gap-4">
                    {/* Smart Sorting Dropdown */}
                    <div className="min-w-[160px] flex-1 sm:flex-none">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-secondary/5 border border-glass-border rounded-xl px-4 py-2.5 text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="newest" className="bg-surface text-foreground">Newest Joined</option>
                            <option value="oldest" className="bg-surface text-foreground">Oldest Joined</option>
                            <option value="name_asc" className="bg-surface text-foreground">Name (A-Z)</option>
                            <option value="name_desc" className="bg-surface text-foreground">Name (Z-A)</option>
                            <option value="role" className="bg-surface text-foreground">Role</option>
                        </select>
                    </div>

                    <div className="min-w-[180px] flex-1 sm:flex-none">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full bg-secondary/5 border border-glass-border rounded-xl px-4 py-2.5 text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-surface text-foreground">All Roles ({users.length})</option>
                            <option value="SUPER_ADMIN" className="bg-surface text-foreground">Super Admin ({roleCounts['SUPER_ADMIN'] || 0})</option>
                            <option value="ADMIN" className="bg-surface text-foreground">Admin ({roleCounts['ADMIN'] || 0})</option>
                            <option value="TRANSLATOR" className="bg-surface text-foreground">Translator ({roleCounts['TRANSLATOR'] || 0})</option>
                            <option value="CLIENT" className="bg-surface text-foreground">Client ({roleCounts['CLIENT'] || 0})</option>
                        </select>
                    </div>

                    {(searchTerm || selectedRole !== 'ALL' || sortBy !== 'newest') && (
                        <button
                            onClick={clearFilters}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-2.5 rounded-xl font-medium transition-colors text-sm"
                        >
                            Clear
                        </button>
                    )}

                    <div className="hidden md:flex bg-secondary/5 border border-glass-border rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-muted hover:text-foreground'}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-muted hover:text-foreground'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <GlassCard key={i} className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3 w-full">
                                        <Skeleton className="h-14 w-14 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-5 w-3/4 rounded" />
                                            <Skeleton className="h-4 w-1/2 rounded" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-glass-border">
                                    <Skeleton className="h-8 flex-1 rounded-lg" />
                                    <Skeleton className="h-8 flex-1 rounded-lg" />
                                    <Skeleton className="h-8 flex-1 rounded-lg" />
                                </div>
                            </GlassCard>
                        ))
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center col-span-3 py-12 text-muted">No users found.</div>
                    ) : (
                        paginatedUsers.map(u => (
                            <GlassCard key={u._id} hoverEffect={true} className="p-5 group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar user={u} size="lg" />
                                        <div>
                                            <h3 className="font-bold text-foreground text-lg">{u.name}</h3>
                                            <p className="text-sm text-muted truncate max-w-[150px]">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'SUPER_ADMIN' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                                            u.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                                                u.role === 'TRANSLATOR' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                                                    'bg-secondary/20 text-muted'
                                            }`}>
                                            {u.role}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.isActive ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>



                                {canManageUser(u) && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-glass-border">
                                        <button onClick={() => openModal(u)} className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-lg flex justify-center items-center gap-2 text-sm transition-colors">
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(u._id, u.isActive, u.name)}
                                            className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-2 text-sm transition-colors ${u.isActive ? 'bg-orange-600/10 hover:bg-orange-600/20 text-orange-600 dark:text-orange-400' : 'bg-green-600/10 hover:bg-green-600/20 text-green-600 dark:text-green-400'}`}
                                            title={u.isActive ? "Deactivate Account" : "Activate Account"}
                                        >
                                            {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />} {u.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                        <button onClick={() => handleDelete(u._id)} className="flex-1 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 rounded-lg flex justify-center items-center gap-2 text-sm transition-colors">
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                )}
                            </GlassCard>
                        ))
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-glass-border">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/20 text-muted text-sm border-b border-glass-border">
                                <th className="p-4 font-medium">User</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Registered</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="hover:bg-secondary/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32 rounded" />
                                                    <Skeleton className="h-3 w-48 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-24 rounded" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        <td className="p-4 text-right"><Skeleton className="h-8 w-24 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-muted">No users found.</td></tr>
                            ) : (
                                paginatedUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-secondary/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar user={u} size="md" />
                                                <div>
                                                    <div className="text-foreground font-medium">{u.name}</div>
                                                    <div className="text-muted text-sm">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                                                u.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                                                    u.role === 'TRANSLATOR' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                                                        'bg-secondary/10 text-muted border border-glass-border'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted text-sm">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {canManageUser(u) && (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openModal(u)} className="p-2 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(u._id, u.isActive, u.name)}
                                                        className={`p-2 rounded-lg transition-colors ${u.isActive ? 'hover:bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'hover:bg-green-500/20 text-green-600 dark:text-green-400'}`}
                                                        title={u.isActive ? "Deactivate User" : "Activate User"}
                                                    >
                                                        {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                                    </button>
                                                    <button onClick={() => handleDelete(u._id)} className="p-2 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )
            }

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={handlePageSizeChange}
            />

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="p-6 bg-surface">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-foreground">Edit User</h2>
                                    <button onClick={closeModal} className="text-muted hover:text-foreground">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdate} className="space-y-4">
                                    {/* Avatar */}
                                    <div>
                                        <label className="text-sm text-muted block mb-1">Avatar</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    value={formData.avatar}
                                                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                                    placeholder="https://example.com/avatar.png"
                                                    className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-blue-500/30"
                                                title="Upload Image"
                                            >
                                                {isUploading ? <RefreshCw size={20} className="animate-spin" /> : <Camera size={20} />}
                                            </button>

                                            {formData.avatar && (
                                                <div className="w-12 h-12 rounded-full overflow-hidden border border-glass-border bg-secondary/10 flex-shrink-0">
                                                    <img
                                                        src={formData.avatar.startsWith('http') || formData.avatar.startsWith('data:') ? formData.avatar : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000'}${formData.avatar}`}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="text-sm text-muted block mb-1">Full Name</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-sm text-muted block mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 pl-10 text-foreground focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="text-sm text-muted block mb-1">Password (Leave blank to keep current)</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder="Set new password..."
                                                    className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 pl-10 text-foreground focus:border-blue-500 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={generatePassword}
                                                className="p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors border border-purple-500/30"
                                                title="Generate Password"
                                            >
                                                <RefreshCw size={20} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(formData.password)}
                                                className="p-3 bg-green-600/20 hover:bg-green-600/30 text-green-600 dark:text-green-400 rounded-lg transition-colors border border-green-500/30"
                                                title="Copy Password"
                                            >
                                                <Copy size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-muted block mb-1">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                            disabled={editingUser?.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN'}
                                        >
                                            {roles.map(r => (
                                                <option
                                                    key={r.name}
                                                    value={r.name}
                                                    disabled={r.name === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN'}
                                                >
                                                    {r.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.role === 'TRANSLATOR' && (
                                        <div className="space-y-4 pt-4 border-t border-glass-border">
                                            <h3 className="text-lg font-semibold text-foreground">Language Capabilities</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        value={langPair.source}
                                                        onChange={e => setLangPair({ ...langPair, source: e.target.value })}
                                                        className="bg-secondary/5 border border-glass-border rounded-lg p-2 text-foreground outline-none w-full"
                                                    >
                                                        <option value="">Select Source</option>
                                                        {availableLangs.map(lang => (
                                                            <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                                                        ))}
                                                    </select>

                                                    <div className="flex gap-2">
                                                        <select
                                                            value={langPair.target}
                                                            onChange={e => setLangPair({ ...langPair, target: e.target.value })}
                                                            className="flex-1 bg-secondary/5 border border-glass-border rounded-lg p-2 text-foreground outline-none"
                                                        >
                                                            <option value="">Select Target</option>
                                                            {availableLangs.map(lang => (
                                                                <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={handleAddLanguage}
                                                            className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-white flex-shrink-0"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {formData.languages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                                                    {formData.languages.map((l, i) => (
                                                        <div key={i} className="flex items-center gap-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                                                            <span>{l.source} → {l.target}</span>
                                                            <button type="button" onClick={() => handleRemoveLanguage(i)} className="hover:text-red-500"><X size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {formData.languages.length === 0 && (
                                                <p className="text-xs text-muted italic">No languages assigned.</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2"
                                        >
                                            <Save size={18} />
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};
