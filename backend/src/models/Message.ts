import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String }, // Can be empty if just attachments
    type: { type: String, enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'], default: 'TEXT' },
    attachments: [{ type: String }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['SENT', 'DELIVERED', 'READ'], default: 'SENT' },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeletedForEveryone: { type: Boolean, default: false },
    linkMetadata: {
        url: String,
        title: String,
        description: String,
        image: String
    }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);
