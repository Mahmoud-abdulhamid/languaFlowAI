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
exports.getAvailableModels = void 0;
const settingController_1 = require("./settingController");
const crypto_1 = require("../utils/crypto");
const openai_1 = __importDefault(require("openai"));
// Helper to get client (similar to aiService but strictly for config testing)
const getClientForConfig = (provider, apiKey) => __awaiter(void 0, void 0, void 0, function* () {
    const baseUrl = provider === 'google' ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : 'https://api.openai.com/v1';
    return new openai_1.default({
        apiKey: apiKey,
        baseURL: baseUrl,
        defaultHeaders: provider === 'google' ? { 'x-goog-api-key': apiKey } : {}
    });
});
const getAvailableModels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Get Credentials (either from DB or verify what's passed?) 
        // Usually we want to fetch models for the *active* config, OR for a new config being tested.
        // Let's assume we use the DB config only for security, unless we want a "Test Connection" feature.
        // For simplicity, let's use the DB config.
        // Actually, if I want to "Select Model" after typing a key, I need to send the key.
        // But sending raw key is risky? No, it's https.
        let { provider, apiKey } = req.query;
        if (!apiKey) {
            // Fallback to stored
            apiKey = yield (0, settingController_1.getSystemSetting)('ai_api_key');
            if (apiKey && apiKey.includes(':'))
                apiKey = (0, crypto_1.decrypt)(apiKey);
        }
        if (!provider) {
            provider = (yield (0, settingController_1.getSystemSetting)('ai_provider')) || 'openai';
        }
        if (!apiKey || apiKey === '********') {
            // Fallback to ENV if completely empty in DB (and not just masked)
            apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
        }
        if (!apiKey)
            return res.status(400).json({ message: 'No API Key available to fetch models' });
        const openai = yield getClientForConfig(provider, apiKey);
        const list = yield openai.models.list();
        // Filter models based on provider to avoid junk
        let models = list.data;
        if (provider === 'google') {
            models = models.filter(m => m.id.includes('gemini'));
        }
        else {
            models = models.filter(m => m.id.includes('gpt'));
        }
        res.json(models.map(m => ({ id: m.id, name: m.id })));
    }
    catch (error) {
        console.error('Fetch Models Error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch models' });
    }
});
exports.getAvailableModels = getAvailableModels;
