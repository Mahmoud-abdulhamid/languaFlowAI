import express from 'express';
import { createTerm, searchGlossary, getProjectGlossary, getAllGlossary, updateTerm, deleteTerm, getGlossaryLanguages, generateBulkTerms, getGlossaryStats, stopBulkGeneration, getBulkGenerationStatus } from '../controllers/glossaryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createTerm);
router.post('/generate', protect, generateBulkTerms);
router.post('/generate/:id/stop', protect, stopBulkGeneration); // Stop Job
router.get('/generate/:id', protect, getBulkGenerationStatus); // Get Status
router.get('/', protect, getAllGlossary);
router.get('/stats', protect, getGlossaryStats); // Add new route
router.get('/languages', protect, getGlossaryLanguages);
router.get('/search', protect, searchGlossary);
router.get('/project/:projectId', protect, getProjectGlossary);
router.put('/:id', protect, updateTerm);
router.delete('/:id', protect, deleteTerm);

export default router;
