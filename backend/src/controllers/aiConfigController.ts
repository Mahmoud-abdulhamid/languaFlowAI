
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getSystemSetting } from './settingController';
import { decrypt } from '../utils/crypto';
import OpenAI from 'openai';

// Helper to get client (similar to aiService but strictly for config testing)
const getClientForConfig = async (provider: string, apiKey: string) => {
    const baseUrl = provider === 'google' ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : 'https://api.openai.com/v1';

    return new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl,
        defaultHeaders: provider === 'google' ? { 'x-goog-api-key': apiKey } : {}
    });
};

export const getAvailableModels = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Get Credentials (either from DB or verify what's passed?) 
        // Usually we want to fetch models for the *active* config, OR for a new config being tested.
        // Let's assume we use the DB config only for security, unless we want a "Test Connection" feature.
        // For simplicity, let's use the DB config.

        // Actually, if I want to "Select Model" after typing a key, I need to send the key.
        // But sending raw key is risky? No, it's https.

        let { provider, apiKey } = req.query as any;

        if (!apiKey) {
            // Fallback to stored
            apiKey = await getSystemSetting('ai_api_key');
            // Decryption removed as requested
            // if (apiKey && apiKey.includes(':')) apiKey = decrypt(apiKey);
        }

        if (!provider) {
            provider = await getSystemSetting('ai_provider') || 'openai';
        }

        // Env fallback removed as requested
        // if (!apiKey || apiKey === '********') {
        //     apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
        // }

        if (!apiKey) return res.status(400).json({ message: 'No API Key available to fetch models' });

        const openai = await getClientForConfig(provider, apiKey);

        const list = await openai.models.list();

        // Filter models based on provider to avoid junk
        let models = list.data;
        if (provider === 'google') {
            models = models.filter(m => m.id.includes('gemini'));
        } else {
            models = models.filter(m => m.id.includes('gpt'));
        }

        // Strip 'models/' prefix and return
        res.json(models.map(m => {
            const cleanId = m.id.replace(/^models\//, '');
            return { id: cleanId, name: cleanId };
        }));

    } catch (error: any) {
        console.error('Fetch Models Error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch models' });
    }
};
