import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export const useNotificationListener = (onNotificationReceived?: () => void) => {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Set up notification handler for when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground');
      
      // Show alert for immediate feedback
      Alert.alert(
        notification.request.content.title || 'New Notification',
        notification.request.content.body || 'You have a new notification',
        [
          { text: 'View', onPress: () => {
            // Navigate to specific notification when user taps "View"
            const notificationId = notification.request.content.data?.notificationId;
            if (notificationId) {
              router.push(`/notification/${notificationId}` as any);
            } else {
              // Fallback to notifications list when notificationId is missing
              router.push('/notifications' as any);
            }
          }},
          { text: 'Dismiss', style: 'cancel' }
        ]
      );
      
      // Call callback to refresh notification list
      onNotificationReceived?.();
    });

    // Set up response handler for when user taps notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped');
      
      // Try multiple paths to find notificationId
      let notificationId = null;
      
      // Path 1: response.notification.request.content.data?.notificationId
      if (response.notification?.request?.content?.data?.notificationId) {
        notificationId = response.notification.request.content.data.notificationId;
      }
      
      // Path 2: response.notification.request.content.data (if data is the notificationId)
      else if (response.notification?.request?.content?.data) {
        const data = response.notification.request.content.data;
        if (typeof data === 'string') {
          notificationId = data;
        }
      }
      
      if (notificationId) {
        router.push(`/notification/${notificationId}` as any);
      } else {
        // Fallback to notifications list when notificationId is missing
        router.push('/notifications' as any);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [onNotificationReceived]);
};
