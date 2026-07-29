import axios from 'axios';
import { store } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 & normalize error.errorMessage with fallback priority:
// error.response.data.message -> error.message -> "Something went wrong"
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      store.dispatch(logout());

      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    const backendMessage = error.response?.data?.message;
    error.errorMessage = backendMessage || error.message || 'Something went wrong';
    return Promise.reject(error);
  }
);

export default api;
