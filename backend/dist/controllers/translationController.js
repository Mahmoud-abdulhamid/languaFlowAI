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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearFileTranslations = exports.stopTranslation = exports.translateFileAI = exports.generateAISuggestion = exports.saveSegment = exports.getProjectSegments = void 0;
const Project_1 = require("../models/Project");
const Segment_1 = require("../models/Segment");
const aiService_1 = require("../utils/aiService");
const getProjectSegments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, fileId } = req.params;
        const { targetLang, page = 1, limit = 50, status } = req.query;
        const project = yield Project_1.Project.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        // Logic to find file index or ID
        const fileIndex = parseInt(fileId);
        if (isNaN(fileIndex) || !project.files[fileIndex]) {
            return res.status(404).json({ message: 'File not found' });
        }
        // Determine target language (Default to first if not provided)
        const activeLang = targetLang || (project.targetLangs && project.targetLangs[0]) || 'en';
        // Pagination setup
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const skip = (pageNum - 1) * limitNum;
        // Build Query
        const query = {
            project: projectId,
            fileIndex: fileIndex,
            targetLang: activeLang
        };
        if (status && status !== 'ALL') {
            if (status === 'UNTRANSLATED') {
                query.status = 'DRAFT';
            }
            else {
                query.status = status;
            }
        }
        // Count total for this filter
        const total = yield Segment_1.Segment.countDocuments(query);
        // Fetch paginated segments
        const segments = yield Segment_1.Segment.find(query)
            .sort('sequence')
            .skip(skip)
            .limit(limitNum);
        res.json({
            segments,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProjectSegments = getProjectSegments;
const saveSegment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { segmentId } = req.params;
        const { targetText, status } = req.body;
        const segment = yield Segment_1.Segment.findByIdAndUpdate(segmentId, { targetText, status }, { new: true });
        // Auto-activate project if DRAFT
        const project = yield Project_1.Project.findById(segment === null || segment === void 0 ? void 0 : segment.project);
        if (project && project.status === 'DRAFT') {
            project.status = 'ACTIVE';
            yield project.save();
        }
        res.json(segment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.saveSegment = saveSegment;
const generateAISuggestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { segmentId } = req.params;
        const segment = yield Segment_1.Segment.findById(segmentId);
        if (!segment)
            return res.status(404).json({ message: 'Segment not found' });
        // Check local switch for single suggestion
        const { getSystemSetting } = yield Promise.resolve().then(() => __importStar(require('./settingController')));
        const enableSingle = yield getSystemSetting('enable_ai_single_suggestion');
        // Strict check for false
        if (enableSingle === false) {
            return res.status(403).json({ message: 'AI suggestions are disabled' });
        }
        // Call Real AI Service
        const translation = yield (0, aiService_1.generateTranslation)(segment.sourceText, segment.targetLang);
        // Check if the result is an error message
        if (translation.startsWith('[AI Error]') || translation.startsWith('[Config Error]')) {
            return res.json({ suggestion: translation });
        }
        segment.aiSuggestion = translation;
        yield segment.save();
        res.json({ suggestion: translation });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.generateAISuggestion = generateAISuggestion;
const settingController_1 = require("./settingController");
const Notification_1 = require("../models/Notification");
const translateFileAI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, fileId } = req.params; // fileId is index
        const { targetLang, segmentIds } = req.body; // segmentIds: string[] | undefined
        // 1. Check System Setting
        const isEnabled = yield (0, settingController_1.getSystemSetting)('enable_ai_translation_all');
        if (!isEnabled || isEnabled === 'false') {
            return res.status(403).json({ message: 'AI Auto-Translation feature is disabled by system administrator.' });
        }
        // 2. Check User Permission (Clients NOT allowed)
        if (req.user.role === 'CLIENT') {
            return res.status(403).json({ message: 'Clients are not authorized to use AI Auto-Translation.' });
        }
        const fileIndex = parseInt(fileId);
        // 3. Find Project and Validate
        const project = yield Project_1.Project.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        if (!project.files[fileIndex])
            return res.status(404).json({ message: 'File not found' });
        // Determine language
        const activeLang = targetLang || (project.targetLangs && project.targetLangs[0]) || 'en';
        // 4. Get Segments
        const query = {
            project: projectId,
            fileIndex: fileIndex,
            targetLang: activeLang
        };
        if (segmentIds && Array.isArray(segmentIds) && segmentIds.length > 0) {
            query._id = { $in: segmentIds };
        }
        const segments = yield Segment_1.Segment.find(query);
        if (segments.length === 0)
            return res.status(400).json({ message: 'No segments found for this file/language.' });
        // --- BACKGROUND PROCESSING START ---
        // Respond immediately to the user
        res.json({ message: 'Translation started in background. You will receive a notification when complete.' });
        // Fire and forget (Background Job)
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            let updatedCount = 0;
            const notificationLink = `/editor/${projectId}/${fileId}`;
            try {
                // Set Translating Flag TRUE
                yield Project_1.Project.updateOne({ _id: projectId, [`files.${fileIndex}`]: { $exists: true } }, { $set: { [`files.${fileIndex}.isTranslating`]: true } });
                // NOTIFY START
                yield Notification_1.Notification.create({
                    user: req.user.id,
                    type: 'INFO',
                    title: 'AI Translation Started',
                    message: `Started translating file "${project.files[fileIndex].originalName}" in project "${project.title}" to ${activeLang}. You can safely leave this page.`,
                    link: notificationLink
                });
                const BATCH_SIZE = 10; // Start with 10, fallback logic handles errors
                const batches = [];
                // Prepare Batches (Skip CONFIRMED)
                let currentBatch = [];
                for (const segment of segments) {
                    if (segment.status === 'CONFIRMED')
                        continue;
                    currentBatch.push(segment);
                    if (currentBatch.length >= BATCH_SIZE) {
                        batches.push(currentBatch);
                        currentBatch = [];
                    }
                }
                if (currentBatch.length > 0)
                    batches.push(currentBatch);
                console.log(`[AI Translation] Processing ${batches.length} batches for Project ${projectId}`);
                // Process Batches
                for (const batch of batches) {
                    // CHECK FOR STOP SIGNAL
                    const currentProject = yield Project_1.Project.findById(projectId);
                    // @ts-ignore
                    if (!((_b = (_a = currentProject === null || currentProject === void 0 ? void 0 : currentProject.files) === null || _a === void 0 ? void 0 : _a[fileIndex]) === null || _b === void 0 ? void 0 : _b.isTranslating)) {
                        console.log(`[AI Translation] Stopped by user for Project ${projectId}`);
                        yield Notification_1.Notification.create({
                            user: req.user.id,
                            type: 'WARNING',
                            title: 'AI Translation Stopped',
                            message: `Translation stopped by user. ${updatedCount} segments were updated.`,
                            link: notificationLink
                        });
                        return; // Exit the background function
                    }
                    const texts = batch.map((s) => s.sourceText);
                    let translations = [];
                    let success = false;
                    // Attempt 1: Full Batch
                    try {
                        translations = yield (0, aiService_1.generateBatchTranslation)(texts, activeLang);
                        success = true;
                    }
                    catch (err) {
                        console.log(`[AI Batch] Batch failed (Size: ${batch.length}). Retrying individually...`);
                    }
                    // Attempt 2: Breakdown if failed
                    if (!success) {
                        // Retry individually (Batch Size = 1) - Slow but safer
                        for (let k = 0; k < texts.length; k++) {
                            try {
                                const singleTrans = yield (0, aiService_1.generateTranslation)(texts[k], activeLang);
                                translations[k] = singleTrans;
                                // Small delay between individuals
                                yield new Promise(resolve => setTimeout(resolve, 1000));
                            }
                            catch (subErr) {
                                console.error(`[AI Batch] Individual Item ${k} failed`);
                                translations[k] = '[AI Error] Failed';
                            }
                        }
                    }
                    // Save Results
                    for (let i = 0; i < batch.length; i++) {
                        const seg = batch[i];
                        const trans = translations[i];
                        if (trans && !trans.startsWith('[AI Error]')) {
                            seg.targetText = trans;
                            seg.status = 'TRANSLATED';
                            yield seg.save();
                            updatedCount++;
                        }
                    }
                    // Manual Rate Limiting: Wait 2 seconds between batches
                    yield new Promise(resolve => setTimeout(resolve, 2000));
                }
                // Auto-activate project
                if (project.status === 'DRAFT' && updatedCount > 0) {
                    yield Project_1.Project.findByIdAndUpdate(projectId, { status: 'ACTIVE' });
                }
                // NOTIFY RESULT
                if (updatedCount > 0) {
                    yield Notification_1.Notification.create({
                        user: req.user.id,
                        type: 'SUCCESS',
                        title: 'AI Translation Complete',
                        message: `Translation finished for "${project.files[fileIndex].originalName}" (${activeLang}). ${updatedCount} segments updated.`,
                        link: notificationLink
                    });
                }
                else {
                    yield Notification_1.Notification.create({
                        user: req.user.id,
                        type: 'WARNING',
                        title: 'AI Translation Incomplete',
                        message: `Translation finished but NO segments were updated. Possible rate limits (429). Please try again later with fewer segments.`,
                        link: notificationLink
                    });
                }
            }
            catch (bgError) {
                console.error('Background translation error:', bgError);
                yield Notification_1.Notification.create({
                    user: req.user.id,
                    type: 'ERROR',
                    title: 'AI Translation Failed',
                    message: `Error translating "${project.files[fileIndex].originalName}".`,
                    link: notificationLink
                });
            }
            finally {
                // Set Translating Flag FALSE
                yield Project_1.Project.updateOne({ _id: projectId, [`files.${fileIndex}`]: { $exists: true } }, { $set: { [`files.${fileIndex}.isTranslating`]: false } });
            }
        }))();
        // --- BACKGROUND PROCESSING END ---
    }
    catch (error) {
        // This catch block handles errors BEFORE the background process starts (e.g. invalid IDs)
        // If response already sent, we can't send again, but usually we haven't sent yet here
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
});
exports.translateFileAI = translateFileAI;
const stopTranslation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, fileId } = req.params;
        const fileIndex = parseInt(fileId);
        yield Project_1.Project.updateOne({ _id: projectId, [`files.${fileIndex}`]: { $exists: true } }, { $set: { [`files.${fileIndex}.isTranslating`]: false } });
        res.json({ message: 'Translation stopped.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.stopTranslation = stopTranslation;
const clearFileTranslations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, fileId } = req.params;
        const { targetLang } = req.body;
        // 1. Check System Setting
        const isEnabled = yield (0, settingController_1.getSystemSetting)('enable_clear_translation');
        if (isEnabled === 'false') {
            return res.status(403).json({ message: 'Clear Translation feature is disabled by system administrator.' });
        }
        // 2. Check User Permission
        if (req.user.role === 'CLIENT') {
            return res.status(403).json({ message: 'Clients are not authorized to clear translations.' });
        }
        const activeLang = targetLang || 'en';
        const fileIndex = parseInt(fileId);
        // 3. Clear Segments
        yield Segment_1.Segment.updateMany({
            project: projectId,
            fileIndex: fileIndex,
            targetLang: activeLang
        }, {
            $set: {
                targetText: '',
                status: 'DRAFT',
                aiSuggestion: null
            }
        });
        res.json({ message: 'Translations cleared successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.clearFileTranslations = clearFileTranslations;
