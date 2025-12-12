import express from 'express';
import { createProject, getProjects, getProjectById, assignTranslator, removeTranslator, updateProjectStatus, updateProjectClient, deleteProject, getProjectProgress } from '../controllers/projectController';
import { downloadProjectFiles, downloadDeliverable, exportTranslatedFile } from '../controllers/downloadController';
import { protect, authorize, checkPermission } from '../middleware/authMiddleware';

const router = express.Router();

import { upload } from '../middleware/uploadMiddleware';

router.route('/')
    .post(protect, authorize('ADMIN', 'CLIENT'), upload.array('files', 10), createProject)
    .get(protect, getProjects);

router.post('/assign', protect, authorize('ADMIN', 'CLIENT'), assignTranslator);
router.post('/remove-translator', protect, authorize('ADMIN', 'CLIENT'), removeTranslator);

router.route('/:id')
    .get(protect, getProjectById)
    .patch(protect, authorize('ADMIN', 'CLIENT', 'TRANSLATOR'), updateProjectStatus)
    .delete(protect, authorize('ADMIN'), deleteProject);

router.put('/:id/client', protect, authorize('ADMIN', 'SUPER_ADMIN'), updateProjectClient);
router.post('/:id/files', protect, authorize('ADMIN', 'SUPER_ADMIN', 'CLIENT'), upload.array('files'), (req, res) => {
    // Lazy import to ensure circular dep check (though controller import structure seems ok)
    const { addProjectFiles } = require('../controllers/projectController');
    addProjectFiles(req, res);
});

router.delete('/:id/files/:fileId', protect, authorize('ADMIN', 'CLIENT'), (req: any, res: any) => {
    // Lazy import or direct usage if imported at top
    // To avoid circular dependency or just cleaner code, we should import it or export it from controller
    const { deleteProjectFile } = require('../controllers/projectController');
    deleteProjectFile(req, res);
});

router.get('/:id/download', protect, downloadProjectFiles);

router.post('/:id/deliverables', protect, upload.array('files'), (req: any, res: any) => {
    const { uploadDeliverable } = require('../controllers/projectController');
    uploadDeliverable(req, res);
});

router.delete('/:id/deliverables/:fileId', protect, (req: any, res: any) => {
    const { deleteDeliverable } = require('../controllers/projectController');
    deleteDeliverable(req, res);
});

router.get('/:id/deliverables/:fileId/download', protect, downloadDeliverable);
router.get('/:id/files/:fileId/export', protect, exportTranslatedFile);

router.get('/:id/progress', protect, getProjectProgress);

// Translation Routes
import { getProjectSegments, saveSegment, generateAISuggestion } from '../controllers/translationController';

router.get('/:projectId/files/:fileId/segments', protect, getProjectSegments);
router.patch('/segments/:segmentId', protect, saveSegment); // Update translation
router.post('/segments/:segmentId/ai', protect, generateAISuggestion); // Generate AI

import { translateFileAI, clearFileTranslations, stopTranslation } from '../controllers/translationController';
router.post('/:projectId/files/:fileId/translate-all', protect, translateFileAI);
router.post('/:projectId/files/:fileId/stop', protect, stopTranslation);
router.post('/:projectId/files/:fileId/clear', protect, authorize('ADMIN', 'SUPER_ADMIN', 'TRANSLATOR'), clearFileTranslations);

// New Details Route
router.patch('/:id/details', protect, (req, res) => {
    const { updateProjectDetails } = require('../controllers/projectController');
    updateProjectDetails(req, res);
});

export default router;
