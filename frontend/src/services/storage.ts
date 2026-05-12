import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Auth-related keys that should not be stored in localStorage on web
const SENSITIVE_KEYS = ['authToken', 'authToken_backup'];

export const appStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return null;
        
        // Do not read sensitive keys from localStorage on web (XSS protection)
        if (SENSITIVE_KEYS.includes(key)) {
          console.warn('Sensitive key access blocked on web - use httpOnly cookies instead');
          return null;
        }
        
        return window.localStorage.getItem(key);
      }

      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return;
        
        // Do not store sensitive keys in localStorage on web (XSS protection)
        if (SENSITIVE_KEYS.includes(key)) {
          console.warn('Sensitive key storage blocked on web - use httpOnly cookies instead');
          return;
        }
        
        window.localStorage.setItem(key, value);
        return;
      }

      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  deleteItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return;
        
        // Do not delete sensitive keys from localStorage on web (XSS protection)
        if (SENSITIVE_KEYS.includes(key)) {
          console.warn('Sensitive key deletion blocked on web - use httpOnly cookies instead');
          return;
        }
        
        window.localStorage.removeItem(key);
        return;
      }

      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Storage deleteItem error:', error);
    }
  },
};
