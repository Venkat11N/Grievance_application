import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import PushToken from '../models/PushToken';
import { generateOTP, verifyOTP } from '../services/otp';
import { sendOTPEmail } from '../services/email';
import { AuthRequest } from '../middlewares/auth';

interface PendingRegistration {
  name: string;
  email: string;
  mobile?: string;
  role: 'seafarer' | 'official';
}

const pendingRegistrations = new Map<string, PendingRegistration>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const register = async (req: Request, res: Response) => {
  const { name, mobile, role } = req.body;
  const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';
  console.log('Register request:', { name, email, mobile, role });
  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Name, email, and role are required' });
  }
  if (role !== 'seafarer' && role !== 'official') {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP(email);
    pendingRegistrations.set(email, { name, email, mobile, role });
    console.log('Generated OTP for', email, ':', otp);

    try {
      await sendOTPEmail(email, otp);
      res.json({ message: 'OTP sent successfully' });
    } catch (emailErr: any) {
      console.error('Failed to send OTP email:', emailErr);
      res.status(500).json({ message: 'Failed to send OTP email. Please check server logs.' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const requestOtp = async (req: Request, res: Response) => {
  const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';
  console.log('Request OTP for:', email);
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    // Only allow OTP for registered users (for login flow)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not registered. Please register first.' });
    }

    const otp = generateOTP(email);
    console.log('Generated OTP for', email, ':', otp);

    try {
      await sendOTPEmail(email, otp);
      res.json({ message: 'OTP sent successfully' });
    } catch (emailErr: any) {
      console.error('Failed to send OTP email:', emailErr);
      res.status(500).json({ message: 'Failed to send OTP email. Please check server logs.' });
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';
  const { otp, mobile } = req.body;
  console.log('Verify OTP request:', { email, otp, mobile });
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
  try {
    const isValid = verifyOTP(email, otp);
    console.log('OTP verification result for', email, ':', isValid);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    let user = await User.findOne({ email });
    if (!user) {
      const pendingRegistration = pendingRegistrations.get(email);
      if (!pendingRegistration) {
        return res.status(400).json({ message: 'Registration details expired. Please register again.' });
      }

      user = new User({
        email,
        name: pendingRegistration.name,
        role: pendingRegistration.role,
        isVerified: true,
      });
      if (pendingRegistration.mobile) user.mobile = pendingRegistration.mobile;
      await user.save();
      console.log('Created new user:', email);
      pendingRegistrations.delete(email);
    } else if (mobile) {
      user.mobile = mobile;
      await user.save();
    }
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_key_for_dev';
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '30d' });
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';
  const { otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
  try {
    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_key_for_dev';
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '30d' });
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
  console.log('Register push token request body:', req.body);
  const user = req.user;
  console.log('User from auth middleware:', user);
  const { token, device } = req.body;
  try {
    if (!user) {
      console.error('No user found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!token) {
      console.error('No token provided');
      return res.status(400).json({ message: 'Token is required' });
    }
    // upsert: remove any existing token from same device/user
    await PushToken.deleteOne({ userId: user._id, token });
    await new PushToken({ userId: user._id, token, device }).save();
    console.log('Push token registered for user:', user._id);
    res.json({ message: 'Push token registered' });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({ message: 'Failed to register push token' });
  }
};
