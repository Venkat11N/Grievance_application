import { Expo } from 'expo-server-sdk';
import PushToken from '../models/PushToken';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
) => {
  const tokens = await PushToken.find({ userId });
  const messages = [];
  for (const pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken.token)) continue;
    messages.push({
      to: pushToken.token,
      sound: 'default',
      title,
      body,
      data: data || {},
    });
  }
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Push error:', error);
    }
  }
};