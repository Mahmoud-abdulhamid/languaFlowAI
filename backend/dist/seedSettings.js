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
const SystemSetting_1 = require("./models/SystemSetting");
const path_1 = __importDefault(require("path"));
// Fix env path to likely root or standard location if running from src
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
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
const seedSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system';
        yield mongoose_1.default.connect(uri);
        console.log('MongoDB Connected');
        console.log('Seeding System Settings...');
        for (const setting of DEFAULT_SETTINGS) {
            yield SystemSetting_1.SystemSetting.findOneAndUpdate({ key: setting.key }, {
                $set: {
                    value: setting.value,
                    description: setting.description
                }
            }, { upsert: true, new: true });
            console.log(`✓ Synced setting: ${setting.key}`);
        }
        console.log('Settings Seeding Complete! ⚙️');
        process.exit(0);
    }
    catch (error) {
        console.error('Settings Seeding Error:', error);
        process.exit(1);
    }
});
seedSettings();
