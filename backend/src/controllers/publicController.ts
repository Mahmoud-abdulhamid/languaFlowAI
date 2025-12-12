import { Request, Response } from 'express';
import { User } from '../models/User';
import { Project } from '../models/Project';

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let query: any = {};

        // Check if input is a valid ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: id };
        } else {
            query = { username: id };
        }

        let user = await User.findOne(query).select('-password -settings -isActive -email');

        // Fallback: If not found by ID (and was valid ID), try username just in case user picked a hex username? (Unlikely but safe)
        if (!user && id.match(/^[0-9a-fA-F]{24}$/)) {
            const userByName = await User.findOne({ username: id }).select('-password -settings -isActive -email');
            if (userByName) user = userByName;
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Stats Logic
        // 1. Projects Completed
        const projectsCompleted = await Project.countDocuments({
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

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
