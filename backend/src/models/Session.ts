import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    userAgent: { type: String },
    device: { type: String }, // 'desktop', 'mobile', etc.
    browser: { type: String },
    os: { type: String },
    lastActive: { type: Date, default: Date.now },
    tokenHash: { type: String } // Optional: Store hash of token for extra security validation
}, { timestamps: true });

// Auto-expire sessions after 7 days (matching JWT 7d)
sessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export const Session = mongoose.model('Session', sessionSchema);
