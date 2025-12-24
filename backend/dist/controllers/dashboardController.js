"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Project_1 = require("../models/Project");
const User_1 = require("../models/User");
const Language_1 = require("../models/Language");
const Glossary_1 = __importDefault(require("../models/Glossary"));
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { duration } = req.query;
        // Time Filter Logic
        let dateQuery = {};
        const now = new Date();
        if (duration === 'week') {
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            dateQuery = { createdAt: { $gte: lastWeek } };
        }
        else if (duration === 'month') {
            const lastMonth = new Date(now);
            lastMonth.setMonth(now.getMonth() - 1);
            dateQuery = { createdAt: { $gte: lastMonth } };
        }
        else if (duration === 'year') {
            const lastYear = new Date(now);
            lastYear.setFullYear(now.getFullYear() - 1);
            dateQuery = { createdAt: { $gte: lastYear } };
        }
        // 'all' or undefined = no date filter
        // FIX: We strictly want "All Time" stats for the main widgets, so we do NOT include dateQuery here.
        // We only apply role-based filters.
        let query = {};
        // Role-based filtering
        if (user.role === 'CLIENT') {
            query.clientId = user.id;
        }
        else if (user.role === 'TRANSLATOR') {
            query.assignedTranslators = user.id;
        }
        console.log('--- DASHBOARD DEBUG ---');
        console.log('User:', { id: user.id, role: user.role, email: user.email });
        console.log('Query:', JSON.stringify(query));
        console.log('Duration Param:', duration);
        // --- 1. Fetch Projects & Basic Stats (ALL TIME for Overview) ---
        // We do NOT apply dateQuery here anymore, so the "Overview" widgets show the actual state of the system
        const projects = yield Project_1.Project.find(query).sort({ updatedAt: -1 });
        console.log('Projects Found:', projects.length);
        const total = projects.length;
        const pending = projects.filter(p => p.status === 'DRAFT' || p.status === 'ACTIVE').length;
        const review = projects.filter(p => p.status === 'REVIEW').length;
        const completed = projects.filter(p => p.status === 'COMPLETED').length;
        // Calculated field for Sidebar Badge
        const activeProjects = pending + review;
        // --- 2. Word Count & AI Metrics ---
        // Calculate total words across all projects
        const totalSystemWords = projects.reduce((acc, project) => {
            var _a;
            const projectWords = ((_a = project.files) === null || _a === void 0 ? void 0 : _a.reduce((fAcc, file) => fAcc + (file.wordCount || 0), 0)) || 0;
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
        const dateBuckets = {};
        const dateKeys = []; // Stores keys like "12-9" (Month-Day) or full string
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            // Use local date parts to ensure consistency with "Today"
            const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            dateBuckets[key] = 0;
            dateKeys.push(key); // Index 0 = Today-6, Index 6 = Today
        }
        // Fetch ALL projects for activity chart to be accurate (independent of filter)
        let activityQuery = {};
        if (user.role === 'CLIENT')
            activityQuery.clientId = user.id;
        else if (user.role === 'TRANSLATOR')
            activityQuery.assignedTranslators = user.id;
        const allProjectsForChart = yield Project_1.Project.find(activityQuery).sort({ createdAt: -1 }).limit(200);
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
        const langMap = {};
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
        let translatorStats = [];
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            totalUsers = yield User_1.User.countDocuments();
            // Estimate Revenue
            projects.forEach(p => {
                var _a;
                const pWords = ((_a = p.files) === null || _a === void 0 ? void 0 : _a.reduce((sum, f) => sum + (f.wordCount || 0), 0)) || 0;
                if (p.status !== 'DRAFT') {
                    revenue += pWords * 0.10;
                }
            });
        }
        // --- 6. Stats for Translators (Admin & Translators) ---
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'TRANSLATOR') {
            const translators = yield User_1.User.find({ role: 'TRANSLATOR' });
            translatorStats = yield Promise.all(translators.map((t) => __awaiter(void 0, void 0, void 0, function* () {
                // Apply same date query to translator projects -> KEEP DATE QUERY HERE FOR "Top Translators this week/month"
                const tQuery = Object.assign(Object.assign({}, dateQuery), { assignedTranslators: t._id });
                const tProjects = yield Project_1.Project.find(tQuery);
                const completedCount = tProjects.filter(p => p.status === 'COMPLETED').length;
                const totalWords = tProjects.reduce((sum, p) => {
                    var _a;
                    return sum + (((_a = p.files) === null || _a === void 0 ? void 0 : _a.reduce((fSum, f) => fSum + (f.wordCount || 0), 0)) || 0);
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
            })));
            // --- 7. Recent Clients (New) ---
            const recentClients = yield User_1.User.find({ role: 'CLIENT' })
                .sort({ createdAt: -1 })
                .limit(5);
            // Sort by words translated (top performers)
            translatorStats.sort((a, b) => b.totalWords - a.totalWords);
            translatorStats = translatorStats.slice(0, 3); // Take top 3
        }
        // --- 9. AI Configuration (Real Status) ---
        const aiSettings = yield Promise.resolve().then(() => __importStar(require('../models/SystemSetting'))).then(m => m.SystemSetting.find({
            key: { $in: ['ai_provider', 'ai_model', 'ai_api_key'] }
        }));
        const aiConfig = {};
        aiSettings.forEach(s => aiConfig[s.key] = s.value);
        // Determine status based on API Key existence (mock check)
        const aiStatus = (aiConfig.ai_api_key && aiConfig.ai_api_key !== '') ? 'ACTIVE' : 'INACTIVE';
        const aiModelName = aiConfig.ai_model || 'Gemini Pro 1.5';
        const aiProvider = aiConfig.ai_provider || 'Google Gemini';
        // --- 8. Global Counts (Sidebar Badges) ---
        // Efficient count queries
        const totalLanguages = yield Language_1.Language.countDocuments();
        const totalGlossaryTerms = yield Glossary_1.default.countDocuments();
        res.json(Object.assign(Object.assign({ activeProjects, projects: {
                total,
                pending,
                review,
                completed
            }, wordsTranslated, aiMetrics: {
                processedWords: aiProcessedWords,
                hoursSaved,
                status: aiStatus,
                modelName: aiModelName,
                provider: aiProvider
            }, activity: realActivity, recentProjects: projects.slice(0, 5), languageDistribution,
            // Global Counts for Sidebar
            totalLanguages,
            totalGlossaryTerms }, (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? {
            revenue: Math.round(revenue),
            totalUsers,
            recentClients: (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? yield User_1.User.find({ role: 'CLIENT' }).sort({ createdAt: -1 }).limit(5) : []
        } : {})), (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'TRANSLATOR' ? {
            translatorStats
        } : {})));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getDashboardStats = getDashboardStats;
