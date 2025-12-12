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
exports.checkPermission = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Role_1 = require("../models/Role");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.query.token) {
        token = req.query.token;
    }
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            // Check Global Logout (Session Invalidation)
            const globalSetting = yield Promise.resolve().then(() => __importStar(require('../models/SystemSetting'))).then(m => m.SystemSetting.findOne({ key: 'global_min_token_iat' }));
            if (globalSetting && globalSetting.value && decoded.iat) {
                const minTimestamp = Number(globalSetting.value);
                // jwt 'iat' is in seconds.
                if (decoded.iat < minTimestamp) {
                    return res.status(401).json({ message: 'Session expired by administrator' });
                }
            }
            // Check status
            const user = yield Promise.resolve().then(() => __importStar(require('../models/User'))).then(m => m.User.findById(req.user.id));
            if (!user || !user.isActive) {
                return res.status(401).json({ message: 'Not authorized, account inactive' });
            }
            return next();
        }
        catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
});
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
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
exports.authorize = authorize;
const checkPermission = (requiredPermission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            // Super Admin Bypass
            if (req.user.role === 'SUPER_ADMIN') {
                return next();
            }
            // Fetch Role Permissions
            const userRole = yield Role_1.Role.findOne({ name: req.user.role });
            if (!userRole) {
                return res.status(403).json({ message: 'Role not found or access denied' });
            }
            // Check for Wildcard or Specific Permission
            if (userRole.permissions.includes('*') || userRole.permissions.includes(requiredPermission)) {
                return next();
            }
            return res.status(403).json({ message: `Access denied. Required permission: ${requiredPermission}` });
        }
        catch (error) {
            console.error('Permission Check Error:', error);
            res.status(500).json({ message: 'Server error during permission check' });
        }
    });
};
exports.checkPermission = checkPermission;
