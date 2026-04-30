import apiClient from '../lib/axios';
import type { ApiResponse, DeliveryVehicle, PaginatedResponse } from '../types';

export interface VehicleFilters {
  per_page?: number;
  page?: number;
  is_active?: '0' | '1';
  search?: string;
}

export const vehiclesApi = {
  list: async (params?: VehicleFilters) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<DeliveryVehicle>>>('/delivery-vehicles', { params });
    return data;
  },

  create: async (payload: Partial<DeliveryVehicle>) => {
    const { data } = await apiClient.post<ApiResponse<DeliveryVehicle>>('/delivery-vehicles', payload);
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<DeliveryVehicle>>(`/delivery-vehicles/${id}`);
    return data;
  },

  update: async (id: number, payload: Partial<DeliveryVehicle>) => {
    const { data } = await apiClient.put<ApiResponse<DeliveryVehicle>>(`/delivery-vehicles/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/delivery-vehicles/${id}`);
    return data;
  },

  toggleStatus: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<DeliveryVehicle>>(`/delivery-vehicles/${id}/toggle-status`);
    return data;
  },
};
