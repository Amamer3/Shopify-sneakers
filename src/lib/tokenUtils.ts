import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://shopify-server-ws3z.onrender.com';
const AUTH_TOKEN_KEY = 'auth_token';

// Create a separate axios instance for token validation to avoid circular dependencies
const tokenApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class TokenExpiredError extends Error {
  constructor() {
    super('Session expired. Please log in again.');
    this.name = 'TokenExpiredError';
  }
}

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

// Cache token validation results for 5 minutes
const tokenValidationCache = new Map<string, { timestamp: number; isValid: boolean }>();
const TOKEN_VALIDATION_TTL = 5 * 60 * 1000; // 5 minutes

export const isTokenValidationCached = (token: string): boolean | null => {
  const cached = tokenValidationCache.get(token);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > TOKEN_VALIDATION_TTL) {
    tokenValidationCache.delete(token);
    return null;
  }
  
  return cached.isValid;
};

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await tokenApi.post('/auth/validate-token', { token });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const cacheTokenValidation = (token: string, isValid: boolean): void => {
  tokenValidationCache.set(token, {
    timestamp: Date.now(),
    isValid
  });
};

export const clearTokenValidation = (token: string): void => {
  tokenValidationCache.delete(token);
};