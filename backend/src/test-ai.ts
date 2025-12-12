
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SystemSetting } from './models/SystemSetting';

dotenv.config();

const runTest = async () => {
    try {
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected.');

        console.log('2. Fetching Settings...');
        const apiKeySetting = await SystemSetting.findOne({ key: 'ai_api_key' });
        const modelSetting = await SystemSetting.findOne({ key: 'ai_model' });

        const apiKey = apiKeySetting?.value;
        const modelName = modelSetting?.value || 'gemini-1.5-flash';

        console.log('--------------------------------------------------');
        console.log(`Model stored in DB: "${modelName}"`);
        console.log(`API Key stored in DB: "${apiKey ? apiKey.substring(0, 5) + '...' + apiKey.slice(-5) : 'MISSING'}"`);
        console.log(`API Key Length: ${apiKey?.length}`);
        console.log('--------------------------------------------------');

        if (!apiKey) {
            throw new Error('API Key is missing in DB');
        }

        console.log('3. Initializing GoogleGenerativeAI...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        console.log('4. Sending Test Prompt...');
        const result = await model.generateContent('Say "Hello World" if you work.');
        const response = await result.response;
        const text = response.text();

        console.log('SUCCESS! AI Response:', text);

    } catch (error: any) {
        console.error('FAILED.');
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('HTTP Status:', error.response.status);
            console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
        }
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
