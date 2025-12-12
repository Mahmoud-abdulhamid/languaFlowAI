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
exports.checkMaintenanceMode = void 0;
const settingController_1 = require("../controllers/settingController");
const checkMaintenanceMode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isMaintenance = yield (0, settingController_1.getSystemSetting)('maintenance_mode');
        // If maintenance is on, allow only ADMIN/SUPER_ADMIN
        // Note: We need req.user to be populated. Ensure 'protect' runs before this if we want to bypass for admins.
        // If this is a public route (no protect), we might just block everyone or need a way to login during maintenance.
        // Strategy: 
        // 1. If user is authenticated (req.user exists) and is ADMIN, allow.
        // 2. If user is NOT authenticated or NOT ADMIN, block.
        // But for Login route? We must allow Login route so admins can sign in.
        // Skip maintenance check for specific safe paths
        const safePaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/settings/public'];
        if (safePaths.includes(req.path)) {
            return next();
        }
        if (isMaintenance) {
            if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
                return next();
            }
            return res.status(503).json({ message: 'System is currently under maintenance. Please try again later.' });
        }
        next();
    }
    catch (error) {
        console.error('Maintenance Check Error:', error);
        next(); // Fail open or closed? Fail open for now to avoid locking out if DB fails
    }
});
exports.checkMaintenanceMode = checkMaintenanceMode;
