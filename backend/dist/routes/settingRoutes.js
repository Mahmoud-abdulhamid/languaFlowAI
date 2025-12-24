"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.publicSettingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const settingController_1 = require("../controllers/settingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const aiConfigController_1 = require("../controllers/aiConfigController");
const router = express_1.default.Router();
exports.publicSettingRoutes = express_1.default.Router();
// Public route to get necessary config (e.g. system name, maintenance status)
exports.publicSettingRoutes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { getSystemSetting } = yield Promise.resolve().then(() => __importStar(require('../controllers/settingController')));
        const systemName = yield getSystemSetting('system_name');
        const systemLogo = yield getSystemSetting('system_logo');
        const systemFavicon = yield getSystemSetting('system_favicon');
        const maintenance = yield getSystemSetting('maintenance_mode');
        const showDemo = yield getSystemSetting('show_demo_login');
        const enableAIAll = yield getSystemSetting('enable_ai_translation_all');
        const enableClear = yield getSystemSetting('enable_clear_translation');
        const enableAIFeatures = yield getSystemSetting('enable_ai_features');
        const enableSingle = yield getSystemSetting('enable_ai_single_suggestion');
        const enableSingle = yield getSystemSetting('enable_ai_single_suggestion');
        const allowClientAssign = yield getSystemSetting('allow_client_assign_translators');
        const allowedFileTypes = yield getSystemSetting('allowed_file_types');
        const maxFileSize = yield getSystemSetting('max_file_size_mb');
        // Only expose safe public info
        res.json({
            system_name: systemName || 'LinguaFlow',
            system_logo: systemLogo,
            system_favicon: systemFavicon,
            maintenance_mode: maintenance,
            show_demo_login: showDemo,
            enable_ai_translation_all: enableAIAll,
            enable_clear_translation: enableClear,
            enable_ai_features: enableAIFeatures,
            enable_ai_single_suggestion: enableSingle,
            allow_client_assign_translators: allowClientAssign,
            allowed_file_types: allowedFileTypes,
            max_file_size_mb: maxFileSize,
            notes_system_enabled: yield getSystemSetting('notes_system_enabled'),
            notes_replies_enabled: yield getSystemSetting('notes_replies_enabled'),
            notes_allow_attachments: yield getSystemSetting('notes_allow_attachments'),
            ai_moderation_contact_info: yield getSystemSetting('ai_moderation_contact_info'),
            enable_ai_glossary_gen: yield getSystemSetting('enable_ai_glossary_gen')
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Sys Config Error' });
    }
}));
router.get('/', authMiddleware_1.protect, settingController_1.getSettings);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), settingController_1.updateSetting);
router.post('/upload', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), uploadMiddleware_1.upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath });
});
router.get('/ai/models', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), aiConfigController_1.getAvailableModels);
exports.default = router;
