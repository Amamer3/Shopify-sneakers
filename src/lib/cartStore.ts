import { type Cart, type CartItem } from '../services/cart';

const CART_STORAGE_KEY = 'urban-sole-cart';
const GUEST_ID_KEY = 'urban-sole-guest-id';

export interface CartStore {
  cart: Cart | null;
  guestId: string | null;
}

export function generateGuestId(): string {
  return `guest_${Math.random().toString(36).substring(2, 15)}`;
}

export function getStoredCart(): CartStore {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    const guestId = localStorage.getItem(GUEST_ID_KEY);
    
    if (stored) {
      return {
        cart: JSON.parse(stored),
        guestId
      };
    }
  } catch (error) {
    console.error('Failed to parse stored cart:', error);
  }
  
  return { cart: null, guestId: null };
}

export function storeCart(cart: Cart | null): void {
  try {
    if (cart) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to store cart:', error);
  }
}

export function storeGuestId(guestId: string | null): void {
  try {
    if (guestId) {
      localStorage.setItem(GUEST_ID_KEY, guestId);
    } else {
      localStorage.removeItem(GUEST_ID_KEY);
    }
  } catch (error) {
    console.error('Failed to store guest ID:', error);
  }
}

export function clearCartStore(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(GUEST_ID_KEY);
}

export function calculateCartTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  return items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      totalPrice: acc.totalPrice + item.quantity * item.product.price
    }),
    { totalItems: 0, totalPrice: 0 }
  );
}

export function findCartItem(cart: Cart, productId: string): CartItem | undefined {
  return cart.items.find(item => item.productId === productId);
}

export function getCartItemCount(cart: Cart | null): number {
  return cart?.totalItems ?? 0;
}
