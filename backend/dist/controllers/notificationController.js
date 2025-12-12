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
exports.deleteNotification = exports.markAllAsRead = exports.markAsUnread = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const Notification_1 = require("../models/Notification");
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield Notification_1.Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});
exports.getNotifications = getNotifications;
const getUnreadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield Notification_1.Notification.countDocuments({ user: req.user.id, isRead: false });
        res.status(200).json({ count });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching unread count' });
    }
});
exports.getUnreadCount = getUnreadCount;
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Notification_1.Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ message: 'Marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});
exports.markAsRead = markAsRead;
const markAsUnread = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Notification_1.Notification.findByIdAndUpdate(id, { isRead: false });
        res.status(200).json({ message: 'Marked as unread' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});
exports.markAsUnread = markAsUnread;
const markAllAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Notification_1.Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'All marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
});
exports.markAllAsRead = markAllAsRead;
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Notification_1.Notification.findByIdAndDelete(id);
        res.status(200).json({ message: 'Notification deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting notification' });
    }
});
exports.deleteNotification = deleteNotification;
