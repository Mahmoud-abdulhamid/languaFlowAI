"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.logActivity = void 0;
const ActivityLog_1 = require("../models/ActivityLog");
const socketService_1 = require("../services/socketService");
// Log user activity
const logActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page } = req.body;
        // Simple validation
        if (!page) {
            return res.status(400).json({ message: 'Page is required' });
        }
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const newLog = yield ActivityLog_1.ActivityLog.create({
            user: req.user.id,
            page,
            ip: typeof ip === 'string' ? ip : (ip === null || ip === void 0 ? void 0 : ip[0]) || 'Unknown'
        });
        // Enrich log with user info for real-time display
        const populatedLog = yield ActivityLog_1.ActivityLog.findById(newLog._id).populate('user', 'name role email avatar');
        // Emit real-time event
        try {
            const io = (0, socketService_1.getIO)();
            // Broadcast to 'super_admin_activity' room
            io.to('super_admin_activity').emit('new_activity', populatedLog);
        }
        catch (err) {
            console.error('Socket emit error', err);
        }
        // Fire and forget - minimal response
        res.status(200).json({ status: 'ok' });
    }
    catch (error) {
        // Silent fail for logging errors to not disrupt client
        console.error('Activity Log Error:', error);
        res.status(500).json({ status: 'error' });
    }
});
exports.logActivity = logActivity;
// Get recent activity (SUPER_ADMIN only)
const getRecentActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = 20;
        const logs = yield ActivityLog_1.ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('user', 'name role email avatar');
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getRecentActivity = getRecentActivity;
