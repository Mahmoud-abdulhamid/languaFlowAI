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
exports.seedSettings = exports.getSystemSetting = exports.updateSetting = exports.getSettings = void 0;
const SystemSetting_1 = require("../models/SystemSetting");
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield SystemSetting_1.SystemSetting.find({});
        // Convert to simple object { key: value }
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            // Removed masking as requested
            // if (curr.key === 'ai_api_key' && acc[curr.key]) {
            //     acc[curr.key] = '********'; // Never return actual key
            // }
            return acc;
        }, {});
        res.json(settingsMap);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSettings = getSettings;
const updateSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { key, value } = req.body;
        // Only Admin/SuperAdmin
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Not authorized to change system settings' });
        }
        // Removed encryption as requested
        // if (value === '********' || !value) {
        //     return res.json({ message: 'No change' }); 
        // }
        // value = encrypt(value);
        const setting = yield SystemSetting_1.SystemSetting.findOneAndUpdate({ key }, {
            value,
            updatedBy: req.user.id
        }, { upsert: true, new: true });
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateSetting = updateSetting;
// Helper to get a setting value directly
const getSystemSetting = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const setting = yield SystemSetting_1.SystemSetting.findOne({ key });
    return setting ? setting.value : null;
});
exports.getSystemSetting = getSystemSetting;
const seedSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    // Helper to init default settings if not exists
    const defaults = [
        { key: 'maintenance_mode', value: false, description: 'Put system in maintenance mode' },
        { key: 'default_deadline_days', value: 7, description: 'Default project deadline in days' },
        { key: 'allowed_file_types', value: ['.pdf', '.docx', '.txt'], description: 'Allowed file extensions' },
        { key: 'system_name', value: 'LinguaFlow', description: 'Application Name' },
        { key: 'support_email', value: 'support@linguaflow.com', description: 'Support Contact Email' },
        { key: 'max_file_size_mb', value: 10, description: 'Maximum file upload size in MB' },
        { key: 'enable_ai_translation_all', value: false, description: 'Enable "Translate All with AI" feature (Warning: May incur high API costs)' },
        { key: 'enable_clear_translation', value: true, description: 'Allow users to clear all translations for a file' },
        { key: 'allow_client_assign_translators', value: false, description: 'Allow clients to assign translators to their projects' },
        // New AI Settings
        { key: 'enable_ai_features', value: true, description: 'Global switch to enable/disable all AI features' },
        { key: 'enable_ai_single_suggestion', value: true, description: 'Enable button for single sentence AI suggestion' },
        { key: 'ai_provider', value: 'openai', description: 'AI Provider (openai, google)' },
        { key: 'ai_model', value: 'gpt-3.5-turbo', description: 'Selected Model ID' },
        { key: 'ai_api_key', value: '', description: 'Encrypted API Key' },
        { key: 'notes_system_enabled', value: true, description: 'Enable Team Notes System' },
        { key: 'notes_replies_enabled', value: true, description: 'Allow new replies in notes' },
        { key: 'notes_allow_attachments', value: false, description: 'Allow file attachments in notes' },
        { key: 'ai_moderation_contact_info', value: false, description: 'Detect & block contact info in client messages' },
        { key: 'ai_moderation_action', value: 'block', description: 'Action when contact info detected (block/hide)' },
        // Chat Settings
        { key: 'chat_enabled', value: true, description: 'Global Chat System Enabled' },
        { key: 'chat_allow_file_sharing', value: true, description: 'Allow file uploads in chat' },
        { key: 'chat_max_file_size', value: 5, description: 'Max file size (MB) for chat uploads' },
        { key: 'chat_allow_group_creation', value: true, description: 'Allow regular users to create groups' },
        { key: 'chat_allowed_file_types', value: ['jpg', 'png', 'pdf', 'docx'], description: 'Allowed extensions for chat' },
        // Glossary Settings
        { key: 'enable_ai_glossary_gen', value: false, description: 'Enable AI Bulk Glossary Generator (Background Job)' }
    ];
    for (const d of defaults) {
        const exists = yield SystemSetting_1.SystemSetting.findOne({ key: d.key });
        if (!exists) {
            yield SystemSetting_1.SystemSetting.create(d);
        }
    }
});
exports.seedSettings = seedSettings;
