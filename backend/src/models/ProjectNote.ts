import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }
}, { _id: false });

const noteSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' }, // Allow empty content if allowed (though frontend blocks it usually, unless attachments only)
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectNote', default: null }, // For replies
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isHidden: { type: Boolean, default: false }, // Admin action
    attachments: [attachmentSchema]
}, { timestamps: true });

export const ProjectNote = mongoose.model('ProjectNote', noteSchema);
