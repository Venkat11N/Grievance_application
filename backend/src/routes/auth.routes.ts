import { Router } from 'express';
import {
  register,
  requestOtp,
  verifyOtp,
  login,
  verifyToken,
  registerPushToken,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/verify-token', authenticate, verifyToken);
router.post('/push-token', authenticate, registerPushToken);

export default router;