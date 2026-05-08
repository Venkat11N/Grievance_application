import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/my');
    return response.data;
  },

  registerPushToken: async (token: string) => {
    const response = await api.post('/auth/push-token', { token });
    return response.data;
  },
};
