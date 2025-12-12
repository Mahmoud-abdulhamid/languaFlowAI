"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
exports.User = mongoose_1.default.model('User', userSchema);
