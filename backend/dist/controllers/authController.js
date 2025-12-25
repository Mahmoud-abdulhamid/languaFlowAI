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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.logout = exports.revokeSession = exports.getSessions = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const zod_1 = require("zod");
const Session_1 = require("../models/Session");
const ua_parser_js_1 = require("ua-parser-js");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string(),
    role: zod_1.z.enum(['CLIENT', 'TRANSLATOR']).optional(),
    languages: zod_1.z.array(zod_1.z.object({
        source: zod_1.z.string(),
        target: zod_1.z.string()
    })).optional()
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, role, languages } = registerSchema.parse(req.body);
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield User_1.User.create({ email, password: hashedPassword, name, role, languages });
        const roleDoc = yield Role_1.Role.findOne({ name: user.role });
        const permissions = roleDoc ? roleDoc.permissions : [];
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                languages: user.languages,
                avatar: user.avatar,
                permissions
            }
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });
        if (!user.isActive) {
            return res.status(403).json({
                message: '⛔ YOUR ACCOUNT HAS BEEN OBLITERATED! (Just kidding, it\'s deactivated. Contact admin.)'
            });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid credentials' });
        // --- Create Session ---
        const userAgent = req.headers['user-agent'] || '';
        const parser = new ua_parser_js_1.UAParser(userAgent);
        const result = parser.getResult();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        const session = yield Session_1.Session.create({
            user: user._id,
            ip: Array.isArray(ip) ? ip[0] : ip,
            userAgent,
            browser: result.browser.name,
            os: result.os.name,
            device: result.device.type || 'desktop'
        });
        const roleDoc = yield Role_1.Role.findOne({ name: user.role });
        const permissions = roleDoc ? roleDoc.permissions : [];
        // Include sessionId in token
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                permissions
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.login = login;
const getSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessions = yield Session_1.Session.find({ user: req.user.id }).sort({ lastActive: -1 });
        // Mark current session
        const currentSessionId = req.user.sessionId;
        const formatted = sessions.map(s => (Object.assign(Object.assign({}, s.toObject()), { isCurrent: s._id.toString() === currentSessionId })));
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSessions = getSessions;
const revokeSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const session = yield Session_1.Session.findOne({ _id: id, user: req.user.id });
        if (!session)
            return res.status(404).json({ message: 'Session not found' });
        yield session.deleteOne();
        res.json({ message: 'Session revoked' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.revokeSession = revokeSession;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Delete current session
        if (req.user.sessionId) {
            yield Session_1.Session.findByIdAndDelete(req.user.sessionId);
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.logout = logout;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, role, languages } = req.body;
        const requestorRole = req.user.role;
        // Basic Validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // 1. Verify Role Exists in DB
        const roleExists = yield Role_1.Role.findOne({ name: role });
        if (!roleExists) {
            return res.status(400).json({ message: `Role '${role}' does not exist in the system.` });
        }
        // 2. Hierarchical Check
        if (requestorRole !== 'SUPER_ADMIN') {
            // Admin cannot create Super Admin or Admin
            if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
                return res.status(403).json({ message: 'You do not have permission to create this role.' });
            }
        }
        // 3. Check Email
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield User_1.User.create({ email, password: hashedPassword, name, role, languages });
        res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createUser = createUser;
