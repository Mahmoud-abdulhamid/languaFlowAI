import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List as ListIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectFilterBar } from '../components/ProjectFilterBar';
import { Skeleton } from '../components/ui/Skeleton';
import { Pagination } from '../components/Pagination';
import { formatNumber } from '../utils/formatNumber';

export const Projects = () => {
    const { projects, fetchProjects, isLoading, pagination } = useProjectStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const isTranslator = user?.role === 'TRANSLATOR';

    // UI State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        if (window.innerWidth < 768) return 'grid';
        const saved = localStorage.getItem('projects_view_mode');
        return (saved === 'grid' || saved === 'list') ? saved : 'grid';
    });

    useEffect(() => {
        localStorage.setItem('projects_view_mode', viewMode);
    }, [viewMode]);

    // Filter State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sourceLangFilter, setSourceLangFilter] = useState('ALL');
    const [targetLangFilter, setTargetLangFilter] = useState('ALL');
    const [domainFilter, setDomainFilter] = useState('ALL');
    const [clientFilter, setClientFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest');

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1); // Reset to first page
    };

    // Fetch projects whenever filters change
    useEffect(() => {
        fetchProjects({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            status: statusFilter,
            sourceLang: sourceLangFilter,
            targetLang: targetLangFilter,
            domain: domainFilter,
            clientId: clientFilter,
            sortBy
        });
    }, [currentPage, itemsPerPage, searchTerm, statusFilter, sourceLangFilter, targetLangFilter, domainFilter, clientFilter, sortBy]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sourceLangFilter, targetLangFilter, domainFilter, clientFilter, sortBy]);

    // Derive filter options from current page data
    const sourceCounts: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};
    const clientCounts: Record<string, number> = {};

    projects.forEach(p => {
        sourceCounts[p.sourceLang] = (sourceCounts[p.sourceLang] || 0) + 1;
        p.targetLangs.forEach(t => {
            targetCounts[t] = (targetCounts[t] || 0) + 1;
        });
        const d = p.domain || 'General';
        domainCounts[d] = (domainCounts[d] || 0) + 1;
        const c = typeof p.clientId === 'object' ? p.clientId?.name : 'Unknown';
        if (c) clientCounts[c] = (clientCounts[c] || 0) + 1;
    });

    const uniqueSourceLangs = Object.keys(sourceCounts).sort();
    const uniqueTargetLangs = Object.keys(targetCounts).sort();
    const uniqueDomains = Object.keys(domainCounts).sort();
    const uniqueClients = Object.keys(clientCounts).sort();

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('ALL');
        setSourceLangFilter('ALL');
        setTargetLangFilter('ALL');
        setDomainFilter('ALL');
        setClientFilter('ALL');
        setSortBy('newest');
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto min-h-screen pb-12">

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold font-outfit text-foreground">Projects</h1>
                        <span className="px-3 py-1 rounded-full bg-secondary/10 border border-glass-border text-xs font-mono text-muted">
                            {formatNumber(pagination.total)}
                        </span>
                    </div>
                    <p className="text-muted mt-2">Manage and track your translation projects.</p>
                </div>
                {!isTranslator && (
                    <button
                        onClick={() => navigate('/projects/new')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Create Project</span>
                    </button>
                )}
            </div>

            {/* 2. Controls & Filter Bar */}
            <ProjectFilterBar
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                // New Filters
                sourceLangFilter={sourceLangFilter}
                setSourceLangFilter={setSourceLangFilter}
                targetLangFilter={targetLangFilter}
                setTargetLangFilter={setTargetLangFilter}
                domainFilter={domainFilter}
                setDomainFilter={setDomainFilter}
                clientFilter={clientFilter}
                setClientFilter={setClientFilter}
                // Options
                uniqueSourceLangs={uniqueSourceLangs}
                uniqueTargetLangs={uniqueTargetLangs}
                uniqueDomains={uniqueDomains}
                uniqueClients={uniqueClients}
                // Counts
                sourceCounts={sourceCounts}
                targetCounts={targetCounts}
                domainCounts={domainCounts}
                clientCounts={clientCounts}
                // Actions
                onClearFilters={clearFilters}
            />

            {/* 3. Projects Grid / List */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    // Loading Skeletons
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className={`rounded-2xl ${viewMode === 'grid' ? 'h-[280px]' : 'h-[80px]'}`} />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted">
                        <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mb-4">
                            <LayoutGrid size={40} className="opacity-20" />
                        </div>
                        <p className="text-lg font-medium">No projects found</p>
                        <p className="text-sm">Try adjusting your filters or create a new one.</p>
                    </div>
                ) : (
                    // Projects List
                    <motion.div
                        layout
                        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
                    >
                        <AnimatePresence>
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    isTranslator={isTranslator}
                                    viewMode={viewMode}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* 4. Pagination */}
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
};
