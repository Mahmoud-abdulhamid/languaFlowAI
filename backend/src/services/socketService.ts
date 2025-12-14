import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { User } from '../models/User';
import geoip from 'geoip-lite';

let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Allow all for dev, restrict in prod
            methods: ["GET", "POST"]
        }
    });

    // Live Tracking Memory Store
    // socketId -> Session Data
    const activeSessions = new Map<string, {
        socketId: string;
        userId?: string;
        userName?: string;
        userEmail?: string;
        role?: string;
        ip: string;
        country: string;
        pageTitle?: string;
        pageUrl?: string;
        browser?: string;
        os?: string;
        connectedAt: Date;
        lastActive: Date;
    }>();

    // Broadcast live stats to admins
    setInterval(() => {
        const sessions = Array.from(activeSessions.values());
        io.to('admin_live_dashboard').emit('live_users_update', sessions);
    }, 2000); // Update every 2 seconds

    // Helper: Convert IPv6-mapped IPv4 to pure IPv4
    const extractIPv4 = (ip: string): string => {
        if (ip.startsWith('::ffff:')) {
            return ip.replace('::ffff:', '');
        }
        return ip;
    };

    io.on('connection', (socket: Socket) => {
        let rawIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
        rawIp = Array.isArray(rawIp) ? rawIp[0] : rawIp;
        const cleanIp = extractIPv4(rawIp);
        
        const userAgent = socket.handshake.headers['user-agent'] || 'Unknown';
        
        // Basic parser for OS/Browser from User-Agent (Simple heuristic)
        let os = 'Unknown OS';
        if (userAgent.includes('Win')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'MacOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';

        let browser = 'Unknown Browser';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        // Resolve Country (skip localhost)
        let country = 'Unknown';
        if (cleanIp !== '127.0.0.1' && cleanIp !== 'localhost' && !cleanIp.startsWith('192.168.')) {
            const geo = geoip.lookup(cleanIp);
            country = geo ? geo.country : 'Unknown';
        } else {
            // For localhost/private IPs, set as local
            country = 'Local';
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

        socket.on('join_user', async (userId: string) => {
            if (userId) {
                console.log(`User ${userId} joined room user_${userId}`);
                socket.join(`user_${userId}`);

                // Update user status to ONLINE
                try {
                    const { UserStatus } = await import('../models/UserStatus');
                    await UserStatus.findOneAndUpdate(
                        { userId },
                        { status: 'ONLINE', socketId: socket.id, lastSeen: new Date() },
                        { upsert: true }
                    );

                    // Fetch user details from DB
                    const user = await User.findById(userId).select('name email role');

                    // Update session memory with full user data
                    const session = activeSessions.get(socket.id);
                    if (session && user) {
                        session.userId = userId;
                        session.role = user.role;
                        // Store user name and email for display (optional)
                        (session as any).userName = user.name;
                        (session as any).userEmail = user.email;
                        activeSessions.set(socket.id, session);
                    }

                    // Update User model lastSeen
                    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

                    // Broadcast status change
                    io.emit('user_status_changed', { userId, status: 'ONLINE', lastSeen: new Date() });
                } catch (err) {
                    console.error('Failed to update user status', err);
                }
            }
        });

        socket.on('change_status', async ({ userId, status }: { userId: string, status: string }) => {
            try {
                const { UserStatus } = await import('../models/UserStatus');
                await UserStatus.findOneAndUpdate(
                    { userId },
                    { status, lastSeen: new Date() },
                    { upsert: true }
                );

                await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

                io.emit('user_status_changed', { userId, status, lastSeen: new Date() });
            } catch (err) {
                console.error('Failed to change user status', err);
            }
        });

        socket.on('join_chat', (conversationId: string) => {
            // console.log(`Socket ${socket.id} joining room chat_${conversationId}`);
            socket.join(`chat_${conversationId}`);
        });

        socket.on('leave_chat', (conversationId: string) => {
            socket.leave(`chat_${conversationId}`);
        });

        socket.on('start_typing', ({ conversationId, userId }: { conversationId: string, userId: string }) => {
            socket.to(`chat_${conversationId}`).emit('user_typing', { conversationId, userId });
        });

        socket.on('stop_typing', ({ conversationId, userId }: { conversationId: string, userId: string }) => {
            socket.to(`chat_${conversationId}`).emit('user_stopped_typing', { conversationId, userId });
        });

        socket.on('message_received', async ({ messageId, conversationId }: { messageId: string, conversationId: string }) => {
            try {
                const { Message } = await import('../models/Message');
                const message = await Message.findById(messageId);
                if (message && message.status === 'SENT') {
                    message.status = 'DELIVERED';
                    await message.save();

                    // Notify sender (and others in chat)
                    io.to(`chat_${conversationId}`).emit('message_status_update', {
                        messageId,
                        conversationId,
                        status: 'DELIVERED'
                    });
                }
            } catch (e) {
                console.error('Error handling message_received', e);
            }
        });

        socket.on('join_project', (projectId: string) => {
            console.log(`Socket ${socket.id} joining room project_${projectId}`);
            socket.join(`project_${projectId}`);
        });

        socket.on('leave_project', (projectId: string) => {
            socket.leave(`project_${projectId}`);
        });

        socket.on('leave_project', (projectId: string) => {
            socket.leave(`project_${projectId}`);
        });

        // --- Live Dashboard Events ---

        socket.on('page_view', (data: { path: string, title: string }) => {
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
        socket.on('disconnect', async () => {
            // Update user status to OFFLINE
            try {
                const { UserStatus } = await import('../models/UserStatus');
                const userStatus = await UserStatus.findOne({ socketId: socket.id });
                if (userStatus) {
                    const now = new Date();
                    await UserStatus.findByIdAndUpdate(userStatus._id, {
                        status: 'OFFLINE',
                        lastSeen: now
                    });

                    await User.findByIdAndUpdate(userStatus.userId, { lastSeen: now });

                    io.emit('user_status_changed', { userId: userStatus.userId, status: 'OFFLINE', lastSeen: now });
                }
            } catch (err) {
                console.error('Failed to update user status on disconnect', err);
            }
            activeSessions.delete(socket.id);
            // console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Helper to send notification to a specific user
export const notifyUser = (userId: string, notification: any) => {
    if (io) {
        io.to(`user_${userId}`).emit('notification', notification);
    }
};

// Helper to notify a role (e.g. all ADMINs)
// Requires advanced room logic or finding all users of a role
// For simplicity, we can rely on iterating users or having role-based rooms if implemented.
export const notifyRole = (role: string, notification: any) => {
    // Implementation would require users to join room `role_${role}`
    if (io) {
        io.to(`role_${role}`).emit('notification', notification);
    }
}
