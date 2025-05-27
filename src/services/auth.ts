import { api } from '../lib/api';
import { AxiosError } from 'axios';
import { createVerificationEmailTemplate } from './emailTemplates';
import { TokenExpiredError } from '../lib/tokenUtils';

// Base API path configuration
const API_PREFIX = '/api';  // All endpoints will be under /api
const AUTH_PATH = `${API_PREFIX}/auth`;  // Auth endpoints will be under /api/auth

// Types and Interfaces
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  addresses?: AddressData[]; 
}

export interface TokenResponse {
  accessToken: string;
  token: string;
  refreshToken?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  storeTokenInCookie?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AddressData {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  label?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
}

// Utility Functions
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    
    if (response.status === 401) {
      throw new AuthenticationError('Authentication required');
    }
    
    if (contentType?.includes('text/html')) {
      throw new Error('Server error: Unable to connect to the service');
    }
    
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = 'Server error: Please try again later';
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

const withAuth = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      // Try to refresh the token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new AuthenticationError('No refresh token available');
        await authService.refreshToken(refreshToken);
        // Retry the original request
        return await fn();
      } catch (refreshError) {
        throw new AuthenticationError('Session expired. Please log in again.');
      }
    }
    throw error;
  }
};

const handleAuthError = (error: unknown): never => {
  // Clean up any partial auth state on critical errors
  const cleanupAuth = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (e) {
      console.error('Failed to clean up auth state:', e);
    }
  };

  if (error instanceof AxiosError) {
    // Network or connection errors
    if (!error.response) {
      cleanupAuth();
      throw new AuthenticationError('Unable to connect to the authentication service. Please check your internet connection.');
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        throw new AuthenticationError(error.response.data?.message || 'Invalid request. Please check your input.');
      case 401:
        cleanupAuth();
        throw new AuthenticationError('Invalid email or password');
      case 403:
        cleanupAuth();
        throw new AuthenticationError('Access denied. Please log in again.');
      case 404:
        throw new AuthenticationError('The authentication service is not available.');
      case 409:
        const conflictMessage = error.response.data?.message || 'This email is already registered.';
        throw new AuthenticationError(conflictMessage);
      case 429:
        throw new AuthenticationError('Too many attempts. Please try again later.');
      case 500:
        throw new AuthenticationError('Server error. Please try again later.');
      default:
        throw new AuthenticationError(error.response.data?.message || error.message || 'An unexpected error occurred');
    }
  }

  if (error instanceof Error) {
    throw new AuthenticationError(error.message);
  }

  throw new AuthenticationError('An unexpected error occurred during authentication');
};

// Error Classes
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Auth Service Implementation
export const authService = {
  // Helper function to get auth headers
  getAuthHeaders(token?: string) {
    const authToken = token || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    };
  },

  async resendVerification(email: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const headers = this.getAuthHeaders(token);

      const response = await api.post('/auth/resend-verification', 
        { email },
        { headers }
      );

      // Store timestamp of last verification email sent
      localStorage.setItem('lastVerificationSent', Date.now().toString());
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait before trying again.');
        }
        if (error.response?.status === 401) {
          throw new Error('Invalid or expired token');
        }
        throw new Error(error.response?.data?.error?.message || 'Failed to resend verification email');
      }
      throw error;
    }
  },

  canResendVerification(): boolean {
    const lastSent = localStorage.getItem('lastVerificationSent');
    if (!lastSent) {
      return true;
    }

    const now = Date.now();
    const lastSentTime = parseInt(lastSent, 10);
    const FIVE_MINUTES = 5 * 60 * 1000;

    return now - lastSentTime >= FIVE_MINUTES;
  },
  async register(data: RegisterData): Promise<TokenResponse> {
    // Add password validation before making the API call
    if (!data.password) {
      throw new Error('Password is required.');
    }
    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!/[a-z]/.test(data.password)) {
      throw new Error('Password must contain at least one lowercase letter.');
    }
    if (!/[A-Z]/.test(data.password)) {
      throw new Error('Password must contain at least one uppercase letter.');
    }
    if (!/[0-9]/.test(data.password)) {
      throw new Error('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
      throw new Error('Password must contain at least one special character.');
    }

    try {
      const response = await api.post(`${AUTH_PATH}/register`, data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },  async login(data: LoginRequest): Promise<TokenResponse> {
    try {
      const response = await api.post(`${AUTH_PATH}/login`, {
        email: data.email,
        password: data.password
      });

      const { token, refreshToken, user } = response.data;

      if (!token || typeof token !== 'string') {
        throw new Error('Invalid login response: Token missing or invalid');
      }

      if (!user || typeof user !== 'object') {
        throw new Error('Invalid login response: User data missing or invalid');
      }

      // Store tokens
      localStorage.setItem('token', token);
      if (refreshToken && typeof refreshToken === 'string') {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Ensure user object has required fields
      const authenticatedUser: User = {
        ...user,
        addresses: user.addresses || []
      };

      return { accessToken: token, token, refreshToken, user: authenticatedUser };
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async refreshToken(refreshToken?: string) {
    try {
      const tokenToUse = refreshToken || localStorage.getItem('refreshToken');
      if (!tokenToUse) {
        throw new AuthenticationError('No refresh token available');
      }

      const response = await api.post(`${AUTH_PATH}/refresh`, { refreshToken: tokenToUse });
      const result = response.data;

      if (!result?.token) {
        throw new AuthenticationError('Token refresh failed');
      }

      localStorage.setItem('token', result.token);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }

      return result;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  async validate() {
    try {
      const response = await api.get(`${AUTH_PATH}/validate`);
      return response.data;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // Try to refresh the token if it's expired
        try {
          await this.refreshToken();
          const response = await api.get(`${AUTH_PATH}/validate`);
          return response.data;
        } catch (refreshError) {
          throw new AuthenticationError('Session expired. Please log in again.');
        }
      }
      throw error;
    }
  },

  async logout() {
    try {
      await api.post(`${AUTH_PATH}/logout`);
    } finally {
      // Clear all auth state
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  async forgotPassword(email: string) {
    const response = await api.post(`${AUTH_PATH}/forgot-password`, { email });
    return response.data;
  },

  async resetPassword(data: ResetPasswordData) {
    const response = await api.post(`${AUTH_PATH}/reset-password`, data);
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.post(`${AUTH_PATH}/verify-email`, { token });
    return response.data;
  },

  // Profile Management
  async updateProfile(data: UpdateProfileData): Promise<void> {
    return withAuth(async () => {
      await api.patch(`${API_PREFIX}/user/profile`, data);
    });
  },

  // Address Management
  async addAddress(address: AddressData): Promise<{ id: string }> {
    return withAuth(async () => {
      const response = await api.post(`${API_PREFIX}/user/addresses`, address);
      return response.data;
    });
  },  async updateAddress(id: string, address: Partial<AddressData>): Promise<void> {
    return withAuth(async () => {
      await api.patch(`${API_PREFIX}/user/addresses/${id}`, address);
    });
  },

  async deleteAddress(id: string): Promise<void> {
    return withAuth(async () => {
      await api.delete(`${API_PREFIX}/user/addresses/${id}`);
    });
  },
};

// Convenience exports for commonly used methods
export const { resendVerification, canResendVerification } = authService;

export function getAuthHeaders(): HeadersInit {
  // Example implementation, adjust as needed
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  try {    const response = await api.post('/login', credentials);
    const { data } = response;

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }

    const { token, user } = data;
    
    if (!token || typeof token !== 'string') {
      throw new Error('Server error: Authentication response missing token');
    }

    if (!user || typeof user !== 'object') {
      throw new Error('Server error: Authentication response missing user data');
    }

    // Validate the token format
    if (!/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token)) {
      throw new Error('Invalid token format received from server');
    }

    // Store the token
    localStorage.setItem('token', token);
    localStorage.setItem('lastLogin', Date.now().toString());

    return { token, user };
  } catch (error) {
    throw handleAuthError(error);
  }
};
export { TokenExpiredError };

