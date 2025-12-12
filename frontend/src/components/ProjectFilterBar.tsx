import React from 'react';
import { Search, LayoutGrid, List, Filter, ArrowUpDown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { SearchableSelect } from './SearchableSelect';

interface ProjectFilterBarProps {
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;

    // New Props
    sourceLangFilter: string;
    setSourceLangFilter: (val: string) => void;
    targetLangFilter: string;
    setTargetLangFilter: (val: string) => void;
    domainFilter: string;
    setDomainFilter: (val: string) => void;
    clientFilter: string;
    setClientFilter: (val: string) => void;

    uniqueSourceLangs: string[];
    uniqueTargetLangs: string[];
    uniqueDomains: string[];
    uniqueClients: string[];

    sourceCounts: Record<string, number>;
    targetCounts: Record<string, number>;
    domainCounts: Record<string, number>;
    clientCounts: Record<string, number>;

    onClearFilters: () => void;
}

export const ProjectFilterBar = ({
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sourceLangFilter,
    setSourceLangFilter,
    targetLangFilter,
    setTargetLangFilter,
    domainFilter,
    setDomainFilter,
    clientFilter,
    setClientFilter,
    uniqueSourceLangs,
    uniqueTargetLangs,
    uniqueDomains,
    uniqueClients,
    sourceCounts,
    targetCounts,
    domainCounts,
    clientCounts,
    onClearFilters
}: ProjectFilterBarProps) => {
    const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

    const hasActiveFilters = searchTerm !== '' ||
        statusFilter !== 'ALL' ||
        sourceLangFilter !== 'ALL' ||
        targetLangFilter !== 'ALL' ||
        domainFilter !== 'ALL' ||
        clientFilter !== 'ALL';

    return (
        <GlassCard className="p-4 mb-8 sticky top-4 z-30 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 w-full">
                    {/* 1. Search Bar - Expanded */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-blue-500" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search projects by name, language..."
                            className="w-full bg-secondary/5 border border-glass-border rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all placeholder:text-muted/70"
                        />
                    </div>

                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`md:hidden p-2.5 rounded-xl border border-glass-border transition-colors ${isFiltersOpen || hasActiveFilters ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-secondary/5 text-muted hover:text-foreground'}`}
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* 2. Controls Group */}
                <div className={`${isFiltersOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center gap-3 w-full overflow-x-auto pb-2 md:pb-0 no-scrollbar transition-all`}>

                    {/* Status Filter */}
                    <div className="flex bg-secondary/5 rounded-lg border border-glass-border p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['ALL', 'ACTIVE', 'COMPLETED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${statusFilter === status
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-muted hover:text-foreground hover:bg-secondary/10'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-glass-border mx-1 hidden md:block" />

                    {/* Extended Filters Group */}
                    <div className="flex gap-2 flex-wrap w-full md:w-auto">

                        {/* Source Lang */}
                        <select
                            value={sourceLangFilter}
                            onChange={(e) => setSourceLangFilter(e.target.value)}
                            className="bg-secondary/5 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer min-w-[100px] flex-1 md:flex-none"
                        >
                            <option value="ALL" className="bg-surface">All Source</option>
                            {uniqueSourceLangs.map(l => (
                                <option key={l} value={l} className="bg-surface">
                                    {l} ({sourceCounts[l] || 0})
                                </option>
                            ))}
                        </select>

                        {/* Target Lang */}
                        <select
                            value={targetLangFilter}
                            onChange={(e) => setTargetLangFilter(e.target.value)}
                            className="bg-secondary/5 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer min-w-[100px] flex-1 md:flex-none"
                        >
                            <option value="ALL" className="bg-surface">All Target</option>
                            {uniqueTargetLangs.map(l => (
                                <option key={l} value={l} className="bg-surface">
                                    {l} ({targetCounts[l] || 0})
                                </option>
                            ))}
                        </select>

                        {/* Domain */}
                        <select
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                            className="bg-secondary/5 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer min-w-[100px] flex-1 md:flex-none"
                        >
                            <option value="ALL" className="bg-surface">All Domains</option>
                            {uniqueDomains.map(d => (
                                <option key={d} value={d} className="bg-surface">
                                    {d} ({domainCounts[d] || 0})
                                </option>
                            ))}
                        </select>

                        {/* Client (Only if there are clients) */}
                        {uniqueClients.length > 0 && (
                            <select
                                value={clientFilter}
                                onChange={(e) => setClientFilter(e.target.value)}
                                className="bg-secondary/5 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer min-w-[100px] flex-1 md:flex-none"
                            >
                                <option value="ALL" className="bg-surface">All Clients</option>
                                {uniqueClients.map(c => (
                                    <option key={c} value={c} className="bg-surface">
                                        {c} ({clientCounts[c] || 0})
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20 whitespace-nowrap"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="h-6 w-px bg-glass-border mx-1 hidden md:block" />

                    {/* Sort Dropdown (Simplified) */}
                    <div className="min-w-[160px] w-full md:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-secondary/5 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="newest" className="bg-surface text-foreground">Newest First</option>
                            <option value="oldest" className="bg-surface text-foreground">Oldest First</option>
                            <option value="deadline" className="bg-surface text-foreground">Deadline</option>
                            <option value="word_count_asc" className="bg-surface text-foreground">Word Count (Low to High)</option>
                            <option value="word_count_desc" className="bg-surface text-foreground">Word Count (High to Low)</option>
                        </select>
                    </div>

                    <div className="h-6 w-px bg-glass-border mx-1 hidden md:block" />

                    {/* View Toggle */}
                    <div className="hidden md:flex bg-secondary/5 rounded-lg border border-glass-border p-1 w-full md:w-auto justify-center">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex-1 md:flex-none p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-background text-blue-500 shadow-sm'
                                : 'text-muted hover:text-foreground'
                                }`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} className="mx-auto" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 md:flex-none p-1.5 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-background text-blue-500 shadow-sm'
                                : 'text-muted hover:text-foreground'
                                }`}
                            title="List View"
                        >
                            <List size={18} className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
