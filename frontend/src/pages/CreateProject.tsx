import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { useSystemStore } from '../store/useSystemStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { FormInput } from '../components/FormInput';
import { useAuthStore } from '../store/useAuthStore';
import { useUserListStore } from '../store/useUserListStore';
import { PROJECT_DOMAINS } from '../constants/domains';
import { SearchableSelect } from '../components/SearchableSelect';

const projectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    domain: z.string().optional(),
    sourceLang: z.string().min(1, 'Source language is required'),
    targetLangs: z.array(z.string()).min(1, 'Select at least one target language'),
    deadline: z.string().optional().refine(val => !val || new Date(val) >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Deadline cannot be in the past"
    }),
    clientId: z.string().optional(),
    assignedTranslators: z.array(z.string()).optional()
});

type ProjectForm = z.infer<typeof projectSchema>;

export const CreateProject = () => {
    const navigate = useNavigate();
    const { createProject } = useProjectStore();
    const { settings, fetchSettings } = useSystemStore();
    const { languages, fetchLanguages } = useLanguageStore();
    const { user } = useAuthStore();
    const { clients, translators, fetchClients, fetchTranslators } = useUserListStore();
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchSettings();
        fetchLanguages();
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            fetchClients();
            fetchTranslators();
        }
    }, [user?.role]);

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<ProjectForm>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: '',
            description: '',
            domain: 'General',
            sourceLang: '',
            targetLangs: [],
            deadline: '',
            clientId: '',
            assignedTranslators: []
        }
    });

    const onSubmit = async (data: ProjectForm) => {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);
            if (data.domain) formData.append('domain', data.domain);
            formData.append('sourceLang', data.sourceLang);
            data.targetLangs.forEach(lang => formData.append('targetLangs', lang));
            if (data.deadline) formData.append('deadline', data.deadline);
            if (data.clientId) formData.append('clientId', data.clientId);
            if (data.assignedTranslators) {
                data.assignedTranslators.forEach(tId => formData.append('assignedTranslators', tId));
            }

            files.forEach(file => {
                formData.append('files', file);
            });

            await createProject(formData);
            toast.success('Project created successfully!');
            navigate('/projects');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create project');
        }
    };

    const validateFile = (file: File) => {
        // Normalize settings: Ensure all have leading dot and are lowercase
        const rawAllowed = settings.allowed_file_types || ['.pdf', '.docx', '.txt'];
        const allowedExtensions = rawAllowed.map(ext => ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`);
        
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            // Remove dots for cleaner display message
            const displayAllowed = allowedExtensions.map(e => e.replace('.', '').toUpperCase());
            toast.error(`File type ${fileExtension} is not allowed. Allowed: ${displayAllowed.join(', ')}`);
            return false;
        }

        const maxSize = (settings.max_file_size_mb || 10) * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(`File size exceeds ${settings.max_file_size_mb}MB limit`);
            return false;
        }

        return true;
    };

    // Transform Data for Selects
    const languageOptions = languages.map(l => ({ value: l.code, label: `${l.name} (${l.code.toUpperCase()})` }));
    const clientOptions = clients.map(c => ({ value: c._id, label: c.name, avatar: c.avatar, email: c.email }));
    const translatorOptions = translators.map(t => ({ value: t._id, label: t.name, avatar: t.avatar, email: t.email }));
    const domainOptions = (settings.project_domains || PROJECT_DOMAINS).map(d => ({ value: d, label: d }));

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard className="p-8">
                    <h1 className="text-3xl font-bold mb-2 font-outfit">Create New Project</h1>
                    <p className="text-gray-400 mb-8">Set up your translation project details.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <FormInput
                            label="Project Title"
                            placeholder="e.g. Annual Marketing Report 2024"
                            error={errors.title}
                            {...register('title')}
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-muted">Description (Optional)</label>
                            <textarea
                                {...register('description')}
                                className="w-full bg-secondary/10 border border-glass-border rounded-xl px-4 py-3 text-foreground focus:border-blue-500 outline-none min-h-[100px]"
                                placeholder="Add project details, context, or instructions..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-muted mb-1">Project Domain / Field</label>
                            <select
                                value={watch('domain') || 'General'}
                                onChange={(e) => setValue('domain', e.target.value)}
                                className="w-full bg-secondary/10 border border-glass-border rounded-xl px-4 py-3 text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer"
                            >
                                {domainOptions.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-surface text-foreground">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <SearchableSelect
                                    label="Source Language"
                                    options={languageOptions}
                                    value={watch('sourceLang')}
                                    onChange={(val) => setValue('sourceLang', val as string, { shouldValidate: true })}
                                    error={errors.sourceLang}
                                    placeholder="Select Source Language"
                                />
                            </div>

                            <FormInput
                                label="Deadline (Optional)"
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                error={errors.deadline}
                                {...register('deadline')}
                            />
                        </div>

                        <div className="space-y-1">
                            <SearchableSelect
                                label="Target Languages"
                                options={languageOptions}
                                value={watch('targetLangs') || []}
                                onChange={(val) => setValue('targetLangs', val as string[], { shouldValidate: true })}
                                multiple
                                error={errors.targetLangs}
                                placeholder="Select Target Languages"
                            />
                        </div>

                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <SearchableSelect
                                        label="Assign Client (Optional)"
                                        options={[{ value: '', label: 'Myself (Default)' }, ...clientOptions]}
                                        value={watch('clientId') || ''}
                                        onChange={(val) => setValue('clientId', val as string)}
                                        placeholder="Select Client"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <SearchableSelect
                                        label="Assign Translators"
                                        options={translatorOptions}
                                        value={watch('assignedTranslators') || []}
                                        onChange={(val) => setValue('assignedTranslators', val as string[])}
                                        multiple
                                        placeholder="Select Translators"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Upload Files</label>
                            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors group cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const newFiles = Array.from(e.target.files).filter(validateFile);
                                            // @ts-ignore
                                            setFiles(prev => [...prev, ...newFiles]);
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                                    <Upload size={24} className="text-blue-400" />
                                </div>
                                <p className="text-gray-300 font-medium">Click to upload files</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {settings.allowed_file_types?.join(', ').toUpperCase() || 'PDF, DOCX, TXT'}
                                    (Max {settings.max_file_size_mb || 10}MB)
                                </p>
                            </div>
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                            <span className="text-sm text-gray-300">{file.name}</span>
                                            <button type="button" onClick={() => {
                                                setFiles(prev => prev.filter((_, idx) => idx !== i));
                                            }} className="text-red-400 hover:text-red-300">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
};
