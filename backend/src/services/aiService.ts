import { GoogleGenerativeAI } from '@google/generative-ai';
import { SystemSetting } from '../models/SystemSetting';

import { decrypt } from '../utils/crypto';

const getAIConfig = async () => {
    const apiKeySetting = await SystemSetting.findOne({ key: 'ai_api_key' });
    const modelSetting = await SystemSetting.findOne({ key: 'ai_model' });

    let apiKey = apiKeySetting?.value;

    if (!apiKey) throw new Error('AI API Key not configured in Database Settings');

    // Decryption removed as requested - using plain text
    // if (apiKey && apiKey.includes(':')) {
    //     apiKey = decrypt(apiKey);
    // }

    // Debug Log (Masked Key & Length Check)
    console.log(`[AI Config] Model: ${modelSetting?.value || 'gemini-1.5-flash'}`);
    if (apiKey) {
        console.log(`[AI Config] Key Length: ${apiKey.length}`);
        console.log(`[AI Config] Key First Char Code: ${apiKey.charCodeAt(0)}`);
        console.log(`[AI Config] Key Last Char Code: ${apiKey.charCodeAt(apiKey.length - 1)}`);
        console.log(`[AI Config] Key Preview: ${apiKey.substring(0, 5)}...${apiKey.slice(-5)}`);
    } else {
        console.log('[AI Config] Key is NULL or UNDEFINED');
    }

    return {
        apiKey,
        model: modelSetting?.value || 'gemini-1.5-flash' // Default only if DB is empty, no env
    };
};

export const translateText = async (text: string, sourceLang: string, targetLang: string) => {
    try {
        const config = await getAIConfig();
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.model });

        const prompt = `Translate the following text from "${sourceLang}" to "${targetLang}". Return ONLY the translated text, no other commentary. Text: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error: any) {
        console.error('AI Translation Error:', error);
        return `[Error] ${text}`; // Fallback
    }
};

export const detectContactInfo = async (text: string): Promise<{ detected: boolean; type?: string }> => {
    // 1. Fast Regex Check (Pre-filtering)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    // Normalize text: remove all whitespace/newlines/symbols, check for 10+ contiguous digits
    const cleanedText = text.replace(/[\s\-\.\(\)\+\r\n]/g, '');
    const simplePhoneRegex = /\d{10,}/;

    if (emailRegex.test(text)) return { detected: true, type: 'email' };
    if (simplePhoneRegex.test(cleanedText)) return { detected: true, type: 'phone reference (obfuscated)' };

    // 2. AI Check (Contextual / Hidden patterns)
    try {
        const config = await getAIConfig();
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.model });

        const prompt = `Analyze the following text for any contact information (emails, phone numbers, or implicit requests to contact outside the platform).
        Text: "${text}"
        Return a JSON object: { "detected": boolean, "type": string | null }
        Example: { "detected": true, "type": "email" }
        Do not include markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text().replace(/```json|```/g, '').trim();

        return JSON.parse(textResponse);
    } catch (error) {
        console.error('AI Detection Error:', error);
        return { detected: false }; // Fail open if AI fails
    }
};

export const generateGlossaryTerms = async (sourceLang: string, targetLang: string, count: number = 20) => {
    try {
        const config = await getAIConfig();
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.model });

        const prompt = `Generate a JSON array of exactly ${count} unique glossary terms for translating from "${sourceLang}" to "${targetLang}".
        Each object in the array should have:
        - "term": The source term (string)
        - "translation": The target translation (string)
        - "context": A brief usage context or domain (string)

        Ensure terms are diverse, commonly used in professional contexts, and strictly unique.
        Return ONLY the JSON array. schema: [{ "term": string, "translation": string, "context": string }]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Clean markdown code blocks if present
        const textResponse = response.text().replace(/```json|```/g, '').trim();

        // Find array start/end to be safe
        const jsonStart = textResponse.indexOf('[');
        const jsonEnd = textResponse.lastIndexOf(']');

        if (jsonStart === -1 || jsonEnd === -1) return [];

        const jsonStr = textResponse.substring(jsonStart, jsonEnd + 1);
        const terms = JSON.parse(jsonStr);
        return Array.isArray(terms) ? terms : [];
    } catch (error) {
        console.error('AI Generation Error:', error);
        return [];
    }
};
