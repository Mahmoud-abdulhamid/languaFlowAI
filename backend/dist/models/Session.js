"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const sessionSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    userAgent: { type: String },
    device: { type: String }, // 'desktop', 'mobile', etc.
    browser: { type: String },
    os: { type: String },
    lastActive: { type: Date, default: Date.now },
    tokenHash: { type: String } // Optional: Store hash of token for extra security validation
}, { timestamps: true });
// Auto-expire sessions after 7 days (matching JWT 7d)
sessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });
exports.Session = mongoose_1.default.model('Session', sessionSchema);
