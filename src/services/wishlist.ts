import { api } from '../lib/api';
import type { Product } from '@/types/models/product';

class WishlistService {
  private readonly baseUrl = '/api/wishlist';

  async getWishlist(): Promise<Product[]> {
    const response = await api.get(this.baseUrl);
    return response.data;
  }

  async addToWishlist(productId: string): Promise<void> {
    await api.post(`${this.baseUrl}`, { productId });
  }

  async removeFromWishlist(productId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${productId}`);
  }
}

export const wishlistService = new WishlistService();
