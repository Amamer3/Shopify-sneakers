import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/tokenUtils';
import { logger } from '@/lib/logger';

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product?: {
    name: string;
    price: number;
    image?: string;
  };
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

const EMPTY_WISHLIST: Wishlist = {
  id: 'guest',
  userId: 'guest',
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const wishlistService = {
  async getWishlist(): Promise<Wishlist> {
    if (!isAuthenticated()) {
      return EMPTY_WISHLIST;
    }

    try {
      const response = await api.get('/api/wishlist');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch wishlist:', error);
      return EMPTY_WISHLIST;
    }
  },

  async addToWishlist(productId: string): Promise<Wishlist> {
    if (!isAuthenticated()) {
      throw new Error('Please log in to add items to wishlist');
    }

    const response = await api.post('/api/wishlist', { productId });
    return response.data;
  },

  async removeFromWishlist(productId: string): Promise<Wishlist> {
    if (!isAuthenticated()) {
      return EMPTY_WISHLIST;
    }

    const response = await api.delete(`/api/wishlist/${productId}`);
    return response.data;
  },

  async clearWishlist(): Promise<void> {
    if (!isAuthenticated()) {
      return;
    }

    await api.delete('/api/wishlist');
  }
};
