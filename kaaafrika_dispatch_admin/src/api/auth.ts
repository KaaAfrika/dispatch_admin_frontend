import apiClient from '../lib/axios';
import type { Admin, ApiResponse } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginData {
  admin: Admin;
  token: string;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<ApiResponse<LoginData>>('/login', payload);
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post<ApiResponse<null>>('/logout');
    return data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get<ApiResponse<Admin>>('/profile');
    return data;
  },

  updateProfile: async (payload: Partial<Pick<Admin, 'name' | 'email' | 'phone'>>) => {
    const { data } = await apiClient.put<ApiResponse<Admin>>('/profile', payload);
    return data;
  },
};
