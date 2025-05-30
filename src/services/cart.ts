import { api } from '@/lib/api';
import type { Product } from '@/types/models';
import { logger } from '@/lib/logger';

// Types
export type CartProduct = Pick<Product, 'id' | 'name' | 'price' | 'sku' | 'stockLevel'> & {
  image?: string;
};

export interface CartItem {
  id: string;          // Cart item ID (different from product ID)
  productId: string;   // Product ID
  product: CartProduct;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
  status: 'active' | 'merged' | 'converted';
}

// Service class for encapsulating cart operations
class CartService {
  private readonly API_PREFIX = '/api/cart';

  // Get the current user's cart
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get(`${this.API_PREFIX}/current`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch cart:', { error });
      throw error;
    }
  }

  // Add an item to cart
  async addToCart(productId: string, quantity = 1, guestId?: string): Promise<Cart> {
    try {
      const endpoint = guestId 
        ? `${this.API_PREFIX}/guest/${guestId}/items`
        : `${this.API_PREFIX}/items`;

      const response = await api.post(endpoint, {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to add item to cart:', { error, productId, quantity, guestId });
      throw error;
    }
  }

  // Update item quantity
  async updateCartItemQuantity(productId: string, quantity: number): Promise<Cart> {
    try {
      const response = await api.patch(`${this.API_PREFIX}/items/${productId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to update cart item:', { error, productId, quantity });
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(productId: string): Promise<Cart> {
    try {
      const response = await api.delete(`${this.API_PREFIX}/items/${productId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to remove item from cart:', { error, productId });
      throw error;
    }
  }

  // Clear the entire cart
  async clearCart(): Promise<Cart> {
    try {
      const response = await api.delete(`${this.API_PREFIX}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to clear cart:', { error });
      throw error;
    }
  }

  // Merge guest cart with user cart after login
  async mergeCart(guestCartId: string): Promise<Cart> {
    try {
      const response = await api.post(`${this.API_PREFIX}/merge`, {
        guestCartId
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to merge carts:', { error, guestCartId });
      throw error;
    }
  }

  // Get cart for guest user or create new one
  async getOrCreateGuestCart(guestId: string): Promise<Cart> {
    try {
      const response = await api.post(`${this.API_PREFIX}/guest`, {
        guestId
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to get/create guest cart:', { error, guestId });
      throw error;
    }
  }
}

// Export singleton instance
export const cartService = new CartService();