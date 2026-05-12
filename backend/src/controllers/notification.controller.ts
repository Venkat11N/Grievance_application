import { Request, Response } from 'express';
import Notification from '../models/Notification';
import UserNotificationSeed from '../models/UserNotificationSeed';
import User from '../models/User';
import { sendPushNotification } from '../services/push';
import { AuthRequest } from '../middlewares/auth';

const sampleNotificationsFlag = process.env.FEATURE_FLAG_SAMPLE_NOTIFICATIONS;
const sampleNotificationsEnabled =
  sampleNotificationsFlag === undefined
    ? process.env.NODE_ENV !== 'production'
    : sampleNotificationsFlag === 'true';

const getSampleNotifications = (userId: string, role: string) => {
  if (role === 'official') {
    return [
      {
        userId,
        title: 'New wage grievance assigned',
        body: 'A seafarer has submitted a wage delay grievance for MV Ocean Pearl. Please review the documents and acknowledge within 24 hours.',
        data: {
          referenceNo: 'GRV-2026-0142',
          category: 'Wage Dispute',
          vessel: 'MV Ocean Pearl',
          priority: 'High',
          status: 'Pending Review',
        },
      },
      {
        userId,
        title: 'Safety complaint escalated',
        body: 'A safety equipment complaint at Port Blair has crossed the response SLA and needs official action.',
        data: {
          referenceNo: 'GRV-2026-0138',
          category: 'Safety',
          port: 'Port Blair',
          priority: 'Critical',
          status: 'Escalated',
        },
      },
      {
        userId,
        title: 'Hearing reminder',
        body: 'Reminder: Conciliation hearing for a contract dispute is scheduled tomorrow at 11:00 AM.',
        data: {
          referenceNo: 'GRV-2026-0119',
          category: 'Contract',
          meetingMode: 'Video Conference',
          status: 'Scheduled',
        },
      },
    ];
  }

  return [
    {
      userId,
      title: 'Grievance received',
      body: 'Your complaint about delayed wages has been received and assigned to a grievance officer.',
      data: {
        referenceNo: 'GRV-2026-0142',
        category: 'Wage Dispute',
        vessel: 'MV Ocean Pearl',
        status: 'Submitted',
      },
    },
    {
      userId,
      title: 'Document request',
      body: 'Please upload your latest contract copy and salary slip to continue processing your grievance.',
      data: {
        referenceNo: 'GRV-2026-0142',
        requiredBy: '15 May 2026',
        status: 'Action Required',
      },
    },
    {
      userId,
      title: 'Case update',
      body: 'Your welfare grievance has been forwarded to the concerned port authority for response.',
      data: {
        referenceNo: 'GRV-2026-0127',
        category: 'Welfare',
        port: 'Chennai',
        status: 'Forwarded',
      },
    },
  ];
};

const ensureSampleNotifications = async (user: any) => {
  let seedResult: any;

  try {
    seedResult = await UserNotificationSeed.findOneAndUpdate(
      { userId: user._id, seeded: { $ne: true }, seeding: { $ne: true } },
      {
        $set: { seeding: true, updatedAt: new Date() },
        $setOnInsert: { userId: user._id, seeded: false, createdAt: new Date() },
      },
      { upsert: true, new: true, includeResultMetadata: true }
    );
  } catch (error: any) {
    if (error?.code === 11000) return;
    throw error;
  }

  if (!seedResult.value || seedResult.value.seeded) return;

  try {
    await Notification.insertMany(getSampleNotifications(user._id, user.role));
    await UserNotificationSeed.updateOne(
      { userId: user._id },
      { $set: { seeded: true, seeding: false, updatedAt: new Date() } }
    );
  } catch (error) {
    await UserNotificationSeed.updateOne(
      { userId: user._id },
      { $set: { seeding: false, updatedAt: new Date() } }
    );
    throw error;
  }
};

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
    if (sampleNotificationsEnabled) {
      await ensureSampleNotifications(user);
    }

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};
