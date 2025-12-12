"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const languageController_1 = require("../controllers/languageController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.protect, languageController_1.getAllLanguages);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), languageController_1.createLanguage); // Only admins can manage languages
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), languageController_1.updateLanguage);
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN', 'SUPER_ADMIN'), languageController_1.deleteLanguage);
exports.default = router;
