import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { GlassCard } from '../../components/GlassCard';
import { useAuthStore } from '../../store/useAuthStore';
import { Languages, Plus, Trash2, Save, X, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { Skeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/Pagination';
import { formatNumber } from '../../utils/formatNumber';


interface Language {
    _id: string;
    name: string;
    code: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
}

export const LanguagesPage = () => {
    const { token } = useAuthStore();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLang, setEditingLang] = useState<Language | null>(null);

    // Pagination and filter state
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(12); // Default to 12

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1); // Reset to first page
    };

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        nativeName: '',
        direction: 'ltr' as 'ltr' | 'rtl'
    });

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        setIsFetching(true);
        try {
            const res = await api.get('/languages');
            setLanguages(res.data);
        } catch (error) {
            console.error('Failed to fetch languages');
        } finally {
            setIsFetching(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This may affect projects using this language.')) return;
        try {
            await api.delete(`/languages/${id}`);
            setLanguages(languages.filter(l => l._id !== id));
            toast.success('Language deleted');

            // Adjust page if needed after deletion
            const newTotalPages = Math.ceil((languages.length - 1) / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        } catch (error) {
            toast.error('Failed to delete language');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingLang) {
                const res = await api.put(`/languages/${editingLang._id}`, formData);
                setLanguages(languages.map(l => l._id === editingLang._id ? res.data : l));
                toast.success('Language updated');
            } else {
                const res = await api.post('/languages', formData);
                setLanguages([...languages, res.data]);
                toast.success('Language added');
            }
            closeModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (lang?: Language) => {
        if (lang) {
            setEditingLang(lang);
            setFormData({ name: lang.name, code: lang.code, nativeName: lang.nativeName, direction: lang.direction });
        } else {
            setEditingLang(null);
            setFormData({ name: '', code: '', nativeName: '', direction: 'ltr' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLang(null);
    };

    // Filter languages by selected letter
    const filteredLanguages = selectedLetter
        ? languages.filter(lang => lang.name.toUpperCase().startsWith(selectedLetter))
        : languages;

    // Pagination calculations
    const totalPages = Math.ceil(filteredLanguages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLanguages = filteredLanguages.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.min(Math.max(1, page), totalPages));
    };

    // Handle letter filter
    const handleLetterFilter = (letter: string | null) => {
        setSelectedLetter(letter);
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Generate alphabet (A-Z)
    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    // Get available first letters from languages
    const availableLetters = new Set(
        languages.map(lang => lang.name.charAt(0).toUpperCase())
    );

    // Generate smart pagination numbers (max 5 visible)
    const generatePageNumbers = () => {
        const maxVisible = 5;
        const pages: (number | 'ellipsis')[] = [];

        if (totalPages <= maxVisible) {
            // Show all pages
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            pages.push('ellipsis');
        }

        // Show current page and neighbors
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('ellipsis');
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Languages size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-foreground font-outfit">Languages</h1>
                            <span className="px-3 py-1 rounded-full bg-secondary/10 border border-glass-border text-xs font-mono text-muted">
                                {formatNumber(filteredLanguages.length)}
                            </span>
                        </div>
                        <p className="text-muted text-sm">Manage supported languages for the system.</p>
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    <span>Add Language</span>
                </button>
            </div>

            {/* Alphabet Filter Bar */}
            <GlassCard className="p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => handleLetterFilter(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedLetter === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-secondary/10 text-muted hover:bg-secondary/20 hover:text-foreground'
                            }`}
                    >
                        All
                    </button>
                    {alphabet.map(letter => (
                        <button
                            key={letter}
                            onClick={() => handleLetterFilter(letter)}
                            disabled={!availableLetters.has(letter)}
                            className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedLetter === letter
                                ? 'bg-blue-600 text-white'
                                : availableLetters.has(letter)
                                    ? 'bg-secondary/10 text-foreground hover:bg-secondary/20'
                                    : 'bg-secondary/5 text-muted/50 cursor-not-allowed'
                                }`}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            </GlassCard>

            {/* Language Count Info */}
            {selectedLetter && (
                <div className="text-sm text-muted">
                    Showing {filteredLanguages.length} language{filteredLanguages.length !== 1 ? 's' : ''} starting with "{selectedLetter}"
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isFetching ? (
                    Array.from({ length: 9 }).map((_, i) => (
                        <GlassCard key={i} className="p-5 flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-24 rounded" />
                                <Skeleton className="h-4 w-32 rounded" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </GlassCard>
                    ))
                ) : currentLanguages.length > 0 ? (
                    currentLanguages.map(lang => (
                        <GlassCard key={lang._id} hoverEffect={true} className="p-5 flex justify-between items-center group">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-foreground text-lg">{lang.nativeName}</span>
                                    <span className="text-xs bg-secondary/10 px-2 py-0.5 rounded text-muted border border-glass-border">{lang.code}</span>
                                </div>
                                <div className="text-sm text-muted">{lang.name} ({lang.direction})</div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(lang)} className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400 transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(lang._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </GlassCard>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted">
                        {selectedLetter
                            ? `No languages found starting with "${selectedLetter}"`
                            : 'No languages found. Add your first language!'
                        }
                    </div>
                )}
            </div>

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
                                    <h2 className="text-xl font-bold text-foreground">
                                        {editingLang ? 'Edit Language' : 'Add New Language'}
                                    </h2>
                                    <button onClick={closeModal} className="text-muted hover:text-foreground">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm text-muted block mb-1">English Name</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Arabic"
                                            className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted block mb-1">Native Name</label>
                                        <input
                                            required
                                            value={formData.nativeName}
                                            onChange={e => setFormData({ ...formData, nativeName: e.target.value })}
                                            placeholder="e.g. العربية"
                                            className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-muted block mb-1">ISO Code</label>
                                            <input
                                                required
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                placeholder="e.g. ar"
                                                className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted block mb-1">Direction</label>
                                            <select
                                                value={formData.direction}
                                                onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'ltr' | 'rtl' })}
                                                className="w-full bg-secondary/5 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="ltr" className="bg-surface text-foreground">LTR</option>
                                                <option value="rtl" className="bg-surface text-foreground">RTL</option>
                                            </select>

                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2"
                                        >
                                            <Save size={18} />
                                            {isLoading ? 'Saving...' : 'Save Language'}
                                        </button>
                                    </div>
                                </form>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
};
