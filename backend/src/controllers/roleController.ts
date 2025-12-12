
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Role } from '../models/Role';

export const getAllRoles = async (req: AuthRequest, res: Response) => {
    try {
        const roles = await Role.find({});
        res.json(roles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createRole = async (req: AuthRequest, res: Response) => {
    try {
        const { name, permissions, description } = req.body;

        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        const role = await Role.create({
            name,
            permissions,
            description
        });

        res.status(201).json(role);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
    try {
        const { name, permissions, description } = req.body;
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (role.name === 'SUPER_ADMIN') {
            return res.status(400).json({ message: 'Cannot modify Super Admin role' });
        }

        role.name = name || role.name;
        role.permissions = permissions || role.permissions;
        role.description = description || role.description;

        await role.save();
        res.json(role);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (['SUPER_ADMIN', 'ADMIN', 'CLIENT', 'TRANSLATOR'].includes(role.name)) {
            return res.status(400).json({ message: 'Cannot delete default system roles' });
        }

        await role.deleteOne();
        res.json({ message: 'Role deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
