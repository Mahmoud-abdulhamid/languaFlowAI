import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    fileIndex: { // Index of the file in the project.files array
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

export const Segment = mongoose.model('Segment', segmentSchema);
