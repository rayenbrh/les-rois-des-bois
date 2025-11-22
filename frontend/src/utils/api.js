import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
  console.log('Making request to:', config.url); // ADD THIS LINE FOR DEBUGGING
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status); // ADD THIS LINE
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data); // ADD THIS LINE
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;