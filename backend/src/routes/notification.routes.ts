import { Router } from 'express';
import { sendNotification, getMyNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/send', authenticate, sendNotification);           // external system - NOW PROTECTED
router.get('/my', authenticate, getMyNotifications); // logged-in user
router.patch('/:notificationId/read', authenticate, markAsRead); // mark as read

export default router;