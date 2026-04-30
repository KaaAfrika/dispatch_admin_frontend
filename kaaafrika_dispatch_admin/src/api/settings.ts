import apiClient from '../lib/axios';
import type { ApiResponse, PricingSetting } from '../types';

export const settingsApi = {
  getPricingGroup: async () => {
    const { data } = await apiClient.get<ApiResponse<PricingSetting[]>>('/settings/group/pricing');
    return data;
  },

  updateSetting: async (key: string, value: string) => {
    const { data } = await apiClient.put<ApiResponse<null>>(`/settings/${key}`, { value });
    return data;
  },

  create: async (payload: { key: string; value: string; type: string }) => {
    const { data } = await apiClient.post<ApiResponse<string>>('/settings', payload);
    return data;
  },
};
