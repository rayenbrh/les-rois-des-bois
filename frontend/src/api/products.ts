import axios from '@/lib/axios';
import { Product, ApiResponse, PaginatedResponse } from '@/types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isSpecial?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export const productsAPI = {
  // Get all products with filters
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    return response.data;
  },

  // Get single product
  getById: async (id: string): Promise<ApiResponse<{ product: Product }>> => {
    const response = await axios.get<ApiResponse<{ product: Product }>>(`/products/${id}`);
    return response.data;
  },

  // Create product (Admin only)
  create: async (data: Partial<Product>): Promise<ApiResponse<{ product: Product }>> => {
    const response = await axios.post<ApiResponse<{ product: Product }>>('/products', data);
    return response.data;
  },

  // Update product (Admin only)
  update: async (id: string, data: Partial<Product>): Promise<ApiResponse<{ product: Product }>> => {
    const response = await axios.put<ApiResponse<{ product: Product }>>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product (Admin only)
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await axios.delete<ApiResponse>(`/products/${id}`);
    return response.data;
  },

  // Generate composite image for special product
  generateComposite: async (
    id: string,
    componentSelections: Record<string, string>
  ): Promise<ApiResponse<{ imagePath: string }>> => {
    const response = await axios.post<ApiResponse<{ imagePath: string }>>(
      `/products/${id}/generate-composite`,
      { componentSelections }
    );
    return response.data;
  },
};
