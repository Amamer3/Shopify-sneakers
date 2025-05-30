import { api } from '@/lib/api';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/tokenUtils';
import type { AxiosRequestConfig } from 'axios';
import type { 
  Profile, 
  AddressInput, 
  PaymentMethodInput, 
  UpdateProfileData,  
} from '@/types/profile';

interface CustomRequestConfig extends AxiosRequestConfig {
  skipRetry?: boolean;
}
import type { Wishlist, WishlistItem } from '@/types/models';
import type { PaginatedResponse } from '@/types/api';
import type { Order } from '@/types/orders';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

type PaginatedOrders = PaginatedResponse<Order>;

export const isAuthenticated = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
};

export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

const FALLBACK_PROFILE: Profile = {
  id: 'temporary',
  email: '',
  firstName: '',
  lastName: '',
  role: 'user',
  isEmailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: {
    notifications: false,
    newsletter: false,
    language: 'en',
    currency: 'USD',
    theme: 'system'
  }
};

class ProfileService {
  private static instance: ProfileService;

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  private constructor() {} // Make constructor private for singleton

  private getAuthHeaders() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async getProfile(): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Not authenticated', 401);
    }

    try {
      const response = await api.get('/api/profile', {
        headers: this.getAuthHeaders(),
        skipRetry: true // Prevent retry loop
      } as CustomRequestConfig);
      
      if (!response.data) {
        throw new ProfileServiceError('Invalid profile data received');
      }

      return {
        ...FALLBACK_PROFILE,
        ...response.data
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Clear invalid session
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        throw new ProfileServiceError('Session expired', 401);
      }
      
      logger.error('Failed to fetch profile:', { error });
      throw new ProfileServiceError(
        error.response?.data?.message || 'Failed to fetch profile',
        error.response?.status
      );
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      const response = await api.patch('/api/profile', data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to update profile:', error);
      
      if (error?.response?.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:required'));
        throw new ProfileServiceError('Authentication required', 401);
      }
      
      throw new ProfileServiceError(
        error.response?.data?.message || 'Failed to update profile',
        error.response?.status
      );
    }
  }

  async addAddress(address: AddressInput): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      const response = await api.post('/users/addresses', address, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add address:', error);
      throw error;
    }
  }

  async updateAddress(id: string, address: AddressInput): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      const response = await api.patch(`/users/addresses/${id}`, address, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  }

  async deleteAddress(id: string): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      const response = await api.delete(`/users/addresses/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  }

  async addPaymentMethod(paymentMethod: PaymentMethodInput): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      const response = await api.post('/users/payment-methods', paymentMethod, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  }

  async deletePaymentMethod(id: string): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      const response = await api.delete(`/users/payment-methods/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      throw error;
    }
  }

  // Wishlist Management
  async getWishlist(): Promise<Wishlist> {
    if (!isAuthenticated()) {
      return {
        id: 'local',
        userId: 'anonymous',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    try {
      const response = await api.get('/api/wishlist');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch wishlist:', error);
      
      // Return empty wishlist for unauthorized/not found
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        return {
          id: 'local',
          userId: 'anonymous',
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      throw error;
    }
  }

  async addToWishlist(productId: string): Promise<WishlistItem> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      const response = await api.post<WishlistItem>('/api/wishlist', { productId });
      return response.data;
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(productId: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      await api.delete(`/api/wishlist/${productId}`);
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      throw error;
    }
  }

  async clearWishlist(): Promise<void> {
    if (!isAuthenticated()) {
      throw new ProfileServiceError('Authentication required', 401);
    }

    try {
      await api.delete('/api/wishlist');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  }

  // Orders Management
  async getOrders(page: number = 1, pageSize: number = 10): Promise<PaginatedOrders> {
    if (!isAuthenticated()) {
      return { items: [], total: 0, page: 1, pageSize, totalPages: 0 };
    }

    try {
      const response = await api.get('/api/profile/orders', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return { items: [], total: 0, page: 1, pageSize, totalPages: 0 };
    }
  }
}

// Export a singleton instance
export const profileService = ProfileService.getInstance();

// Also export the class for type usage
export type { ProfileService };
