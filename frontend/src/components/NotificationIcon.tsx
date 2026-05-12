import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationIconProps {
  unreadCount: number;
  onPress: () => void;
  size?: number;
  color?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  unreadCount,
  onPress,
  size = 24,
  color = '#fff'
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Ionicons name="notifications-outline" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
