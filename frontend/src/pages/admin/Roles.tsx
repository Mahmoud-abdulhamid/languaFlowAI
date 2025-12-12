import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard';
import { Shield, Plus, Edit2, Trash2, Check, X, Lock } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';

interface Role {
    _id: string;
    name: string;
    description: string;
    permissions: string[];
}

const PERMISSIONS_LIST = [
    'user.create', 'user.read', 'user.update', 'user.delete',
    'project.create', 'project.read', 'project.update', 'project.delete',
    'language.manage', 'role.manage'
];

export const RolesPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const token = useAuthStore((state) => state.token);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/roles');
            setRoles(res.data);
        } catch (err) {
            console.error('Failed to fetch roles', err);
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setName(role.name);
        setDescription(role.description);
        setSelectedPermissions(role.permissions);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/roles/${id}`);
            fetchRoles();
            toast.success('Role deleted');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete role');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { name, description, permissions: selectedPermissions };

            if (editingRole) {
                await api.put(`/roles/${editingRole._id}`, payload);
                toast.success('Role updated');
            } else {
                await api.post('/roles', payload);
                toast.success('Role created');
            }
            setIsModalOpen(false);
            resetForm();
            fetchRoles();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
            toast.error('Operation failed');
        }
    };

    const resetForm = () => {
        setEditingRole(null);
        setName('');
        setDescription('');
        setSelectedPermissions([]);
    };

    const togglePermission = (perm: string) => {
        if (selectedPermissions.includes(perm)) {
            setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
        } else {
            setSelectedPermissions([...selectedPermissions, perm]);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-outfit mb-2">Role Management</h1>
                    <p className="text-muted">Manage system roles and permissions</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus size={20} />
                    Create Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <GlassCard key={role._id} className="p-6 relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {role.name !== 'SUPER_ADMIN' && role.name !== 'ADMIN' && role.name !== 'CLIENT' && role.name !== 'TRANSLATOR' && (
                                <>
                                    <button onClick={() => handleEdit(role)} className="p-2 bg-secondary/10 rounded-lg hover:bg-secondary/20 text-blue-600 dark:text-blue-400">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(role._id)} className="p-2 bg-secondary/10 rounded-lg hover:bg-secondary/20 text-red-600 dark:text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                            {/* Allow editing permissions for default roles excluding Super Admin */}
                            {['ADMIN', 'CLIENT', 'TRANSLATOR'].includes(role.name) && (
                                <button onClick={() => handleEdit(role)} className="p-2 bg-secondary/10 rounded-lg hover:bg-secondary/20 text-blue-600 dark:text-blue-400">
                                    <Edit2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-xl ${role.name === 'SUPER_ADMIN' ? 'bg-red-500/20 text-red-600 dark:text-red-500' : 'bg-blue-500/20 text-blue-600 dark:text-blue-500'}`}>
                                {role.name === 'SUPER_ADMIN' ? <Shield size={24} /> : <Lock size={24} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{role.name}</h3>
                                <p className="text-sm text-muted">{role.description}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Permissions</h4>
                            <div className="flex flex-wrap gap-2">
                                {role.permissions.includes('*') ? (
                                    <span className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded border border-red-500/20">
                                        ALL ACCESS
                                    </span>
                                ) : (
                                    role.permissions.slice(0, 5).map(p => (
                                        <span key={p} className="px-2 py-1 bg-secondary/5 text-muted text-xs rounded border border-glass-border">
                                            {p}
                                        </span>
                                    ))
                                )}
                                {role.permissions.length > 5 && (
                                    <span className="px-2 py-1 bg-secondary/5 text-muted text-xs rounded">
                                        +{role.permissions.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl"
                    >
                        <GlassCard className="p-8 bg-surface">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {editingRole ? 'Edit Role' : 'Create New Role'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-foreground">
                                    <X size={24} />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Role Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!!editingRole && ['SUPER_ADMIN', 'ADMIN', 'CLIENT', 'TRANSLATOR'].includes(editingRole.name)}
                                        className="w-full bg-secondary/5 border border-glass-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                        placeholder="e.g. EDITOR"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-secondary/5 border border-glass-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500"
                                        placeholder="Brief description of the role"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted mb-4">Permissions</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 bg-secondary/5 rounded-xl border border-glass-border">
                                        {PERMISSIONS_LIST.map(perm => (
                                            <label key={perm} className="flex items-center gap-3 p-2 rounded hover:bg-secondary/5 cursor-pointer transition-colors">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedPermissions.includes(perm) ? 'bg-blue-600 border-blue-600' : 'border-glass-border'}`}>
                                                    {selectedPermissions.includes(perm) && <Check size={14} className="text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedPermissions.includes(perm)}
                                                    onChange={() => togglePermission(perm)}
                                                    disabled={editingRole?.name === 'SUPER_ADMIN'}
                                                />
                                                <span className="text-muted font-mono text-sm">{perm}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 rounded-xl text-muted hover:bg-secondary/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all"
                                    >
                                        {editingRole ? 'Save Changes' : 'Create Role'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
