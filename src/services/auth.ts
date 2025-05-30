import { api } from '../lib/api';
import { AxiosError } from 'axios';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_STORAGE_KEY, clearSession, setAuthToken } from '../lib/tokenUtils';

// Base API path configuration
const API_PREFIX = '/api/auth';

// Types and Interfaces
export interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  addresses: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    label?: string;
  }>;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
  data?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Auth Service Methods
export async function login(data: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await api.post(`${API_PREFIX}/login`, data);
    const authResponse = response.data;
    
    // Validate response structure
    if (!authResponse || typeof authResponse !== 'object') {
      throw new AuthError('Invalid response format from server', 'INVALID_RESPONSE');
    }

    // Always ensure we have a success flag
    authResponse.success = Boolean(authResponse.success);
    
    if (authResponse.success) {
      // Don't clear session here - let AuthContext handle that
      if (!authResponse.token) {
        throw new AuthError('No auth token in response', 'NO_TOKEN');
      }
      
      if (!authResponse.user) {
        throw new AuthError('No user data in response', 'NO_USER_DATA');
      }

      // Update API headers synchronously
      api.defaults.headers.common['Authorization'] = `Bearer ${authResponse.token}`;
      
      // Store tokens and user data
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      if (authResponse.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authResponse.user));
    }
    
    return authResponse;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      switch (status) {
        case 401:
          throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
        case 403:
          throw new AuthError('Account locked or email not verified', 'ACCOUNT_LOCKED');
        case 429:
          throw new AuthError('Too many login attempts', 'RATE_LIMIT');
        case 500:
          throw new AuthError('Server error', 'SERVER_ERROR');
        default:
          throw new AuthError(message || 'Network error', 'NETWORK_ERROR');
      }
    }
    
    throw new AuthError('An unexpected error occurred', 'UNKNOWN_ERROR');
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post(`${API_PREFIX}/logout`);
  } finally {
    clearSession();
  }
}

export async function updateProfile(data: Partial<User>): Promise<AuthResponse> {
  try {
    const response = await api.patch(`${API_PREFIX}/profile`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      clearSession();
      throw new AuthError('Session expired', 'SESSION_EXPIRED');
    }
    throw error;
  }
}

export async function addAddress(address: Omit<User['addresses'][0], 'id'>): Promise<AuthResponse> {
  const response = await api.post(`${API_PREFIX}/addresses`, address);
  return response.data;
}

