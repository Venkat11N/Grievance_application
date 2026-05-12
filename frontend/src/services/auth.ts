import api from './api';
import { appStorage } from './storage';

interface RegisterData {
  name: string;
  email: string;
  mobile?: string;
  role: 'seafarer' | 'official';
}

export const authService = {
  register: async (data: RegisterData) => {
    const payload = {
      ...data,
      email: data.email.trim().toLowerCase(),
      mobile: data.mobile?.trim(),
    };
    console.log('Frontend: Calling register API with:', payload);
    try {
      const response = await api.post('/auth/register', payload);
      console.log('Frontend: Register API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Frontend: Register API error:', error.response?.data || error.message);
      throw error;
    }
  },

  requestOtp: async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Frontend: Calling requestOtp API with:', normalizedEmail);
    try {
      const response = await api.post('/auth/request-otp', { email: normalizedEmail });
      console.log('Frontend: RequestOtp API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Frontend: RequestOtp API error:', error.response?.data || error.message);
      throw error;
    }
  },

  verifyOtp: async (email: string, otp: string, mobile?: string) => {
    const payload = {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      mobile: mobile?.trim(),
    };
    console.log('Frontend: Calling verifyOtp API with:', { email: payload.email, otpLength: payload.otp.length, mobile: payload.mobile });
    try {
      const response = await api.post('/auth/verify-otp', payload);
      console.log('Frontend: VerifyOtp API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Frontend: VerifyOtp API error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (email: string, otp: string) => {
    const payload = {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    };
    console.log('Frontend: Calling login API with:', { email: payload.email, otpLength: payload.otp.length });
    try {
      const response = await api.post('/auth/login', payload);
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
      await appStorage.deleteItem('authToken');
      await appStorage.deleteItem('userRole');
      console.log('Frontend: Logout successful');
    } catch (error) {
      console.error('Frontend: Logout error:', error);
    }
  },
};
