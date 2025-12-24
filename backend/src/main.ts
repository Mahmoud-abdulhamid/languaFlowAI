import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

dotenv.config();

import { createServer } from 'http';
import { initSocket } from './services/socketService';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database
connectDB();

// Initialize Socket.io
initSocket(httpServer);

// Middlewares
import { protect } from './middleware/authMiddleware';
import { checkMaintenanceMode } from './middleware/systemMiddleware';

// Notification Routes (New)
import notificationRoutes from './routes/notificationRoutes';
app.use('/api/v1/notifications', protect, notificationRoutes);

import settingRoutes, { publicSettingRoutes } from './routes/settingRoutes';
app.use('/api/v1/public-settings', publicSettingRoutes);
app.use('/api/v1/settings', settingRoutes);



import noteRoutes from './routes/noteRoutes';
app.use('/api/v1/notes', noteRoutes);

import authRoutes from './routes/authRoutes';
app.use('/api/v1/auth', authRoutes);

import activityRoutes from './routes/activityRoutes';

// Helper Routes
app.use('/api/v1/activity', activityRoutes); // Activity Log

const protectedMiddleware = [protect, checkMaintenanceMode];

import projectRoutes from './routes/projectRoutes';
app.use('/api/v1/projects', protectedMiddleware, projectRoutes);

import aiRoutes from './routes/aiRoutes';
app.use('/api/v1/ai', protectedMiddleware, aiRoutes);

import dashboardRoutes from './routes/dashboardRoutes';
app.use('/api/v1/dashboard', protectedMiddleware, dashboardRoutes);

import glossaryRoutes from './routes/glossaryRoutes';
app.use('/api/v1/glossaries', protectedMiddleware, glossaryRoutes);

import userRoutes, { publicUserRouter } from './routes/userRoutes';
app.use('/api/v1/users', publicUserRouter);
app.use('/api/v1/users', protectedMiddleware, userRoutes);

import languageRoutes from './routes/languageRoutes';
app.use('/api/v1/languages', protectedMiddleware, languageRoutes);

import roleRoutes from './routes/roleRoutes';
app.use('/api/v1/roles', protectedMiddleware, roleRoutes);

import publicRoutes from './routes/publicRoutes';
app.use('/api/v1/profile/public', publicRoutes);

import chatRoutes from './routes/chatRoutes';
app.use('/api/v1/chats', protectedMiddleware, chatRoutes);

import maintenanceRoutes from './routes/maintenanceRoutes';
app.use('/api/v1/maintenance', maintenanceRoutes);

app.get('/', (req, res) => {
    res.send('AI Translation System API Running');
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
