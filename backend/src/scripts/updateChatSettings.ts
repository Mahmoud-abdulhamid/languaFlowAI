import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SystemSetting } from '../models/SystemSetting';
import path from 'path';

// Load env from one level up (backend root)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const updateSettings = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in environment');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const newAllowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'docx', 'doc', 'webm', 'mp3', 'm4a', 'ogg', 'heic', 'heif', 'svg'];

        // Upsert the setting
        await SystemSetting.findOneAndUpdate(
            { key: 'chat_allowed_file_types' },
            {
                value: newAllowedTypes,
                description: 'List of allowed file extensions for chat uploads',
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        console.log('Successfully updated chat_allowed_file_types');
        process.exit(0);
    } catch (error) {
        console.error('Error updating settings:', error);
        process.exit(1);
    }
};

updateSettings();
