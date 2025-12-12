import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
    role: z.enum(['CLIENT', 'TRANSLATOR']).optional(),
    languages: z.array(z.object({
        source: z.string(),
        target: z.string()
    })).optional()
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role, languages } = registerSchema.parse(req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, role, languages });

        const roleDoc = await Role.findOne({ name: user.role });
        const permissions = roleDoc ? roleDoc.permissions : [];

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

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
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isActive) {
            return res.status(403).json({
                message: '⛔ YOUR ACCOUNT HAS BEEN OBLITERATED! (Just kidding, it\'s deactivated. Contact admin.)'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const roleDoc = await Role.findOne({ name: user.role });
        const permissions = roleDoc ? roleDoc.permissions : [];

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, role, languages } = req.body;
        const requestorRole = req.user.role;

        // Basic Validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Verify Role Exists in DB
        const roleExists = await Role.findOne({ name: role });
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
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, role, languages });

        res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
