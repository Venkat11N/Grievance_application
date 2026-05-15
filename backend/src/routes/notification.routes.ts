import { Router } from 'express';
import { sendNotification, getMyNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticate, verifyApiKey } from '../middlewares/auth';

const router = Router();

router.post('/send', verifyApiKey, sendNotification);           // external system - now protected by API key
router.get('/my', authenticate, getMyNotifications); // logged-in user
router.patch('/:notificationId/read', authenticate, markAsRead); // mark as read

export default router;