import { Request, Response } from 'express';
import Glossary from '../models/Glossary';
import GlossaryGenerationJob from '../models/GlossaryGenerationJob';
import { SystemSetting } from '../models/SystemSetting';

export const createTerm = async (req: Request, res: Response) => {
    try {
        const { term, translation, sourceLang, targetLang, context, projectId } = req.body;
        // @ts-ignore
        const createdBy = req.user.id;

        const newTerm = new Glossary({
            term,
            translation,
            sourceLang,
            targetLang,
            context,
            projectId,
            createdBy
        });

        await newTerm.save();
        res.status(201).json(newTerm);
    } catch (error) {
        res.status(500).json({ message: 'Error creating glossary term', error });
    }
};

export const searchGlossary = async (req: Request, res: Response) => {
    try {
        const { query, sourceLang, targetLang, projectId } = req.query;

        const filter: any = {};

        // Scope Filter: Project Specific OR Global
        if (projectId) {
            filter.$or = [
                { projectId: projectId },
                { projectId: null },
                { projectId: { $exists: false } }
            ];
        }

        // Bidirectional Filter
        const langFilter: any = {};
        if (sourceLang && targetLang) {
            langFilter.$or = [
                { sourceLang: sourceLang, targetLang: targetLang },
                { sourceLang: targetLang, targetLang: sourceLang }
            ];
        } else {
            if (sourceLang) langFilter.sourceLang = sourceLang;
            if (targetLang) langFilter.targetLang = targetLang;
        }

        // Merge Filters
        const finalFilter: any = { $and: [] };
        if (projectId || filter.$or) finalFilter.$and.push({ $or: filter.$or || [{}] }); // Pushing scope
        if (langFilter.$or || langFilter.sourceLang || langFilter.targetLang) finalFilter.$and.push(langFilter);

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

        const queryObj: any = {};
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
        } else {
            if (sourceLang) queryObj.sourceLang = sourceLang;
            if (targetLang) queryObj.targetLang = targetLang;
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

        const results = await Glossary.find(queryObj).limit(20);

        // Normalize direction
        const normalized = results.map(t => {
            if (sourceLang && t.sourceLang !== sourceLang) {
                return {
                    ...t.toObject(),
                    term: t.translation,
                    translation: t.term,
                    sourceLang: t.targetLang,
                    targetLang: t.sourceLang
                };
            }
            return t;
        });

        res.json(normalized);
    } catch (error) {
        res.status(500).json({ message: 'Error searching glossary', error });
    }
};

export const getProjectGlossary = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        // Fetch Project Terms OR Global Terms
        const terms = await Glossary.find({
            $or: [
                { projectId: projectId },
                { projectId: null },
                { projectId: { $exists: false } }
            ]
        });
        res.json(terms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project glossary', error });
    }
};

export const getAllGlossary = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 50, search, sourceLang, targetLang, projectId } = req.query;
        const query: any = {};

        if (sourceLang && targetLang) {
            query.$or = [
                { sourceLang: sourceLang, targetLang: targetLang },
                { sourceLang: targetLang, targetLang: sourceLang }
            ];
        } else {
            if (sourceLang) query.sourceLang = sourceLang;
            if (targetLang) query.targetLang = targetLang;
        }

        if (projectId) query.projectId = projectId;

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
            } else {
                query.$or = searchClause;
            }
        }

        const terms = await Glossary.find(query)
            .populate('projectId', 'title')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Glossary.countDocuments(query);

        // Swap if needed
        const normalizedTerms = terms.map(t => {
            if (sourceLang && t.sourceLang !== sourceLang) {
                return {
                    ...t.toObject(),
                    term: t.translation,
                    translation: t.term,
                    sourceLang: t.targetLang,
                    targetLang: t.sourceLang
                };
            }
            return t;
        });

        res.json({ terms: normalizedTerms, total, pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching glossary', error });
    }
};

export const updateTerm = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const term = await Glossary.findByIdAndUpdate(id, req.body, { new: true });
        if (!term) return res.status(404).json({ message: 'Term not found' });
        res.json(term);
    } catch (error) {
        res.status(500).json({ message: 'Error updating term', error });
    }
};

export const deleteTerm = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Glossary.findByIdAndDelete(id);
        res.json({ message: 'Term deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting term', error });
    }
};


import { generateGlossaryTerms } from '../services/aiService';

export const generateBulkTerms = async (req: Request, res: Response) => {
    try {
        const { sourceLang, targetLang, count = 20 } = req.body;
        // @ts-ignore
        const createdBy = req.user.id;

        // 1. Check System Setting
        const setting = await SystemSetting.findOne({ key: 'enable_ai_glossary_gen' });
        if (setting && setting.value === false) {
            return res.status(403).json({ message: 'AI Bulk Glossary Generator is disabled by Administrator.' });
        }

        if (!sourceLang || !targetLang) {
            return res.status(400).json({ message: 'Source and Target languages are required' });
        }

        // 2. Create Background Job
        const job = await GlossaryGenerationJob.create({
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

    } catch (error) {
        console.error('Bulk Gen Start Error:', error);
        res.status(500).json({ message: 'Error starting generation job', error });
    }
};

// --- Background Worker Function ---
const processBulkGeneration = async (jobId: any, userId: any, sourceLang: string, targetLang: string, totalCount: number) => {
    try {
        console.log(`[Job ${jobId}] Starting Bulk Gen: ${totalCount} terms (${sourceLang}->${targetLang})`);

        await GlossaryGenerationJob.findByIdAndUpdate(jobId, { status: 'PROCESSING' });

        let generatedTotal = 0;
        const batchSize = 20; // Generate in small batches to allow stopping

        while (generatedTotal < totalCount) {
            // A. Check for STOP signal
            const currentJob = await GlossaryGenerationJob.findById(jobId);
            if (!currentJob || currentJob.status === 'STOPPED') {
                console.log(`[Job ${jobId}] Stopped by user.`);
                return; // Exit loop
            }

            // B. Calculate remaining (cap at batch size)
            const remaining = totalCount - generatedTotal;
            const currentBatch = Math.min(remaining, batchSize);

            // C. Generate Batch
            const rawTerms = await generateGlossaryTerms(sourceLang, targetLang, currentBatch);

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
                const exists = await Glossary.findOne({
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
                await Glossary.insertMany(termsToInsert);
            }

            // E. Update Progress
            generatedTotal += rawTerms.length; // We count generated raw terms towards progress? Or only valid?
            // Usually "Active Progress" is based on attempts.
            await GlossaryGenerationJob.findByIdAndUpdate(jobId, { generatedCount: generatedTotal });

            // F. Small delay to be nice to API and DB
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Finish
        // Check if it wasn't stopped in the very last moment
        const finalCheck = await GlossaryGenerationJob.findById(jobId);
        if (finalCheck && finalCheck.status !== 'STOPPED') {
            await GlossaryGenerationJob.findByIdAndUpdate(jobId, { status: 'COMPLETED' });
            console.log(`[Job ${jobId}] Completed. Generated: ${generatedTotal}`);
        }

    } catch (error: any) {
        console.error(`[Job ${jobId}] Failed:`, error);
        await GlossaryGenerationJob.findByIdAndUpdate(jobId, { status: 'FAILED', error: error.message });
    }
};

export const stopBulkGeneration = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user.id;

        const job = await GlossaryGenerationJob.findOne({ _id: id, userId });
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status === 'PROCESSING' || job.status === 'PENDING') {
            job.status = 'STOPPED';
            await job.save();
            return res.json({ message: 'Job stopping...', status: 'STOPPED' });
        }

        res.json({ message: 'Job already finished or stopped', status: job.status });

    } catch (error) {
        res.status(500).json({ message: 'Error stopping job', error });
    }
};

export const getBulkGenerationStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const job = await GlossaryGenerationJob.findById(id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job status', error });
    }
};

export const getGlossaryLanguages = async (req: Request, res: Response) => {
    try {
        const sourceLangs = await Glossary.distinct('sourceLang');
        const targetLangs = await Glossary.distinct('targetLang');
        res.json({ sourceLangs, targetLangs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching languages', error });
    }
};

export const getGlossaryStats = async (req: Request, res: Response) => {
    try {
        const stats = await Glossary.aggregate([
            {
                $group: {
                    _id: "$sourceLang",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const totalTerms = await Glossary.countDocuments();

        const statsMap = stats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {} as Record<string, number>);

        res.json({ total: totalTerms, byLanguage: statsMap });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};
