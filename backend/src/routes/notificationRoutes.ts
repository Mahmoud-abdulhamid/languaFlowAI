import express from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAsUnread, markAllAsRead, deleteNotification } from '../controllers/notificationController';

const router = express.Router();

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/:id/unread', markAsUnread);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
