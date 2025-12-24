"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    conversationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String }, // Can be empty if just attachments
    type: { type: String, enum: ['TEXT', 'IMAGE', 'FILE', 'VOICE', 'SYSTEM'], default: 'TEXT' },
    attachments: [{ type: String }],
    readBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['SENT', 'DELIVERED', 'READ'], default: 'SENT' },
    deletedFor: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    isDeletedForEveryone: { type: Boolean, default: false },
    linkMetadata: {
        url: String,
        title: String,
        description: String,
        image: String
    },
    voiceMetadata: {
        duration: Number, // in seconds
        waveform: [Number] // amplitude array for visualization (0-1 range)
    }
}, { timestamps: true });
exports.Message = mongoose_1.default.model('Message', messageSchema);
