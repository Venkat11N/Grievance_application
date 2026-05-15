import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  service?: { key: string; role: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET is missing' });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload) || typeof (payload as any).userId !== 'string') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const decoded = payload as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const verifyApiKey = (req: AuthRequest, res: Response, next: NextFunction) => {
  const expectedApiKey = process.env.SERVICE_API_KEY;
  if (!expectedApiKey) {
    return res.status(500).json({ message: 'Server misconfiguration: SERVICE_API_KEY is missing' });
  }

  const apiKeyHeader = req.headers['x-api-key'];
  const apiKey = typeof apiKeyHeader === 'string' ? apiKeyHeader : '';
  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({ message: 'Invalid API key' });
  }

  req.service = {
    key: apiKey,
    role: process.env.SERVICE_API_KEY_ROLE === 'admin' ? 'admin' : 'service',
  };
  next();
};