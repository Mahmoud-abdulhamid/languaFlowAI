import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CLIENT', 'TRANSLATOR', 'ADMIN', 'SUPER_ADMIN'], default: 'CLIENT' },
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, trim: true, minlength: 3 },
    avatar: { type: String },
    languages: [{
        source: { type: String, required: true },
        target: { type: String, required: true }
    }],
    specializations: [{
        type: String,
        enum: ['General', 'Legal', 'Medical', 'Technical', 'Financial', 'Marketing', 'Literary', 'Scientific']
    }],
    isActive: { type: Boolean, default: true },
    bio: { type: String, maxlength: 500 },
    jobTitle: { type: String },
    socialLinks: {
        linkedin: { type: String },
        twitter: { type: String },
        website: { type: String }
    },
    heroImage: { type: String },
    settings: {
        theme: { type: String, default: 'midnight' }
    },
    achievements: [{
        id: { type: String },
        name: { type: String },
        description: { type: String },
        icon: { type: String },
        unlockedAt: { type: Date, default: Date.now }
    }],
    lastSeen: { type: Date }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
