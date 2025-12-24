import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ActivityLog } from '../models/ActivityLog';

import { getIO } from '../services/socketService';

// Log user activity
export const logActivity = async (req: AuthRequest, res: Response) => {
    try {
        const { page } = req.body;
        
        // Simple validation
        if (!page) {
            return res.status(400).json({ message: 'Page is required' });
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const newLog = await ActivityLog.create({
            user: req.user.id,
            page,
            ip: typeof ip === 'string' ? ip : ip?.[0] || 'Unknown'
        });

        // Enrich log with user info for real-time display
        const populatedLog = await ActivityLog.findById(newLog._id).populate('user', 'name role email avatar');

        // Emit real-time event
        try {
            const io = getIO();
            // Broadcast to 'super_admin_activity' room
            io.to('super_admin_activity').emit('new_activity', populatedLog);
        } catch (err) {
            console.error('Socket emit error', err);
        }

        // Fire and forget - minimal response
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        // Silent fail for logging errors to not disrupt client
        console.error('Activity Log Error:', error);
        res.status(500).json({ status: 'error' });
    }
};

// Get recent activity (SUPER_ADMIN only)
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
    try {
        const limit = 20;
        
        const logs = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('user', 'name role email avatar');

        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
