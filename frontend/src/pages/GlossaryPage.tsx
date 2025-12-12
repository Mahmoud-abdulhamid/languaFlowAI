import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { SearchableSelect } from '../components/SearchableSelect';
import { useAuthStore } from '../store/useAuthStore';
import { useSystemStore } from '../store/useSystemStore';
import { BookOpen, Search, Plus, Edit2, Trash2, Filter, X, Save, Sparkles, Zap, ArrowRight, Loader2, StopCircle } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Pagination } from '../components/Pagination';
import { formatNumber } from '../utils/formatNumber';

export const GlossaryPage = () => {
    const { user } = useAuthStore();
    const [terms, setTerms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(12); // Default to 12 items per page
    const [filters, setFilters] = useState({ search: '', sourceLang: '', targetLang: '' });

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setLimit(size);
        setPage(1); // Reset to first page
    };

    // Dynamic Lists
    // Dynamic Lists
    const DEFAULT_LANGS = ['en', 'ar', 'fr', 'es', 'de', 'it', 'ru', 'zh', 'ja'];
    const [languages, setLanguages] = useState<any[]>([]);

    // Bulk Gen State
    const [isGenerating, setIsGenerating] = useState(false);
    const [bulk, setBulk] = useState({ source: '', target: '', count: 1000 });
    const [stats, setStats] = useState<any>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState<any>(null);
    const [formData, setFormData] = useState({ term: '', translation: '', sourceLang: '', targetLang: '', context: '' });

    const fetchLanguages = async () => {
        try {
            const res = await api.get('/languages');
            setLanguages(res.data);
        } catch (error) {
            console.error('Failed to load languages');
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/glossaries/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to load stats');
        }
    };

    const fetchTerms = async () => {
        setLoading(true);
        try {
            const params = { ...filters, page, limit };
            const res = await api.get('/glossaries', { params });
            setTerms(res.data.terms);
            setTotalPages(res.data.pages);
        } catch (error) {
            toast.error('Failed to load glossary');
        } finally {
            setLoading(false);
        }
    };

    const { settings: systemSettings, fetchSettings: fetchSystemSettings } = useSystemStore();
    const [currentJob, setCurrentJob] = useState<any>(null);

    useEffect(() => {
        fetchSystemSettings();
        fetchLanguages();
        fetchStats();
    }, []);

    // ... existing ...

    // Polling for Job Status
    useEffect(() => {
        let interval: any;
        if (isGenerating && currentJob?._id) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/glossaries/generate/${currentJob._id}`);
                    const job = res.data;
                    setCurrentJob(job);

                    if (job.status === 'COMPLETED') {
                        setIsGenerating(false);
                        toast.success(`Bulk Generation Completed: ${job.generatedCount} terms!`);
                        fetchTerms();
                        fetchStats();
                    } else if (job.status === 'STOPPED') {
                        setIsGenerating(false);
                        toast.error('Bulk Generation Stopped by user.');
                        fetchTerms();
                    } else if (job.status === 'FAILED') {
                        setIsGenerating(false);
                        toast.error(`Bulk Generation Failed: ${job.error}`);
                    }
                } catch (error) {
                    console.error('Polling Error', error);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isGenerating, currentJob?._id]);

    const handleBulkGenerate = async () => {
        if (!bulk.source || !bulk.target) return;

        // Check Setting
        if (systemSettings.enable_ai_glossary_gen === false && user?.role !== 'SUPER_ADMIN') {
            toast.error('AI Bulk Generation is currently disabled by Administrator.');
            return;
        }

        setIsGenerating(true);
        setCurrentJob(null); // Reset
        try {
            const res = await api.post('/glossaries/generate', {
                sourceLang: bulk.source,
                targetLang: bulk.target,
                count: Number(bulk.count)
            });

            setCurrentJob({ _id: res.data.jobId, status: 'PENDING', generatedCount: 0, targetCount: Number(bulk.count) });
            toast.success('Bulk Generation Started...');
        } catch (error: any) {
            console.error(error);
            setIsGenerating(false);
            toast.error(error.response?.data?.message || 'Failed to start generation');
        }
    };

    const handleStopGeneration = async () => {
        if (!currentJob?._id) return;
        try {
            await api.post(`/glossaries/generate/${currentJob._id}/stop`);
            toast.loading('Stopping generation...');
            // Polling will catch the STOPPED status update
        } catch (error) {
            toast.error('Failed to stop generation');
        }
    };

    useEffect(() => {
        fetchLanguages();
        fetchStats();
    }, []);

    useEffect(() => {
        const bounce = setTimeout(fetchTerms, 500);
        return () => clearTimeout(bounce);
    }, [filters, page]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTerm) {
                await api.put(`/glossaries/${editingTerm._id}`, formData);
                toast.success('Term updated');
            } else {
                await api.post('/glossaries', { ...formData, projectId: null }); // Global term if null? Or force select project?
                toast.success('Term created');
            }
            setIsModalOpen(false);
            setEditingTerm(null);
            setFormData({ term: '', translation: '', sourceLang: '', targetLang: '', context: '' });
            fetchTerms();
            fetchLanguages(); // Refresh languages in case new ones were added
        } catch (error) {
            toast.error('Failed to save term');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/glossaries/${id}`);
            toast.success('Term deleted');
            fetchTerms();
            fetchLanguages();
        } catch (error) {
            toast.error('Failed to delete term');
        }
    };

    const openEdit = (term: any) => {
        setEditingTerm(term);
        setFormData({
            term: term.term,
            translation: term.translation,
            sourceLang: term.sourceLang,
            targetLang: term.targetLang,
            context: term.context || ''
        });
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingTerm(null);
        setFormData({ term: '', translation: '', sourceLang: 'en', targetLang: 'ar', context: '' });
        setIsModalOpen(true);
    };

    const getLanguageName = (code: string) => {
        try {
            return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code;
        } catch (e) {
            return code;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-foreground flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold font-outfit text-foreground">Glossary</h1>
                            <span className="px-3 py-1 rounded-full bg-secondary/10 border border-glass-border text-xs font-mono text-muted">
                                {formatNumber(stats?.total || 0)}
                            </span>
                        </div>
                    </h1>
                    <p className="text-muted mt-2">Manage terminology and global dictionary.</p>
                </div>
                <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20">
                    <Plus size={20} /> Add Term
                </button>
            </div>

            {/* Bulk Generator */}
            {systemSettings.enable_ai_glossary_gen && (
                <GlassCard className="p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Sparkles size={20} />
                                <span className="font-semibold text-lg">AI Bulk Generator</span>
                            </div>
                            <span className="text-muted text-sm border-l border-glass-border pl-4">Generate terms in bulk using AI</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-[180px]">
                                <SearchableSelect
                                    value={bulk.source}
                                    onChange={(val) => setBulk({ ...bulk, source: val as string })}
                                    options={languages.map(l => ({ value: l.code, label: l.name }))}
                                    placeholder="Source Lang"
                                />
                            </div>
                            <div className="text-muted"><ArrowRight size={16} /></div>
                            <div className="w-[180px]">
                                <SearchableSelect
                                    value={bulk.target}
                                    onChange={(val) => setBulk({ ...bulk, target: val as string })}
                                    options={languages.map(l => ({ value: l.code, label: l.name }))}
                                    placeholder="Target Lang"
                                />
                            </div>
                            <div className="w-[100px]">
                                <input
                                    type="number"
                                    min="1"
                                    max="5000"
                                    value={bulk.count}
                                    onChange={(e) => setBulk({ ...bulk, count: parseInt(e.target.value) || 1000 })}
                                    className="w-full bg-secondary/5 border border-glass-border rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-foreground"
                                    placeholder="Qty"
                                />
                            </div>
                            {isGenerating ? (
                                <button
                                    onClick={handleStopGeneration}
                                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all animate-pulse"
                                >
                                    <StopCircle size={20} />
                                    Stop ({currentJob?.generatedCount || 0}/{currentJob?.targetCount || bulk.count})
                                </button>
                            ) : (
                                <button
                                    onClick={handleBulkGenerate}
                                    disabled={(!systemSettings.enable_ai_glossary_gen && user?.role !== 'SUPER_ADMIN') || !bulk.source || !bulk.target}
                                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
                                    title={!systemSettings.enable_ai_glossary_gen ? 'Feature Disabled by Admin' : ''}
                                >
                                    <Zap size={20} />
                                    Generate
                                </button>
                            )}
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Language Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    {Object.entries(stats.byLanguage || {}).map(([langCode, count]) => (
                        <GlassCard key={langCode} className="p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted uppercase font-bold">{langCode}</span>
                                <span className="text-lg font-bold text-foreground">{count as number} terms</span>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </GlassCard>
                    ))}
                    <GlassCard className="p-3 flex items-center justify-between bg-blue-500/10 border-blue-500/30">
                        <div className="flex flex-col">
                            <span className="text-xs text-blue-400 uppercase font-bold">Total</span>
                            <span className="text-lg font-bold text-blue-400">{stats.total} terms</span>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Filters */}
            <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            className="w-full bg-secondary/5 border border-glass-border rounded-lg pl-10 pr-4 py-2 outline-none focus:border-blue-500 text-foreground"
                            placeholder="Search terms..."
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="w-[240px]">
                            <SearchableSelect
                                value={filters.sourceLang}
                                onChange={(val) => setFilters({ ...filters, sourceLang: val as string })}
                                options={[
                                    { value: '', label: 'All Source' },
                                    ...languages.map(l => ({ value: l.code, label: l.name }))
                                ]}
                                placeholder="Source"
                            />
                        </div>
                        <div className="w-[240px]">
                            <SearchableSelect
                                value={filters.targetLang}
                                onChange={(val) => setFilters({ ...filters, targetLang: val as string })}
                                options={[
                                    { value: '', label: 'All Target' },
                                    ...languages.map(l => ({ value: l.code, label: l.name }))
                                ]}
                                placeholder="Target"
                            />
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="py-8 text-center text-muted">Loading...</div>
                ) : terms.length === 0 ? (
                    <div className="py-8 text-center text-muted">No terms found.</div>
                ) : (
                    terms.map(term => (
                        <GlassCard key={term._id} className="p-4 relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => openEdit(term)} className="p-1.5 text-blue-500 bg-blue-500/10 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(term._id)} className="p-1.5 text-red-500 bg-red-500/10 rounded"><Trash2 size={16} /></button>
                            </div>

                            <div className="pr-16">
                                <div className="font-bold text-foreground text-lg mb-1">{term.term}</div>
                                <div className="text-blue-500 mb-2 font-medium" dir="rtl">{term.translation}</div>

                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs px-2 py-1 rounded bg-secondary/10 text-muted border border-glass-border">
                                        {getLanguageName(term.sourceLang)} → {getLanguageName(term.targetLang)}
                                    </span>
                                </div>

                                {term.context && (
                                    <div className="text-sm text-muted/70 italic border-l-2 border-glass-border pl-2">
                                        {term.context}
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-secondary/5 border border-glass-border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary/5 border-b border-glass-border font-medium text-muted">
                        <tr>
                            <th className="p-4">Term</th>
                            <th className="p-4">Translation</th>
                            <th className="p-4">Languages</th>
                            <th className="p-4">Context</th>
                            <th className="p-4 w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted">Loading...</td></tr>
                        ) : terms.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted">No terms found.</td></tr>
                        ) : (
                            terms.map(term => (
                                <tr key={term._id} className="hover:bg-secondary/5 transition-colors group">
                                    <td className="p-4 font-medium text-foreground">{term.term}</td>
                                    <td className="p-4 text-blue-600 dark:text-blue-400">{term.translation}</td>
                                    <td className="p-4">
                                        <span className="text-xs px-2 py-1 rounded bg-secondary/10 text-muted border border-glass-border">
                                            {getLanguageName(term.sourceLang)} → {getLanguageName(term.targetLang)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-muted line-clamp-1 max-w-[200px] truncate" title={term.context || ''}>{term.context || '-'}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(term)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(term._id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative glass-card border border-glass-border rounded-2xl p-6 w-full max-w-md shadow-2xl bg-surface"
                        >
                            <h2 className="text-xl font-bold mb-4 text-foreground">{editingTerm ? 'Edit Term' : 'Add New Term'}</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted block mb-1">Source Lang</label>
                                        <SearchableSelect
                                            value={formData.sourceLang}
                                            onChange={(val) => setFormData({ ...formData, sourceLang: val as string })}
                                            options={languages.map(l => ({ value: l.code, label: l.name }))}
                                            placeholder="Select Source"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted block mb-1">Target Lang</label>
                                        <SearchableSelect
                                            value={formData.targetLang}
                                            onChange={(val) => setFormData({ ...formData, targetLang: val as string })}
                                            options={languages.map(l => ({ value: l.code, label: l.name }))}
                                            placeholder="Select Target"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-muted block mb-1">Source Term</label>
                                    <input
                                        className="w-full bg-secondary/5 border border-glass-border rounded p-2 text-base focus:border-blue-500 outline-none text-foreground"
                                        value={formData.term}
                                        onChange={e => setFormData({ ...formData, term: e.target.value })}
                                        required
                                        placeholder="e.g. Artificial Intelligence"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted block mb-1">Translation</label>
                                    <input
                                        className="w-full bg-secondary/5 border border-glass-border rounded p-2 text-base focus:border-blue-500 outline-none text-foreground"
                                        value={formData.translation}
                                        onChange={e => setFormData({ ...formData, translation: e.target.value })}
                                        required
                                        dir="rtl"
                                        placeholder="e.g. الذكاء الاصطناعي"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted block mb-1">Context / Domain (Optional)</label>
                                    <textarea
                                        className="w-full bg-secondary/5 border border-glass-border rounded p-2 text-sm focus:border-blue-500 outline-none min-h-[80px] text-foreground"
                                        value={formData.context}
                                        onChange={e => setFormData({ ...formData, context: e.target.value })}
                                        placeholder="Add definition or usage notes..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-muted hover:text-foreground transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20">Save Term</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
};
