import axios from '@/lib/axios';
import { AuthResponse, ApiResponse, User } from '@/types';

export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    address?: string;
    locale?: string;
  }): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Refresh token
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string): Promise<ApiResponse> => {
    const response = await axios.post<ApiResponse>('/auth/logout', { refreshToken });
    return response.data;
  },

  // Get current user
  me: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },
};
