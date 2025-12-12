import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: any, res: Response) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const getUnreadCount = async (req: any, res: Response) => {
    try {
        const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unread count' });
    }
};

export const markAsRead = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

export const markAsUnread = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: false });
        res.status(200).json({ message: 'Marked as unread' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

export const markAllAsRead = async (req: any, res: Response) => {
    try {
        await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

export const deleteNotification = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification' });
    }
};
