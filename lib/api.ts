import axios from 'axios';
import Cookies from 'js-cookie';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

const RAW_BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/+$/, '');
// Support env values with or without a trailing /api segment.
let NEXT_PUBLIC_BACKEND_URL = RAW_BACKEND_URL;
if (RAW_BACKEND_URL.toLowerCase().endsWith('/api')) {
  NEXT_PUBLIC_BACKEND_URL = RAW_BACKEND_URL.replace(/\/api$/i, '');
}
const API_BASE_URL = `${NEXT_PUBLIC_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: `${API_BASE_URL}/`,
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('token') ;
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => {
    try {
      const body: any = response?.data;
      const message = body?.message || body?.error || body?.Message;
      const statusText = body?.status || body?.Status;
      if (
        (typeof message === 'string' && message.toLowerCase().includes('token expired')) ||
        (typeof statusText === 'string' && statusText.toLowerCase() === 'error' && typeof message === 'string' && message.toLowerCase().includes('token expired'))
      ) {
        authService.handleSessionExpired(message);
      }
    } catch {}
    return response;
  },
  (error: any) => {
    try {
      if (authService.isTokenExpiredError(error)) {
        authService.handleSessionExpired(error?.response?.data?.message);
      }
    } catch {}
    try {
      // Handle network/offline errors: no response from server
      const isNetworkError = !error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error');
      const isOffline = typeof window !== 'undefined' && navigator && navigator.onLine === false;
      if ((isNetworkError || isOffline) && typeof window !== 'undefined') {
        const currentPath = window.location?.pathname || '';
        if (currentPath !== '/offline') {
          window.location.href = '/offline';
        }
      } else {
        const message = error?.response?.data?.message || error?.message || 'Request failed';
        // Avoid toasting on cancellations and for our mock HR user who doesn't have a real session
        const currentUser = authService.getCurrentUser();
        const isMockHRUser = currentUser?.username === 'hrsaurabh@gmail.com';

        if (!axios.isCancel(error) && !isMockHRUser) {
          toast.error(message);
        }
      }
    } catch {}
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
