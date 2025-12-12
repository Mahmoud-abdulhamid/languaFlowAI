"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    participants: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['DIRECT', 'GROUP'], default: 'DIRECT' },
    name: { type: String }, // For group chats
    groupAvatar: { type: String },
    lastMessage: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Message' },
    admins: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }], // For group admins
    leftParticipants: [{
            user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
            leftAt: { type: Date, default: Date.now }
        }],
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
// Ensure unique direct conversation between two users
conversationSchema.index({ participants: 1 });
exports.Conversation = mongoose_1.default.model('Conversation', conversationSchema);
