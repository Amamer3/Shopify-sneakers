import type { 
  Profile, 
  PaginatedOrders, 
  AddressInput, 
  PaymentMethodInput, 
  UpdateProfileData,
  Wishlist,
  WishlistItem 
} from '@/types/models';

import { api } from '@/lib/api';

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
    if (response.status === 401) {
    // Clear invalid token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Notify about unauthorized access
    window.dispatchEvent(new CustomEvent('auth:required'));
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    if (contentType?.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || error.error?.message || `Request failed with status ${response.status}`);
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!contentType?.includes('application/json')) {
    throw new Error('Invalid response format from server');
  }

  return response.json();
};

export const profileService = {  
  async getProfile(): Promise<Profile | null> {
    if (!isAuthenticated()) {
      return null;
    }

    try {
      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:required'));
        return null;
      }
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.patch('/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  async addAddress(address: AddressInput): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.post('/users/addresses', address);
      return response.data;
    } catch (error) {
      console.error('Failed to add address:', error);
      throw error;
    }
  },

  async updateAddress(id: string, address: AddressInput): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.patch(`/users/addresses/${id}`, address);
      return response.data;
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  },

  async deleteAddress(id: string): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.delete(`/users/addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  },

  async addPaymentMethod(paymentMethod: PaymentMethodInput): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.post('/users/payment-methods', paymentMethod);
      return response.data;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  },

  async deletePaymentMethod(id: string): Promise<Profile> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.delete(`/users/payment-methods/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      throw error;
    }
  },
  async getOrders(page: number = 1, pageSize: number = 10): Promise<PaginatedOrders> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.get('/api/profile/orders', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw new Error('Failed to fetch orders');
    }
  },

  // Wishlist Management
  async getWishlist(): Promise<Wishlist> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.get<Wishlist>('/api/wishlist');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      throw error;
    }
  },

  async addToWishlist(productId: string): Promise<WishlistItem> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.post<WishlistItem>('/api/wishlist', { productId });
      return response.data;
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
      throw error;
    }
  },

  async removeFromWishlist(productId: string): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      await api.delete(`/api/wishlist/${productId}`);
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      throw error;
    }
  },

  async clearWishlist(): Promise<void> {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      await api.delete('/api/wishlist');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  }
};
