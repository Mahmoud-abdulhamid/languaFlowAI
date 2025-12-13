import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SystemSetting } from './models/SystemSetting';
import path from 'path';

// Fix env path to likely root or standard location if running from src
dotenv.config({ path: path.join(__dirname, '../.env') });
// If that fails, it tries default cwd

const DEFAULT_SETTINGS = [
    {
        key: 'chat_enabled',
        value: true,
        description: 'Master switch to enable/disable the chat system'
    },
    {
        key: 'chat_allow_file_sharing',
        value: true,
        description: 'Allow users to share files in chat'
    },
    {
        key: 'chat_max_file_size',
        value: 10, // MB
        description: 'Maximum file size for chat uploads in MB'
    },
    {
        key: 'chat_allowed_file_types',
        value: [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', // Images
            'heic', 'heif', // Mobile specific
            'pdf', 'docx', 'doc', 'txt', // Docs
            'webm', 'mp3', 'm4a', 'ogg', 'wav' // Audio
        ],
        description: 'List of allowed file extensions for chat uploads'
    },
    {
        key: 'chat_allow_group_creation',
        value: true,
        description: 'Allow non-admin users to create groups'
    }
];

const seedSettings = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system';
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        console.log('Seeding System Settings...');

        for (const setting of DEFAULT_SETTINGS) {
            await SystemSetting.findOneAndUpdate(
                { key: setting.key },
                {
                    $set: {
                        value: setting.value,
                        description: setting.description
                    }
                },
                { upsert: true, new: true }
            );
            console.log(`✓ Synced setting: ${setting.key}`);
        }

        console.log('Settings Seeding Complete! ⚙️');
        process.exit(0);
    } catch (error) {
        console.error('Settings Seeding Error:', error);
        process.exit(1);
    }
};

seedSettings();
