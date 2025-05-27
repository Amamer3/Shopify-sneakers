import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthenticationError, User as AuthUser } from '../services/auth';
import { toast } from 'sonner';

// Address type definition
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// User type definition
export type User = AuthUser & {
  addresses: Address[];
};

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loadingStates: {
    login: boolean;
    signup: boolean;
    profileUpdate: boolean;
    addressOperations: boolean;
  };
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  canResendVerification: () => boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  loadingStates: {
    login: false,
    signup: false,
    profileUpdate: false,
    addressOperations: false,
  },
  error: null,
  login: async () => {},
  signup: async () => {},
  updateProfile: async () => {},
  logout: () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  verifyEmail: async () => {},
  isAuthenticated: false,
  addAddress: async () => {},
  updateAddress: async () => {},
  deleteAddress: async () => {},
  resendVerification: async () => {},
  canResendVerification: () => false,
});

// Storage keys
const USER_STORAGE_KEY = 'sneaker-store-user';
const TOKEN_STORAGE_KEY = 'sneaker-store-token';
const REFRESH_TOKEN_KEY = 'sneaker-store-refresh-token';

// Verification cooldown
const VERIFICATION_COOLDOWN = 60000; // 1 minute

// Error handling utility
const handleApiError = (error: any, defaultMessage: string): string => {
  if (error instanceof AuthenticationError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message.includes('Network')
      ? 'Network error. Please check your connection.'
      : error.message;
  }
  return defaultMessage;
};

// Address validation utility
const validateAddress = (address: Omit<Address, 'id'>): string | null => {
  if (!address.street.trim()) return 'Street address is required';
  if (!address.city.trim()) return 'City is required';
  if (!address.state.trim()) return 'State is required';
  if (!address.zipCode.trim()) return 'Zip code is required';
  if (!address.country.trim()) return 'Country is required';
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    login: false,
    signup: false,
    profileUpdate: false,
    addressOperations: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastVerificationSent, setLastVerificationSent] = useState<number | null>(null);
  const navigate = useNavigate();

  // Load and validate user session
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!token || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userInfo = await authService.validate();
        if (userInfo && userInfo.email) {
          setUser({
            id: userInfo.id,
            email: userInfo.email,
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || '',
            isAdmin: userInfo.isAdmin || false,
            addresses: userInfo.addresses || [],
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.warn('Session validation failed:', error);
        try {
          const newTokens = await authService.refreshToken(refreshToken);
          localStorage.setItem(TOKEN_STORAGE_KEY, String(newTokens.accessToken));
          localStorage.setItem(REFRESH_TOKEN_KEY, newTokens.refreshToken);
          const userInfo = await authService.validate();
          setUser({
            id: userInfo.id,
            email: userInfo.email,
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || '',
            isAdmin: userInfo.isAdmin || false,
            addresses: userInfo.addresses || [],
          });
          setIsAuthenticated(true);
        } catch (refreshError) {
          console.warn('Token refresh failed:', refreshError);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
          setIsAuthenticated(false);
          toast.error('Session expired');
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [navigate]);

  // Handle authentication required events globally
  useEffect(() => {
    const handleAuthRequired = async () => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;

      await logout();
      toast.error('Session expired. Please log in again.');

      navigate('/login', {
        replace: true,
        state: {
          from: currentPath + currentSearch,
          isExpired: true,
        },
      });
    };

    window.addEventListener('auth:required', handleAuthRequired);
    return () => window.removeEventListener('auth:required', handleAuthRequired);
  }, [navigate]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setLoadingStates(prev => ({ ...prev, login: true }));
    setError(null);
    try {
      const { token, refreshToken, user } = await authService.login({ email, password });

      if (!token || !refreshToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setUser({
        ...user,
        addresses: (user.addresses || []).map(addr => ({
          id: (addr as any).id ?? '', // fallback if id is missing
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          country: addr.country,
          isDefault: addr.isDefault ?? false,
        })),
      });
      setIsAuthenticated(true);
      toast.success('Successfully logged in');
      navigate('/');
    } catch (err) {
      const errorMessage = handleApiError(err, 'An error occurred during login');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, login: false }));
    }
  }, [navigate]);

  // Signup function
  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setLoadingStates(prev => ({ ...prev, signup: true }));
    setError(null);

    try {
      const registerResponse = await authService.register({
        email,
        password,
        firstName: firstName || '',
        lastName: lastName || '',
      });

      console.log('Registration response:', registerResponse);
      toast.success('Registration successful! Please log in.');

      try {
        await login(email, password);
        toast.success('Logged in successfully!');
      } catch (loginErr) {
        console.log('Auto-login failed, redirecting to login page');
        navigate('/login');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'An error occurred during signup');
      setError(errorMessage);
      console.error('Signup error:', err);
      toast.error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, signup: false }));
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      toast.success('Password reset email sent successfully');
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to send password reset email');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        token,
        password,
        confirmPassword: password,
      });
      toast.success('Password reset successful. Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to reset password');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email function
  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(token);
      toast.success('Email verified successfully');
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to verify email');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification function
  const resendVerification = useCallback(async (email: string) => {
    if (lastVerificationSent && Date.now() - lastVerificationSent < VERIFICATION_COOLDOWN) {
      toast.error('Please wait before requesting another verification email');
      return;
    }

    try {
      await authService.resendVerification(email);
      setLastVerificationSent(Date.now());
      toast.success('Verification email sent successfully');
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to send verification email');
      toast.error(errorMessage);
      console.error('Resend verification error:', err);
      throw err;
    }
  }, [lastVerificationSent]);

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error('User must be logged in to update profile');
    }

    setLoadingStates(prev => ({ ...prev, profileUpdate: true }));
    setError(null);

    const previousUser = { ...user };

    try {
      const updatedUser = { ...user, ...data };
      const userWithDefaultAddresses = {
        ...updatedUser,
        addresses: updatedUser.addresses.map(addr => ({
          ...addr,
          id: addr.id || '', // Ensure id is always present
          isDefault: addr.isDefault ?? false
        })) as Address[]
      };
      setUser(userWithDefaultAddresses);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithDefaultAddresses));

      await authService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });

      toast.success('Profile updated successfully');
    } catch (err) {
      setUser(previousUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(previousUser));
      const errorMessage = handleApiError(err, 'Failed to update profile');
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, profileUpdate: false }));
    }
  };

  // Add address
  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) {
      throw new Error('User must be logged in to add address');
    }

    const validationError = validateAddress(address);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoadingStates(prev => ({ ...prev, addressOperations: true }));
    setError(null);

    try {
      const { id } = await authService.addAddress(address);
      const newAddress = { ...address, id };
      const updatedUser: User = {
        ...user,
        addresses: [...user.addresses, newAddress as Address],
      };

      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      toast.success('Address added successfully');
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to add address');
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, addressOperations: false }));
    }
  };

  // Update address
  const updateAddress = async (id: string, addressUpdate: Partial<Address>) => {
    if (!user) {
      throw new Error('User must be logged in to update address');
    }

    setLoadingStates(prev => ({ ...prev, addressOperations: true }));
    setError(null);

    const previousUser = { ...user };

    try {
      const updatedAddresses = user.addresses.map(addr =>
        addr.id === id ? { ...addr, ...addressUpdate, id: addr.id } : addr
      );
      const updatedUser: User = {
        ...user,
        addresses: updatedAddresses.map(addr => ({
          id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          country: addr.country,
          isDefault: addr.isDefault
        }))
      };

      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      await authService.updateAddress(id, addressUpdate);
      toast.success('Address updated successfully');
    } catch (err) {
      setUser(previousUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(previousUser));
      const errorMessage = handleApiError(err, 'Failed to update address');
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, addressOperations: false }));
    }
  };

  // Delete address
  const deleteAddress = async (id: string) => {
    if (!user) {
      throw new Error('User must be logged in to delete address');
    }

    setLoadingStates(prev => ({ ...prev, addressOperations: true }));
    setError(null);

    const previousUser = { ...user };

    try {
      const updatedUser: User = {
        ...user,
        addresses: user.addresses.filter(addr => addr.id !== id).map(addr => ({
          id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          country: addr.country,
          isDefault: addr.isDefault ?? false
        })),
      };

      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      await authService.deleteAddress(id);
      toast.success('Address deleted successfully');
    } catch (err) {
      setUser(previousUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(previousUser));
      const errorMessage = handleApiError(err, 'Failed to delete address');
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, addressOperations: false }));
    }
  };

  const value = {
    user,
    isLoading,
    loadingStates,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    isAuthenticated,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    resendVerification,
    canResendVerification: authService.canResendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};