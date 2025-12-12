import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    pageSize = 12,
    onPageSizeChange,
    pageSizeOptions = [6, 12, 24, 48, 96]
}) => {
    if (totalPages <= 1 && !onPageSizeChange) return null;

    return (
        <div className="flex justify-center items-center gap-4 mt-8 mb-10 flex-wrap">
            {/* Page Size Selector */}
            {onPageSizeChange && (
                <div className="flex items-center gap-2">
                    <span className="text-muted text-sm">Show:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="bg-secondary/5 border border-glass-border rounded-lg px-3 py-1.5 text-foreground text-sm focus:border-blue-500 outline-none cursor-pointer"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size} className="bg-surface text-foreground">
                                {size} items
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-secondary/5 border border-glass-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/10 transition-colors"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="text-muted text-sm font-medium px-2">
                        Page <span className="text-foreground font-semibold">{currentPage}</span> of <span className="text-foreground font-semibold">{totalPages}</span>
                    </span>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-secondary/5 border border-glass-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/10 transition-colors"
                        aria-label="Next Page"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}
        </div>
    );
};
