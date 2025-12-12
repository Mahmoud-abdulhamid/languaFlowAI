import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project } from '../models/Project';
import { Segment } from '../models/Segment';
import { generateTranslation, generateBatchTranslation } from '../utils/aiService';

export const getProjectSegments = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, fileId } = req.params;
        const { targetLang, page = 1, limit = 50, status } = req.query;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Logic to find file index or ID
        const fileIndex = parseInt(fileId);
        if (isNaN(fileIndex) || !project.files[fileIndex]) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Determine target language (Default to first if not provided)
        const activeLang = (targetLang as string) || (project.targetLangs && project.targetLangs[0]) || 'en';

        // Pagination setup
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 50;
        const skip = (pageNum - 1) * limitNum;

        // Build Query
        const query: any = {
            project: projectId,
            fileIndex: fileIndex,
            targetLang: activeLang
        };

        if (status && status !== 'ALL') {
            if (status === 'UNTRANSLATED') {
                query.status = 'DRAFT';
            } else {
                query.status = status;
            }
        }

        // Count total for this filter
        const total = await Segment.countDocuments(query);

        // Fetch paginated segments
        const segments = await Segment.find(query)
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


export const saveSegment = async (req: AuthRequest, res: Response) => {
    try {
        const { segmentId } = req.params;
        const { targetText, status } = req.body;

        const segment = await Segment.findByIdAndUpdate(
            segmentId,
            { targetText, status },
            { new: true }
        );

        // Auto-activate project if DRAFT
        const project = await Project.findById(segment?.project);
        if (project && project.status === 'DRAFT') {
            project.status = 'ACTIVE';
            await project.save();
        }



        res.json(segment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const generateAISuggestion = async (req: AuthRequest, res: Response) => {
    try {
        const { segmentId } = req.params;
        const segment = await Segment.findById(segmentId);
        if (!segment) return res.status(404).json({ message: 'Segment not found' });

        // Check local switch for single suggestion
        const { getSystemSetting } = await import('./settingController');
        const enableSingle = await getSystemSetting('enable_ai_single_suggestion');
        // Strict check for false
        if (enableSingle === false) {
            return res.status(403).json({ message: 'AI suggestions are disabled' });
        }

        // Call Real AI Service
        const translation = await generateTranslation(segment.sourceText, segment.targetLang);

        // Check if the result is an error message
        if (translation.startsWith('[AI Error]') || translation.startsWith('[Config Error]')) {
            return res.json({ suggestion: translation });
        }

        segment.aiSuggestion = translation;
        await segment.save();

        res.json({ suggestion: translation });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

import { getSystemSetting } from './settingController';

import { Notification } from '../models/Notification';

export const translateFileAI = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, fileId } = req.params; // fileId is index
        const { targetLang, segmentIds } = req.body; // segmentIds: string[] | undefined

        // 1. Check System Setting
        const isEnabled = await getSystemSetting('enable_ai_translation_all');
        if (!isEnabled || isEnabled === 'false') {
            return res.status(403).json({ message: 'AI Auto-Translation feature is disabled by system administrator.' });
        }

        // 2. Check User Permission (Clients NOT allowed)
        if (req.user.role === 'CLIENT') {
            return res.status(403).json({ message: 'Clients are not authorized to use AI Auto-Translation.' });
        }

        const fileIndex = parseInt(fileId);

        // 3. Find Project and Validate
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!project.files[fileIndex]) return res.status(404).json({ message: 'File not found' });

        // Determine language
        const activeLang = targetLang || (project.targetLangs && project.targetLangs[0]) || 'en';

        // 4. Get Segments
        const query: any = {
            project: projectId,
            fileIndex: fileIndex,
            targetLang: activeLang
        };

        if (segmentIds && Array.isArray(segmentIds) && segmentIds.length > 0) {
            query._id = { $in: segmentIds };
        }

        const segments = await Segment.find(query);

        if (segments.length === 0) return res.status(400).json({ message: 'No segments found for this file/language.' });

        // --- BACKGROUND PROCESSING START ---
        // Respond immediately to the user
        res.json({ message: 'Translation started in background. You will receive a notification when complete.' });

        // Fire and forget (Background Job)
        (async () => {
            let updatedCount = 0;
            const notificationLink = `/editor/${projectId}/${fileId}`;

            try {
                // Set Translating Flag TRUE
                await Project.updateOne(
                    { _id: projectId, [`files.${fileIndex}`]: { $exists: true } },
                    { $set: { [`files.${fileIndex}.isTranslating`]: true } }
                );

                // NOTIFY START
                await Notification.create({
                    user: req.user.id,
                    type: 'INFO',
                    title: 'AI Translation Started',

                    message: `Started translating file "${project.files[fileIndex].originalName}" in project "${project.title}" to ${activeLang}. You can safely leave this page.`,
                    link: notificationLink
                });

                const BATCH_SIZE = 10; // Start with 10, fallback logic handles errors
                const batches = [];

                // Prepare Batches (Skip CONFIRMED)
                let currentBatch: any[] = [];
                for (const segment of segments) {
                    if (segment.status === 'CONFIRMED') continue;

                    currentBatch.push(segment);
                    if (currentBatch.length >= BATCH_SIZE) {
                        batches.push(currentBatch);
                        currentBatch = [];
                    }
                }
                if (currentBatch.length > 0) batches.push(currentBatch);

                console.log(`[AI Translation] Processing ${batches.length} batches for Project ${projectId}`);

                // Process Batches
                for (const batch of batches) {
                    // CHECK FOR STOP SIGNAL
                    const currentProject = await Project.findById(projectId);
                    // @ts-ignore
                    if (!currentProject?.files?.[fileIndex]?.isTranslating) {
                        console.log(`[AI Translation] Stopped by user for Project ${projectId}`);
                        await Notification.create({
                            user: req.user.id,
                            type: 'WARNING',
                            title: 'AI Translation Stopped',
                            message: `Translation stopped by user. ${updatedCount} segments were updated.`,
                            link: notificationLink
                        });
                        return; // Exit the background function
                    }

                    const texts = batch.map((s: any) => s.sourceText);
                    let translations: string[] = [];
                    let success = false;

                    // Attempt 1: Full Batch
                    try {
                        translations = await generateBatchTranslation(texts, activeLang);
                        success = true;
                    } catch (err) {
                        console.log(`[AI Batch] Batch failed (Size: ${batch.length}). Retrying individually...`);
                    }

                    // Attempt 2: Breakdown if failed
                    if (!success) {
                        // Retry individually (Batch Size = 1) - Slow but safer
                        for (let k = 0; k < texts.length; k++) {
                            try {
                                const singleTrans = await generateTranslation(texts[k], activeLang);
                                translations[k] = singleTrans;
                                // Small delay between individuals
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            } catch (subErr) {
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
                            await seg.save();
                            updatedCount++;
                        }
                    }

                    // Manual Rate Limiting: Wait 2 seconds between batches
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                // Auto-activate project
                if (project.status === 'DRAFT' && updatedCount > 0) {
                    await Project.findByIdAndUpdate(projectId, { status: 'ACTIVE' });
                }

                // NOTIFY RESULT
                if (updatedCount > 0) {
                    await Notification.create({
                        user: req.user.id,
                        type: 'SUCCESS',
                        title: 'AI Translation Complete',
                        message: `Translation finished for "${project.files[fileIndex].originalName}" (${activeLang}). ${updatedCount} segments updated.`,
                        link: notificationLink
                    });
                } else {
                    await Notification.create({
                        user: req.user.id,
                        type: 'WARNING',
                        title: 'AI Translation Incomplete',
                        message: `Translation finished but NO segments were updated. Possible rate limits (429). Please try again later with fewer segments.`,
                        link: notificationLink
                    });
                }

            } catch (bgError) {
                console.error('Background translation error:', bgError);
                await Notification.create({
                    user: req.user.id,
                    type: 'ERROR',
                    title: 'AI Translation Failed',
                    message: `Error translating "${project.files[fileIndex].originalName}".`,
                    link: notificationLink
                });
            } finally {
                // Set Translating Flag FALSE
                await Project.updateOne(
                    { _id: projectId, [`files.${fileIndex}`]: { $exists: true } },
                    { $set: { [`files.${fileIndex}.isTranslating`]: false } }
                );
            }
        })();
        // --- BACKGROUND PROCESSING END ---

    } catch (error: any) {
        // This catch block handles errors BEFORE the background process starts (e.g. invalid IDs)
        // If response already sent, we can't send again, but usually we haven't sent yet here
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

export const stopTranslation = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, fileId } = req.params;
        const fileIndex = parseInt(fileId);

        await Project.updateOne(
            { _id: projectId, [`files.${fileIndex}`]: { $exists: true } },
            { $set: { [`files.${fileIndex}.isTranslating`]: false } }
        );

        res.json({ message: 'Translation stopped.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const clearFileTranslations = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, fileId } = req.params;
        const { targetLang } = req.body;

        // 1. Check System Setting
        const isEnabled = await getSystemSetting('enable_clear_translation');
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
        await Segment.updateMany(
            {
                project: projectId,
                fileIndex: fileIndex,
                targetLang: activeLang
            },
            {
                $set: {
                    targetText: '',
                    status: 'DRAFT',
                    aiSuggestion: null
                }
            }
        );

        res.json({ message: 'Translations cleared successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
