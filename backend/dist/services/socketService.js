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
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyRole = exports.notifyUser = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const User_1 = require("../models/User");
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Allow all for dev, restrict in prod
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('join_user', (userId) => __awaiter(void 0, void 0, void 0, function* () {
            if (userId) {
                console.log(`User ${userId} joined room user_${userId}`);
                socket.join(`user_${userId}`);
                // Update user status to ONLINE
                try {
                    const { UserStatus } = yield Promise.resolve().then(() => __importStar(require('../models/UserStatus')));
                    yield UserStatus.findOneAndUpdate({ userId }, { status: 'ONLINE', socketId: socket.id, lastSeen: new Date() }, { upsert: true });
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
        socket.on('join_project', (projectId) => {
            console.log(`Socket ${socket.id} joining room project_${projectId}`);
            socket.join(`project_${projectId}`);
        });
        socket.on('leave_project', (projectId) => {
            socket.leave(`project_${projectId}`);
        });
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
