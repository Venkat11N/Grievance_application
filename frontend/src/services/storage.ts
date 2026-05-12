import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const appStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },

  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};
