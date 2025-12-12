import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // 'INFO', 'SUCCESS', 'WARNING', 'ERROR' or specific types like 'PROJECT_ASSIGNED'
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // Optional link to navigate to
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model('Notification', notificationSchema);
