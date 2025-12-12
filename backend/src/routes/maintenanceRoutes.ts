import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    getSystemStats,
    getBackups,
    createBackup,
    downloadBackup,
    deleteBackup,
    restoreBackup,
    clearCache,
    killAllSessions
} from '../controllers/maintenanceController';
import { upload } from '../middleware/uploadMiddleware';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Middleware: Super Admin / Admin Check
// Note: We'll allow ADMIN for now, but usually this is SUPER_ADMIN only.
const superAdminOnly = (req: any, res: any, next: any) => {
    if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: System Administrators only' });
    }
};

router.use(protect);
router.use(superAdminOnly);

// System Stats
router.get('/stats', getSystemStats);

// Backups
router.get('/backups', getBackups);
router.post('/backups/create', createBackup);
router.get('/backups/:filename', downloadBackup);
router.delete('/backups/:filename', deleteBackup);
router.post('/backups/restore', restoreBackup);

// Upload & Restore
// Uses a custom storage config or just moves file to backups dir
router.post('/backups/upload', upload.single('backupFile'), (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Move from uploads to backups
    const oldPath = req.file.path;
    const newPath = path.join(__dirname, '../../backups', req.file.originalname);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to move backup file', error: err.message });
        }
        res.json({ message: 'Backup uploaded successfully', filename: req.file.originalname });
    });
});

// Actions
router.post('/cache/clear', clearCache);
router.post('/sessions/kill', killAllSessions);

export default router;
