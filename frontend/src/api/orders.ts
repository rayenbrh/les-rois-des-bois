import axios from '@/lib/axios';
import { Order, Invoice, ApiResponse, PaginatedResponse } from '@/types';

export const ordersAPI = {
  // Create order
  create: async (data: {
    lines: Array<{
      productId: string;
      variantId?: string;
      componentSelections?: Record<string, string>;
      qty: number;
    }>;
    remise?: number;
  }): Promise<ApiResponse<{ order: Order }>> => {
    const response = await axios.post<ApiResponse<{ order: Order }>>('/orders', data);
    return response.data;
  },

  // Get all orders
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const response = await axios.get<PaginatedResponse<Order>>(`/orders?${searchParams.toString()}`);
    return response.data;
  },

  // Get single order
  getById: async (id: string): Promise<ApiResponse<{ order: Order }>> => {
    const response = await axios.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateStatus: async (id: string, status: string): Promise<ApiResponse<{ order: Order }>> => {
    const response = await axios.put<ApiResponse<{ order: Order }>>(`/orders/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Generate invoice for order
  generateInvoice: async (id: string): Promise<ApiResponse<{ invoice: Invoice }>> => {
    const response = await axios.post<ApiResponse<{ invoice: Invoice }>>(
      `/orders/${id}/generate-invoice`
    );
    return response.data;
  },
};
