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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGlossaryTerms = exports.detectContactInfo = exports.translateText = void 0;
const generative_ai_1 = require("@google/generative-ai");
const SystemSetting_1 = require("../models/SystemSetting");
const crypto_1 = require("../utils/crypto");
const getAIConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const apiKeySetting = yield SystemSetting_1.SystemSetting.findOne({ key: 'ai_api_key' });
    const modelSetting = yield SystemSetting_1.SystemSetting.findOne({ key: 'ai_model' });
    let apiKey = apiKeySetting === null || apiKeySetting === void 0 ? void 0 : apiKeySetting.value;
    // Fallback to Env
    if (!apiKey) {
        apiKey = process.env.AI_API_KEY;
    }
    if (!apiKey)
        throw new Error('AI API Key not configured');
    // Decrypt if it looks encrypted (contains IV separator)
    if (apiKey && apiKey.includes(':')) {
        apiKey = (0, crypto_1.decrypt)(apiKey);
    }
    return {
        apiKey,
        model: (modelSetting === null || modelSetting === void 0 ? void 0 : modelSetting.value) || process.env.AI_MODEL || 'gemini-1.5-flash'
    };
});
const translateText = (text, sourceLang, targetLang) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = yield getAIConfig();
        const genAI = new generative_ai_1.GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.model });
        const prompt = `Translate the following text from "${sourceLang}" to "${targetLang}". Return ONLY the translated text, no other commentary. Text: "${text}"`;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        return response.text().trim();
    }
    catch (error) {
        console.error('AI Translation Error:', error);
        return `[Error] ${text}`; // Fallback
    }
});
exports.translateText = translateText;
const detectContactInfo = (text) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Fast Regex Check (Pre-filtering)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    // Normalize text: remove all whitespace/newlines/symbols, check for 10+ contiguous digits
    const cleanedText = text.replace(/[\s\-\.\(\)\+\r\n]/g, '');
    const simplePhoneRegex = /\d{10,}/;
    if (emailRegex.test(text))
        return { detected: true, type: 'email' };
    if (simplePhoneRegex.test(cleanedText))
        return { detected: true, type: 'phone reference (obfuscated)' };
    // 2. AI Check (Contextual / Hidden patterns)
    try {
        const config = yield getAIConfig();
        const genAI = new generative_ai_1.GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.model });
        const prompt = `Analyze the following text for any contact information (emails, phone numbers, or implicit requests to contact outside the platform).
        Text: "${text}"
        Return a JSON object: { "detected": boolean, "type": string | null }
        Example: { "detected": true, "type": "email" }
        Do not include markdown formatting.`;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const textResponse = response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(textResponse);
    }
    catch (error) {
        console.error('AI Detection Error:', error);
        return { detected: false }; // Fail open if AI fails
    }
});
exports.detectContactInfo = detectContactInfo;
const generateGlossaryTerms = (sourceLang_1, targetLang_1, ...args_1) => __awaiter(void 0, [sourceLang_1, targetLang_1, ...args_1], void 0, function* (sourceLang, targetLang, count = 20) {
    try {
        const config = yield getAIConfig();
        const genAI = new generative_ai_1.GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.model });
        const prompt = `Generate a JSON array of exactly ${count} unique glossary terms for translating from "${sourceLang}" to "${targetLang}".
        Each object in the array should have:
        - "term": The source term (string)
        - "translation": The target translation (string)
        - "context": A brief usage context or domain (string)

        Ensure terms are diverse, commonly used in professional contexts, and strictly unique.
        Return ONLY the JSON array. schema: [{ "term": string, "translation": string, "context": string }]`;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        // Clean markdown code blocks if present
        const textResponse = response.text().replace(/```json|```/g, '').trim();
        // Find array start/end to be safe
        const jsonStart = textResponse.indexOf('[');
        const jsonEnd = textResponse.lastIndexOf(']');
        if (jsonStart === -1 || jsonEnd === -1)
            return [];
        const jsonStr = textResponse.substring(jsonStart, jsonEnd + 1);
        const terms = JSON.parse(jsonStr);
        return Array.isArray(terms) ? terms : [];
    }
    catch (error) {
        console.error('AI Generation Error:', error);
        return [];
    }
});
exports.generateGlossaryTerms = generateGlossaryTerms;
