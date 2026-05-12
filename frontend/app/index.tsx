import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { appStorage } from '../src/services/storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const token = await appStorage.getItem('authToken');
    if (token) {
      router.replace('/notifications' as any);
    } else {
      router.replace('/login' as any);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1D4ED8" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
