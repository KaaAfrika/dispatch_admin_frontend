import apiClient from '../lib/axios';
import type { ApiResponse } from '../types';

export interface SendNotificationPayload {
  user_id: number;
  title: string;
  body: string;
}

export interface BroadcastNotificationPayload {
  title: string;
  message: string;
  type: 'general' | 'promotion' | 'update';
  user_type: 'all' | 'riders' | 'drivers' | 'dispatchers';
}

export const notificationsApi = {
  sendToUser: async (payload: SendNotificationPayload) => {
    const { data } = await apiClient.post<ApiResponse<null>>('/notifications/send-to-user', payload);
    return data;
  },

  sendToAll: async (payload: BroadcastNotificationPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ sent_count: number }>>('/notifications/send-to-all-users', payload);
    return data;
  },
};
