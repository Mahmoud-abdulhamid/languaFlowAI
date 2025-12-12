"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controllers/projectController");
const downloadController_1 = require("../controllers/downloadController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
router.route('/')
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'CLIENT'), uploadMiddleware_1.upload.array('files', 10), projectController_1.createProject)
    .get(authMiddleware_1.protect, projectController_1.getProjects);
router.post('/assign', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'CLIENT'), projectController_1.assignTranslator);
router.post('/remove-translator', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'CLIENT'), projectController_1.removeTranslator);
router.route('/:id')
    .get(authMiddleware_1.protect, projectController_1.getProjectById)
    .patch(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'CLIENT', 'TRANSLATOR'), projectController_1.updateProjectStatus)
    .delete(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN'), projectController_1.deleteProject);
router.put('/:id/client', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), projectController_1.updateProjectClient);
router.post('/:id/files', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN', 'CLIENT'), uploadMiddleware_1.upload.array('files'), (req, res) => {
    // Lazy import to ensure circular dep check (though controller import structure seems ok)
    const { addProjectFiles } = require('../controllers/projectController');
    addProjectFiles(req, res);
});
router.delete('/:id/files/:fileId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'CLIENT'), (req, res) => {
    // Lazy import or direct usage if imported at top
    // To avoid circular dependency or just cleaner code, we should import it or export it from controller
    const { deleteProjectFile } = require('../controllers/projectController');
    deleteProjectFile(req, res);
});
router.get('/:id/download', authMiddleware_1.protect, downloadController_1.downloadProjectFiles);
router.post('/:id/deliverables', authMiddleware_1.protect, uploadMiddleware_1.upload.array('files'), (req, res) => {
    const { uploadDeliverable } = require('../controllers/projectController');
    uploadDeliverable(req, res);
});
router.delete('/:id/deliverables/:fileId', authMiddleware_1.protect, (req, res) => {
    const { deleteDeliverable } = require('../controllers/projectController');
    deleteDeliverable(req, res);
});
router.get('/:id/deliverables/:fileId/download', authMiddleware_1.protect, downloadController_1.downloadDeliverable);
router.get('/:id/files/:fileId/export', authMiddleware_1.protect, downloadController_1.exportTranslatedFile);
router.get('/:id/progress', authMiddleware_1.protect, projectController_1.getProjectProgress);
// Translation Routes
const translationController_1 = require("../controllers/translationController");
router.get('/:projectId/files/:fileId/segments', authMiddleware_1.protect, translationController_1.getProjectSegments);
router.patch('/segments/:segmentId', authMiddleware_1.protect, translationController_1.saveSegment); // Update translation
router.post('/segments/:segmentId/ai', authMiddleware_1.protect, translationController_1.generateAISuggestion); // Generate AI
const translationController_2 = require("../controllers/translationController");
router.post('/:projectId/files/:fileId/translate-all', authMiddleware_1.protect, translationController_2.translateFileAI);
router.post('/:projectId/files/:fileId/stop', authMiddleware_1.protect, translationController_2.stopTranslation);
router.post('/:projectId/files/:fileId/clear', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN', 'TRANSLATOR'), translationController_2.clearFileTranslations);
// New Details Route
router.patch('/:id/details', authMiddleware_1.protect, (req, res) => {
    const { updateProjectDetails } = require('../controllers/projectController');
    updateProjectDetails(req, res);
});
exports.default = router;
