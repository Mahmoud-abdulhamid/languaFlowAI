import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String }, // Can be empty if just attachments
    type: { type: String, enum: ['TEXT', 'IMAGE', 'FILE', 'VOICE', 'SYSTEM'], default: 'TEXT' },
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
    },
    voiceMetadata: {
        duration: Number, // in seconds
        waveform: [Number] // amplitude array for visualization (0-1 range)
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);
