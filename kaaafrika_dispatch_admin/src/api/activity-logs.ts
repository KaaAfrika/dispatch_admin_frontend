import apiClient from '../lib/axios';
import type { ApiResponse, ActivityLog, PaginatedResponse, ActivityLogFilters } from '../types';

export const activityLogsApi = {
  list: async (params?: ActivityLogFilters) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ActivityLog>>>('/activity-logs', { params });
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<ActivityLog>>(`/activity-logs/${id}`);
    return data;
  },
};
