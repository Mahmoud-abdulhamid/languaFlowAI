import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getSystemSetting } from '../controllers/settingController';
import { decrypt } from './crypto';

dotenv.config();

// Helper to get configured OpenAI Client
const getAIClient = async () => {
    let apiKey = await getSystemSetting('ai_api_key');
    const globalSwitch = await getSystemSetting('enable_ai_features');
    if (globalSwitch === false) {
        throw new Error('AI features are currently disabled by the administrator');
    }

    let provider = await getSystemSetting('ai_provider');
    const baseUrl = provider === 'google' ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : 'https://api.openai.com/v1';

    // Decryption removed as requested - using plain text
    // if (apiKey && apiKey.includes(':')) {
    //     apiKey = decrypt(apiKey);
    // }

    // Use DB only - Fail if missing
    if (!apiKey) throw new Error('AI API Key not configured in Database Settings');

    // Deep Debug Logs
    console.log(`[AI Config] Provider: ${provider}`);
    console.log(`[AI Config] Key Length: ${apiKey.length}`);
    if (apiKey) {
        console.log(`[AI Config] Key First Char Code: ${apiKey.charCodeAt(0)}`);
        console.log(`[AI Config] Key Last Char Code: ${apiKey.charCodeAt(apiKey.length - 1)}`);
        console.log(`[AI Config] Key Preview: ${apiKey.substring(0, 5)}...${apiKey.slice(-5)}`);
    }

    return new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl,
        defaultHeaders: provider === 'google' ? { 'x-goog-api-key': apiKey } : {}
    });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateTranslation = async (text: string, targetLang: string): Promise<string> => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const openai = await getAIClient();
            // Check Model from DB only (Default to stable gemini if empty)
            let model = await getSystemSetting('ai_model');
            if (!model) model = "gemini-2.0-flash-exp";

            // Clean Model Name (Remove 'models/' prefix if present)
            if (model.startsWith('models/')) {
                model = model.replace('models/', '');
            }

            // Debug Log
            console.log(`[AI Service] Attempt ${attempt + 1}/${maxRetries} | Model: ${model}`);

            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a professional translator. Translate the following text into ${targetLang}. Preserve all formatting, tags, and special characters. Provide ONLY the translated text.`
                    },
                    { role: "user", content: text }
                ],
                model: model,
            });

            return completion.choices[0].message.content || "";
        } catch (error: any) {
            console.error(`AI Service Error (Attempt ${attempt + 1}):`, error.status || error.message);

            // Retry only on 429 (Rate Limit) or 5xx (Server Errors)
            if (error.status === 429 || (error.status && error.status >= 500)) {
                attempt++;
                if (attempt < maxRetries) {
                    const delay = 2000 * attempt; // 2s, 4s, 6s...
                    console.log(`Waiting ${delay}ms before retrying...`);
                    await sleep(delay);
                    continue;
                }
            }

            return `[AI Error] ${error.status === 429 ? 'Quota Exceeded (429). Please try again later.' : error.message}`;
        }
    }
    return "[AI Error] Failed after multiple retries.";
};

export const generateBatchTranslation = async (texts: string[], targetLang: string): Promise<string[]> => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const openai = await getAIClient();
            let model = await getSystemSetting('ai_model');
            if (!model) model = "gemini-2.0-flash-exp";

            // Clean Model Name (Remove 'models/' prefix if present)
            if (model.startsWith('models/')) {
                model = model.replace('models/', '');
            }

            console.log(`[AI Batch Service] Attempt ${attempt + 1}/${maxRetries} | Batch Size: ${texts.length} | Model: ${model}`);

            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a professional translator. Translate the following array of texts into ${targetLang}. 
                        Return strict JSON array of strings. 
                        Example Input: ["Hello", "World"] 
                        Example Output: ["Hola", "Mundo"]
                        Preserve all formatting and order perfectly.`
                    },
                    { role: "user", content: JSON.stringify(texts) }
                ],
                model: model,
                response_format: { type: "json_object" }, // Force JSON mode if supported, else rely on prompt
            });

            const content = completion.choices[0].message.content || "[]";
            let parsed: any;
            try {
                parsed = JSON.parse(content);
                // Handle various JSON wrapper formats if AI adds keys like { "translations": [...] }
                if (!Array.isArray(parsed)) {
                    parsed = parsed.translations || parsed.data || Object.values(parsed);
                }
            } catch (e) {
                console.error("Failed to parse JSON batch response", content);
                parsed = [];
            }

            if (Array.isArray(parsed) && parsed.length === texts.length) {
                return parsed.map(String);
            } else {
                console.warn(`[AI Batch Mismatch] Expected ${texts.length}, got ${Array.isArray(parsed) ? parsed.length : 'invalid'}. Falling back to single.`);
                // Fallback or retry? For now, throw to trigger retry
                throw new Error("Batch size mismatch");
            }

        } catch (error: any) {
            console.error(`AI Batch Service Error (Attempt ${attempt + 1}):`, error.message);
            attempt++;
            if (attempt < maxRetries) {
                await sleep(2000 * attempt);
                continue;
            }
        }
    }
    // Fallback: Return error for all
    return texts.map(() => "[AI Error] Batch Failed");
};
