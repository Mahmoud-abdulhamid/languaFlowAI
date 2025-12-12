"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // 'INFO', 'SUCCESS', 'WARNING', 'ERROR' or specific types like 'PROJECT_ASSIGNED'
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // Optional link to navigate to
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
exports.Notification = mongoose_1.default.model('Notification', notificationSchema);
