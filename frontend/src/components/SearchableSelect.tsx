import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { UserAvatar } from './UserAvatar'; // Assuming you have this

interface Option {
    value: string;
    label: string;
    avatar?: string;
    email?: string; // For extra context
}

interface SearchableSelectProps {
    options: Option[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    placeholder?: string;
    label?: string;
    multiple?: boolean;
    error?: any;
}

export const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    label,
    multiple = false,
    error
}: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({}); // Typed correctly

    // Update position when opening - use useLayoutEffect to prevent flicker/misplacement
    useLayoutEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownStyle({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width,
                position: 'absolute', // Ensure this is part of the state
                zIndex: 9999
            });
        }
    }, [isOpen]);

    // Close on click outside and scroll
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                const dropdownEl = document.getElementById('searchable-select-dropdown');
                if (dropdownEl && dropdownEl.contains(event.target as Node)) return;
                setIsOpen(false);
            }
        };

        const handleScroll = (event: Event) => {
            const dropdownEl = document.getElementById('searchable-select-dropdown');
            if (dropdownEl && dropdownEl.contains(event.target as Node)) {
                return; // Ignore internal scrolling
            }
            setIsOpen(false);
        };

        // Delay adding listener to avoid immediate close on the same click that opened it
        // although mousedown vs click usually avoids this, this is safer.
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleScroll);
        }, 10);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        (opt.email && opt.email.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSelect = (optionValue: string) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValue = currentValues.includes(optionValue)
                ? currentValues.filter(v => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValue);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    const removeValue = (valToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (multiple && Array.isArray(value)) {
            onChange(value.filter(v => v !== valToRemove));
        } else {
            onChange('');
        }
    };

    // Get selected option objects
    const selectedOptions = options.filter(opt =>
        multiple ? (Array.isArray(value) && value.includes(opt.value)) : value === opt.value
    );

    return (
        <div className="space-y-1 relative" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-muted">{label}</label>}

            <div
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`w-full bg-secondary/10 border ${error ? 'border-red-500/50' : 'border-glass-border'} rounded-xl px-4 py-2 text-foreground focus:border-blue-500 cursor-pointer min-h-[46px] flex items-center justify-between transition-colors hover:border-blue-500/30`}
            >
                <div className="flex flex-wrap gap-2 flex-1">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map(opt => (
                            <span key={opt.value} className="bg-secondary/20 border border-white/5 rounded-lg px-2 py-1 text-sm flex items-center gap-2">
                                {opt.avatar !== undefined && ( // Check for undefined to allow empty string avatars if needed, though UserAvatar handles it
                                    <UserAvatar user={{ name: opt.label, avatar: opt.avatar }} size="xs" />
                                )}
                                {opt.label}
                                <span
                                    onClick={(e) => removeValue(opt.value, e)}
                                    className="hover:text-red-400 cursor-pointer p-0.5 rounded-full hover:bg-white/5 transition-colors"
                                >
                                    <X size={12} />
                                </span>
                            </span>
                        ))
                    ) : (
                        <span className="text-muted/50">{placeholder}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-muted">
                    {selectedOptions.length > 0 && (
                        <span
                            onClick={(e) => { e.stopPropagation(); onChange(multiple ? [] : ''); }}
                            className="hover:text-foreground cursor-pointer p-1"
                        >
                            <X size={16} />
                        </span>
                    )}
                    <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {error && <span className="text-red-400 text-xs">{error.message}</span>}

            {isOpen && createPortal(
                <AnimatePresence>
                    <motion.div
                        id="searchable-select-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        style={{ ...dropdownStyle, position: 'absolute', zIndex: 9999 }}
                        className="bg-surface border border-glass-border rounded-xl shadow-xl overflow-hidden backdrop-blur-xl"
                    >
                        {/* Search Input */}
                        <div className="p-2 border-b border-glass-border sticky top-0 bg-surface z-10">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-secondary/10 rounded-lg pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted/50"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(opt => {
                                    const isSelected = multiple
                                        ? (Array.isArray(value) && value.includes(opt.value))
                                        : value === opt.value;

                                    return (
                                        <div
                                            key={opt.value}
                                            onClick={() => {
                                                handleSelect(opt.value);
                                                // Keep open if multiple, close if single
                                                // if (!multiple) setIsOpen(false); // Handled in handleSelect logic modification below if needed, or user click
                                            }}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10 text-foreground'}`}
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{opt.label}</div>
                                                {opt.email && <div className="text-xs text-muted/70">{opt.email}</div>}
                                            </div>
                                            {isSelected && <Check size={16} />}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-sm text-muted">
                                    No results found.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
};
