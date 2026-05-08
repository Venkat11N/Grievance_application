import { Router } from 'express';
import { sendNotification, getMyNotifications } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/send', sendNotification);           // external system
router.get('/my', authenticate, getMyNotifications); // logged-in user

export default router;