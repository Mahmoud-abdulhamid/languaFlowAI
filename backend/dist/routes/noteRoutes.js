"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const noteController_1 = require("../controllers/noteController");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = express_1.default.Router();
router.get('/:projectId', authMiddleware_1.protect, noteController_1.getProjectNotes);
router.post('/:projectId', authMiddleware_1.protect, uploadMiddleware_1.upload.array('attachments', 5), noteController_1.createProjectNote);
router.delete('/:id', authMiddleware_1.protect, noteController_1.deleteNote);
router.patch('/:id/hide', authMiddleware_1.protect, noteController_1.hideNote);
exports.default = router;
