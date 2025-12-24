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
const SystemSetting_1 = require("../models/SystemSetting");
const path_1 = __importDefault(require("path"));
// Load env from one level up (backend root)
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const updateSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in environment');
        }
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        const newAllowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'docx', 'doc', 'webm', 'mp3', 'm4a', 'ogg', 'heic', 'heif', 'svg'];
        // Upsert the setting
        yield SystemSetting_1.SystemSetting.findOneAndUpdate({ key: 'chat_allowed_file_types' }, {
            value: newAllowedTypes,
            description: 'List of allowed file extensions for chat uploads',
            updatedAt: new Date()
        }, { upsert: true, new: true });
        console.log('Successfully updated chat_allowed_file_types');
        process.exit(0);
    }
    catch (error) {
        console.error('Error updating settings:', error);
        process.exit(1);
    }
});
updateSettings();
