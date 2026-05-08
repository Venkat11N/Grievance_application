import api from './api';
import * as SecureStore from 'expo-secure-store';

interface RegisterData {
  name: string;
  email: string;
  mobile?: string;
  role: 'seafarer' | 'official';
}

export const authService = {
  register: async (data: RegisterData) => {
    console.log('Frontend: Calling register API with:', data);
    try {
      const response = await api.post('/auth/register', data);
      console.log('Frontend: Register API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Frontend: Register API error:', error.response?.data || error.message);
      throw error;
    }
  },

  requestOtp: async (email: string) => {
    console.log('Frontend: Calling requestOtp API with:', email);
    try {
      const response = await api.post('/auth/request-otp', { email });
      console.log('Frontend: RequestOtp API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Frontend: RequestOtp API error:', error.response?.data || error.message);
      throw error;
    }
  },

  verifyOtp: async (email: string, otp: string, mobile?: string) => {
    console.log('Frontend: Calling verifyOtp API with:', { email, otp, mobile });
    try {
      const response = await api.post('/auth/verify-otp', { email, otp, mobile });
      console.log('Frontend: VerifyOtp API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Frontend: VerifyOtp API error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (email: string, otp: string) => {
    console.log('Frontend: Calling login API with:', { email, otp });
    try {
      const response = await api.post('/auth/login', { email, otp });
      console.log('Frontend: Login API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Frontend: Login API error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    console.log('Frontend: Logging out');
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userRole');
      console.log('Frontend: Logout successful');
    } catch (error) {
      console.error('Frontend: Logout error:', error);
    }
  },
};
