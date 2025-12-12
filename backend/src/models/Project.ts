import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    notesStatus: {
        type: String,
        enum: ['ENABLED', 'DISABLED', 'READ_ONLY'],
        default: 'ENABLED'
    },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sourceLang: { type: String, required: true },
    targetLangs: [{ type: String }],
    assignedTranslators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
