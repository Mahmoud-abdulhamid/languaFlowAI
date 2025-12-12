import { forwardRef } from 'react';
import type { FieldError } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

import { twMerge } from 'tailwind-merge';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: FieldError;
    className?: string;
    icon?: React.ElementType;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, className, icon: Icon, ...props }, ref) => {
        return (
            <div className="space-y-1">
                <label className="block text-sm font-medium text-muted">
                    {label}
                </label>
                <div className="relative">
                    {Icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                            <Icon size={18} />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={twMerge(
                            "w-full bg-secondary/10 border border-glass-border rounded-lg p-3 text-foreground focus:border-blue-500 outline-none transition-all placeholder:text-muted/50",
                            Icon && "pl-10",
                            error && "border-red-500 focus:border-red-500",
                            className
                        )}
                        {...props}
                    />
                </div>
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-1 text-red-400 text-xs mt-1"
                        >
                            <AlertCircle size={12} />
                            <span>{error.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
