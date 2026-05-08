import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!notification) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Notification not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.date}>
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.body}>{notification.body}</Text>

          {notification.data && Object.keys(notification.data).length > 0 && (
            <View style={styles.dataContainer}>
              <Text style={styles.dataTitle}>Additional Information:</Text>
              <Text style={styles.dataText}>
                {JSON.stringify(notification.data, null, 2)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  content: {
    padding: 20,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  dataContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dataText: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});
