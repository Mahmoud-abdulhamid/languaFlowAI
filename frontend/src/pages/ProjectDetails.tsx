import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSystemStore } from '../store/useSystemStore';
import { useUserListStore } from '../store/useUserListStore';
import { GlassCard } from '../components/GlassCard';
import { Skeleton } from '../components/ui/Skeleton';
import { PROJECT_DOMAINS } from '../constants/domains';
import { SmartDeadlineWidget } from '../components/SmartDeadlineWidget';
import { SearchableSelect } from '../components/SearchableSelect';
import { ProjectNotes } from '../components/ProjectNotes';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import JSConfetti from 'js-confetti';
import {
    ArrowLeft,
    FileText,
    Download,
    Trash2,
    X,
    Save,
    Upload,
    Edit2,
    DollarSign,
    Users,
    Plus,
    PackageCheck,
    PackageOpen
} from 'lucide-react';

export const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeProject: project, fetchProject, isLoading, error, assignTranslator, removeTranslator, updateStatus, deleteProject, addProjectFiles, updateProjectDetails } = useProjectStore();
    const { user, token } = useAuthStore();
    const { settings } = useSystemStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', deadline: '', domain: 'General' });

    const normalizedRole = user?.role?.toUpperCase() || '';
    const isTranslator = normalizedRole === 'TRANSLATOR';
    const isClient = normalizedRole === 'CLIENT';
    const isAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';

    // Local state for Admin Assign Translator
    const [translators, setTranslators] = useState<any[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [selectedTranslator, setSelectedTranslator] = useState('');
    const { clients, fetchClients } = useUserListStore();

    // Progress State
    const [progress, setProgress] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchProject(id);
            fetchProgress();
        }
    }, [id, fetchProject]);

    useEffect(() => {
        if (project) {
            setEditForm({
                title: project.title,
                description: project.description || '',
                deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
                domain: project.domain || 'General'
            });
        }
    }, [project]);

    const fetchProgress = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/projects/${id}/progress`);
            setProgress(res.data);
        } catch (err) {
            console.error('Failed to fetch progress', err);
        }
    };

    const fetchTranslators = async () => {
        try {
            const res = await api.get('/users/translators');
            setTranslators(res.data);
            setIsAssigning(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssign = async () => {
        if (!id || !selectedTranslator) return;
        try {
            await assignTranslator(id, selectedTranslator);
            setIsAssigning(false);
            setSelectedTranslator('');
            toast.success('Translator assigned successfully');
        } catch (e) {
            toast.error('Failed to assign translator');
        }
    };

    const handleSaveDetails = async () => {
        if (!project) return;
        try {
            await updateProjectDetails(project.id, editForm);
            setIsEditing(false);
            toast.success('Project details updated');
        } catch (err: any) {
            toast.error('Failed to update details');
        }
    };

    const handleDelete = async () => {
        if (!project) return;
        if (project.status !== 'DRAFT') {
            toast.error('Project status must be DRAFT to delete it. Please change status first.');
            return;
        }
        if (!id || !window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await deleteProject(id);
            navigate('/projects');
            toast.success('Project deleted successfully');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to delete project');
        }
    };

    const handleDownload = async () => {
        if (!id || !project) return;
        toast.promise(
            api.get(`/projects/${id}/download`, {
                responseType: 'blob'
            }).then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${project.title.toLowerCase()}_files.zip`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }),
            {
                loading: 'Preparing files for download...',
                success: 'Download started!',
                error: 'Failed to download files',
            }
        );
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await updateStatus(project!.id, newStatus);
            if (newStatus === 'COMPLETED') {
                const jsConfetti = new JSConfetti();
                jsConfetti.addConfetti({
                    emojis: ['🎉', '✨', '🏆', '🚀'],
                    confettiNumber: 100,
                });
                toast.success('Project Completed! Achievement Unlocked? 🏆');
            } else {
                toast.success('Status updated');
            }
        } catch (err: any) {
            toast.error('Failed to update status');
        }
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return 'bg-green-500 text-green-600 dark:text-green-400';
        if (percent >= 50) return 'bg-blue-500 text-blue-600 dark:text-blue-400';
        return 'bg-yellow-500 text-yellow-600 dark:text-yellow-400';
    };

    if (isLoading) return (
        <div className="min-h-screen pt-24 px-4 md:px-8 max-w-7xl mx-auto space-y-6 text-foreground">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
    if (error || !project) return <div className="min-h-screen text-foreground flex items-center justify-center">Project not found</div>;

    return (
        <div className="min-h-screen text-foreground p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4">
                <ArrowLeft size={20} /> Back to Projects
            </button>

            {/* Project Header - Full Width */}
            <GlassCard className="p-4 md:p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="space-y-4 bg-secondary/5 p-4 rounded-xl border border-glass-border max-w-2xl">
                                <input
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full bg-transparent border-b border-glass-border p-2 text-2xl font-bold focus:border-blue-500 outline-none text-foreground"
                                    placeholder="Project Title"
                                />
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full bg-transparent border border-glass-border rounded-lg p-3 focus:border-blue-500 outline-none min-h-[100px] text-foreground"
                                    placeholder="Description..."
                                />
                                <div>
                                    <label className="text-xs text-muted block mb-1">Domain</label>
                                    <select
                                        value={editForm.domain}
                                        onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                                        className="w-full bg-secondary/5 border border-glass-border rounded-lg p-2 text-foreground focus:border-blue-500 outline-none appearance-none"
                                    >
                                        {(useSystemStore.getState().settings.project_domains || PROJECT_DOMAINS).map((d: string) => (
                                            <option key={d} value={d} className="bg-surface text-foreground">{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-muted block mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={editForm.deadline}
                                        onChange={e => setEditForm({ ...editForm, deadline: e.target.value })}
                                        className="bg-secondary/5 border border-glass-border rounded p-2 text-sm text-foreground"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-secondary/10 rounded text-muted hover:text-foreground"><X size={20} /></button>
                                    <button onClick={handleSaveDetails} className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white"><Save size={20} /></button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground">{project.title}</h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                            ${project.status === 'COMPLETED' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                                            project.status === 'ACTIVE' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                                                project.status === 'REVIEW' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                                                    'bg-secondary/20 text-muted'}`}>
                                        {project.status}
                                    </span>
                                    {/* Domain Tag */}
                                    {/* @ts-ignore */}
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {/* @ts-ignore */}
                                        {project.domain || 'General'}
                                    </span>
                                    {(isAdmin || ((project as any).clientId?._id === user?.id || (project as any).clientId === user?.id)) && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-muted hover:text-foreground transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                </div>
                                {project.description && (
                                    <p className="text-muted/80 mb-4 max-w-2xl leading-relaxed whitespace-pre-wrap">{project.description}</p>
                                )}
                                <div className="flex gap-4 text-muted text-sm">
                                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                    {project.deadline && <span>• Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0 w-full md:w-auto">
                        {/* Status Select */}
                        <div className="min-w-[150px]">
                            <select
                                value={project.status}
                                onChange={(e) => handleUpdateStatus(e.target.value)}
                                className="w-full bg-white dark:bg-secondary/20 border border-gray-200 dark:border-glass-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-foreground focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            >
                                <option value="DRAFT" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">DRAFT</option>
                                <option value="ACTIVE" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">ACTIVE</option>
                                <option value="REVIEW" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">REVIEW</option>
                                <option value="COMPLETED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">COMPLETED</option>
                            </select>
                        </div>

                        {(isAdmin || isClient) && (
                            <button onClick={handleDownload} className="px-4 py-2 bg-secondary/5 border border-glass-border rounded-lg text-muted hover:text-foreground flex items-center gap-2">
                                <Download size={18} />
                                <span className="hidden sm:inline">Download Files</span>
                            </button>
                        )}
                        {isAdmin && (
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/20 flex items-center gap-2">
                                <Trash2 size={18} />
                                <span className="hidden sm:inline">Delete Project</span>
                            </button>
                        )}
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Stats, Files, Notes */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats & Files Section */}
                    <GlassCard className="p-4 md:p-6 md:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-secondary/5 border border-glass-border">
                                <div className="text-muted text-xs mb-1">Total Words</div>
                                <div className="text-2xl font-bold text-foreground font-outfit">
                                    {project.files.reduce((acc: number, f: any) => acc + (f.wordCount || 0), 0) || '0'}
                                </div>
                            </div>
                            {(isClient || isAdmin) && (
                                <div className="p-4 md:p-6 my-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-foreground">Estimated Cost</div>
                                            <div className="text-xs text-muted">Based on word count</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-green-600 dark:text-green-400 font-outfit">
                                        ${(project.files.reduce((acc: number, f: any) => acc + (f.wordCount || 0), 0) * 0.08).toFixed(2)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                                    Project Files
                                </h3>
                                {((isAdmin || isClient) && (project.status === 'DRAFT' || project.status === 'ACTIVE')) && (
                                    <div>
                                        <input
                                            type="file"
                                            id="add-files"
                                            multiple
                                            className="hidden"
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    const formData = new FormData();
                                                    Array.from(e.target.files).forEach(file => formData.append('files', file));
                                                    try {
                                                        // @ts-ignore
                                                        await addProjectFiles(project.id, formData);
                                                        toast.success('Files added successfully');
                                                    } catch (err: any) {
                                                        toast.error('Failed to add files');
                                                    }
                                                    e.target.value = ''; // Reset
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="add-files"
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20"
                                        >
                                            <Upload size={14} /> Add Files
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                {project.files.length === 0 ? (
                                    <div className="text-muted text-sm p-4 text-center border border-dashed border-glass-border rounded-xl">No files uploaded.</div>
                                ) : (
                                    project.files.map((file: any, i: number) => (
                                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-secondary/5 border border-glass-border hover:border-glass-border/70 transition-colors gap-4">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-foreground">{file.originalName}</div>
                                                    <div className="text-xs text-muted">{file.wordCount} words</div>

                                                    {/* File Progress - Visible to ALL */}
                                                    {progress && progress.files[i] && (
                                                        <div className="mt-2 w-full max-w-[200px]">
                                                            <div className="flex justify-between text-[10px] text-muted mb-1">
                                                                <span>Progress</span>
                                                                <span>{progress.files[i].percent}%</span>
                                                            </div>
                                                            <div className="w-full bg-secondary/20 rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(progress.files[i].percent)}`}
                                                                    style={{ width: `${progress.files[i].percent}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {/* Export Text Buttons - For Translator/Admin/Client */}
                                                {(isAdmin || isTranslator || isClient) && progress && progress.files[i] && progress.files[i].completed > 0 && (
                                                    <div className="flex gap-1">
                                                        {project.targetLangs.map((lang: string) => (
                                                            <button
                                                                key={lang}
                                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/projects/${project.id}/files/${i}/export?token=${token}&targetLang=${lang}`, '_blank')}
                                                                className="flex items-center gap-1 px-2 py-1 bg-secondary/10 hover:bg-secondary/20 rounded text-xs text-muted hover:text-foreground transition-colors border border-glass-border"
                                                                title={`Export Translated Text (${lang.toUpperCase()})`}
                                                            >
                                                                <FileText size={12} />
                                                                <span className="uppercase">{lang}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {(isAdmin || isClient) && (
                                                    <button
                                                        onClick={async () => {
                                                            if (project.status !== 'DRAFT') {
                                                                toast.error('Project status must be DRAFT to delete files.');
                                                                return;
                                                            }
                                                            if (window.confirm(`Delete file ${file.originalName}?`)) {
                                                                try {
                                                                    // @ts-ignore
                                                                    await useProjectStore.getState().deleteProjectFile(project.id, i);
                                                                    toast.success('File deleted');
                                                                } catch (e: any) {
                                                                    toast.error(e.response?.data?.message || 'Failed to delete file');
                                                                }
                                                            }
                                                        }}
                                                        className="p-1.5 text-muted hover:text-red-600 dark:text-red-400 rounded transition-colors"
                                                        title="Delete File"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}

                                                {(isTranslator || isAdmin) && project.status !== 'COMPLETED' && (
                                                    <button
                                                        onClick={() => navigate(`/editor/${project.id}/${i}`)}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors"
                                                    >
                                                        Translate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {(isAdmin || isTranslator || isClient) && settings.notes_system_enabled === true && (
                        <ProjectNotes projectId={id!} />
                    )}
                </div>

                {/* Right Column: Widgets */}
                <div className="space-y-6">
                    {/* Smart Deadline Widget */}
                    <SmartDeadlineWidget deadline={project.deadline} status={project.status} />

                    {/* Progress Widget */}
                    {progress && (
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                                Project Progress
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-muted">Overall Completion</div>
                                    <div className={`text-2xl font-bold font-outfit ${getProgressColor(progress.overall.percent).replace('bg-', 'text-')}`}>{progress.overall.percent}%</div>
                                </div>
                                <div className="w-full bg-secondary/20 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(progress.overall.percent)}`}
                                        style={{ width: `${progress.overall.percent}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-muted">
                                    <span>{progress.overall.completed}/{progress.overall.total} segments</span>
                                    <span>{progress.overall.confirmed} confirmed</span>
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Team Widget */}
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Users size={20} className="text-purple-600 dark:text-purple-400" />
                            Team
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs text-muted mb-2 uppercase tracking-wide flex justify-between">
                                    Client
                                    {isAdmin && (
                                        <button
                                            onClick={() => {
                                                if (!isEditingClient) fetchClients();
                                                setIsEditingClient(!isEditingClient);
                                            }}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-300 text-xs"
                                        >
                                            {isEditingClient ? 'Cancel' : 'Edit'}
                                        </button>
                                    )}
                                </div>
                                {isEditingClient ? (
                                    <div className="flex gap-2">
                                        <SearchableSelect
                                            value={(project as any).clientId?._id || ''}
                                            onChange={async (val) => {
                                                try {
                                                    await api.put(`/projects/${id}/client`, { clientId: val });
                                                    fetchProject(id!);
                                                    setIsEditingClient(false);
                                                    toast.success('Client updated');
                                                } catch (err) {
                                                    toast.error('Failed to update client');
                                                }
                                            }}
                                            options={clients.map(c => ({ value: c._id, label: c.name, avatar: c.avatar }))}
                                            placeholder="Select Client"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                                            {(project as any).clientId?.name?.charAt(0) || 'C'}
                                        </div>
                                        <div className="text-sm text-foreground">{(project as any).clientId?.name || 'Unknown Client'}</div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs text-muted uppercase tracking-wide">Assigned Translators</div>
                                    {(!isAssigning && (isAdmin || (isClient && useSystemStore.getState().settings.allow_client_assign_translators))) && (
                                        <button onClick={fetchTranslators} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                            <Plus size={12} /> Add
                                        </button>
                                    )}
                                </div>

                                {isAssigning && (
                                    <div className="mb-4 bg-secondary/5 p-3 rounded-lg border border-glass-border relative z-50">
                                        <SearchableSelect
                                            value={selectedTranslator}
                                            onChange={(val) => setSelectedTranslator(val as string)}
                                            placeholder="Select Translator..."
                                            options={translators
                                                .map(t => ({
                                                    value: t._id,
                                                    label: `${t.name} ${t.languages?.length ? `(${t.languages.map((l: any) => `${l.source}->${l.target}`).join(', ')})` : '(No languages set)'}`,
                                                    avatar: t.avatar,
                                                    email: t.email
                                                }))
                                            }
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={handleAssign} disabled={!selectedTranslator} className="flex-1 bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-500 disabled:opacity-50">Assign</button>
                                            <button onClick={() => setIsAssigning(false)} className="px-3 bg-secondary/10 text-foreground text-xs py-2 rounded hover:bg-secondary/20 border border-glass-border">Cancel</button>
                                        </div>
                                    </div>
                                )}


                                {(project as any).assignedTranslators && (project as any).assignedTranslators.length > 0 ? (
                                    <div className="space-y-2">
                                        {(project as any).assignedTranslators.map((t: any) => (
                                            <div key={t._id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/5 group">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                                    {t.name?.charAt(0) || 'T'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-foreground truncate">{t.name}</div>
                                                    <div className="text-xs text-muted truncate">{t.email}</div>
                                                </div>
                                                {(isAdmin || (isClient && useSystemStore.getState().settings.allow_client_assign_translators)) && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Remove ${t.name} from project?`)) {
                                                                removeTranslator(id!, t._id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-muted hover:text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Remove Translator"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted italic">No translators assigned yet</div>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Final Deliverables Widget */}
                    <GlassCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
                                    <PackageCheck size={20} className="text-green-600 dark:text-green-400" />
                                    Final Deliverables
                                </h2>
                                <p className="text-muted text-xs mt-1">Ready for delivery</p>
                            </div>
                            {(isAdmin || isTranslator) && (
                                <div className="relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files[0];
                                                const formData = new FormData();
                                                formData.append('files', file);
                                                toast.promise(
                                                    useProjectStore.getState().uploadDeliverable(project.id, formData),
                                                    {
                                                        loading: 'Uploading final file...',
                                                        success: 'Deliverable uploaded successfully!',
                                                        error: 'Failed to upload'
                                                    }
                                                );
                                            }
                                        }}
                                    />
                                    <button className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors" title="Upload Final Version">
                                        <Upload size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {project.deliverables && project.deliverables.length > 0 ? (
                            <div className="space-y-3">
                                {project.deliverables.map((file: any) => {
                                    const getFileUrl = (path: string) => {
                                        if (path.startsWith('http')) return path;
                                        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

                                        // Normalize path separators
                                        const normalized = path.replace(/\\/g, '/');
                                        // If it contains 'uploads/', take everything after it
                                        if (normalized.includes('uploads/')) {
                                            return `${baseUrl}/uploads/${normalized.split('uploads/')[1]}`;
                                        }
                                        // Fallback - assume relative
                                        const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
                                        return `${baseUrl}${cleanPath}`;
                                    };

                                    return (
                                        <div key={file._id} className="flex items-center justify-between p-3 bg-secondary/5 border border-glass-border rounded-xl hover:bg-secondary/10 transition-colors group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                                                    <PackageOpen size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-foreground truncate">{file.originalName}</div>
                                                    <div className="text-xs text-muted">{new Date(file.uploadedAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => window.open(getFileUrl(file.path), '_blank')}
                                                    className="p-1.5 text-muted hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Delete this deliverable?')) {
                                                                try {
                                                                    await useProjectStore.getState().deleteDeliverable(project.id, file._id);
                                                                    toast.success('Deleted');
                                                                } catch (e) {
                                                                    toast.error('Failed to delete');
                                                                }
                                                            }
                                                        }}
                                                        className="p-1.5 text-muted hover:text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-dashed border-glass-border rounded-xl">
                                <PackageOpen size={32} className="mx-auto text-muted mb-2" />
                                <div className="text-sm text-muted">No deliverables yet</div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
