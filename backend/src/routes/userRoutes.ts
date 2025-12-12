import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getTranslators, getClients, getAllUsers, updateUser, deleteUser, updateProfile, changePassword, toggleUserStatus, checkUsernameAvailability, getDemoUsers } from '../controllers/userController';
import { createUser } from '../controllers/authController';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();
export const publicUserRouter = express.Router();

publicUserRouter.get('/public/demo-users', getDemoUsers);

router.get('/translators', protect, getTranslators);
router.get('/clients', protect, authorize('ADMIN', 'SUPER_ADMIN'), getClients);
router.post('/create', protect, createUser);

// Profile Management (All Authenticated Users)
router.post('/check-username', protect, checkUsernameAvailability);
router.post('/upload-avatar', protect, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
});
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin Routes
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), getAllUsers);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), updateUser);
router.put('/:id/status', protect, authorize('ADMIN', 'SUPER_ADMIN'), toggleUserStatus);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), deleteUser);

export default router;
