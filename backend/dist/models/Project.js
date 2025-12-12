"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String },
    notesStatus: {
        type: String,
        enum: ['ENABLED', 'DISABLED', 'READ_ONLY'],
        default: 'ENABLED'
    },
    clientId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    sourceLang: { type: String, required: true },
    targetLangs: [{ type: String }],
    assignedTranslators: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'REVIEW', 'COMPLETED'],
        default: 'DRAFT'
    },
    domain: {
        type: String,
        enum: ['General', 'Legal', 'Medical', 'Technical', 'Financial', 'Marketing', 'Literary', 'Scientific'],
        default: 'General'
    },
    deadline: { type: Date },
    files: [{
            originalName: String,
            path: String,
            wordCount: Number,
            isTranslating: { type: Boolean, default: false }
        }],
    deliverables: [{
            name: String,
            path: String,
            uploadedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
            uploadedAt: { type: Date, default: Date.now }
        }]
}, { timestamps: true });
exports.Project = mongoose_1.default.model('Project', projectSchema);
