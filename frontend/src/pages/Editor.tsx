import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store/useEditorStore';
import { ArrowLeft, Check, Sparkles, Loader2, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../store/useAuthStore';
import { GlossaryPanel } from '../components/GlossaryPanel';

import { useProjectStore } from '../store/useProjectStore';
import { useSystemStore } from '../store/useSystemStore';
import { toast } from 'react-hot-toast';
import { Skeleton } from '../components/ui/Skeleton';
import { GlossaryHighlighter } from '../components/GlossaryHighlighter';

export const Editor = () => {
    const { projectId, fileId } = useParams<{ projectId: string, fileId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isReadOnly = user?.role === 'CLIENT';

    const {
        segments, activeSegmentId, isLoading, isTranslatingAll, generatingAiSegmentIds,
        loadSegments, updateSegmentLocal, confirmSegment, generateAI, setActiveSegment,
        pagination, setPage, filterStatus, setFilterStatus
    } = useEditorStore();

    // Fetch project details for languages
    const { activeProject, fetchProject, glossaryTerms, fetchGlossary } = useProjectStore();
    const { settings, fetchSettings } = useSystemStore();
    useEffect(() => {
        fetchSettings();
        if (projectId) {
            fetchGlossary(projectId);
        }
    }, [projectId]);



    // Language State
    const [selectedTargetLang, setSelectedTargetLang] = React.useState<string>('');

    // Mock fileId if not passed
    const effectiveFileId = fileId || '0';

    // Initialize Language
    useEffect(() => {
        if (activeProject && activeProject.targetLangs?.length > 0 && !selectedTargetLang) {
            // Logic: If translator, pick matching language. If Admin/Client, pick first.
            let defaultLang = activeProject.targetLangs[0];

            if (user?.role === 'TRANSLATOR' && user.languages) {
                const match = user.languages.find((l: any) =>
                    l.source === activeProject.sourceLang && activeProject.targetLangs.includes(l.target)
                );
                if (match) defaultLang = match.target;
            }
            setSelectedTargetLang(defaultLang);
        }
    }, [activeProject, user, selectedTargetLang]);

    useEffect(() => {
        if (projectId && selectedTargetLang) {
            loadSegments(projectId, effectiveFileId, selectedTargetLang, pagination.page);
        }
        if (projectId) {
            fetchProject(projectId);
        }
    }, [projectId, effectiveFileId, selectedTargetLang, loadSegments, fetchProject, pagination.page, filterStatus]);

    const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (isReadOnly) return;
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            confirmSegment(id);
        }
    };

    // Poll for project updates (to check AI status)
    useEffect(() => {
        if (!projectId) return;
        const interval = setInterval(() => {
            fetchProject(projectId);
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [projectId, fetchProject]);

    // Active File Logic
    const activeFileIndex = parseInt(effectiveFileId);
    const activeFile = activeProject?.files?.[activeFileIndex];
    // Check if background translation is running for this file
    const isBackgroundTranslating = activeFile?.isTranslating === true;

    // Auto-Refresh Segments when Translation Completes
    const prevTranslating = React.useRef(isBackgroundTranslating);
    useEffect(() => {
        if (prevTranslating.current && !isBackgroundTranslating) {
            if (projectId && selectedTargetLang) {
                loadSegments(projectId, effectiveFileId, selectedTargetLang);
                toast.success('Refresh: New translations loaded', { icon: '🔄' });
            }
        }
        prevTranslating.current = isBackgroundTranslating;
    }, [isBackgroundTranslating, projectId, effectiveFileId, selectedTargetLang, loadSegments]);

    if (isLoading && !segments.length) return (
        <div className="min-h-screen bg-main flex flex-col pt-24 px-4 pb-4">
            <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto w-full">
                <Skeleton className="h-10 w-64 rounded-xl" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
                <div className="hidden lg:block space-y-4">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen overflow-hidden bg-main text-foreground flex flex-col font-inter">
            {/* Top Bar */}
            <header className="h-16 border-b border-glass-border bg-main/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-2 md:px-6">
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary/10 rounded-lg text-muted hover:text-foreground transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-gray-900 dark:text-white">{activeProject?.title || `Project #${projectId?.slice(-4)}`}</h1>
                            {activeFile && (
                                <>
                                    <span className="text-gray-400 dark:text-gray-600">/</span>
                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{activeFile.originalName}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-400">
                            <span className="uppercase">{activeProject?.sourceLang || '...'}</span>
                            <span>→</span>
                            {/* Language Selector */}
                            {activeProject?.targetLangs && activeProject.targetLangs.length > 1 ? (
                                <div className="min-w-[80px]">
                                    <select
                                        value={selectedTargetLang}
                                        onChange={(e) => setSelectedTargetLang(e.target.value)}
                                        className="w-full bg-transparent border-b border-gray-400 dark:border-white/20 text-xs uppercase text-gray-900 dark:text-primary focus:outline-none focus:border-purple-500 appearance-none cursor-pointer py-1"
                                    >
                                        {activeProject.targetLangs.map(lang => (
                                            <option key={lang} value={lang} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{lang}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <span className="uppercase">{selectedTargetLang || '...'}</span>
                            )}
                            <span>•</span>
                            <span>{segments.length} Segments</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status Filter */}
                    <div className="w-[180px]">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="w-full bg-white dark:bg-secondary/5 border border-gray-300 dark:border-glass-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-primary focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Segments</option>
                            <option value="UNTRANSLATED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Untranslated</option>
                            <option value="TRANSLATED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Translated</option>
                            <option value="CONFIRMED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Confirmed</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Clear Translations Button */}
                    {!isReadOnly && user?.role !== 'CLIENT' && (settings.enable_clear_translation !== false && String(settings.enable_clear_translation) !== 'false') && (
                        <button
                            disabled={isTranslatingAll || isBackgroundTranslating}
                            onClick={async () => {
                                if (window.confirm('DANGER: This will delete ALL translations for this file in the current language.\n\nAre you sure you want to Clear All?')) {
                                    try {
                                        // @ts-ignore
                                        await useEditorStore.getState().clearTranslations(projectId, effectiveFileId, selectedTargetLang);
                                        toast.success('Translations cleared successfully');
                                    } catch (e: any) {
                                        toast.error(e.response?.data?.message || 'Failed to clear translations');
                                    }
                                }
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Clear All Translations"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}

                    {/* AI Translate Page Button */}
                    {!isReadOnly && (settings.enable_ai_translation_all === true || String(settings.enable_ai_translation_all) === 'true') && user?.role !== 'CLIENT' && (
                        (isTranslatingAll || isBackgroundTranslating) ? (
                            <button
                                onClick={async () => {
                                    try {
                                        // @ts-ignore
                                        await useEditorStore.getState().stopTranslation(projectId, effectiveFileId);
                                        toast.success('Stopping translation...');
                                    } catch (e: any) {
                                        toast.error('Failed to stop translation');
                                    }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20"
                            >
                                <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
                                <span className="hidden sm:inline">Stop Generating</span>
                            </button>
                        ) : (
                            <button
                                onClick={async () => {
                                    if (window.confirm(`WARNING: You are about to translate THIS PAGE (${segments.length} segments) using AI.\n\n- Existing unconfirmed segments will be overwritten.\n- This action cannot be undone.\n\nAre you sure you want to proceed?`)) {
                                        try {
                                            const currentSegmentIds = segments.map(s => s._id);
                                            // @ts-ignore
                                            const msg = await useEditorStore.getState().translateAll(projectId, effectiveFileId, selectedTargetLang, currentSegmentIds);
                                            toast.success(msg || 'Translation started in background');
                                        } catch (e: any) {
                                            toast.error(e.response?.data?.message || 'Failed to auto-translate page');
                                        }
                                    }
                                }}
                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/20"
                            >
                                <Sparkles size={14} />
                                <span className="hidden sm:inline">AI Translate Page</span>
                            </button>
                        )
                    )}
                    {isReadOnly && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/20">Read Only View</span>}
                    <div className="text-xs text-gray-400">
                        {segments.filter(s => s.status === 'CONFIRMED').length} / {segments.length} Confirmed
                    </div>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${(segments.filter(s => s.status === 'CONFIRMED').length / segments.length) * 100}%` }}
                        />
                    </div>
                </div>
            </header >

            {/* Editor Workspace */}
            < div className="flex-1 flex overflow-hidden" >
                <main className="flex-1 overflow-y-auto p-2 md:p-6 max-w-5xl mx-auto w-full space-y-3 md:space-y-4 pb-24 md:pb-40">
                    <AnimatePresence>
                        {segments.map((segment) => {
                            const isActive = segment._id === activeSegmentId;
                            return (
                                <motion.div
                                    key={segment._id}
                                    layoutId={segment._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-xl border transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-blue-50/50 dark:bg-white/5 border-blue-500/50 shadow-lg shadow-blue-900/10 ring-1 ring-blue-500/20'
                                            : 'bg-white dark:bg-transparent border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/10'
                                        }`}
                                    onClick={() => setActiveSegment(segment._id)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
                                        {/* Source */}
                                        <div className="p-3 md:p-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 leading-relaxed">
                                            <span className="text-xs text-gray-400 dark:text-gray-600 font-mono mr-2 select-none">{segment.sequence}</span>
                                            <GlossaryHighlighter text={segment.sourceText} terms={glossaryTerms} />
                                        </div>

                                        {/* Target */}
                                        <div className="p-3 md:p-4 relative">
                                            {isActive && !isReadOnly ? (
                                                <textarea
                                                    className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white resize-none h-full min-h-[80px] placeholder-gray-400 dark:placeholder-gray-600"
                                                    value={segment.targetText}
                                                    onChange={(e) => updateSegmentLocal(segment._id, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, segment._id)}
                                                    placeholder="Type translation..."
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className={`min-h-[24px] ${!segment.targetText ? 'text-gray-400 dark:text-gray-600 italic' : 'text-gray-700 dark:text-gray-200'}`}>
                                                    {segment.targetText || 'No translation'}
                                                </div>
                                            )}

                                            {/* Status Indicator */}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {segment.status === 'CONFIRMED' && <Check size={16} className="text-green-500" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Controls */}
                                    {isActive && !isReadOnly && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="border-t border-white/5 bg-black/20 px-4 py-2 flex justify-between items-center rounded-b-xl"
                                        >
                                            <div className="flex gap-2">
                                                {(settings.enable_ai_features !== false && String(settings.enable_ai_features) !== 'false') &&
                                                    (settings.enable_ai_single_suggestion !== false && String(settings.enable_ai_single_suggestion) !== 'false') && (
                                                        <button
                                                            onClick={() => generateAI(segment._id)}
                                                            disabled={generatingAiSegmentIds.includes(segment._id)}
                                                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 transition-colors"
                                                        >
                                                            {generatingAiSegmentIds.includes(segment._id) ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                            AI Suggestion
                                                        </button>
                                                    )}

                                                {segment.aiSuggestion && (
                                                    <span className={`text-xs flex items-center ${segment.aiSuggestion.startsWith('[') ? 'text-red-400' : 'text-gray-500'}`}>
                                                        {segment.aiSuggestion}
                                                        {!segment.aiSuggestion.startsWith('[') && (
                                                            <button
                                                                onClick={() => updateSegmentLocal(segment._id, segment.aiSuggestion!)}
                                                                className="ml-2 text-blue-400 hover:underline"
                                                            >
                                                                Use
                                                            </button>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider self-center mr-2 hidden sm:block">Ctrl+Enter to Confirm</span>
                                                <button
                                                    onClick={() => confirmSegment(segment._id)}
                                                    disabled={!segment.targetText || !segment.targetText.trim()}
                                                    className="text-xs flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium shadow-lg shadow-green-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Check size={14} />
                                                    Confirm
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col items-center gap-4 py-8 border-t border-white/5 mt-8">
                            <div className="flex items-center gap-2">
                                {/* First Page */}
                                <button
                                    onClick={() => {
                                        setPage(1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={pagination.page === 1 || isLoading}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="First Page"
                                >
                                    <ChevronsLeft size={18} />
                                </button>

                                {/* Previous */}
                                <button
                                    onClick={() => {
                                        setPage(pagination.page - 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={pagination.page === 1 || isLoading}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <span className="text-sm text-gray-500 font-mono px-2">
                                    Page <span className="text-gray-300 font-bold">{pagination.page}</span> of {pagination.totalPages}
                                </span>

                                {/* Next */}
                                <button
                                    onClick={() => {
                                        setPage(pagination.page + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={pagination.page >= pagination.totalPages || isLoading}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>

                                {/* Last Page */}
                                <button
                                    onClick={() => {
                                        setPage(pagination.totalPages);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={pagination.page >= pagination.totalPages || isLoading}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Last Page"
                                >
                                    <ChevronsRight size={18} />
                                </button>
                            </div>

                            {/* Jump to Page */}
                            <div className="flex items-center gap-2 group">
                                <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Go to page:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={pagination.totalPages}
                                    placeholder="#"
                                    className="w-16 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-center text-white focus:border-blue-500 outline-none transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const page = parseInt(e.currentTarget.value);
                                            if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
                                                setPage(page);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                e.currentTarget.value = ''; // Clear after jump
                                            } else {
                                                toast.error(`Invalid page. Enter 1-${pagination.totalPages}`);
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </main>

                <aside className="w-80 border-l border-white/10 bg-midnight-950/50 backdrop-blur hidden lg:block">
                    <GlossaryPanel
                        projectId={projectId || ''}
                        sourceLang={activeProject?.sourceLang || 'en'}
                        targetLang={selectedTargetLang || 'ar'}
                        isReadOnly={isReadOnly}
                        activeSegmentText={segments.find(s => s._id === activeSegmentId)?.sourceText || ''}
                    />
                </aside>
            </div >
        </div >
    );
};
