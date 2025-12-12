import mongoose from 'mongoose';

const userStatusSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['ONLINE', 'OFFLINE', 'AWAY', 'BUSY'], default: 'OFFLINE' },
    lastSeen: { type: Date, default: Date.now },
    socketId: { type: String }
}, { timestamps: true });

export const UserStatus = mongoose.model('UserStatus', userStatusSchema);
