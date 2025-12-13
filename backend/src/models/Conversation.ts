import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['DIRECT', 'GROUP'], default: 'DIRECT' },
    name: { type: String }, // For group chats
    groupAvatar: { type: String },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For group admins
    leftParticipants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        leftAt: { type: Date, default: Date.now }
    }],
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique direct conversation between two users
conversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
