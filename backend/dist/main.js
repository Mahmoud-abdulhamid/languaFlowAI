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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
dotenv_1.default.config();
const http_1 = require("http");
const socketService_1 = require("./services/socketService");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 4000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Database
(0, db_1.connectDB)();
// Initialize Socket.io
(0, socketService_1.initSocket)(httpServer);
// Middlewares
const authMiddleware_1 = require("./middleware/authMiddleware");
const systemMiddleware_1 = require("./middleware/systemMiddleware");
// Notification Routes (New)
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
app.use('/api/v1/notifications', authMiddleware_1.protect, notificationRoutes_1.default);
const settingRoutes_1 = __importStar(require("./routes/settingRoutes"));
app.use('/api/v1/public-settings', settingRoutes_1.publicSettingRoutes);
app.use('/api/v1/settings', settingRoutes_1.default);
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
app.use('/api/v1/notes', noteRoutes_1.default);
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
app.use('/api/v1/auth', authRoutes_1.default);
const protectedMiddleware = [authMiddleware_1.protect, systemMiddleware_1.checkMaintenanceMode];
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
app.use('/api/v1/projects', protectedMiddleware, projectRoutes_1.default);
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
app.use('/api/v1/ai', protectedMiddleware, aiRoutes_1.default);
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
app.use('/api/v1/dashboard', protectedMiddleware, dashboardRoutes_1.default);
const glossaryRoutes_1 = __importDefault(require("./routes/glossaryRoutes"));
app.use('/api/v1/glossaries', protectedMiddleware, glossaryRoutes_1.default);
const userRoutes_1 = __importStar(require("./routes/userRoutes"));
app.use('/api/v1/users', userRoutes_1.publicUserRouter);
app.use('/api/v1/users', protectedMiddleware, userRoutes_1.default);
const languageRoutes_1 = __importDefault(require("./routes/languageRoutes"));
app.use('/api/v1/languages', protectedMiddleware, languageRoutes_1.default);
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
app.use('/api/v1/roles', protectedMiddleware, roleRoutes_1.default);
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
app.use('/api/v1/profile/public', publicRoutes_1.default);
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
app.use('/api/v1/chats', protectedMiddleware, chatRoutes_1.default);
const maintenanceRoutes_1 = __importDefault(require("./routes/maintenanceRoutes"));
app.use('/api/v1/maintenance', maintenanceRoutes_1.default);
app.get('/', (req, res) => {
    res.send('AI Translation System API Running');
});
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
