
import React, { createContext, useState, useEffect, useContext } from 'react';

// User type definition
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Storage keys
const USER_STORAGE_KEY = 'sneaker-store-user';
const USERS_STORAGE_KEY = 'sneaker-store-users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Helper to get users array
  const getUsers = (): { email: string; password: string; id: string; firstName?: string; lastName?: string; }[] => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = getUsers();
      const userMatch = users.find(u => u.email === email && u.password === password);
      
      if (userMatch) {
        // Create safe user object (without password)
        const safeUser: User = {
          id: userMatch.id,
          email: userMatch.email,
          firstName: userMatch.firstName,
          lastName: userMatch.lastName,
          isAdmin: false // Default value
        };
        
        setUser(safeUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = getUsers();
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        setError('Email is already in use');
        setIsLoading(false);
        return;
      }
      
      // Create new user
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password, // In real application, this should be hashed
        firstName,
        lastName
      };
      
      // Save to "database"
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...users, newUser]));
      
      // Create safe user object (without password) for context
      const safeUser: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isAdmin: false
      };
      
      // Set as current user
      setUser(safeUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));
      
    } catch (err) {
      setError('An error occurred during signup');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
