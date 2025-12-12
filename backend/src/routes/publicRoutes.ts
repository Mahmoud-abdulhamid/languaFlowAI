import express from 'express';
import { getPublicProfile } from '../controllers/publicController';

const router = express.Router();

router.get('/:id', getPublicProfile);

export default router;
