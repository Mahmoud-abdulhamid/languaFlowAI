
import mongoose, { Schema, Document } from 'mongoose';

export interface IGlossaryGenerationJob extends Document {
    userId: mongoose.Types.ObjectId;
    sourceLang: string;
    targetLang: string;
    targetCount: number;
    generatedCount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'STOPPED' | 'FAILED';
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

const GlossaryGenerationJobSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceLang: { type: String, required: true },
    targetLang: { type: String, required: true },
    targetCount: { type: Number, required: true },
    generatedCount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'STOPPED', 'FAILED'],
        default: 'PENDING'
    },
    error: { type: String }
}, { timestamps: true });

export default mongoose.model<IGlossaryGenerationJob>('GlossaryGenerationJob', GlossaryGenerationJobSchema);
