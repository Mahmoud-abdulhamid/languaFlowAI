import mongoose, { Schema, Document } from 'mongoose';

export interface IGlossary extends Document {
    term: string;
    translation: string;
    sourceLang: string;
    targetLang: string;
    context?: string;
    projectId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
}

const GlossarySchema: Schema = new Schema({
    term: { type: String, required: true },
    translation: { type: String, required: true },
    sourceLang: { type: String, required: true },
    targetLang: { type: String, required: true },
    context: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' }, // Optional: global vs project-specific
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Index for faster searching
GlossarySchema.index({ term: 'text', translation: 'text' });

export default mongoose.model<IGlossary>('Glossary', GlossarySchema);
