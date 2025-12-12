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
exports.getPublicProfile = void 0;
const User_1 = require("../models/User");
const Project_1 = require("../models/Project");
const getPublicProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        let query = {};
        // Check if input is a valid ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: id };
        }
        else {
            query = { username: id };
        }
        let user = yield User_1.User.findOne(query).select('-password -settings -isActive -email');
        // Fallback: If not found by ID (and was valid ID), try username just in case user picked a hex username? (Unlikely but safe)
        if (!user && id.match(/^[0-9a-fA-F]{24}$/)) {
            const userByName = yield User_1.User.findOne({ username: id }).select('-password -settings -isActive -email');
            if (userByName)
                user = userByName;
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Stats Logic
        // 1. Projects Completed
        const projectsCompleted = yield Project_1.Project.countDocuments({
            $or: [{ clientId: user._id }, { assignedTranslators: user._id }],
            status: 'COMPLETED'
        });
        // 2. Member Since
        const memberSince = user.createdAt;
        // 3. Languages count
        const languageCount = user.languages ? user.languages.length : 0;
        res.json({
            user,
            stats: {
                projectsCompleted,
                memberSince,
                languageCount
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPublicProfile = getPublicProfile;
