import React, { useState, useEffect } from 'react';
import { Book, Search, Plus, X, Globe, Folder, Info, Copy } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import { GlassCard } from './GlassCard';
import { toast } from 'react-hot-toast';

export const GlossaryPanel = ({ projectId, sourceLang, targetLang, isReadOnly, activeSegmentText }: { projectId: string, sourceLang: string, targetLang: string, isReadOnly: boolean, activeSegmentText?: string }) => {
    const { token } = useAuthStore();
    const { glossaryTerms, fetchGlossary } = useProjectStore();
    const [query, setQuery] = useState('');
    const [newTerm, setNewTerm] = useState({ term: '', translation: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        // Initial fetch handled by Editor potentially, but safe to fetch here if needed.
        if (!query && glossaryTerms.length === 0) {
            fetchGlossary(projectId);
        }
    }, [projectId, query]);

    // Derived state for display
    let displayedTerms = [];
    if (query) {
        displayedTerms = glossaryTerms.filter(t => t.term.toLowerCase().includes(query.toLowerCase()) || t.translation.toLowerCase().includes(query.toLowerCase()));
    } else if (activeSegmentText) {
        const normalizedText = activeSegmentText.toLowerCase();
        displayedTerms = glossaryTerms.filter(t => normalizedText.includes(t.term.toLowerCase()));
    } else {
        // Fallback: Show all (or user preferred empty?). Let's show all for now if no segment selected, 
        // BUT user asked for "only words in current segment". 
        // If no active segment (e.g. none selected), we might just show empty?
        // Let's default to empty if no query and no segment to follow strict instruction.
        // Actually, if no segment is selected, it's safer to show *nothing* or *all*.
        // Showing *all* might be overwhelming if they expect context. 
        // Let's show ALL if no segment is active (default/fallback), but if segment IS active, filter by it.
        // Wait, "activSegmentText" is "" if none selected.
        displayedTerms = glossaryTerms;
    }

    const handleAddTerm = async () => {
        if (!newTerm.term || !newTerm.translation) return;
        try {
            await api.post('/glossaries', {
                ...newTerm,
                projectId,
                sourceLang,
                targetLang
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewTerm({ term: '', translation: '' });
            setIsAdding(false);
            fetchGlossary(projectId); // Refresh store
            toast.success('Term added to Project Glossary');
        } catch (err) {
            toast.error('Failed to add term');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <GlassCard className="h-full flex flex-col">
            <div className="p-4 border-b border-white/10 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Book size={18} className="text-yellow-400" />
                        Glossary
                    </h3>
                    {!isReadOnly && (
                        <button onClick={() => setIsAdding(!isAdding)} className="text-gray-400 hover:text-white transition-colors" title="Add Project Term">
                            {isAdding ? <X size={18} /> : <Plus size={18} />}
                        </button>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1"><Folder size={10} className="text-blue-400" /> Project Only</span>
                    <span className="flex items-center gap-1"><Globe size={10} className="text-green-400" /> Global</span>
                </div>

                {/* Context Indicator */}
                {!query && activeSegmentText && (
                    <div className="text-[10px] text-purple-300 flex items-center gap-1 pb-1 animate-pulse pt-1">
                        <Info size={10} />
                        Showing terms found in current segment
                    </div>
                )}
            </div>


            <div className="p-4 border-b border-white/10">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search terms..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none placeholder-gray-600"
                    />
                </div>
            </div>

            {
                isAdding && (
                    <div className="p-4 bg-white/5 border-b border-white/10 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-blue-300 pb-2">
                            <Folder size={12} />
                            Adding to Project Glossary
                        </div>
                        <input
                            type="text"
                            placeholder="Term"
                            value={newTerm.term}
                            onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Translation"
                            value={newTerm.translation}
                            onChange={(e) => setNewTerm({ ...newTerm, translation: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                        />
                        <button onClick={handleAddTerm} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded transition-colors shadow-lg shadow-blue-900/20">
                            Add Term
                        </button>
                    </div>
                )
            }

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {displayedTerms.map((term) => {
                    const isGlobal = !term.projectId;
                    return (
                        <div key={term._id} className="group p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer relative" onClick={() => copyToClipboard(term.translation)}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-medium text-white break-words pr-6">{term.term}</span>
                                <div className="absolute top-3 right-3 opacity-50" title={isGlobal ? "Global Term" : "Project Term"}>
                                    {isGlobal ? <Globe size={12} className="text-green-400" /> : <Folder size={12} className="text-blue-400" />}
                                </div>
                            </div>
                            <div className="text-sm text-yellow-400 break-words pr-6">{term.translation}</div>

                            {/* Hover Actions */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy size={12} className="text-gray-400" />
                            </div>
                        </div>
                    );
                })}
                {displayedTerms.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
                        <Book size={24} className="opacity-20" />
                        <span className="text-xs">No terms found</span>
                    </div>
                )}
            </div>
        </GlassCard >
    );
};
