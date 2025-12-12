
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getAllRoles, createRole, updateRole, deleteRole } from '../controllers/roleController';

const router = express.Router();

router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), getAllRoles);
router.post('/', protect, authorize('SUPER_ADMIN'), createRole); // Only Super Admin can create new roles
router.put('/:id', protect, authorize('SUPER_ADMIN'), updateRole); // Only Super Admin can modify roles
router.delete('/:id', protect, authorize('SUPER_ADMIN'), deleteRole);

export default router;
