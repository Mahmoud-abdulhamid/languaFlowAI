"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const publicController_1 = require("../controllers/publicController");
const router = express_1.default.Router();
router.get('/:id', publicController_1.getPublicProfile);
exports.default = router;
