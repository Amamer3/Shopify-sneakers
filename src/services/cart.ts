import { getAuthHeaders } from './auth';
import { Product } from './products';

const API_VERSION = '/api';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface UpdateCartItemData {
  quantity: number;
  size?: string;
  color?: string;
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await fetch(`${API_VERSION}/cart`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to fetch cart' }));
      throw new Error(error.message || 'Failed to fetch cart');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async addToCart(data: AddToCartData): Promise<Cart> {
    const response = await fetch(`${API_VERSION}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to add item to cart' }));
      throw new Error(error.message || 'Failed to add item to cart');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async updateCartItem(productId: string, data: UpdateCartItemData): Promise<Cart> {
    const response = await fetch(`${API_VERSION}/cart/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to update cart item' }));
      throw new Error(error.message || 'Failed to update cart item');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async removeCartItem(productId: string): Promise<Cart> {
    const response = await fetch(`${API_VERSION}/cart/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to remove item from cart' }));
      throw new Error(error.message || 'Failed to remove item from cart');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async clearCart(): Promise<void> {
    const response = await fetch(`${API_VERSION}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to clear cart' }));
      throw new Error(error.message || 'Failed to clear cart');
    }
  }
};
