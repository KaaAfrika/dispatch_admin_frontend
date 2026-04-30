import apiClient from '../lib/axios';
import type {
  ApiResponse,
  Delivery,
  DeliveryDetail,
  DeliveryFilters,
  DeliveryOtp,
  DeliveryStats,
  PayoutStatus,
  PaginatedResponse,
  DeliveryIssue,
} from '../types';

export const deliveriesApi = {
  list: async (filters: DeliveryFilters = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Delivery>>>(
      '/deliveries',
      { params: filters }
    );
    return data;
  },

  getOne: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<DeliveryDetail>>(`/deliveries/${id}`);
    return data;
  },

  getStats: async (period = 'week', dateFrom?: string, dateTo?: string) => {
    const { data } = await apiClient.get<ApiResponse<DeliveryStats>>('/deliveries/statistics', {
      params: { period, ...(dateFrom && { date_from: dateFrom }), ...(dateTo && { date_to: dateTo }) },
    });
    return data;
  },

  getOtp: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<DeliveryOtp>>(`/deliveries/${id}/otp`);
    return data;
  },

  confirm: async (id: number) => {
    const { data } = await apiClient.post(`/deliveries/${id}/confirm`);
    return data;
  },

  cancel: async (id: number, reason: string) => {
    const { data } = await apiClient.post(`/deliveries/${id}/cancel`, { reason });
    return data;
  },

  reassign: async (id: number, dispatcherId: number) => {
    const { data } = await apiClient.post(`/deliveries/${id}/reassign`, {
      dispatcher_id: dispatcherId,
    });
    return data;
  },

  updatePayoutStatus: async (id: number, payoutStatus: PayoutStatus) => {
    const { data } = await apiClient.patch(`/deliveries/${id}/payment`, {
      payout_status: payoutStatus,
    });
    return data;
  },

  overrideFare: async (
    id: number,
    payload: {
      base_fare?: number;
      total_amount?: number;
      payout_amount?: number;
      reason: string;
    }
  ) => {
    const { data } = await apiClient.patch<ApiResponse<DeliveryDetail>>(`/deliveries/${id}/fare`, payload);
    return data;
  },

  forceComplete: async (id: number, reason: string) => {
    const { data } = await apiClient.post<ApiResponse<DeliveryDetail>>(`/deliveries/${id}/force-complete`, { reason });
    return data;
  },

  refund: async (id: number, amount?: number, reason?: string) => {
    const { data } = await apiClient.post<
      ApiResponse<{
        delivery: Partial<Delivery>;
        refund_amount: number;
        wallet_transaction_id: number;
        new_wallet_balance: string;
      }>
    >(`/deliveries/${id}/refund`, { amount, reason });
    return data;
  },

  getIssues: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<DeliveryIssue[]>>(`/deliveries/${id}/issues`);
    return data;
  },

  resolveIssue: async (id: number, issueId: number, resolutionNotes: string) => {
    const { data } = await apiClient.post<ApiResponse<DeliveryIssue>>(
      `/deliveries/${id}/issues/${issueId}/resolve`,
      { resolution_notes: resolutionNotes }
    );
    return data;
  },
};
