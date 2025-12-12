"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const glossaryController_1 = require("../controllers/glossaryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, glossaryController_1.createTerm);
router.post('/generate', authMiddleware_1.protect, glossaryController_1.generateBulkTerms);
router.post('/generate/:id/stop', authMiddleware_1.protect, glossaryController_1.stopBulkGeneration); // Stop Job
router.get('/generate/:id', authMiddleware_1.protect, glossaryController_1.getBulkGenerationStatus); // Get Status
router.get('/', authMiddleware_1.protect, glossaryController_1.getAllGlossary);
router.get('/stats', authMiddleware_1.protect, glossaryController_1.getGlossaryStats); // Add new route
router.get('/languages', authMiddleware_1.protect, glossaryController_1.getGlossaryLanguages);
router.get('/search', authMiddleware_1.protect, glossaryController_1.searchGlossary);
router.get('/project/:projectId', authMiddleware_1.protect, glossaryController_1.getProjectGlossary);
router.put('/:id', authMiddleware_1.protect, glossaryController_1.updateTerm);
router.delete('/:id', authMiddleware_1.protect, glossaryController_1.deleteTerm);
exports.default = router;
