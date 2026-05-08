import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import PushToken from '../models/PushToken';
import { generateOTP, verifyOTP } from '../services/otp';
import { sendOTPEmail } from '../services/email';
import { AuthRequest } from '../middlewares/auth';

export const sendVisitorOTP = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const otp = generateOTP(email);
    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyVisitorOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
  try {
    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    let user = await User.findOne({ email });
    if (!user) {
      // Create new seafarer if not exists
      user = new User({
        email,
        name: email.split('@')[0], // placeholder name
        role: 'seafarer',
        isVerified: true,
      });
      await user.save();
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

export const officialLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const user = await User.findOne({ email, role: 'official' });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const verifyToken = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
};

export const registerPushToken = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { token, device } = req.body;
  try {
    // upsert: remove any existing token from same device/user
    await PushToken.deleteOne({ userId: user._id, token });
    await new PushToken({ userId: user._id, token, device }).save();
    res.json({ message: 'Push token registered' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to register push token' });
  }
};