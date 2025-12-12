import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MoreVertical, FileText, CheckCircle, AlertCircle, ArrowRight, User } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';

interface ProjectCardProps {
    project: any;
    isTranslator?: boolean;
    viewMode?: 'grid' | 'list';
}

export const ProjectCard = ({ project, isTranslator, viewMode = 'grid' }: ProjectCardProps) => {
    const navigate = useNavigate();

    // Calculate days remaining
    const deadline = new Date(project.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'REVIEW': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            case 'ACTIVE': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-muted bg-secondary/10 border-glass-border';
        }
    };

    const statusStyle = getStatusColor(project.status);
    const isOverdue = diffDays < 0 && project.status !== 'COMPLETED';
    const isUrgent = diffDays <= 3 && diffDays >= 0 && project.status !== 'COMPLETED';

    // Calculate total word count from files
    const totalWordCount = project.files?.reduce((acc: number, file: any) => acc + (file.wordCount || 0), 0) || 0;

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group cursor-pointer"
            >
                <GlassCard className="p-4 flex items-center gap-4 hover:border-blue-500/30 transition-all">
                    {/* Lang Icon */}
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center font-bold text-muted group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                        {project.sourceLang.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4 lg:col-span-3">
                            <h4 className="font-bold text-foreground truncate group-hover:text-blue-500 transition-colors">{project.title}</h4>
                            <div className="text-xs text-muted flex items-center gap-2 mt-1">
                                <span className="font-medium text-foreground/80">{project.sourceLang}</span>
                                <span className="text-muted/50">→</span>
                                <div className="flex gap-1 flex-wrap">
                                    {project.targetLangs.map((lang: string) => (
                                        <span key={lang} className="bg-secondary/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 hidden lg:flex items-center gap-2 text-sm text-foreground">
                            <FileText size={14} className="text-muted" />
                            {(totalWordCount / 1000).toFixed(1)}k
                        </div>

                        <div className="col-span-3 lg:col-span-2">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${isUrgent ? 'text-red-400 bg-red-400/10' : 'text-muted bg-secondary/10'}`}>
                                <Clock size={12} />
                                {isOverdue ? 'Overdue' : `${diffDays} days`}
                            </div>
                        </div>

                        {/* Team / Client Avatars - Added to List View */}
                        <div className="col-span-3 lg:col-span-2 flex justify-center">
                            <div className="flex items-center gap-2">
                                {isTranslator ? (
                                    project.clientId ? <UserAvatar user={project.clientId} size="xs" /> : <span className="text-xs text-muted">-</span>
                                ) : (
                                    <div className="flex -space-x-2">
                                        {project.assignedTranslators && project.assignedTranslators.length > 0 ? (
                                            project.assignedTranslators.slice(0, 3).map((t: any, i: number) => (
                                                <UserAvatar key={t._id || i} user={t} size="xs" className="border border-background" />
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-muted">-</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2 lg:col-span-3 text-right flex items-center justify-end gap-3">
                            {/* Progress Bar (Mini) */}
                            <div className="hidden lg:block w-16 h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                                <div className={`h-full ${project.status === 'COMPLETED' ? 'bg-green-500 w-full' : 'bg-blue-500 w-1/3'}`} />
                            </div>

                            <span className={`px-2 py-1 rounded text-xs font-bold border ${statusStyle}`}>
                                {project.status}
                            </span>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        );
    }

    // Grid View (Original)
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="cursor-pointer group h-full"
        >
            <GlassCard className="h-full p-0 overflow-hidden relative flex flex-col hover:border-blue-500/50 transition-colors">

                {/* Large Background Lang Icon (Decorative) */}
                <div className="absolute -right-4 -top-4 text-[100px] font-bold opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                    {project.sourceLang.substring(0, 2).toUpperCase()}
                </div>

                {/* Header Section */}
                <div className="p-5 pb-0 flex justify-between items-start z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center text-lg font-bold shadow-sm">
                            <span className="bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {project.sourceLang.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-blue-500 transition-colors">{project.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                                <span>{project.sourceLang}</span>
                                <ArrowRight size={10} className="opacity-50" />
                                <div className="flex gap-1">
                                    {project.targetLangs.map((lang: string) => (
                                        <span key={lang} className="bg-secondary/20 px-1 rounded text-[10px]">{lang}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusStyle} uppercase tracking-wider shadow-sm`}>
                        {project.status}
                    </span>
                </div>

                {/* Body Section */}
                <div className="p-5 flex-1 z-10 space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-secondary/5 rounded-lg p-2 border border-glass-border/50">
                            <div className="text-xs text-muted mb-1 flex items-center gap-1.5">
                                <FileText size={12} /> Words
                            </div>
                            <div className="font-semibold text-sm text-foreground">
                                {totalWordCount > 0 ? (totalWordCount / 1000).toFixed(1) + 'k' : 'N/A'}
                            </div>
                        </div>
                        <div className={`rounded-lg p-2 border ${isUrgent ? 'bg-red-500/10 border-red-500/20' : 'bg-secondary/5 border-glass-border/50'}`}>
                            <div className={`text-xs mb-1 flex items-center gap-1.5 ${isUrgent ? 'text-red-400' : 'text-muted'}`}>
                                <Clock size={12} /> Deadline
                            </div>
                            <div className={`font-semibold text-sm ${isUrgent ? 'text-red-400' : 'text-foreground'}`}>
                                {isOverdue ? 'Overdue' : diffDays === 0 ? 'Today' : `${diffDays} days`}
                            </div>
                        </div>
                    </div>

                    {/* Translator / Client Info */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            {isTranslator ? (
                                // Show Client if viewing as Translator
                                <>
                                    <span className="text-xs text-muted">Client:</span>
                                    {project.clientId ? (
                                        <UserAvatar user={project.clientId} size="xs" />
                                    ) : (
                                        <span className="text-xs text-muted italic">Unknown</span>
                                    )}
                                </>
                            ) : (
                                // Show Assigned Translators if viewing as Admin/Client
                                <>
                                    <span className="text-xs text-muted">Team:</span>
                                    <div className="flex -space-x-2">
                                        {project.assignedTranslators && project.assignedTranslators.length > 0 ? (
                                            project.assignedTranslators.map((t: any, i: number) => (
                                                <UserAvatar key={t._id || i} user={t} size="xs" className="border border-background" />
                                            ))
                                        ) : (
                                            <span className="text-[10px] bg-secondary/20 px-2 py-1 rounded-full text-muted">Unassigned</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Progress Bar */}
                <div className="relative h-1 bg-secondary/20 w-full mt-auto">
                    {/* Mocked Progress - In real app, calculate based on translated segments */}
                    <div
                        className={`absolute left-0 top-0 h-full transition-all duration-1000 ${project.status === 'COMPLETED' ? 'bg-green-500 w-full' : 'bg-blue-500 w-1/3'}`}
                    />
                </div>
            </GlassCard>
        </motion.div>
    );
};
