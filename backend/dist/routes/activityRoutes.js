"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityController_1 = require("../controllers/activityController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, activityController_1.logActivity);
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('SUPER_ADMIN'), activityController_1.getRecentActivity);
exports.default = router;
