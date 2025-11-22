import axios from '@/lib/axios';
import { ApiResponse, SalesAnalytics } from '@/types';

export const analyticsAPI = {
  // Get sales analytics
  getSalesAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    commercialId?: string;
  }): Promise<ApiResponse<SalesAnalytics>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    const response = await axios.get<ApiResponse<SalesAnalytics>>(
      `/analytics/sales?${searchParams.toString()}`
    );
    return response.data;
  },
};
