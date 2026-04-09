import apiClient from '../lib/axios';
import type { ApiResponse, DashboardSummary } from '../types';

export const dashboardApi = {
  getSummary: async (period = 'today') => {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard', {
      params: { period },
    });
    return data;
  },
};
