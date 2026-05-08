import { Router } from 'express';
import {
  sendVisitorOTP,
  verifyVisitorOTP,
  officialLogin,
  verifyToken,
  registerPushToken,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/visitor/send-otp', sendVisitorOTP);
router.post('/visitor/verify-otp', verifyVisitorOTP);
router.post('/official/login', officialLogin);
router.get('/verify-token', authenticate, verifyToken);
router.post('/push-token', authenticate, registerPushToken);

export default router;