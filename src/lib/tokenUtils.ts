import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { logger } from './logger';
import { jwtDecode } from 'jwt-decode';

// Constants
const baseURL = import.meta.env.VITE_API_URL || 'https://shopify-server-ws3z.onrender.com';
const refreshTokenEndpoint = import.meta.env.VITE_REFRESH_TOKEN_ENDPOINT || '/api/auth/refresh-token';
const TOKEN_VALIDATION_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 5000; // 5 seconds

// Error types
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class TokenExpiredError extends Error {
  constructor() {
    super('Session expired. Please log in again.');
    this.name = 'TokenExpiredError';
  }
}

// Storage keys
export const AUTH_TOKEN_KEY = 'sneaker-store-token';
export const REFRESH_TOKEN_KEY = 'sneaker-store-refresh-token';
export const USER_STORAGE_KEY = 'sneaker-store-user';

// Axios instance
export const tokenApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  timeoutErrorMessage: 'Request timed out - the server might be starting up, please try again',
});

// Interfaces
interface TokenResponse {
  token: string;
  refreshToken?: string;
}

interface ValidateTokenResponse {
  valid: boolean;
  message?: string;
}

interface RefreshTokenResponse extends TokenResponse {
  success: boolean;
  message?: string;
}

// Token validation cache
const tokenValidationCache = new Map<string, { timestamp: number; isValid: boolean }>();

// Retry utility
const getRetryDelay = (retryCount: number): number => {
  const delay = Math.min(RETRY_DELAY * 2 ** retryCount, MAX_RETRY_DELAY);
  return delay + Math.random() * 100; // Add jitter
};

const retry = async <T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      await new Promise(res => setTimeout(res, getRetryDelay(attempt)));
    }
  }
  throw new Error('Max retry attempts exceeded');
};

// Session & Token Storage
export const setSession = (token: string, refreshToken?: string, user?: any) => {
  setAuthToken(token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  logger.info('Session set', { userId: user?.uid });
};

export const clearSession = (reason?: string) => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  logger.info(reason ? `Session cleared: ${reason}` : 'Session cleared');
};

export const handleSessionExpired = () => {
  clearSession('Session expired');
  toast.error('Session expired', { description: 'Please log in again' });
  window.dispatchEvent(new CustomEvent('sessionExpired'));
};

// Token validation cache
export const isTokenValidationCached = (token: string): boolean | null => {
  const cached = tokenValidationCache.get(token);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > TOKEN_VALIDATION_TTL) {
    tokenValidationCache.delete(token);
    return null;
  }

  return cached.isValid;
};

export const cacheTokenValidation = (token: string, isValid: boolean): void => {
  tokenValidationCache.set(token, {
    timestamp: Date.now(),
    isValid,
  });
};

export const clearTokenValidation = (token: string): void => {
  tokenValidationCache.delete(token);
};

// Optional: Check if token is expired via JWT `exp` claim

interface DecodedToken {
  exp: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};


// Token validation
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const cached = isTokenValidationCached(token);
    if (cached !== null) return cached;

    const response = await tokenApi.post<ValidateTokenResponse>('/api/auth/validate-token', { token });
    const isValid = response.data.valid;

    cacheTokenValidation(token, isValid);
    return isValid;
  } catch (error) {
    logger.error('Token validation failed:', { error });
    return false;
  }
};

// Token refresh with retry
export const refreshAuthToken = async (oldToken: string): Promise<string | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    logger.warn('No refresh token found');
    return null;
  }

  try {
    const response = await retry(() =>
      tokenApi.post<RefreshTokenResponse>(refreshTokenEndpoint, {
        token: oldToken,
        refreshToken,
      })
    );

    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      }
      return response.data.token;
    }

    throw new AuthError('Failed to refresh token', 'REFRESH_FAILED');
  } catch (error) {
    logger.error('Token refresh failed:', error);
    return null;
  }
};

// Error handling
export const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AuthError) {
    logger.error('Auth error:', { code: error.code, message: error.message });
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    logger.error('API error:', {
      status,
      message,
      data: error.response?.data,
    });

    if (status === 401 && !error.config?.url?.includes('/login')) {
      handleSessionExpired();
    }

    return message || defaultMessage;
  }

  if (error instanceof Error) {
    logger.error('Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return error.message;
  }

  logger.error('Unknown error:', { error, type: typeof error, defaultMessage });
  return defaultMessage;
};

export function isAuthenticated() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;

  const isExpired = isTokenExpired(token);
  if (isExpired) {
    logger.info('Token is expired');
    return false;
  }

  return true;
}

// Token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};
