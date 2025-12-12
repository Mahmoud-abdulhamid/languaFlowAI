import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { Segment } from '../models/Segment';
import { Language } from '../models/Language';
import Glossary from '../models/Glossary';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const { duration } = req.query;

        // Time Filter Logic
        let dateQuery: any = {};
        const now = new Date();
        if (duration === 'week') {
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            dateQuery = { createdAt: { $gte: lastWeek } };
        } else if (duration === 'month') {
            const lastMonth = new Date(now);
            lastMonth.setMonth(now.getMonth() - 1);
            dateQuery = { createdAt: { $gte: lastMonth } };
        } else if (duration === 'year') {
            const lastYear = new Date(now);
            lastYear.setFullYear(now.getFullYear() - 1);
            dateQuery = { createdAt: { $gte: lastYear } };
        }
        // 'all' or undefined = no date filter

        let query: any = { ...dateQuery };

        // Role-based filtering
        if (user.role === 'CLIENT') {
            query.clientId = user.id;
        } else if (user.role === 'TRANSLATOR') {
            query.assignedTranslators = user.id;
        }

        // --- 1. Fetch Projects & Basic Stats ---
        const projects = await Project.find(query).sort({ updatedAt: -1 });

        const total = projects.length;
        const pending = projects.filter(p => p.status === 'DRAFT' || p.status === 'ACTIVE').length;
        const review = projects.filter(p => p.status === 'REVIEW').length;
        const completed = projects.filter(p => p.status === 'COMPLETED').length;

        // --- 2. Word Count & AI Metrics ---
        // Calculate total words across all projects
        const totalSystemWords = projects.reduce((acc, project) => {
            const projectWords = project.files?.reduce((fAcc: number, file: any) => fAcc + (file.wordCount || 0), 0) || 0;
            return acc + projectWords;
        }, 0);

        // We'll treat Total Words as "Processed Words" by the system (AI Nexus)
        const aiProcessedWords = totalSystemWords;

        // Estimate saved hours: Manual translation ~500 words/hr vs AI instant.
        // Saving = Time it would take manually.
        const hoursSaved = Number((aiProcessedWords / 500).toFixed(1));

        // (Aggregation logic removed for performance and reliability - using Project totals)
        const wordsTranslated = totalSystemWords;

        // --- 3. Activity Analytics (Rolling Last 7 Days) ---
        // Robust implementation using Local Date Strings to avoid timezone/math artifacts
        const dateBuckets: Record<string, number> = {};
        const dateKeys: string[] = []; // Stores keys like "12-9" (Month-Day) or full string

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            // Use local date parts to ensure consistency with "Today"
            const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            dateBuckets[key] = 0;
            dateKeys.push(key); // Index 0 = Today-6, Index 6 = Today
        }

        // Fetch ALL projects for activity chart to be accurate (independent of filter)
        let activityQuery: any = {};
        if (user.role === 'CLIENT') activityQuery.clientId = user.id;
        else if (user.role === 'TRANSLATOR') activityQuery.assignedTranslators = user.id;

        const allProjectsForChart = await Project.find(activityQuery).sort({ createdAt: -1 }).limit(200);

        allProjectsForChart.forEach(p => {
            const d = new Date(p.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

            if (dateBuckets[key] !== undefined) {
                dateBuckets[key]++;
            }
        });

        // Map buckets back to array [Count(Today-6), ..., Count(Today)]
        const realActivity = dateKeys.map(k => dateBuckets[k]);

        // --- 4. Language Distribution (Pie Chart Data) ---
        const langMap: Record<string, number> = {};
        projects.forEach(p => {
            const targets = p.targetLangs && p.targetLangs.length > 0 ? p.targetLangs : ['?'];
            targets.forEach(tgt => {
                const pair = `${p.sourceLang} → ${tgt}`;
                langMap[pair] = (langMap[pair] || 0) + 1;
            });
        });

        const languageDistribution = Object.entries(langMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // --- 5. Financial / Admin Specific Stats ---
        let revenue = 0;
        let totalUsers = 0;
        let translatorStats: any[] = [];

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            totalUsers = await User.countDocuments();
            // Estimate Revenue
            projects.forEach(p => {
                const pWords = p.files?.reduce((sum: number, f: any) => sum + (f.wordCount || 0), 0) || 0;
                if (p.status !== 'DRAFT') {
                    revenue += pWords * 0.10;
                }
            });
        }

        // --- 6. Stats for Translators (Admin & Translators) ---
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'TRANSLATOR') {
            const translators = await User.find({ role: 'TRANSLATOR' });

            translatorStats = await Promise.all(translators.map(async (t) => {
                // Apply same date query to translator projects
                const tQuery = { ...dateQuery, assignedTranslators: t._id };
                const tProjects = await Project.find(tQuery);

                const completedCount = tProjects.filter(p => p.status === 'COMPLETED').length;
                const totalWords = tProjects.reduce((sum, p) => {
                    return sum + (p.files?.reduce((fSum: number, f: any) => fSum + (f.wordCount || 0), 0) || 0);
                }, 0);

                return {
                    id: t._id,
                    name: t.name,
                    email: t.email,
                    avatar: t.avatar,
                    completedProjects: completedCount,
                    totalWords,
                    rating: 4.8 // Mock rating
                };
            }));

            // --- 7. Recent Clients (New) ---
            const recentClients = await User.find({ role: 'CLIENT' })
                .sort({ createdAt: -1 })
                .limit(5);

            // Sort by words translated (top performers)
            translatorStats.sort((a, b) => b.totalWords - a.totalWords);
            translatorStats = translatorStats.slice(0, 3); // Take top 3
        }

        // --- 9. AI Configuration (Real Status) ---
        const aiSettings = await import('../models/SystemSetting').then(m => m.SystemSetting.find({
            key: { $in: ['ai_provider', 'ai_model', 'ai_api_key'] }
        }));

        const aiConfig: any = {};
        aiSettings.forEach(s => aiConfig[s.key] = s.value);

        // Determine status based on API Key existence (mock check)
        const aiStatus = (aiConfig.ai_api_key && aiConfig.ai_api_key !== '') ? 'ACTIVE' : 'INACTIVE';
        const aiModelName = aiConfig.ai_model || 'Gemini Pro 1.5';
        const aiProvider = aiConfig.ai_provider || 'Google Gemini';

        // --- 8. Global Counts (Sidebar Badges) ---
        // Efficient count queries
        const totalLanguages = await Language.countDocuments();
        const totalGlossaryTerms = await Glossary.countDocuments();

        res.json({
            projects: {
                total,
                pending,
                review,
                completed
            },
            wordsTranslated,
            aiMetrics: {
                processedWords: aiProcessedWords,
                hoursSaved,
                status: aiStatus,
                modelName: aiModelName,
                provider: aiProvider
            },
            activity: realActivity,
            recentProjects: projects.slice(0, 5),
            languageDistribution,
            // Global Counts for Sidebar
            totalLanguages,
            totalGlossaryTerms,
            // Admin only fields
            ...(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? {
                revenue: Math.round(revenue),
                totalUsers,
                recentClients: (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? await User.find({ role: 'CLIENT' }).sort({ createdAt: -1 }).limit(5) : []
            } : {}),
            // Shared fields (Admin + Translator)
            ...(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'TRANSLATOR' ? {
                translatorStats
            } : {})
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
