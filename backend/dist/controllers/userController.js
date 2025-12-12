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
exports.getDemoUsers = exports.getAchievements = exports.checkAchievementsInternal = exports.checkUsernameAvailability = exports.toggleUserStatus = exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.changePassword = exports.updateProfile = exports.getClients = exports.getTranslators = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getTranslators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const translators = yield User_1.User.find({ role: 'TRANSLATOR' }).select('-password');
        res.json(translators);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTranslators = getTranslators;
const getClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield User_1.User.find({ role: 'CLIENT' }).select('-password');
        res.json(clients);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getClients = getClients;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, avatar, username, bio, jobTitle, socialLinks, specializations } = req.body;
        const userId = req.user.id;
        // Check email uniqueness if changed
        if (email) {
            const existing = yield User_1.User.findOne({ email, _id: { $ne: userId } });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        const updateOps = {
            $set: { name, email, avatar, bio, jobTitle, socialLinks, specializations }
        };
        // Handle Username
        if (username && username.trim().length > 0) {
            if (username.length < 3) {
                return res.status(400).json({ message: 'Username must be at least 3 characters' });
            }
            const existingUser = yield User_1.User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            updateOps.$set.username = username;
        }
        else if (username === '') {
            // Explicitly unset the username field to avoid unique index collision on null/empty
            updateOps.$unset = { username: 1 };
        }
        const user = yield User_1.User.findByIdAndUpdate(userId, updateOps, { new: true, runValidators: true }).select('-password');
        res.json(user);
    }
    catch (error) {
        // Handle Mongoose duplicate key error specifically for better message
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `${field} is already taken` });
        }
        res.status(400).json({ message: error.message });
    }
});
exports.updateProfile = updateProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = yield User_1.User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(newPassword, salt);
        yield user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.changePassword = changePassword;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const role = req.query.role;
        const skip = (page - 1) * limit;
        let query = {};
        if (role && role !== 'ALL') {
            query.role = role;
        }
        const total = yield User_1.User.countDocuments(query);
        const users = yield User_1.User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.json({
            data: users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllUsers = getAllUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, role, languages, password, avatar } = req.body;
        // Prevent updating self role to something lower if you are the last super admin (edge case, not handling deep logic yet)
        // Prevent Admin from updating Super Admin
        const targetUser = yield User_1.User.findById(id);
        if (!targetUser)
            return res.status(404).json({ message: 'User not found' });
        if (req.user.role !== 'SUPER_ADMIN' && targetUser.role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Cannot modify Super Admin' });
        }
        // Check email uniqueness if changed
        if (email && email !== targetUser.email) {
            const existing = yield User_1.User.findOne({ email, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        const updateData = { name, email, role, languages, avatar };
        // Only hash and update password if provided and not empty
        if (password && password.trim() !== '') {
            const salt = yield bcryptjs_1.default.genSalt(10);
            updateData.password = yield bcryptjs_1.default.hash(password, salt);
        }
        const updatedUser = yield User_1.User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        res.json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const targetUser = yield User_1.User.findById(id);
        if (!targetUser)
            return res.status(404).json({ message: 'User not found' });
        if (targetUser.role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Cannot delete Super Admin account. Action forbidden.' });
        }
        yield User_1.User.findByIdAndDelete(id);
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteUser = deleteUser;
const toggleUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const targetUser = yield User_1.User.findById(id);
        if (!targetUser)
            return res.status(404).json({ message: 'User not found' });
        if (targetUser.role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Cannot deactivate Super Admin' });
        }
        targetUser.isActive = isActive;
        yield targetUser.save();
        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: { id: targetUser._id, isActive: targetUser.isActive }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.toggleUserStatus = toggleUserStatus;
// --- Gamification ---
const checkUsernameAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        const userId = req.user.id;
        if (!username || username.length < 3) {
            return res.status(400).json({ message: 'Username too short' });
        }
        const existingUser = yield User_1.User.findOne({ username, _id: { $ne: userId } });
        if (!existingUser) {
            return res.json({ available: true, suggestions: [] });
        }
        // Generate suggestions
        const suggestions = [];
        const base = username.substring(0, 10);
        // Simple loop to generate 3 suggestions
        let attempts = 0;
        while (suggestions.length < 3 && attempts < 10) {
            attempts++;
            const randomSuffix = Math.floor(Math.random() * 10000);
            const candidate = `${base}_${randomSuffix}`;
            const check = yield User_1.User.findOne({ username: candidate });
            if (!check && !suggestions.includes(candidate)) {
                suggestions.push(candidate);
            }
        }
        res.json({ available: false, suggestions });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.checkUsernameAvailability = checkUsernameAvailability;
// Helper function (not exported as route handler)
const checkAchievementsInternal = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findById(userId);
        if (!user)
            return;
        // Fetch Stats
        // 1. Completed Projects
        // (Rough estimate using specific queries or counters if we had them. For now, querying projects)
        const projectsCompleted = yield Promise.resolve().then(() => __importStar(require('../models/Project'))).then(m => m.Project.countDocuments({
            status: 'COMPLETED',
            $or: [{ clientId: userId }, { assignedTranslators: userId }]
        }));
        // 2. Word Count (Total words in completed projects)
        // Harder to calculate efficiently on every check. Maybe simplified for minimal MVP.
        // Let's stick to "Project Count" for speed.
        const newAchievements = [];
        const currentIds = (user.achievements || []).map((a) => a.id);
        // Achievement: First Steps (1 Project)
        if (projectsCompleted >= 1 && !currentIds.includes('first_steps')) {
            newAchievements.push({
                id: 'first_steps',
                name: 'First Steps',
                description: 'Completed your first project',
                icon: 'Flag',
                unlockedAt: new Date()
            });
        }
        // Achievement: Pro User (5 Projects)
        if (projectsCompleted >= 5 && !currentIds.includes('pro_user')) {
            newAchievements.push({
                id: 'pro_user',
                name: 'Pro User',
                description: 'Completed 5 projects',
                icon: 'Star',
                unlockedAt: new Date()
            });
        }
        if (newAchievements.length > 0) {
            user.achievements.push(...newAchievements);
            yield user.save();
            return newAchievements;
        }
        return [];
    }
    catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
});
exports.checkAchievementsInternal = checkAchievementsInternal;
const getAchievements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user.achievements || []);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAchievements = getAchievements;
// --- Demo Access ---
const getDemoUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch ALL active users for demo purposes as requested
        // Increased limit to 100 to ensure we capture all roles even if one role has many users
        const users = yield User_1.User.find({ isActive: true })
            .select('name email role avatar')
            .limit(100);
        // Custom sort: Super Admin > Admin > Client > Translator
        const rolePriority = {
            'SUPER_ADMIN': 0,
            'ADMIN': 1,
            'CLIENT': 2,
            'TRANSLATOR': 3
        };
        const sortedUsers = users.sort((a, b) => {
            var _a, _b;
            const priorityA = (_a = rolePriority[a.role]) !== null && _a !== void 0 ? _a : 99;
            const priorityB = (_b = rolePriority[b.role]) !== null && _b !== void 0 ? _b : 99;
            return priorityA - priorityB || a.name.localeCompare(b.name);
        });
        const demoUsers = sortedUsers.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role.charAt(0) + user.role.slice(1).toLowerCase(),
            avatar: user.avatar,
            // Hardcoded demo password suggestion
            pass: '123456'
        }));
        res.json(demoUsers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getDemoUsers = getDemoUsers;
