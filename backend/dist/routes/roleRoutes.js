"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleController_1 = require("../controllers/roleController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), roleController_1.getAllRoles);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('SUPER_ADMIN'), roleController_1.createRole); // Only Super Admin can create new roles
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('SUPER_ADMIN'), roleController_1.updateRole); // Only Super Admin can modify roles
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('SUPER_ADMIN'), roleController_1.deleteRole);
exports.default = router;
