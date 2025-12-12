"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userStatusSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['ONLINE', 'OFFLINE', 'AWAY', 'BUSY'], default: 'OFFLINE' },
    lastSeen: { type: Date, default: Date.now },
    socketId: { type: String }
}, { timestamps: true });
exports.UserStatus = mongoose_1.default.model('UserStatus', userStatusSchema);
