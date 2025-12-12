import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserAvatar } from '../components/UserAvatar';
import { GlassCard } from '../components/GlassCard';
import { Briefcase, Calendar, Globe, Linkedin, Twitter, Share2, MessageSquare, CheckCircle, Trophy } from 'lucide-react';
import api from '../api/axios';
import { Skeleton } from '../components/ui/Skeleton';
import jsConfetti from 'js-confetti';
import * as LucideIcons from 'lucide-react';

interface PublicProfileData {
    user: {
        _id: string;
        name: string;
        avatar?: string;
        bio?: string;
        jobTitle?: string;
        socialLinks?: {
            linkedin?: string;
            twitter?: string;
            website?: string;
        };
        role: string;
        createdAt: string;
        achievements?: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
            unlockedAt: string;
        }>;
    };
    stats: {
        projectsCompleted: number;
        memberSince: string;
        languageCount: number;
    };
}

export const PublicProfile = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/profile/public/${id}`);
                setData(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfile();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        const confetti = new jsConfetti();
        confetti.addConfetti({ emojis: ['🔗', '✨', '🚀'] });
    };

    if (loading) return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
            {/* Hero Skeleton */}
            <Skeleton className="h-[400px] w-full rounded-3xl" />

            {/* Achievements Skeleton */}
            <Skeleton className="h-64 w-full rounded-3xl" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-bold mb-4">😕 User Not Found</h1>
            <p className="text-muted">This profile might be private or does not exist.</p>
        </div>
    );

    const { user, stats } = data;

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-8">

            {/* Hero Section */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative"
            >
                <GlassCard className="p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden border-t border-blue-500/30">

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 relative"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600">
                            <div className="w-full h-full rounded-full border-4 border-background overflow-hidden relative">
                                <UserAvatar user={user} size="lg" className="w-full h-full text-4xl" />
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-background" title="Active" />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold font-outfit text-foreground mb-2 mt-2">
                        {user.name}
                    </h1>

                    {user.jobTitle && (
                        <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-4 flex items-center gap-2">
                            <Briefcase size={20} />
                            {user.jobTitle}
                        </p>
                    )}

                    {user.bio && (
                        <p className="max-w-2xl text-muted text-lg leading-relaxed mb-8">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex gap-4">
                        {user.socialLinks?.website && (
                            <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-secondary/20 hover:bg-blue-500/20 rounded-full transition-colors text-blue-600 dark:text-blue-400">
                                <Globe size={24} />
                            </a>
                        )}
                        {user.socialLinks?.twitter && (
                            <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-secondary/20 hover:bg-sky-500/20 rounded-full transition-colors text-sky-600 dark:text-sky-500">
                                <Twitter size={24} />
                            </a>
                        )}
                        {user.socialLinks?.linkedin && (
                            <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-secondary/20 hover:bg-blue-700/20 rounded-full transition-colors text-blue-700 dark:text-blue-600">
                                <Linkedin size={24} />
                            </a>
                        )}
                        <button onClick={handleShare} className="p-3 bg-secondary/20 hover:bg-green-500/20 rounded-full transition-colors text-green-600 dark:text-green-500" title="Copy Profile Link">
                            <Share2 size={24} />
                        </button>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Achievements Section */}
            {user.achievements && user.achievements.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                >
                    <GlassCard className="p-8">
                        <h2 className="text-2xl font-bold font-outfit text-foreground mb-6 flex items-center gap-2">
                            <Trophy className="text-yellow-400" /> Achievements
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.achievements.map((ach) => {
                                // @ts-ignore
                                const IconEnv = LucideIcons[ach.icon] || Trophy;
                                return (
                                    <div key={ach.id} className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-4">
                                        <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400">
                                            <IconEnv size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground shadow-sm">{ach.name}</h3>
                                            <p className="text-sm text-muted">{ach.description}</p>
                                            <div className="text-xs text-muted-foreground mt-1">Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </motion.div>
            )}


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <GlassCard className="p-6 flex items-center gap-4 hover:bg-secondary/5 transition-colors">
                        <div className="p-4 bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-foreground">{stats.projectsCompleted}</h3>
                            <p className="text-muted">Projects Completed</p>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <GlassCard className="p-6 flex items-center gap-4 hover:bg-secondary/5 transition-colors">
                        <div className="p-4 bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-foreground">{new Date(stats.memberSince).getFullYear()}</h3>
                            <p className="text-muted">Member Since</p>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <GlassCard className="p-6 flex items-center gap-4 hover:bg-secondary/5 transition-colors">
                        <div className="p-4 bg-pink-500/20 rounded-xl text-pink-600 dark:text-pink-400">
                            <MessageSquare size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-foreground">{stats.languageCount}</h3>
                            <p className="text-muted">Languages</p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

        </div>
    );
};
