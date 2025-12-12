import express from 'express';
import { translateSegment } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/translate', protect, translateSegment);

export default router;
