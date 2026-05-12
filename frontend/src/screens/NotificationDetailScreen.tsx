import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationService, Notification } from '../services/notification';
import { styles } from './NotificationDetailScreen.styles';

export default function NotificationDetailScreen() {
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isWideWeb = isWeb && width >= 1024;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotification();
  }, [loadNotification]);

  const loadNotification = useCallback(async () => {
    try {
      const notifications = await notificationService.getMyNotifications();
      const found = notifications.find((item) => item._id === id);
      if (found) {
        setNotification(found);
        // Mark as read if it's unread
        if (!found.read) {
          await notificationService.markAsRead(found._id);
        }
      }
    } catch (error) {
      console.error('Failed to load notification:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.errorText}>Notification not found</Text>
      </SafeAreaView>
    );
  }

  const detailEntries = notification.data
    ? Object.entries(notification.data).filter(([, value]) => value !== undefined && value !== null && value !== '')
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, isWideWeb && styles.scrollContentWeb]}>
        <View style={[styles.detailShell, isWideWeb && styles.detailShellWeb]}>
          <View style={[styles.header, isWideWeb && styles.headerWeb]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.date}>{new Date(notification.createdAt).toLocaleString()}</Text>
          </View>

          <View style={[styles.content, isWideWeb && styles.contentWeb]}>
            <Text style={styles.body}>{notification.body}</Text>
            {detailEntries.length > 0 && (
              <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>Case details</Text>
                {detailEntries.map(([key, value]) => (
                  <View key={key} style={styles.dataRow}>
                    <Text style={styles.dataLabel}>{formatLabel(key)}</Text>
                    <Text style={styles.dataValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
