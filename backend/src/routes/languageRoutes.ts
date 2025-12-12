
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getAllLanguages, createLanguage, updateLanguage, deleteLanguage } from '../controllers/languageController';

const router = express.Router();

router.get('/', protect, getAllLanguages);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), createLanguage); // Only admins can manage languages
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), updateLanguage);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), deleteLanguage);

export default router;
