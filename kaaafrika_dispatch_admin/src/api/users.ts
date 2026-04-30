import apiClient from '../lib/axios';
import type { ApiResponse, User } from '../types';

export const usersApi = {
  suspend: async (id: number, reason: string) => {
    const { data } = await apiClient.post<ApiResponse<User>>(`/users/${id}/suspend`, { reason });
    return data;
  },

  unsuspend: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<User>>(`/users/${id}/unsuspend`);
    return data;
  },

  resetPassword: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<{ user_id: number; notified_via_sms: boolean }>>(`/users/${id}/reset-password`);
    return data;
  },
};
