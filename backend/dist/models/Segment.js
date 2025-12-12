"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const segmentSchema = new mongoose_1.default.Schema({
    project: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    fileIndex: {
        type: Number,
        required: true
    },
    sequence: {
        type: Number,
        required: true
    },
    sourceText: {
        type: String,
        required: true
    },
    targetText: {
        type: String,
        default: ''
    },
    targetLang: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'TRANSLATED', 'CONFIRMED'],
        default: 'DRAFT'
    },
    aiSuggestion: {
        type: String
    }
}, {
    timestamps: true
});
exports.Segment = mongoose_1.default.model('Segment', segmentSchema);
