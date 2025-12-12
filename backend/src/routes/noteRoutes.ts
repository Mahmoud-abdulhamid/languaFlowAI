import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getProjectNotes, createProjectNote, deleteNote, hideNote } from '../controllers/noteController';

import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/:projectId', protect, getProjectNotes);
router.post('/:projectId', protect, upload.array('attachments', 5), createProjectNote);
router.delete('/:id', protect, deleteNote);
router.patch('/:id/hide', protect, hideNote);

export default router;
