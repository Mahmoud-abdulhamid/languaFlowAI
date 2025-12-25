import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../models/Role';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token as string;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            req.user = decoded;

            // Check Global Logout (Session Invalidation)
            const globalSetting = await import('../models/SystemSetting').then(m => m.SystemSetting.findOne({ key: 'global_min_token_iat' }));
            if (globalSetting && globalSetting.value && decoded.iat) {
                const minTimestamp = Number(globalSetting.value);
                // jwt 'iat' is in seconds.
                if (decoded.iat < minTimestamp) {
                    return res.status(401).json({ message: 'Session expired by administrator' });
                }
            }

            // Check status
            const user = await import('../models/User').then(m => m.User.findById(req.user.id));
            if (!user || !user.isActive) {
                return res.status(401).json({ message: 'Not authorized, account inactive' });
            }

            // Check Session Validity (if token has sessionId)
            if (decoded.sessionId) {
                const session = await import('../models/Session').then(m => m.Session.findById(decoded.sessionId));
                if (!session) {
                    return res.status(401).json({ message: 'Session expired or revoked' });
                }
                // Update last active asynchronously
                session.updateOne({ lastActive: new Date() }).exec();
            }

            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.user && req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

export const checkPermission = (requiredPermission: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            // Super Admin Bypass
            if (req.user.role === 'SUPER_ADMIN') {
                return next();
            }

            // Fetch Role Permissions
            const userRole = await Role.findOne({ name: req.user.role });
            if (!userRole) {
                return res.status(403).json({ message: 'Role not found or access denied' });
            }

            // Check for Wildcard or Specific Permission
            if (userRole.permissions.includes('*') || userRole.permissions.includes(requiredPermission)) {
                return next();
            }

            return res.status(403).json({ message: `Access denied. Required permission: ${requiredPermission}` });
        } catch (error) {
            console.error('Permission Check Error:', error);
            res.status(500).json({ message: 'Server error during permission check' });
        }
    };
};
