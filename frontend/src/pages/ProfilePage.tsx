import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../store/useAuthStore';
import { Save, User, Lock, Trash2, Globe, Trophy } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { FormInput } from '../components/FormInput';
import { UserAvatar } from '../components/UserAvatar';
import * as LucideIcons from 'lucide-react';

// --- Schemas ---
const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores and dashes')
        .optional()
        .or(z.literal('')),
    email: z.string().email('Invalid email address'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional(),
    socialLinks: z.object({
        linkedin: z.string().optional().or(z.literal('')),
        twitter: z.string().optional().or(z.literal('')),
        website: z.string().optional().or(z.literal(''))
    }).optional(),
    specializations: z.array(z.string()).optional()
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

import { Skeleton } from '../components/ui/Skeleton';
import { PROJECT_DOMAINS } from '../constants/domains';
import { useSystemStore } from '../store/useSystemStore';

export const ProfilePage = () => {
    const { user, setUser, isLoading } = useAuthStore();
    const { settings } = useSystemStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'public' | 'security' | 'achievements'>('profile');

    if (isLoading || !user) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-4">
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                    <div className="col-span-2 space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    const [availability, setAvailability] = useState<{ available: boolean; suggestions: string[] } | null>(null);
    const [checking, setChecking] = useState(false);

    // Forms
    const { register: regProfile, handleSubmit: subProfile, watch, setValue, formState: { errors: errProfile, isSubmitting: isSubProfile } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            // @ts-ignore
            username: user?.username || '',
            email: user?.email || '',
            bio: user?.bio || '',
            jobTitle: user?.jobTitle || '',
            socialLinks: {
                linkedin: user?.socialLinks?.linkedin || '',
                twitter: user?.socialLinks?.twitter || '',
                website: user?.socialLinks?.website || ''
            }
        }
    });

    const watchedUsername = watch('username');

    // Auto-check availability with debounce
    // @ts-ignore
    useEffect(() => {
        const checkUsername = async () => {
            if (!watchedUsername || watchedUsername.length < 3) {
                setAvailability(null);
                setChecking(false);
                return;
            }
            if (watchedUsername === user?.username) {
                setAvailability(null); // It's their own username
                return;
            }

            setChecking(true);
            try {
                // @ts-ignore
                const res = await api.post('/users/check-username', { username: watchedUsername });
                setAvailability(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setChecking(false);
            }
        };

        const timer = setTimeout(() => {
            checkUsername();
        }, 500);

        return () => clearTimeout(timer);
    }, [watchedUsername, user?.username]);

    const { register: regPass, handleSubmit: subPass, reset: resetPass, formState: { errors: errPass, isSubmitting: isSubPass } } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema)
    });

    // --- Handlers ---
    const onProfileUpdate = async (data: ProfileForm) => {
        try {
            const res = await api.put('/users/profile', data);
            setUser({ ...user!, ...res.data });
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const onPasswordChange = async (data: PasswordForm) => {
        try {
            await api.put('/users/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast.success('Password changed successfully');
            resetPass();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Change failed');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'public', label: 'Public Profile', icon: Globe },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-4xl font-bold font-outfit text-foreground">My Profile</h1>
                <p className="text-muted mt-2">Manage your personal account settings and security.</p>
            </div>

            <div className="flex gap-4 border-b border-glass-border pb-4 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-secondary/10 text-muted hover:bg-secondary/20 hover:text-foreground'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <GlassCard className="p-8">
                {activeTab === 'profile' && (
                    <motion.form
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onSubmit={subProfile(onProfileUpdate)}
                        className="space-y-6"
                    >
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-secondary/10 border border-glass-border overflow-hidden flex items-center justify-center relative group">
                                {user?.avatar ? (
                                    <>
                                        <UserAvatar user={user} size="lg" className="w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                try {
                                                    await api.put('/users/profile', {
                                                        name: user?.name,
                                                        email: user?.email,
                                                        avatar: '' // Clear avatar
                                                    });
                                                    setUser({ ...user!, avatar: '' });
                                                    toast.success('Avatar removed');
                                                } catch (err) {
                                                    toast.error('Failed to remove avatar');
                                                }
                                            }}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            title="Remove Avatar"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </>
                                ) : (
                                    <UserAvatar user={user} size="lg" className="w-full h-full" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                const formData = new FormData();
                                                formData.append('file', e.target.files[0]);
                                                try {
                                                    const res = await api.post('/users/upload-avatar', formData, {
                                                        headers: { 'Content-Type': undefined }
                                                    });
                                                    const newAvatar = res.data.url;
                                                    setUser({ ...user!, avatar: newAvatar });

                                                    await api.put('/users/profile', {
                                                        name: user?.name,
                                                        email: user?.email,
                                                        avatar: newAvatar
                                                    });
                                                    toast.success('Avatar updated');
                                                } catch (err) {
                                                    toast.error('Avatar upload failed');
                                                }
                                            }
                                        }}
                                    />
                                    <span className="text-xs text-white font-medium">Change</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-foreground font-medium">Profile Picture</h3>
                                <p className="text-sm text-muted">Click image to upload new photo</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Full Name"
                                error={errProfile.name}
                                {...regProfile('name')}
                            />
                            <div>
                                <div className="relative">
                                    <FormInput
                                        label="Username (Optional)"
                                        placeholder="unique_username"
                                        error={errProfile.username}
                                        {...regProfile('username', {
                                            onChange: (e) => {
                                                const val = e.target.value;
                                                const sanitized = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                                                if (val !== sanitized) {
                                                    e.target.value = sanitized;
                                                    setValue('username', sanitized, { shouldValidate: true });
                                                }
                                            }
                                        })}
                                    />
                                    {checking && (
                                        <div className="absolute right-3 top-[38px] text-muted text-xs flex items-center gap-1 animate-pulse">
                                            Checking...
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] text-muted mt-1 flex items-center gap-2">
                                    <LucideIcons.Info size={10} />
                                    <span>Only lowercase letters "a-z", numbers "0-9", underscores "_" and dashes "-" allowed.</span>
                                </div>

                                {availability && watchedUsername && watchedUsername !== user?.username && !checking && (
                                    <div className="mt-2 text-sm">
                                        {availability.available ? (
                                            <span className="text-green-500 dark:text-green-400 flex items-center gap-1">
                                                <LucideIcons.CheckCircle size={14} /> Available
                                            </span>
                                        ) : (
                                            <div className="space-y-1">
                                                <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                                                    <LucideIcons.XCircle size={14} /> Taken. Try one of these:
                                                </span>
                                                <div className="flex gap-2 flex-wrap">
                                                    {availability.suggestions.map(s => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => {
                                                                setValue('username', s);
                                                                setAvailability(null); // Reset after pick
                                                            }}
                                                            className="px-2 py-1 bg-secondary/10 hover:bg-secondary/20 border border-glass-border rounded-md text-xs text-blue-500 transition-colors"
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <FormInput
                            label="Email Address"
                            type="email"
                            error={errProfile.email}
                            {...regProfile('email')}
                        />
                        <button disabled={isSubProfile} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">
                            <Save size={18} /> {isSubProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                    </motion.form>
                )}

                {activeTab === 'public' && (
                    <motion.form
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onSubmit={subProfile(onProfileUpdate)}
                        className="space-y-6"
                    >
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-200 text-sm mb-6 flex flex-wrap gap-1">
                            {/* @ts-ignore */}
                            <span className="font-semibold">Public Profile Link:</span>
                            <a href={`/u/${user?.username || user?.id}`} target="_blank" rel="noreferrer" className="underline hover:text-blue-800 dark:hover:text-white break-all">{`${window.location.origin}/u/${user?.username || user?.id}`}</a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Job Title"
                                placeholder="e.g. Senior Translator"
                                error={errProfile.jobTitle}
                                {...regProfile('jobTitle')}
                            />
                            <FormInput
                                label="Website / Portfolio"
                                placeholder="https://..."
                                error={errProfile.socialLinks?.website}
                                {...regProfile('socialLinks.website')}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-muted">Bio / About Me</label>
                            <textarea
                                rows={4}
                                placeholder="Tell the world about yourself..."
                                {...regProfile('bio')}
                                className="bg-secondary/10 border border-glass-border rounded-lg p-3 w-full focus:outline-none focus:border-blue-500 text-foreground placeholder-muted transition-colors"
                            />
                            {errProfile.bio && <span className="text-sm text-red-500">{errProfile.bio.message}</span>}
                        </div>

                        {/* Specializations Multi-select */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted">Specializations / Domains</label>
                            <div className="flex flex-wrap gap-2 p-3 border border-glass-border rounded-xl bg-secondary/5">
                                {PROJECT_DOMAINS.map(domain => {
                                    const current = watch('specializations') || [];
                                    const isSelected = current.includes(domain);
                                    return (
                                        <button
                                            key={domain}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (isSelected) {
                                                    setValue('specializations', current.filter(d => d !== domain));
                                                } else {
                                                    setValue('specializations', [...current, domain]);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isSelected
                                                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                                                : 'bg-secondary/10 text-muted border-glass-border hover:bg-secondary/20 hover:text-foreground'
                                                }`}
                                        >
                                            {domain}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="LinkedIn URL"
                                placeholder="https://linkedin.com/in/..."
                                error={errProfile.socialLinks?.linkedin}
                                {...regProfile('socialLinks.linkedin')}
                            />
                            <FormInput
                                label="Twitter/X URL"
                                placeholder="https://twitter.com/..."
                                error={errProfile.socialLinks?.twitter}
                                {...regProfile('socialLinks.twitter')}
                            />
                        </div>

                        <button disabled={isSubProfile} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">
                            <Save size={18} /> {isSubProfile ? 'Saving...' : 'Update Public Profile'}
                        </button>
                    </motion.form>
                )}

                {activeTab === 'security' && (
                    <motion.form
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onSubmit={subPass(onPasswordChange)}
                        className="space-y-6"
                    >
                        <FormInput
                            label="Current Password"
                            type="password"
                            error={errPass.currentPassword}
                            {...regPass('currentPassword')}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="New Password"
                                type="password"
                                error={errPass.newPassword}
                                {...regPass('newPassword')}
                            />
                            <FormInput
                                label="Confirm New Password"
                                type="password"
                                error={errPass.confirmPassword}
                                {...regPass('confirmPassword')}
                            />
                        </div>
                        <button disabled={isSubPass} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">
                            <Save size={18} /> {isSubPass ? 'Updating...' : 'Update Password'}
                        </button>
                    </motion.form>
                )}

                {activeTab === 'achievements' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">Your Achievements</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* @ts-ignore */}
                            {user?.achievements && user.achievements.length > 0 ? (
                                // @ts-ignore
                                user.achievements.map((ach: any) => {
                                    // @ts-ignore
                                    const IconEnv = LucideIcons[ach.icon] || Trophy;
                                    return (
                                        <div key={ach.id} className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-4">
                                            <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400">
                                                <IconEnv size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">{ach.name}</h3>
                                                <p className="text-sm text-muted">{ach.description}</p>
                                                <div className="text-xs text-muted/80 mt-1">Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-2 text-center py-10 text-muted">
                                    <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No achievements unlocked yet. Complete projects to earn badges!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </GlassCard>
        </div>
    );
};
