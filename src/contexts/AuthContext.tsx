import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth';
import { toast } from 'sonner';
import { 
  AUTH_TOKEN_KEY, 
  REFRESH_TOKEN_KEY, 
  USER_STORAGE_KEY, 
  clearSession, 
  validateToken, 
  handleApiError, 
  AuthError
} from '../lib/tokenUtils';
import { logger } from '../lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import { api } from '@/lib/api';

// Interfaces
interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  label?: string;
}

interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  addresses: Address[];
}

interface LoadingStates {
  login: boolean;
  signup: boolean;
  profileUpdate: boolean;
  addressOperations: boolean;
  forgotPassword: boolean;
  resetPassword: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loadingStates: LoadingStates;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const DEFAULT_LOADING_STATES: LoadingStates = {
  login: false,
  signup: false,
  profileUpdate: false,
  addressOperations: false,
  forgotPassword: false,
  resetPassword: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(DEFAULT_LOADING_STATES);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleError = (error: unknown, defaultMessage: string): string => {
    const message = handleApiError(error, defaultMessage);
    setError(message);
    logger.error(defaultMessage, { error });
    return message;
  };

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (!token || !storedUser) {
          throw new Error('No stored session');
        }

        const isValid = await validateToken(token);
        if (!isValid) {
          throw new Error('Invalid token');
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        logger.warn('Session restoration failed:', { error });
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoadingStates(prev => ({ ...prev, login: true }));
    
    try {
      // Clear any existing session first
      await logout();
      
      const response = await authService.login({ email, password });
      
      if (!response.success || !response.token || !response.user) {
        throw new AuthError(
          response.message || 'Invalid response from server',
          'INVALID_RESPONSE'
        );
      }
      
      // Set user and auth state
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Update API configuration
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      
      const message = handleError(error, 'Login failed');
      
      if (error instanceof AuthError) {
        switch (error.code) {
          case 'INVALID_CREDENTIALS':
            toast.error('Invalid credentials', {
              description: 'Please check your email and password'
            });
            break;
          case 'ACCOUNT_LOCKED':
            toast.error('Account locked', {
              description: 'Please verify your email or contact support'
            });
            break;
          case 'RATE_LIMIT':
            toast.error('Too many attempts', {
              description: 'Please wait a moment before trying again'
            });
            break;
          default:
            toast.error('Login failed', { description: message });
        }
      } else {
        toast.error('Login failed', { description: message });
      }
      
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, login: false }));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      logger.error('Logout error:', { error });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      clearSession();
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    setLoadingStates(prev => ({ ...prev, profileUpdate: true }));
    setError(null);

    try {
      const response = await authService.updateProfile(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }

      const updatedUser = { ...user!, ...response.data };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = handleError(error, 'Failed to update profile');
      toast.error('Update failed', { description: message });
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, profileUpdate: false }));
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    setLoadingStates(prev => ({ ...prev, addressOperations: true }));
    setError(null);

    try {
      const response = await authService.addAddress(address);
      if (!response.success) {
        throw new Error(response.message || 'Failed to add address');
      }

      const newAddress = { ...address, id: response.data.id };
      const updatedUser = {
        ...user!,
        addresses: [...user!.addresses, newAddress],
      };

      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      toast.success('Address added successfully');
    } catch (error) {
      const message = handleError(error, 'Failed to add address');
      toast.error('Failed to add address', { description: message });
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, addressOperations: false }));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    loadingStates,
    error,
    isAuthenticated,
    login,
    signup: async () => false, // Implement if needed
    logout,
    updateProfile,
    forgotPassword: async () => {}, // Implement if needed
    resetPassword: async () => {}, // Implement if needed
    addAddress,
    updateAddress: async () => {}, // Implement if needed
    deleteAddress: async () => {}, // Implement if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};