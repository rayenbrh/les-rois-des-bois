import axios from '@/lib/axios';
import { User, ApiResponse, PaginatedResponse } from '@/types';

export const usersAPI = {
  // Get all users
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const response = await axios.get<PaginatedResponse<User>>(`/users?${searchParams.toString()}`);
    return response.data;
  },

  // Get single user
  getById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data;
  },

  // Create user (Admin only)
  create: async (data: Partial<User> & { password: string }): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.post<ApiResponse<{ user: User }>>('/users', data);
    return response.data;
  },

  // Update user (Admin only)
  update: async (id: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.put<ApiResponse<{ user: User }>>(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (Admin only)
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await axios.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  },

  // Assign commercial to client
  assignCommercial: async (
    clientId: string,
    commercialId: string
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.post<ApiResponse<{ user: User }>>(
      `/users/${clientId}/assign-commercial`,
      { commercialId }
    );
    return response.data;
  },
};
