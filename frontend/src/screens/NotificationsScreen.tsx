import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { authService } from '../services/auth';
import { notificationService, Notification } from '../services/notification';
import { appStorage } from '../services/storage';
import { NotificationIcon } from '../components/NotificationIcon';
import { useNotificationListener } from '../hooks/useNotificationListener';
import { styles } from './NotificationsScreen.styles';

export default function NotificationsScreen() {
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isWideWeb = isWeb && width >= 1024;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadUserRole();
    fetchNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh notifications when screen comes into focus
      fetchNotifications();
      
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, [])
  );

  // Set up notification listener for real-time updates
  useNotificationListener(() => {
    // Auto-refresh notification list when new notification arrives
    fetchNotifications();
  });

  const loadUserRole = async () => {
    const role = await appStorage.getItem('userRole');
    setUserRole(role);
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const performLogout = async () => {
    await authService.logout();
    router.replace('/login' as any);
  };

  const handleLogout = async () => {
    if (isWeb) {
      const canConfirm = typeof globalThis.confirm === 'function';
      if (!canConfirm || globalThis.confirm('Are you sure you want to logout?')) {
        await performLogout();
      }
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void performLogout() },
    ]);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, isWideWeb && styles.notificationItemWeb, !item.read && styles.unreadNotification]}
      onPress={() => router.push(`/notification/${item._id}` as any)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.notificationBody} numberOfLines={2}>
        {item.body}
      </Text>
      {item.data?.status && <Text style={styles.statusText}>{item.data.status}</Text>}
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#1D4ED8" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.pageShell, isWideWeb && styles.pageShellWeb]}>
        <View style={[styles.header, isWideWeb && styles.headerWeb]}>
          <Text style={styles.headerEyebrow}>Maritime Grievance Portal</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.headerActions}>
              <NotificationIcon
                unreadCount={notifications.filter((item) => !item.read).length}
                onPress={() => {
                  // Refresh notifications when icon is pressed
                  fetchNotifications();
                }}
                size={20}
                color="#fff"
              />
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.roleBadge}>{userRole === 'seafarer' ? 'Seafarer' : 'Official'}</Text>
          </View>
        </View>

        <View style={[styles.contentShell, isWideWeb && styles.contentShellWeb]}>
          {isWideWeb && (
            <View style={styles.sidebarCard}>
              <Text style={styles.sidebarLabel}>Workspace</Text>
              <Text style={styles.sidebarRole}>{userRole === 'seafarer' ? 'Seafarer inbox' : 'Official desk'}</Text>
              <Text style={styles.sidebarCopy}>
                {userRole === 'seafarer'
                  ? 'Monitor grievance progress, document requests, and official responses from a cleaner desktop view.'
                  : 'Review assigned grievances, escalation alerts, and scheduled actions from a wider browser workspace.'}
              </Text>
              <View style={styles.sidebarMetricRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{notifications.length}</Text>
                  <Text style={styles.metricLabel}>Total</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{notifications.filter((item) => !item.read).length}</Text>
                  <Text style={styles.metricLabel}>Unread</Text>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.feedCard, isWideWeb && styles.feedCardWeb]}>
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No grievance updates yet</Text>
                <Text style={styles.emptySubtext}>New case assignments, document requests, and status updates will appear here.</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item._id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
