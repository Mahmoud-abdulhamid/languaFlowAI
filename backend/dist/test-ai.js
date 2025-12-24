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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const SystemSetting_1 = require("./models/SystemSetting");
dotenv_1.default.config();
const runTest = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('1. Connecting to MongoDB...');
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('Connected.');
        console.log('2. Fetching Settings...');
        const apiKeySetting = yield SystemSetting_1.SystemSetting.findOne({ key: 'ai_api_key' });
        const modelSetting = yield SystemSetting_1.SystemSetting.findOne({ key: 'ai_model' });
        const apiKey = apiKeySetting === null || apiKeySetting === void 0 ? void 0 : apiKeySetting.value;
        const modelName = (modelSetting === null || modelSetting === void 0 ? void 0 : modelSetting.value) || 'gemini-1.5-flash';
        console.log('--------------------------------------------------');
        console.log(`Model stored in DB: "${modelName}"`);
        console.log(`API Key stored in DB: "${apiKey ? apiKey.substring(0, 5) + '...' + apiKey.slice(-5) : 'MISSING'}"`);
        console.log(`API Key Length: ${apiKey === null || apiKey === void 0 ? void 0 : apiKey.length}`);
        console.log('--------------------------------------------------');
        if (!apiKey) {
            throw new Error('API Key is missing in DB');
        }
        console.log('3. Initializing GoogleGenerativeAI...');
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log('4. Sending Test Prompt...');
        const result = yield model.generateContent('Say "Hello World" if you work.');
        const response = yield result.response;
        const text = response.text();
        console.log('SUCCESS! AI Response:', text);
    }
    catch (error) {
        console.error('FAILED.');
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('HTTP Status:', error.response.status);
            console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
    finally {
        yield mongoose_1.default.disconnect();
    }
});
runTest();
