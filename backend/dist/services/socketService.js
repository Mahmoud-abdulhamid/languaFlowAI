"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyRole = exports.notifyUser = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const User_1 = require("../models/User");
const geoip_lite_1 = __importDefault(require("geoip-lite"));
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Allow all for dev, restrict in prod
            methods: ["GET", "POST"]
        }
    });
    // Live Tracking Memory Store
    // socketId -> Session Data
    const activeSessions = new Map();
    // Broadcast live stats to admins
    setInterval(() => {
        const sessions = Array.from(activeSessions.values());
        io.to('admin_live_dashboard').emit('live_users_update', sessions);
    }, 2000); // Update every 2 seconds
    // Helper: Convert IPv6-mapped IPv4 to pure IPv4
    const extractIPv4 = (ip) => {
        // IPv6 localhost
        if (ip === '::1') {
            return '127.0.0.1';
        }
        // IPv6-mapped IPv4
        if (ip.startsWith('::ffff:')) {
            return ip.replace('::ffff:', '');
        }
        return ip;
    };
    // Helper: Get real client IP from various sources
    const getRealClientIP = (socket) => {
        // Try common proxy headers in order of preference
        const headers = socket.handshake.headers;
        // CF-Connecting-IP (Cloudflare)
        if (headers['cf-connecting-ip']) {
            return Array.isArray(headers['cf-connecting-ip'])
                ? headers['cf-connecting-ip'][0]
                : headers['cf-connecting-ip'];
        }
        // X-Real-IP (Nginx)
        if (headers['x-real-ip']) {
            return Array.isArray(headers['x-real-ip'])
                ? headers['x-real-ip'][0]
                : headers['x-real-ip'];
        }
        // X-Forwarded-For (Standard proxy header, first IP is the real client)
        if (headers['x-forwarded-for']) {
            const forwarded = Array.isArray(headers['x-forwarded-for'])
                ? headers['x-forwarded-for'][0]
                : headers['x-forwarded-for'];
            // X-Forwarded-For can be: "client, proxy1, proxy2"
            const firstIP = forwarded.split(',')[0].trim();
            return firstIP;
        }
        // Fallback to direct connection address
        return socket.handshake.address;
    };
    io.on('connection', (socket) => {
        let rawIp = getRealClientIP(socket);
        rawIp = Array.isArray(rawIp) ? rawIp[0] : rawIp;
        const cleanIp = extractIPv4(rawIp);
        // Debug log to see what IP we're getting
        console.log('Client connected - Raw IP:', rawIp, 'Clean IP:', cleanIp, 'Headers:', {
            'x-forwarded-for': socket.handshake.headers['x-forwarded-for'],
            'x-real-ip': socket.handshake.headers['x-real-ip'],
            'cf-connecting-ip': socket.handshake.headers['cf-connecting-ip']
        });
        const userAgent = socket.handshake.headers['user-agent'] || 'Unknown';
        // Basic parser for OS/Browser from User-Agent (Simple heuristic)
        let os = 'Unknown OS';
        if (userAgent.includes('Win'))
            os = 'Windows';
        else if (userAgent.includes('Mac'))
            os = 'MacOS';
        else if (userAgent.includes('Linux'))
            os = 'Linux';
        else if (userAgent.includes('Android'))
            os = 'Android';
        else if (userAgent.includes('iOS'))
            os = 'iOS';
        let browser = 'Unknown Browser';
        if (userAgent.includes('Chrome'))
            browser = 'Chrome';
        else if (userAgent.includes('Firefox'))
            browser = 'Firefox';
        else if (userAgent.includes('Safari'))
            browser = 'Safari';
        else if (userAgent.includes('Edge'))
            browser = 'Edge';
        // Resolve Country (skip localhost)
        let country = 'Unknown';
        if (cleanIp !== '127.0.0.1' && cleanIp !== 'localhost' && !cleanIp.startsWith('192.168.') && !cleanIp.startsWith('10.')) {
            const geo = geoip_lite_1.default.lookup(cleanIp);
            country = geo ? geo.country : 'Unknown';
        }
        else {
            // For localhost/private IPs, set as local
            country = 'LOCAL';
        }
        // Register initial session (Guest)
        activeSessions.set(socket.id, {
            socketId: socket.id,
            ip: cleanIp,
            country: country,
            pageUrl: '/connecting...',
            browser,
            os,
            connectedAt: new Date(),
            lastActive: new Date()
        });
        console.log('Client connected:', socket.id);
        socket.on('join_user', (userId) => __awaiter(void 0, void 0, void 0, function* () {
            if (userId) {
                console.log(`User ${userId} joined room user_${userId}`);
                socket.join(`user_${userId}`);
                // Update user status to ONLINE
                try {
                    const { UserStatus } = yield Promise.resolve().then(() => __importStar(require('../models/UserStatus')));
                    yield UserStatus.findOneAndUpdate({ userId }, { status: 'ONLINE', socketId: socket.id, lastSeen: new Date() }, { upsert: true });
                    // Fetch user details from DB
                    const user = yield User_1.User.findById(userId).select('name email role');
                    // Remove old sessions for this user (prevent duplicates)
                    for (const [sid, session] of activeSessions.entries()) {
                        if (session.userId === userId && sid !== socket.id) {
                            activeSessions.delete(sid);
                            console.log(`Removed old session ${sid} for user ${userId}`);
                        }
                    }
                    // Update session memory with full user data
                    const session = activeSessions.get(socket.id);
                    if (session && user) {
                        session.userId = userId;
                        session.role = user.role;
                        session.userName = user.name;
                        session.userEmail = user.email;
                        activeSessions.set(socket.id, session);
                    }
                    // Update User model lastSeen
                    yield User_1.User.findByIdAndUpdate(userId, { lastSeen: new Date() });
                    // Broadcast status change
                    io.emit('user_status_changed', { userId, status: 'ONLINE', lastSeen: new Date() });
                }
                catch (err) {
                    console.error('Failed to update user status', err);
                }
            }
        }));
        socket.on('change_status', (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, status }) {
            try {
                const { UserStatus } = yield Promise.resolve().then(() => __importStar(require('../models/UserStatus')));
                yield UserStatus.findOneAndUpdate({ userId }, { status, lastSeen: new Date() }, { upsert: true });
                yield User_1.User.findByIdAndUpdate(userId, { lastSeen: new Date() });
                io.emit('user_status_changed', { userId, status, lastSeen: new Date() });
            }
            catch (err) {
                console.error('Failed to change user status', err);
            }
        }));
        socket.on('join_chat', (conversationId) => {
            // console.log(`Socket ${socket.id} joining room chat_${conversationId}`);
            socket.join(`chat_${conversationId}`);
        });
        socket.on('leave_chat', (conversationId) => {
            socket.leave(`chat_${conversationId}`);
        });
        socket.on('start_typing', ({ conversationId, userId }) => {
            socket.to(`chat_${conversationId}`).emit('user_typing', { conversationId, userId });
        });
        socket.on('stop_typing', ({ conversationId, userId }) => {
            socket.to(`chat_${conversationId}`).emit('user_stopped_typing', { conversationId, userId });
        });
        socket.on('message_received', (_a) => __awaiter(void 0, [_a], void 0, function* ({ messageId, conversationId }) {
            try {
                const { Message } = yield Promise.resolve().then(() => __importStar(require('../models/Message')));
                const message = yield Message.findById(messageId);
                if (message && message.status === 'SENT') {
                    message.status = 'DELIVERED';
                    yield message.save();
                    // Notify sender (and others in chat)
                    io.to(`chat_${conversationId}`).emit('message_status_update', {
                        messageId,
                        conversationId,
                        status: 'DELIVERED'
                    });
                }
            }
            catch (e) {
                console.error('Error handling message_received', e);
            }
        }));
        socket.on('join_project', (projectId) => {
            console.log(`Socket ${socket.id} joining room project_${projectId}`);
            socket.join(`project_${projectId}`);
        });
        socket.on('leave_project', (projectId) => {
            socket.leave(`project_${projectId}`);
        });
        socket.on('leave_project', (projectId) => {
            socket.leave(`project_${projectId}`);
        });
        // --- Live Dashboard Events ---
        socket.on('page_view', (data) => {
            const session = activeSessions.get(socket.id);
            if (session) {
                session.pageUrl = data.path;
                session.pageTitle = data.title;
                session.lastActive = new Date();
                activeSessions.set(socket.id, session);
            }
        });
        socket.on('admin_subscribe_live', () => {
            // In a real app, verify admin token/role here!
            socket.join('admin_live_dashboard');
            // Send immediate update
            socket.emit('live_users_update', Array.from(activeSessions.values()));
        });
        socket.on('admin_unsubscribe_live', () => {
            socket.leave('admin_live_dashboard');
        });
        // -----------------------------
        // ... inside disconnect ...
        socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            // Update user status to OFFLINE
            try {
                const { UserStatus } = yield Promise.resolve().then(() => __importStar(require('../models/UserStatus')));
                const userStatus = yield UserStatus.findOne({ socketId: socket.id });
                if (userStatus) {
                    const now = new Date();
                    yield UserStatus.findByIdAndUpdate(userStatus._id, {
                        status: 'OFFLINE',
                        lastSeen: now
                    });
                    yield User_1.User.findByIdAndUpdate(userStatus.userId, { lastSeen: now });
                    io.emit('user_status_changed', { userId: userStatus.userId, status: 'OFFLINE', lastSeen: now });
                }
            }
            catch (err) {
                console.error('Failed to update user status on disconnect', err);
            }
            activeSessions.delete(socket.id);
            // console.log('Client disconnected:', socket.id);
        }));
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
// Helper to send notification to a specific user
const notifyUser = (userId, notification) => {
    if (io) {
        io.to(`user_${userId}`).emit('notification', notification);
    }
};
exports.notifyUser = notifyUser;
// Helper to notify a role (e.g. all ADMINs)
// Requires advanced room logic or finding all users of a role
// For simplicity, we can rely on iterating users or having role-based rooms if implemented.
const notifyRole = (role, notification) => {
    // Implementation would require users to join room `role_${role}`
    if (io) {
        io.to(`role_${role}`).emit('notification', notification);
    }
};
exports.notifyRole = notifyRole;
