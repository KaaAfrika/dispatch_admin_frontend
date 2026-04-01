import apiClient from '../lib/axios';

export const walletApi = {
  getTransactions: async (page = 1) => {
    const { data } = await apiClient.get('/transactions', {
      params: { page }
    });
    return data;
  }
};
