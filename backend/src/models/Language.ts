
import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g. "English"
    code: { type: String, required: true, unique: true }, // e.g. "en"
    nativeName: { type: String, required: true }, // e.g. "English"
    direction: { type: String, enum: ['ltr', 'rtl'], default: 'ltr' }
}, { timestamps: true });

export const Language = mongoose.model('Language', languageSchema);
