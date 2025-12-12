"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.get('/', notificationController_1.getNotifications);
router.get('/unread-count', notificationController_1.getUnreadCount);
router.put('/:id/read', notificationController_1.markAsRead);
router.put('/:id/unread', notificationController_1.markAsUnread);
router.put('/mark-all-read', notificationController_1.markAllAsRead);
router.delete('/:id', notificationController_1.deleteNotification);
exports.default = router;
