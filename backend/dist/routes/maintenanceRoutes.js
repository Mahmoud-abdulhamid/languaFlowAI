"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const maintenanceController_1 = require("../controllers/maintenanceController");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Middleware: Super Admin / Admin Check
// Note: We'll allow ADMIN for now, but usually this is SUPER_ADMIN only.
const superAdminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Access denied: System Administrators only' });
    }
};
router.use(authMiddleware_1.protect);
router.use(superAdminOnly);
// System Stats
router.get('/stats', maintenanceController_1.getSystemStats);
// Backups
router.get('/backups', maintenanceController_1.getBackups);
router.post('/backups/create', maintenanceController_1.createBackup);
router.get('/backups/:filename', maintenanceController_1.downloadBackup);
router.delete('/backups/:filename', maintenanceController_1.deleteBackup);
router.post('/backups/restore', maintenanceController_1.restoreBackup);
// Upload & Restore
// Uses a custom storage config or just moves file to backups dir
router.post('/backups/upload', uploadMiddleware_1.upload.single('backupFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Move from uploads to backups
    const oldPath = req.file.path;
    const newPath = path_1.default.join(__dirname, '../../backups', req.file.originalname);
    fs_1.default.rename(oldPath, newPath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to move backup file', error: err.message });
        }
        res.json({ message: 'Backup uploaded successfully', filename: req.file.originalname });
    });
});
// Actions
router.post('/cache/clear', maintenanceController_1.clearCache);
router.post('/sessions/kill', maintenanceController_1.killAllSessions);
exports.default = router;
