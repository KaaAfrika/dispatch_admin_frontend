import apiClient from '../lib/axios';
import type { ApiResponse, DeliveryCategory, PaginatedResponse } from '../types';

export interface CategoryFilters {
  per_page?: number;
  page?: number;
  is_active?: '0' | '1';
  search?: string;
}

export const categoriesApi = {
  list: async (params?: CategoryFilters) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<DeliveryCategory>>>('/delivery-categories', { params });
    return data;
  },

  create: async (payload: Partial<DeliveryCategory>) => {
    const { data } = await apiClient.post<ApiResponse<DeliveryCategory>>('/delivery-categories', payload);
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<DeliveryCategory>>(`/delivery-categories/${id}`);
    return data;
  },

  update: async (id: number, payload: Partial<DeliveryCategory>) => {
    const { data } = await apiClient.put<ApiResponse<DeliveryCategory>>(`/delivery-categories/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/delivery-categories/${id}`);
    return data;
  },

  toggleStatus: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<DeliveryCategory>>(`/delivery-categories/${id}/toggle-status`);
    return data;
  },
};
