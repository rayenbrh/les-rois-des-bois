import axios from '@/lib/axios';
import { Invoice, ApiResponse, PaginatedResponse } from '@/types';

export const invoicesAPI = {
  // Get all invoices
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isPaid?: boolean;
  }): Promise<PaginatedResponse<Invoice>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const response = await axios.get<PaginatedResponse<Invoice>>(
      `/invoices?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get single invoice
  getById: async (id: string): Promise<ApiResponse<{ invoice: Invoice }>> => {
    const response = await axios.get<ApiResponse<{ invoice: Invoice }>>(`/invoices/${id}`);
    return response.data;
  },

  // Record payment
  recordPayment: async (
    id: string,
    amount: number,
    note?: string
  ): Promise<ApiResponse<{ invoice: Invoice }>> => {
    const response = await axios.post<ApiResponse<{ invoice: Invoice }>>(
      `/invoices/${id}/payments`,
      { amount, note }
    );
    return response.data;
  },

  // Download PDF
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await axios.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
