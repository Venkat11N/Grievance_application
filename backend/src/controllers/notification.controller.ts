import { Request, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';
import { sendPushNotification } from '../services/push';
import { AuthRequest } from '../middlewares/auth';

// This endpoint is meant to be called by the external grievance system.
// It receives either a specific userId, or a role to broadcast to all users of that role.
export const sendNotification = async (req: Request, res: Response) => {
  const { userId, role, title, body, data } = req.body;

  try {
    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      await new Notification({ userId, title, body, data }).save();
      await sendPushNotification(userId, title, body, data);
    } else if (role) {
      const users = await User.find({ role });
      if (users.length === 0) {
        return res.json({ message: 'No users found with that role.' });
      }
      // Prepare notifications for bulk insertion
      const notifications = users.map(u => ({ userId: u._id, title, body, data }));
      await Notification.insertMany(notifications);

      // Send push notifications concurrently for better performance
      const pushPromises = users.map(u =>
        sendPushNotification(u._id.toString(), title, body, data)
      );
      await Promise.all(pushPromises);

    } else {
      return res.status(400).json({ message: 'userId or role required' });
    }
    res.json({ message: 'Notifications sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
};

// Fetch logged-in user's notification history
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  try {
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};