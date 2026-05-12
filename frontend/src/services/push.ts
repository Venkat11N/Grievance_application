import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { notificationService } from './notification';

// Configure notification behavior
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const pushService = {
  // Request notification permissions
  requestPermissions: async () => {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  // Get the push token
  getPushToken: async () => {
    if (Platform.OS === 'web') return null;

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.warn('No EAS project ID found. Skipping push token registration.');
        return null;
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      return token;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  },

  // Register push token with backend
  registerPushToken: async () => {
    if (Platform.OS === 'web') return;

    const hasPermission = await pushService.requestPermissions();
    if (!hasPermission) {
      console.log('Failed to get push notification permissions');
      return;
    }

    const token = await pushService.getPushToken();
    if (token) {
      try {
        await notificationService.registerPushToken(token);
        console.log('Push token registered successfully');
      } catch (error) {
        console.error('Failed to register push token:', error);
      }
    }
  },

  // Listen for incoming notifications
  addNotificationReceivedListener: (callback: (notification: Notifications.Notification) => void) => {
    if (Platform.OS === 'web') return { remove: () => undefined };

    return Notifications.addNotificationReceivedListener(callback);
  },

  // Listen for notification taps
  addNotificationResponseReceivedListener: (callback: (response: Notifications.NotificationResponse) => void) => {
    if (Platform.OS === 'web') return { remove: () => undefined };

    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
