import axios from 'axios';
import { store } from '@/redux/store';
import { logout, setTokens } from '@/redux/slices/authSlice';
import { getUserMessage, logClientError } from '@/utils/errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let refreshPromise = null;

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      .then(({ data: res }) => {
        const token = res?.data?.token;
        const nextRefresh = res?.data?.refreshToken;
        if (!token || !nextRefresh) {
          throw new Error('Invalid refresh response');
        }
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', nextRefresh);
        store.dispatch(setTokens({ token, refreshToken: nextRefresh }));
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data || {};
    const original = error.config || {};

    error.requestId =
      data.requestId ||
      error.response?.headers?.['x-request-id'] ||
      error.response?.headers?.['X-Request-Id'];
    error.errorCode = data.code || data.error?.code;

    if (status === 401 && !original._retry && !String(original.url || '').includes('/auth/refresh')) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        store.dispatch(logout());
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    } else if (status === 401) {
      error.errorCode = error.errorCode || 'SESSION_EXPIRED';
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      store.dispatch(logout());
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    error.errorMessage = getUserMessage(error);
    logClientError(error, 'be-api');
    return Promise.reject(error);
  }
);

export default api;
