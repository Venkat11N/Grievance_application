import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationService } from '../services/notification';

export const registerPushToken = async () => {
  // Skip push token registration on web
  if (Platform.OS === 'web') {
    console.log('Push token registration skipped on web platform');
    return;
  }

  try {
    // Request permission
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    // Get the token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    if (token) {
      console.log('Push token registration initiated');
      await notificationService.registerPushToken(token);
    }
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
};

export const usePushToken = () => {
  // This hook is now just a placeholder - actual registration happens after login
};
