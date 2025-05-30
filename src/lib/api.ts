import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { toast } from 'sonner';
import { logger } from './logger';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_STORAGE_KEY, tokenApi, refreshAuthToken } from './tokenUtils';
import type { User } from '@/types/models';

// Backend User type that matches server response
export interface BackendUser {
  uid: string;            // server uses uid instead of id
  email: string;
  firstName: string;
  lastName: string;
  role: 'user';
  isEmailVerified: boolean;
  createdAt: string;      // server sends dates as ISO strings
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
    currency: string;
  };
  metadata?: Record<string, any>;
}

// Request configuration type with retry and token
interface RequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _originalToken?: string;
  skipAuthRetry?: boolean;
  headers: AxiosRequestHeaders;
}

// Constants
const baseURL = import.meta.env.VITE_API_URL || 'https://shopify-server-ws3z.onrender.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 5000; // 5 seconds

// Create axios instance with default config
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  timeoutErrorMessage: 'Request timed out - the server might be starting up, please try again',
});

// Configure tokenApi similarly
tokenApi.defaults.baseURL = baseURL;
tokenApi.defaults.headers.common['Content-Type'] = 'application/json';
tokenApi.defaults.timeout = 30000;
tokenApi.defaults.timeoutErrorMessage = 'Request timed out - the server might be starting up, please try again';

// Utility to calculate exponential backoff delay
const getRetryDelay = (retryCount: number): number => {
  const delay = Math.min(RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
  return delay + Math.random() * 100; // Add jitter
};

// Utility to get user context
const getUserContext = (): string | undefined => {
  try {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      const user = JSON.parse(userJson) as BackendUser;
      return user.uid;
    }
  } catch {
    return undefined;
  }
};

// Request interceptor for auth
const requestInterceptor = (config: RequestConfigWithRetry) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);  if (token) {
    // Ensure headers exist and are the correct type
    if (!config.headers || !(config.headers instanceof axios.AxiosHeaders)) {
      config.headers = new axios.AxiosHeaders();
    }
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Save token for potential retries
  if (token && !config._originalToken) {
    config._originalToken = token;
  }
  
  return config;
};

api.interceptors.request.use(requestInterceptor, (error) => {
  logger.error('Request interceptor error:', { 
    error, 
    userId: getUserContext(),
    path: error.config?.url 
  });
  return Promise.reject(error);
});

tokenApi.interceptors.request.use(requestInterceptor, (error) => {
  logger.error('Request interceptor error (tokenApi):', { error, userId: getUserContext() });
  return Promise.reject(error);
});

// Response interceptor for auth and retries
const responseInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as RequestConfigWithRetry;
  if (!originalRequest || originalRequest.skipAuthRetry) {
    return Promise.reject(error);
  }

  // Only retry on specific status codes
  if (error.response?.status === 401 && !originalRequest._retry && originalRequest._originalToken) {
    originalRequest._retry = true;
    originalRequest.skipAuthRetry = true; // Prevent infinite retry loop
    
    try {
      // Try to refresh token
      const newToken = await refreshAuthToken(originalRequest._originalToken);
      if (newToken) {
        // Update token in localStorage and headers
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    } catch (refreshError) {
      logger.error('Token refresh failed:', { 
        error: refreshError,
        userId: getUserContext(),
        path: originalRequest.url
      });
    }
  }

  // Handle network errors with retry
  if (
    (!error.response || error.code === 'ECONNABORTED') && 
    originalRequest._retryCount < MAX_RETRIES
  ) {
    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
    const delay = getRetryDelay(originalRequest._retryCount);
    
    logger.info(`Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}) after ${delay}ms`, {
      url: originalRequest.url,
      method: originalRequest.method,
      retryCount: originalRequest._retryCount
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return api(originalRequest);
  }

  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => response,
  responseInterceptor
);
tokenApi.interceptors.response.use((response) => response, responseInterceptor);

export default api;