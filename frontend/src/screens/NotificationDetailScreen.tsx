import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationService, Notification } from '../services/notification';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadNotification = async () => {
    try {
      const notifications = await notificationService.getMyNotifications();
      const found = notifications.find((n) => n._id === id);
      if (found) {
        setNotification(found);
      }
    } catch (error) {
      console.error('Failed to load notification:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.date}>
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.content}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E40AF',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  backButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  content: {
    padding: 20,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111827',
  },
  dataContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E2EA',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dataRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dataLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dataValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
