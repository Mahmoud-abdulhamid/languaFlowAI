import React from 'react';
import type { GlossaryTerm } from '../store/useProjectStore';

interface GlossaryHighlighterProps {
    text: string;
    terms: GlossaryTerm[];
}

export const GlossaryHighlighter: React.FC<GlossaryHighlighterProps> = ({ text, terms }) => {
    if (!text || !terms.length) return <>{text}</>;

    // Sort terms by length (longest first)
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const pattern = new RegExp(`(${sortedTerms.map(t => escapeRegExp(t.term)).join('|')})`, 'gi');
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, index) => {
                const match = sortedTerms.find(t => t.term.toLowerCase() === part.toLowerCase());
                if (match) {
                    return (
                        <span key={index} className="relative group/term inline-block cursor-help">
                            <span className="bg-yellow-500/20 text-yellow-200 decoration-yellow-500/50 underline decoration-dotted rounded px-0.5 transition-colors group-hover/term:bg-yellow-500/30">
                                {part}
                            </span>
                            {/* Tooltip */}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-black/90 border border-white/10 backdrop-blur-md rounded-lg p-2 text-xs opacity-0 invisible group-hover/term:opacity-100 group-hover/term:visible transition-all duration-200 z-50 pointer-events-none shadow-xl">
                                <span className="block font-bold text-yellow-400 mb-0.5">{match.translation}</span>
                                <span className="block text-gray-500 text-[10px] uppercase tracking-wider">{match.term}</span>
                                {/* Arrow */}
                                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></span>
                            </span>
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </>
    );
};
