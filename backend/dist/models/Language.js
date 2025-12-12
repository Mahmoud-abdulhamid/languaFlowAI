"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Language = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const languageSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true }, // e.g. "English"
    code: { type: String, required: true, unique: true }, // e.g. "en"
    nativeName: { type: String, required: true }, // e.g. "English"
    direction: { type: String, enum: ['ltr', 'rtl'], default: 'ltr' }
}, { timestamps: true });
exports.Language = mongoose_1.default.model('Language', languageSchema);
