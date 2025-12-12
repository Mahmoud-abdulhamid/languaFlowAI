"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicUserRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const authController_1 = require("../controllers/authController");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = express_1.default.Router();
exports.publicUserRouter = express_1.default.Router();
exports.publicUserRouter.get('/public/demo-users', userController_1.getDemoUsers);
router.get('/translators', authMiddleware_1.protect, userController_1.getTranslators);
router.get('/clients', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), userController_1.getClients);
router.post('/create', authMiddleware_1.protect, authController_1.createUser);
// Profile Management (All Authenticated Users)
router.post('/check-username', authMiddleware_1.protect, userController_1.checkUsernameAvailability);
router.post('/upload-avatar', authMiddleware_1.protect, uploadMiddleware_1.upload.single('file'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
});
router.put('/profile', authMiddleware_1.protect, userController_1.updateProfile);
router.put('/change-password', authMiddleware_1.protect, userController_1.changePassword);
// Admin Routes
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), userController_1.getAllUsers);
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), userController_1.updateUser);
router.put('/:id/status', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), userController_1.toggleUserStatus);
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), userController_1.deleteUser);
exports.default = router;
