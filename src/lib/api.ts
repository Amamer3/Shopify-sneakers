import axios, { AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { toast } from 'sonner';
import { logger } from './logger';
import { 
  validateToken, 
  TokenExpiredError, 
  isTokenValidationCached,
  cacheTokenValidation,
  clearTokenValidation 
} from './tokenUtils';

// In development, we use relative URLs that will be handled by the dev server proxy
// In production, we use the full URL from the environment variable
// In development, we'll use the proxy through the dev server
const baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'https://shopify-server-ws3z.onrender.com');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Utility to wait between retries
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and validate
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Add the authorization header to all requests if a token exists
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  
  logger.debug('API Request', { 
    url: config.url, 
    method: config.method 
  });
  return config;
});

// Response interceptor to handle errors and retries
api.interceptors.response.use(
  (response) => {
    logger.debug('API Response', { 
      url: response.config.url, 
      status: response.status 
    });
    return response;
  },
  async (error) => {
    // Ensure error is AxiosError
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const config = error.config;
    if (!config) return Promise.reject(error);
    
    // Add retry count to config if it doesn't exist
    const retryCount = (config as { retryCount?: number }).retryCount || 0;
    
    // Log the error with context
    logger.error('API Request Failed', {
      url: config.url,
      method: config.method,
      status: error.response?.status,
      retryCount: retryCount,
      errorMessage: error.message,
      errorResponse: error.response?.data
    });

    // Only retry on network errors or 5xx errors, and if not a 401 error (handled separately)
    const shouldRetry = (
      !error.response ||
      (error.response.status >= 500 && error.response.status <= 599)
    ) && retryCount < MAX_RETRIES && error.response?.status !== 401;

    if (shouldRetry) {
      (config as any).retryCount = retryCount + 1;
      
      logger.info('Retrying request', {
        url: config.url,
        method: config.method,
        retryCount: (config as any).retryCount,
      });
      
      // Wait before retrying
      await wait(RETRY_DELAY * Math.pow(2, retryCount));
      return api(config);
    }
    
    // Handle specific error cases
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - attempt to refresh token
          try {
            const authService = (await import('./../services/auth')).authService;
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token available');
            await authService.refreshToken(refreshToken);
            // Retry the original request with the new token
            const newToken = localStorage.getItem('token');
            if (config.headers) {
              config.headers.set('Authorization', `Bearer ${newToken}`);
            }
            // Ensure retryCount is reset for the retried request after token refresh
            (config as any).retryCount = 0; // Reset retry count for the new attempt
            return api(config);
          } catch (refreshError) {
            // If refresh fails, clear token and redirect to login
            localStorage.removeItem('token');
            // clearTokenValidation(token); // This function is no longer needed here
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        case 403:          // Forbidden
          toast.error('Access Denied', {
            description: 'You do not have permission to perform this action.'
          });
          break;
        case 404:
          // Not Found
          toast.error('Not Found', {
            description: 'The requested resource was not found.'
          });
          break;
        case 422:
          // Validation Error
          toast.error('Validation Error', {
            description: error.response.data.message || 'Please check your input.'
          });
          break;
        case 500:
          // Server Error
          toast.error('Server Error', {
            description: 'An unexpected error occurred. Please try again later.'
          });
          break;
        default:
          toast.error('Error', {
            description: error.response.data.message || 'An error occurred.'
          });
      }
    } else if (error.request) {
      // Network Error
      toast.error('Network Error', {
        description: 'Please check your internet connection.'
      });
    }
    return Promise.reject(error);
  }
);
