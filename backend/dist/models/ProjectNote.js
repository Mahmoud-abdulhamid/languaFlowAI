"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectNote = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const attachmentSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }
}, { _id: false });
const noteSchema = new mongoose_1.default.Schema({
    project: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' }, // Allow empty content if allowed (though frontend blocks it usually, unless attachments only)
    parentId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ProjectNote', default: null }, // For replies
    readBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    isHidden: { type: Boolean, default: false }, // Admin action
    attachments: [attachmentSchema]
}, { timestamps: true });
exports.ProjectNote = mongoose_1.default.model('ProjectNote', noteSchema);
