import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { translateText } from '../services/aiService';
import { Segment } from '../models/Segment';

export const translateSegment = async (req: AuthRequest, res: Response) => {
    try {
        const { text, sourceLang, targetLang, segmentId } = req.body;

        // Mock simulation
        const result = await translateText(text, sourceLang, targetLang);

        // Save to segment if provided
        if (segmentId) {
            const segment = await Segment.findById(segmentId);
            if (segment) {
                segment.aiSuggestion = result;
                await segment.save();
            }
        }

        res.json({ translatedText: result });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
