
import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingController';
import { protect, authorize } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { getAvailableModels } from '../controllers/aiConfigController';

const router = express.Router();
export const publicSettingRoutes = express.Router();

// Public route to get necessary config (e.g. system name, maintenance status)
publicSettingRoutes.get('/', async (req, res) => {
    try {
        const { getSystemSetting } = await import('../controllers/settingController');
        const systemName = await getSystemSetting('system_name');
        const systemLogo = await getSystemSetting('system_logo');
        const systemFavicon = await getSystemSetting('system_favicon');
        const maintenance = await getSystemSetting('maintenance_mode');
        const showDemo = await getSystemSetting('show_demo_login');
        const enableAIAll = await getSystemSetting('enable_ai_translation_all');
        const enableClear = await getSystemSetting('enable_clear_translation');
        const enableAIFeatures = await getSystemSetting('enable_ai_features');
        const enableSingle = await getSystemSetting('enable_ai_single_suggestion');
        const allowClientAssign = await getSystemSetting('allow_client_assign_translators');

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
            notes_system_enabled: await getSystemSetting('notes_system_enabled'),
            notes_replies_enabled: await getSystemSetting('notes_replies_enabled'),
            notes_allow_attachments: await getSystemSetting('notes_allow_attachments'),
            ai_moderation_contact_info: await getSystemSetting('ai_moderation_contact_info'),
            enable_ai_glossary_gen: await getSystemSetting('enable_ai_glossary_gen')
        });
    } catch (error) {
        res.status(500).json({ message: 'Sys Config Error' });
    }
});

router.get('/', protect, getSettings);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), updateSetting);
router.post('/upload', protect, authorize('ADMIN', 'SUPER_ADMIN'), upload.single('file'), (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath });
});

router.get('/ai/models', protect, authorize('ADMIN', 'SUPER_ADMIN'), getAvailableModels);

export default router;
