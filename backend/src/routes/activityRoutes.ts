import express from 'express';
import { logActivity, getRecentActivity } from '../controllers/activityController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, logActivity);
router.get('/', protect, authorize('SUPER_ADMIN'), getRecentActivity);

export default router;
