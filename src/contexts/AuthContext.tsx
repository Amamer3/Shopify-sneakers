import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
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
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  addresses: Address[];
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  isAuthenticated: boolean;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
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
});

// Storage key
const USER_STORAGE_KEY = 'sneaker-store-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      console.log('Login response:', response);

      // Extract user data from the response
      const userData: User = {
        id: response.userId || response._id || email, // fallback to email if no ID
        email: email,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        isAdmin: response.isAdmin || false,
        addresses: response.addresses || [],
      };
      
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      setUser(userData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
      throw err; // Propagate the error for proper handling in signup
    } finally {
      setIsLoading(false);
    }
  };  // Signup function
  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const registerResponse = await authService.register({
        email,
        password,
        name: `${firstName || ''} ${lastName || ''}`.trim(),
      });
      
      console.log('Registration response:', registerResponse);

      // Show success message
      toast.success('Registration successful! Please log in.');
      
      // Try to log in automatically
      try {
        await login(email, password);
        toast.success('Logged in successfully!');
      } catch (loginErr) {
        // If auto-login fails, redirect to login page
        console.log('Auto-login failed, redirecting to login page');
        navigate('/login');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during signup';
      setError(errorMessage);
      console.error('Signup error:', err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
    } catch (err) {
      setError('Failed to send password reset email');
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
      await authService.resetPassword({ token, password });
    } catch (err) {
      setError('Failed to reset password');
      console.error(err);
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
    } catch (err) {
      setError('Failed to verify email');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would call your API
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError('Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add address function
  const addAddress = async (address: Omit<Address, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newAddress = {
        ...address,
        id: crypto.randomUUID(),
      };
      const updatedUser = {
        ...user!,
        addresses: [...user!.addresses, newAddress],
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError('Failed to add address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update address function
  const updateAddress = async (id: string, address: Partial<Address>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedAddresses = user!.addresses.map((addr) =>
        addr.id === id ? { ...addr, ...address } : addr
      );
      const updatedUser = {
        ...user!,
        addresses: updatedAddresses,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError('Failed to update address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete address function
  const deleteAddress = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedAddresses = user!.addresses.filter((addr) => addr.id !== id);
      const updatedUser = {
        ...user!,
        addresses: updatedAddresses,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError('Failed to delete address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        isAuthenticated: !!user,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
