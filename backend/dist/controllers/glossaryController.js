"use strict";
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
exports.getGlossaryStats = exports.getGlossaryLanguages = exports.getBulkGenerationStatus = exports.stopBulkGeneration = exports.generateBulkTerms = exports.deleteTerm = exports.updateTerm = exports.getAllGlossary = exports.getProjectGlossary = exports.searchGlossary = exports.createTerm = void 0;
const Glossary_1 = __importDefault(require("../models/Glossary"));
const GlossaryGenerationJob_1 = __importDefault(require("../models/GlossaryGenerationJob"));
const SystemSetting_1 = require("../models/SystemSetting");
const createTerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { term, translation, sourceLang, targetLang, context, projectId } = req.body;
        // @ts-ignore
        const createdBy = req.user.id;
        const newTerm = new Glossary_1.default({
            term,
            translation,
            sourceLang,
            targetLang,
            context,
            projectId,
            createdBy
        });
        yield newTerm.save();
        res.status(201).json(newTerm);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating glossary term', error });
    }
});
exports.createTerm = createTerm;
const searchGlossary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, sourceLang, targetLang, projectId } = req.query;
        const filter = {};
        // Scope Filter: Project Specific OR Global
        if (projectId) {
            filter.$or = [
                { projectId: projectId },
                { projectId: null },
                { projectId: { $exists: false } }
            ];
        }
        // Bidirectional Filter
        const langFilter = {};
        if (sourceLang && targetLang) {
            langFilter.$or = [
                { sourceLang: sourceLang, targetLang: targetLang },
                { sourceLang: targetLang, targetLang: sourceLang }
            ];
        }
        else {
            if (sourceLang)
                langFilter.sourceLang = sourceLang;
            if (targetLang)
                langFilter.targetLang = targetLang;
        }
        // Merge Filters
        const finalFilter = { $and: [] };
        if (projectId || filter.$or)
            finalFilter.$and.push({ $or: filter.$or || [{}] }); // Pushing scope
        if (langFilter.$or || langFilter.sourceLang || langFilter.targetLang)
            finalFilter.$and.push(langFilter);
        if (query) {
            const searchClause = [
                { term: { $regex: query, $options: 'i' } },
                { translation: { $regex: query, $options: 'i' } }
            ];
            finalFilter.$and.push({ $or: searchClause });
        }
        // If no filters effectively, just find all (filtered by scope)
        // Cleanup if $and is empty? Mongoose handles empty $and fine? No.
        // Let's simplify.
        const queryObj = {};
        const andConditions = [];
        // 1. Scope
        if (projectId) {
            andConditions.push({
                $or: [
                    { projectId: projectId },
                    { projectId: null },
                    { projectId: { $exists: false } }
                ]
            });
        }
        // 2. Language Direction
        if (sourceLang && targetLang) {
            andConditions.push({
                $or: [
                    { sourceLang: sourceLang, targetLang: targetLang },
                    { sourceLang: targetLang, targetLang: sourceLang }
                ]
            });
        }
        else {
            if (sourceLang)
                queryObj.sourceLang = sourceLang;
            if (targetLang)
                queryObj.targetLang = targetLang;
        }
        // 3. Search Text
        if (query) {
            andConditions.push({
                $or: [
                    { term: { $regex: query, $options: 'i' } },
                    { translation: { $regex: query, $options: 'i' } }
                ]
            });
        }
        if (andConditions.length > 0) {
            queryObj.$and = andConditions;
        }
        const results = yield Glossary_1.default.find(queryObj).limit(20);
        // Normalize direction
        const normalized = results.map(t => {
            if (sourceLang && t.sourceLang !== sourceLang) {
                return Object.assign(Object.assign({}, t.toObject()), { term: t.translation, translation: t.term, sourceLang: t.targetLang, targetLang: t.sourceLang });
            }
            return t;
        });
        res.json(normalized);
    }
    catch (error) {
        res.status(500).json({ message: 'Error searching glossary', error });
    }
});
exports.searchGlossary = searchGlossary;
const getProjectGlossary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        // Fetch Project Terms OR Global Terms
        const terms = yield Glossary_1.default.find({
            $or: [
                { projectId: projectId },
                { projectId: null },
                { projectId: { $exists: false } }
            ]
        });
        res.json(terms);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project glossary', error });
    }
});
exports.getProjectGlossary = getProjectGlossary;
const getAllGlossary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 50, search, sourceLang, targetLang, projectId } = req.query;
        const query = {};
        if (sourceLang && targetLang) {
            query.$or = [
                { sourceLang: sourceLang, targetLang: targetLang },
                { sourceLang: targetLang, targetLang: sourceLang }
            ];
        }
        else {
            if (sourceLang)
                query.sourceLang = sourceLang;
            if (targetLang)
                query.targetLang = targetLang;
        }
        if (projectId)
            query.projectId = projectId;
        if (search) {
            const searchClause = [
                { term: { $regex: search, $options: 'i' } },
                { translation: { $regex: search, $options: 'i' } }
            ];
            if (query.$or) {
                query.$and = [
                    { $or: query.$or }, // Directional OR
                    { $or: searchClause } // Search OR
                ];
                delete query.$or;
            }
            else {
                query.$or = searchClause;
            }
        }
        const terms = yield Glossary_1.default.find(query)
            .populate('projectId', 'title')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = yield Glossary_1.default.countDocuments(query);
        // Swap if needed
        const normalizedTerms = terms.map(t => {
            if (sourceLang && t.sourceLang !== sourceLang) {
                return Object.assign(Object.assign({}, t.toObject()), { term: t.translation, translation: t.term, sourceLang: t.targetLang, targetLang: t.sourceLang });
            }
            return t;
        });
        res.json({ terms: normalizedTerms, total, pages: Math.ceil(total / Number(limit)) });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching glossary', error });
    }
});
exports.getAllGlossary = getAllGlossary;
const updateTerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const term = yield Glossary_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!term)
            return res.status(404).json({ message: 'Term not found' });
        res.json(term);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating term', error });
    }
});
exports.updateTerm = updateTerm;
const deleteTerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Glossary_1.default.findByIdAndDelete(id);
        res.json({ message: 'Term deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting term', error });
    }
});
exports.deleteTerm = deleteTerm;
const aiService_1 = require("../services/aiService");
const generateBulkTerms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sourceLang, targetLang, count = 20 } = req.body;
        // @ts-ignore
        const createdBy = req.user.id;
        // 1. Check System Setting
        const setting = yield SystemSetting_1.SystemSetting.findOne({ key: 'enable_ai_glossary_gen' });
        if (setting && setting.value === false) {
            return res.status(403).json({ message: 'AI Bulk Glossary Generator is disabled by Administrator.' });
        }
        if (!sourceLang || !targetLang) {
            return res.status(400).json({ message: 'Source and Target languages are required' });
        }
        // 2. Create Background Job
        const job = yield GlossaryGenerationJob_1.default.create({
            userId: createdBy,
            sourceLang,
            targetLang,
            targetCount: Number(count),
            status: 'PENDING'
        });
        // 3. Start Background Process (Fire & Forget)
        // We use a self-invoking async function or just call it without await
        processBulkGeneration(job._id, createdBy, sourceLang, targetLang, Number(count));
        // 4. Return Job ID immediately
        res.json({
            message: 'Background generation started',
            jobId: job._id,
            status: 'PENDING'
        });
    }
    catch (error) {
        console.error('Bulk Gen Start Error:', error);
        res.status(500).json({ message: 'Error starting generation job', error });
    }
});
exports.generateBulkTerms = generateBulkTerms;
// --- Background Worker Function ---
const processBulkGeneration = (jobId, userId, sourceLang, targetLang, totalCount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`[Job ${jobId}] Starting Bulk Gen: ${totalCount} terms (${sourceLang}->${targetLang})`);
        yield GlossaryGenerationJob_1.default.findByIdAndUpdate(jobId, { status: 'PROCESSING' });
        let generatedTotal = 0;
        const batchSize = 20; // Generate in small batches to allow stopping
        while (generatedTotal < totalCount) {
            // A. Check for STOP signal
            const currentJob = yield GlossaryGenerationJob_1.default.findById(jobId);
            if (!currentJob || currentJob.status === 'STOPPED') {
                console.log(`[Job ${jobId}] Stopped by user.`);
                return; // Exit loop
            }
            // B. Calculate remaining (cap at batch size)
            const remaining = totalCount - generatedTotal;
            const currentBatch = Math.min(remaining, batchSize);
            // C. Generate Batch
            const rawTerms = yield (0, aiService_1.generateGlossaryTerms)(sourceLang, targetLang, currentBatch);
            if (!rawTerms.length) {
                // If AI fails to return anything, maybe break or retry? 
                // Let's assume end of capacity or error, but we continue to try next batch or finish.
                // For safety, if 0 returned, maybe we stop to avoid infinite loop of nothing.
                console.warn(`[Job ${jobId}] AI returned 0 terms. Stopping.`);
                break;
            }
            // D. Insert Unique Terms
            const termsToInsert = [];
            for (const item of rawTerms) {
                const exists = yield Glossary_1.default.findOne({
                    term: item.term,
                    sourceLang,
                    targetLang
                });
                if (!exists) {
                    termsToInsert.push({
                        term: item.term,
                        translation: item.translation,
                        sourceLang,
                        targetLang,
                        context: item.context,
                        createdBy: userId
                    });
                }
            }
            if (termsToInsert.length > 0) {
                yield Glossary_1.default.insertMany(termsToInsert);
            }
            // E. Update Progress
            generatedTotal += rawTerms.length; // We count generated raw terms towards progress? Or only valid?
            // Usually "Active Progress" is based on attempts.
            yield GlossaryGenerationJob_1.default.findByIdAndUpdate(jobId, { generatedCount: generatedTotal });
            // F. Small delay to be nice to API and DB
            yield new Promise(resolve => setTimeout(resolve, 1000));
        }
        // Finish
        // Check if it wasn't stopped in the very last moment
        const finalCheck = yield GlossaryGenerationJob_1.default.findById(jobId);
        if (finalCheck && finalCheck.status !== 'STOPPED') {
            yield GlossaryGenerationJob_1.default.findByIdAndUpdate(jobId, { status: 'COMPLETED' });
            console.log(`[Job ${jobId}] Completed. Generated: ${generatedTotal}`);
        }
    }
    catch (error) {
        console.error(`[Job ${jobId}] Failed:`, error);
        yield GlossaryGenerationJob_1.default.findByIdAndUpdate(jobId, { status: 'FAILED', error: error.message });
    }
});
const stopBulkGeneration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user.id;
        const job = yield GlossaryGenerationJob_1.default.findOne({ _id: id, userId });
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        if (job.status === 'PROCESSING' || job.status === 'PENDING') {
            job.status = 'STOPPED';
            yield job.save();
            return res.json({ message: 'Job stopping...', status: 'STOPPED' });
        }
        res.json({ message: 'Job already finished or stopped', status: job.status });
    }
    catch (error) {
        res.status(500).json({ message: 'Error stopping job', error });
    }
});
exports.stopBulkGeneration = stopBulkGeneration;
const getBulkGenerationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const job = yield GlossaryGenerationJob_1.default.findById(id);
        if (!job)
            return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching job status', error });
    }
});
exports.getBulkGenerationStatus = getBulkGenerationStatus;
const getGlossaryLanguages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sourceLangs = yield Glossary_1.default.distinct('sourceLang');
        const targetLangs = yield Glossary_1.default.distinct('targetLang');
        res.json({ sourceLangs, targetLangs });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching languages', error });
    }
});
exports.getGlossaryLanguages = getGlossaryLanguages;
const getGlossaryStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield Glossary_1.default.aggregate([
            {
                $group: {
                    _id: "$sourceLang",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        const totalTerms = yield Glossary_1.default.countDocuments();
        const statsMap = stats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});
        res.json({ total: totalTerms, byLanguage: statsMap });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
});
exports.getGlossaryStats = getGlossaryStats;
