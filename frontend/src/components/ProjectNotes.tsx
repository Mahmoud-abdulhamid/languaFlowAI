import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSystemStore } from '../store/useSystemStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useProjectStore } from '../store/useProjectStore';
import { GlassCard } from './GlassCard';
import { MessageSquare, Send, Reply, Trash2, Eye, EyeOff, Paperclip, MoreVertical, ShieldAlert, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as Popover from '@radix-ui/react-popover';
import { UserAvatar } from './UserAvatar';

interface Note {
    _id: string;
    content: string;
    user: {
        _id: string;
        name: string;
        role: string;
        avatar?: string;
    };
    parentId: string | null;
    createdAt: string;
    isHidden: boolean;
    attachments?: { name: string, url: string, type: string }[];
}

interface ProjectNotesProps {
    projectId: string;
}

export const ProjectNotes = ({ projectId }: ProjectNotesProps) => {
    const activeProject = useProjectStore(state => state.activeProject);
    const updateProjectDetails = useProjectStore(state => state.updateProjectDetails);
    const fetchProject = useProjectStore(state => state.fetchProject);
    const socket = useNotificationStore(state => state.socket);

    const { token, user } = useAuthStore();
    const settings = useSystemStore(state => state.settings);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [enterToSend, setEnterToSend] = useState(() => localStorage.getItem('notes_enter_to_send') === 'true');
    const [autoScroll, setAutoScroll] = useState(true);
    const notesEndRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(true); // Default expanded
    const [isFullScreen, setIsFullScreen] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    // Auto-scroll effect
    const prevNotesLength = useRef(0);
    const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

    // Auto-scroll effect
    useEffect(() => {
        // Skip if empty or not expanded
        if (!isExpanded || notes.length === 0) return;

        // If this is the "first" load of notes, mark as loaded but DON'T scroll
        // This prevents hijacking the page scroll on mount
        if (!hasLoadedInitially) {
            setHasLoadedInitially(true);
            prevNotesLength.current = notes.length;
            return;
        }

        // Only scroll if we have NEW notes (length increased) or if user requested it specifically
        // (We removed generic auto-scroll on every render)
        if (autoScroll && notesEndRef.current && notes.length > prevNotesLength.current) {
            notesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        prevNotesLength.current = notes.length;
    }, [notes, autoScroll, isExpanded]);

    useEffect(() => {
        fetchNotes();
        if (projectId && (!activeProject || activeProject.id !== projectId)) {
            fetchProject(projectId);
        }
    }, [projectId]);

    // Real-time updates
    useEffect(() => {
        if (!socket || !projectId) return;

        socket.emit('join_project', projectId);

        const handleNewNote = (newNote: Note) => {
            setNotes(prev => {
                if (prev.some(n => n._id === newNote._id)) return prev;
                return [...prev, newNote];
            });
            // Smart expand on new message if specific conditions met (optional)
        };

        socket.on('note_new', handleNewNote);

        return () => {
            socket.off('note_new', handleNewNote);
        };
    }, [socket, projectId]);

    const handleSend = async (parentId: string | null = null) => {
        const content = parentId ? replyContent : newNote;
        if (!content.trim() && (!selectedFiles.length || parentId)) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            if (parentId) formData.append('parentId', parentId);
            if (!parentId) {
                selectedFiles.forEach(file => formData.append('attachments', file));
            }

            const res = await api.post(`/notes/${projectId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data && res.data.isHidden) {
                toast('Note hidden due to contact info policy', {
                    icon: '⚠️',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' },
                });
            } else {
                toast.success('Note sent');
            }

            if (parentId) {
                setReplyTo(null);
                setReplyContent('');
            } else {
                setNewNote('');
                setSelectedFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
            await fetchNotes();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to send note';
            if (msg.includes('prohibited contact information')) {
                toast.error('Blocked: ' + msg, { icon: <ShieldAlert className="text-red-500" />, duration: 5000 });
            } else {
                toast.error(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNotes = async () => {
        try {
            const res = await api.get(`/notes/${projectId}`);
            setNotes(res.data);
        } catch (error) {
            console.error('Failed to fetch notes', error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (selectedFiles.length + files.length > 5) {
                toast.error('Maximum 5 files allowed');
                return;
            }
            setSelectedFiles(prev => [...prev, ...files]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDelete = async (noteId: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            await api.delete(`/notes/${noteId}`);
            toast.success('Note deleted');
            fetchNotes();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleHide = async (noteId: string) => {
        try {
            await api.patch(`/notes/${noteId}/hide`, {});
            toast.success('Visibility toggled');
            fetchNotes();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const canDelete = (note: Note) => {
        if (isAdmin) return true;
        if (note.user._id === user?.id) {
            const hours = (new Date().getTime() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60);
            return hours < 1;
        }
        return false;
    };

    const threads = notes.filter(n => !n.parentId).map(parent => ({
        ...parent,
        replies: notes.filter(n => n.parentId === parent._id)
    }));

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderNoteContent = (note: Note) => {
        if (note.isHidden) {
            return (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-sm italic text-muted">
                    <EyeOff size={16} className="text-red-600 dark:text-red-400" />
                    {isAdmin ? (
                        <span><span className="text-red-600 dark:text-red-400 font-bold">HIDDEN:</span> {note.content}</span>
                    ) : (
                        <span>This message has been hidden by a moderator.</span>
                    )}
                </div>
            );
        }

        const getFileUrl = (path: string) => {
            if (path.startsWith('http')) return path;
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';
            const normalized = path.replace(/\\/g, '/');
            if (normalized.includes('uploads/')) {
                return `${baseUrl}/uploads/${normalized.split('uploads/')[1]}`;
            }
            const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
            return `${baseUrl}${cleanPath}`;
        };

        return (
            <div className="mt-1">
                <p className="text-muted text-sm whitespace-pre-wrap">{note.content}</p>
                {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {note.attachments.map((file, idx) => (
                            <a
                                key={idx}
                                href={getFileUrl(file.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-secondary/5 hover:bg-secondary/10 border border-glass-border rounded-lg p-2 text-xs text-blue-600 dark:text-blue-400 transition-colors"
                            >
                                <Paperclip size={12} />
                                <span className="max-w-[150px] truncate">{file.name}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const NoteItem = ({ note, isReply = false }: { note: Note, isReply?: boolean }) => (
        <div className={`flex gap-3 relative ${isReply ? '' : ''}`}>
            {isReply && <div className="absolute -left-6 top-3 w-4 h-0.5 bg-glass-border"></div>}

            <div className="mt-1 flex-shrink-0">
                <UserAvatar user={note.user} size={isReply ? 'sm' : 'md'} className={`border border-glass-border ${isReply ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <span className={`${isReply ? 'text-xs' : 'text-sm'} font-semibold ${note.isHidden && !isAdmin ? 'text-muted' : 'text-foreground'}`}>{note.user.name}</span>
                        <span className="text-[10px] text-pink-600 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">{note.user.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted">{formatDate(note.createdAt)}</span>
                        {(canDelete(note) || isAdmin) && (
                            <Popover.Root>
                                <Popover.Trigger asChild>
                                    <button className="text-muted hover:text-foreground transition-colors p-1"><MoreVertical size={14} /></button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content className="bg-surface border border-glass-border rounded-lg p-1 shadow-xl z-50 w-32 flex flex-col gap-1" sideOffset={5}>
                                        {canDelete(note) && (
                                            <button onClick={() => handleDelete(note._id)} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 hover:bg-secondary/5 p-2 rounded w-full text-left">
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <button onClick={() => handleHide(note._id)} className="flex items-center gap-2 text-xs text-muted hover:bg-secondary/5 p-2 rounded w-full text-left">
                                                {note.isHidden ? <Eye size={14} /> : <EyeOff size={14} />} {note.isHidden ? 'Unhide' : 'Hide'}
                                            </button>
                                        )}
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        )}
                    </div>
                </div>

                {renderNoteContent(note)}

                {settings.notes_replies_enabled === true && !isReply && !note.isHidden && (
                    <div className="mt-2 flex gap-4">
                        <button
                            onClick={() => setReplyTo(replyTo === note._id ? null : note._id)}
                            className="text-xs text-muted hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            <Reply size={12} /> Reply
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const isProjectMismatch = !activeProject || activeProject.id !== projectId;
    const projectStatus = isProjectMismatch ? 'ENABLED' : ((activeProject as any).notesStatus || 'ENABLED');
    const isReadOnly = settings.notes_replies_enabled === false || projectStatus === 'READ_ONLY';
    const isNotesDisabled = !settings.notes_system_enabled || projectStatus === 'DISABLED';

    if (isNotesDisabled && !isAdmin) return null;

    // Get unique avatars for collapsed state
    const uniqueUsers = Array.from(new Set(notes.map(n => n.user._id))).map(id => notes.find(n => n.user._id === id)?.user).filter((u): u is Note['user'] => u !== undefined).slice(0, 5);

    return (
        <div className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-0 md:p-4 flex flex-col' : ''}`}>
            <GlassCard className={`p-0 overflow-hidden transition-all duration-300 ${isExpanded ? '' : 'hover:bg-secondary/5'} ${isFullScreen ? 'h-full flex flex-col' : ''}`}>
                {/* Header */}
                <div
                    className={`p-6 flex justify-between items-center cursor-pointer ${isExpanded ? `border-b ${isFullScreen ? 'border-gray-200 dark:border-gray-800 bg-surface' : 'border-glass-border bg-secondary/5'}` : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-pink-500/20 text-pink-600 dark:text-pink-400 transition-colors ${isExpanded ? 'bg-pink-500 text-white' : ''}`}>
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            Team Discussion
                            <span className="text-xs font-normal text-muted bg-secondary/10 px-2 py-0.5 rounded-full">{notes.length}</span>
                        </h3>
                        {!isExpanded && notes.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                {uniqueUsers.map((u, i) => (
                                    <div key={i} className="w-5 h-5 rounded-full border border-surface overflow-hidden relative" style={{ zIndex: 10 - i, marginLeft: i > 0 ? -6 : 0 }}>
                                        <UserAvatar user={u} size="xs" noBorder />
                                    </div>
                                ))}
                                {notes.length > 0 && <span className="text-xs text-muted ml-2">Active discussion</span>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Controls (only show when expanded) */}
                    {isExpanded && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setAutoScroll(!autoScroll); }}
                                className={`p-1.5 rounded-lg transition-colors ${autoScroll ? 'bg-pink-500/20 text-pink-600 dark:text-pink-400' : 'text-muted hover:text-foreground'}`}
                                title="Toggle Auto-scroll"
                            >
                                <div className="flex flex-col items-center gap-0.5 scale-75">
                                    <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-current rotate-45 transform translate-y-[-2px]"></div>
                                    <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-current rotate-45 transform translate-y-[-4px]"></div>
                                </div>
                            </button>

                            {isAdmin && activeProject && (
                                <div onClick={e => e.stopPropagation()} className="flex bg-secondary/10 rounded-lg p-1 border border-glass-border">
                                    {(['ENABLED', 'READ_ONLY', 'DISABLED'] as const).map((status) => (
                                        <button
                                            key={status}
                                            onClick={async () => {
                                                try {
                                                    await updateProjectDetails(activeProject.id, { notesStatus: status });
                                                    toast.success(`Updated`);
                                                } catch (e) {
                                                    toast.error('Failed');
                                                }
                                            }}
                                            className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${((activeProject as any).notesStatus || 'ENABLED') === status
                                                ? 'bg-pink-500 text-white shadow-lg'
                                                : 'text-muted hover:text-foreground hover:bg-secondary/10'
                                                }`}
                                        >
                                            {status === 'ENABLED' ? 'ON' : status === 'DISABLED' ? 'OFF' : 'READ'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFullScreen(!isFullScreen);
                                if (!isExpanded && !isFullScreen) setIsExpanded(true);
                            }}
                            className="p-2 text-muted hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors md:hidden"
                        >
                            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <div className="text-muted p-2">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body (Collapsible) */}
            {isExpanded && (
                <div className={`${isFullScreen ? 'bg-background flex-1 flex flex-col min-h-0' : 'bg-secondary/5'}`}>
                    {isNotesDisabled && (
                        <div className="m-4 mb-0 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-sm text-red-200">
                            <EyeOff size={16} />
                            <span>Notes are currently <strong>disabled</strong> and hidden from clients/translators.</span>
                        </div>
                    )}

                    <div className={`p-4 space-y-4 overflow-y-auto pr-2 custom-scrollbar ${isFullScreen ? 'flex-1' : 'max-h-[350px]'}`}>
                        {threads.length === 0 ? (
                            <div className="text-center text-muted py-8">No notes yet. Start a discussion!</div>
                        ) : (
                            threads.map(thread => (
                                <div key={thread._id} className={`${isFullScreen ? 'bg-surface border-gray-200 dark:border-gray-800' : 'bg-secondary/5 border-glass-border'} rounded-xl p-4 border ${thread.isHidden ? 'border-red-500/20 bg-red-500/5' : ''}`}>
                                    <NoteItem note={thread} />
                                    {thread.replies.length > 0 && (
                                        <div className={`mt-4 pl-8 space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 ${isFullScreen ? 'before:bg-gray-200 dark:before:bg-gray-700' : 'before:bg-glass-border'}`}>
                                            {thread.replies.map(reply => (
                                                <NoteItem key={reply._id} note={reply} isReply={true} />
                                            ))}
                                        </div>
                                    )}

                                    {replyTo === thread._id && settings.notes_replies_enabled === true && (
                                        <div className="mt-3 pl-11">
                                            <div className="flex gap-2">
                                                <input
                                                    value={replyContent}
                                                    onChange={e => setReplyContent(e.target.value)}
                                                    placeholder="Write a reply..."
                                                    className={`flex-1 ${isFullScreen ? 'bg-background border-gray-200 dark:border-gray-700' : 'bg-secondary/10 border-glass-border'} border rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none`}
                                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(thread._id); } }}
                                                />
                                                <button
                                                    onClick={() => handleSend(thread._id)}
                                                    disabled={!replyContent.trim() || isLoading}
                                                    className="p-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white disabled:opacity-50"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={notesEndRef} />
                    </div>

                    {!isReadOnly && (
                        <div className={`relative p-4 pt-2 border-t ${isFullScreen ? 'border-gray-200 dark:border-gray-800 bg-background' : 'border-glass-border bg-secondary/5'}`}>
                            <textarea
                                value={newNote}
                                onChange={e => setNewNote(e.target.value)}
                                placeholder="Add a note to the team..."
                                className={`w-full ${isFullScreen ? 'bg-surface border-gray-200 dark:border-gray-800' : 'bg-secondary/10 border-glass-border'} border rounded-xl p-3 pr-12 pb-10 text-foreground focus:border-pink-500 outline-none min-h-[60px] resize-none text-sm`}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        if (enterToSend && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(null);
                                        } else if (!enterToSend && e.ctrlKey) {
                                            handleSend(null);
                                        }
                                    }
                                }}
                            />

                            {selectedFiles.length > 0 && (
                                <div className="absolute bottom-12 left-6 right-6 flex gap-2 overflow-x-auto py-1 custom-scrollbar">
                                    {selectedFiles.map((file, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-pink-500/20 border border-pink-500/30 rounded px-2 py-0.5 text-xs text-white shrink-0">
                                            <span className="max-w-[100px] truncate">{file.name}</span>
                                            <button onClick={() => removeFile(i)} className="hover:text-red-600 dark:text-red-400"><Trash2 size={10} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {settings.ai_moderation_contact_info && (user?.role === 'CLIENT' || user?.role === 'TRANSLATOR') && (
                                (() => {
                                    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
                                    const phoneRegex = /(?:(?:\+|00)\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4,}|(?:\d{10,})/;
                                    const hasContact = emailRegex.test(newNote) || phoneRegex.test(newNote);

                                    return hasContact ? (
                                        <div className="absolute top-[-30px] left-4 right-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs p-1.5 rounded-lg flex items-center gap-2 animate-pulse">
                                            <ShieldAlert size={12} className="text-yellow-500" />
                                            No contact info allowed.
                                        </div>
                                    ) : null;
                                })()
                            )}

                            <div className="absolute bottom-6 right-6 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-muted hover:text-foreground transition-colors"
                                        title="Attach Files"
                                    >
                                        <Paperclip size={16} />
                                    </button>
                                </div>

                                <div className="h-4 w-[1px] bg-glass-border"></div>

                                <div className="flex items-center gap-2 text-[10px] text-muted">
                                    <input
                                        type="checkbox"
                                        checked={enterToSend}
                                        onChange={e => {
                                            setEnterToSend(e.target.checked);
                                            localStorage.setItem('notes_enter_to_send', String(e.target.checked));
                                        }}
                                        className="rounded bg-secondary/10 border-glass-border"
                                    />
                                    <span className="hidden sm:inline">Enter to send</span>
                                </div>

                                <button
                                    onClick={() => handleSend(null)}
                                    disabled={!newNote.trim() && !selectedFiles.length || isLoading}
                                    className="p-1.5 bg-pink-600 hover:bg-pink-500 rounded-lg text-white disabled:opacity-50 transition-colors shadow-lg shadow-pink-500/20"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            </GlassCard>
        </div>
    );
};
