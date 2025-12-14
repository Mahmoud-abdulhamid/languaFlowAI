import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';

import bcrypt from 'bcryptjs';

export const getTranslators = async (req: AuthRequest, res: Response) => {
    try {
        const translators = await User.find({ role: 'TRANSLATOR' }).select('-password');
        res.json(translators);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getClients = async (req: AuthRequest, res: Response) => {
    try {
        const clients = await User.find({ role: 'CLIENT' }).select('-password');
        res.json(clients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, avatar, username, bio, jobTitle, socialLinks, specializations } = req.body;
        const userId = req.user.id;

        // Check email uniqueness if changed
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: userId } });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updateOps: any = {
            $set: { name, email, avatar, bio, jobTitle, socialLinks, specializations }
        };

        // Handle Username
        if (username && username.trim().length > 0) {
            if (username.length < 3) {
                return res.status(400).json({ message: 'Username must be at least 3 characters' });
            }
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            updateOps.$set.username = username;
        } else if (username === '') {
            // Explicitly unset the username field to avoid unique index collision on null/empty
            updateOps.$unset = { username: 1 };
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateOps,
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error: any) {
        // Handle Mongoose duplicate key error specifically for better message
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `${field} is already taken` });
        }
        res.status(400).json({ message: error.message });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const role = req.query.role as string;
        const skip = (page - 1) * limit;

        let query: any = {};
        if (role && role !== 'ALL') {
            query.role = role;
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, role, languages, password, avatar } = req.body;

        // Prevent updating self role to something lower if you are the last super admin (edge case, not handling deep logic yet)
        // Prevent Admin from updating Super Admin
        const targetUser = await User.findById(id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (req.user.role !== 'SUPER_ADMIN' && targetUser.role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Cannot modify Super Admin' });
        }

        // Check email uniqueness if changed
        if (email && email !== targetUser.email) {
            const existing = await User.findOne({ email, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updateData: any = { name, email, role, languages, avatar };

        // Only hash and update password if provided and not empty
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const targetUser = await User.findById(id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (targetUser.role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Cannot delete Super Admin account. Action forbidden.' });
        }

        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const targetUser = await User.findById(id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (targetUser.role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Cannot deactivate Super Admin' });
        }

        targetUser.isActive = isActive;
        await targetUser.save();

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: { id: targetUser._id, isActive: targetUser.isActive }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// --- Gamification ---
export const checkUsernameAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const { username } = req.body;
        const userId = req.user.id;

        if (!username || username.length < 3) {
            return res.status(400).json({ message: 'Username too short' });
        }

        const existingUser = await User.findOne({ username, _id: { $ne: userId } });

        if (!existingUser) {
            return res.json({ available: true, suggestions: [] });
        }

        // Generate suggestions
        const suggestions: string[] = [];
        const base = username.substring(0, 10);

        // Simple loop to generate 3 suggestions
        let attempts = 0;
        while (suggestions.length < 3 && attempts < 10) {
            attempts++;
            const randomSuffix = Math.floor(Math.random() * 10000);
            const candidate = `${base}_${randomSuffix}`;

            const check = await User.findOne({ username: candidate });
            if (!check && !suggestions.includes(candidate)) {
                suggestions.push(candidate);
            }
        }

        res.json({ available: false, suggestions });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function (not exported as route handler)
export const checkAchievementsInternal = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Fetch Stats
        // 1. Completed Projects
        // (Rough estimate using specific queries or counters if we had them. For now, querying projects)
        const projectsCompleted = await import('../models/Project').then(m => m.Project.countDocuments({
            status: 'COMPLETED',
            $or: [{ clientId: userId }, { assignedTranslators: userId }]
        }));

        // 2. Word Count (Total words in completed projects)
        // Harder to calculate efficiently on every check. Maybe simplified for minimal MVP.
        // Let's stick to "Project Count" for speed.

        const newAchievements: any[] = [];
        const currentIds = (user.achievements || []).map((a: any) => a.id);

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
            await user.save();
            return newAchievements;
        }

        return [];

    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

export const getAchievements = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.achievements || []);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// --- Demo Access ---
export const getDemoUsers = async (req: Request, res: Response) => {
    try {
        // Fetch ALL active users for demo purposes
        const users = await User.find({ isActive: true })
            .select('name email role avatar')
            .limit(100);

        // Get project counts for each user
        const { Project } = await import('../models/Project');
        const userProjectCounts = await Promise.all(
            users.map(async (user) => {
                let projectCount = 0;

                if (user.role === 'CLIENT') {
                    // Count projects where user is the client
                    projectCount = await Project.countDocuments({ clientId: user._id });
                } else if (user.role === 'TRANSLATOR') {
                    // Count projects where user is assigned as translator
                    projectCount = await Project.countDocuments({
                        translators: user._id
                    });
                }

                return { user, projectCount };
            })
        );

        // Custom sort: Super Admin > Admin > Translator > Client
        // Then by project count (descending), then by name
        const rolePriority: { [key: string]: number } = {
            'SUPER_ADMIN': 0,
            'ADMIN': 1,
            'TRANSLATOR': 2,
            'CLIENT': 3
        };

        const sortedUsers = userProjectCounts.sort((a, b) => {
            // Primary sort: role priority
            const priorityA = rolePriority[a.user.role] ?? 99;
            const priorityB = rolePriority[b.user.role] ?? 99;
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // Secondary sort: project count (descending)
            if (b.projectCount !== a.projectCount) {
                return b.projectCount - a.projectCount;
            }

            // Tertiary sort: name (alphabetical)
            return a.user.name.localeCompare(b.user.name);
        });

        const demoUsers = sortedUsers.map(({ user, projectCount }) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role === 'SUPER_ADMIN' ? 'Super Admin' :
                    user.role.charAt(0) + user.role.slice(1).toLowerCase(),
            avatar: user.avatar,
            projectCount,
            // Hardcoded demo password suggestion
            pass: '123456'
        }));

        res.json(demoUsers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
