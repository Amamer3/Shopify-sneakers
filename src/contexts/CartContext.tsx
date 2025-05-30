import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { cartService, type Cart, type CartItem, type CartProduct } from '../services/cart';
import { logger } from '../lib/logger';
import { getProductById } from '../data/products';
import type { Product as DataProduct } from '../data/products';
import {
  getStoredCart,
  storeCart,
  storeGuestId,
  generateGuestId,
  calculateCartTotals,
  clearCartStore,
  getCartItemCount,
  findCartItem
} from '../lib/cartStore';

// Context value type
interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  loadingStates: {
    fetching: boolean;
    adding: boolean;
    removing: boolean;
    updating: boolean;
    clearing: boolean;
  };
  isSyncing: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Empty cart state
const EMPTY_CART: Cart = {
  id: '',
  userId: '',
  items: [],
  totalItems: 0,
  totalPrice: 0,
  updatedAt: new Date().toISOString(),
  status: 'active'
};

// Helper to convert data product to cart product
const toCartProduct = (product: DataProduct): CartProduct => ({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  sku: product.id, // Use ID as SKU for demo
  stockLevel: 10, // Default stock level for demo
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<Cart>({ ...EMPTY_CART });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    fetching: false,
    adding: false,
    removing: false,
    updating: false,
    clearing: false
  });

  // Calculate cart totals
  const calculateTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
    return items.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      totalPrice: acc.totalPrice + (item.product.price * item.quantity)
    }), { totalItems: 0, totalPrice: 0 });
  };

  // Fetch or restore cart
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      const { cart: storedCart } = getStoredCart();
      if (storedCart) {
        setCart(storedCart);
        setIsLoading(false);
        return;
      }

      // Initialize empty guest cart
      const guestCart: Cart = {
        ...EMPTY_CART,
        id: `guest_${generateGuestId()}`,
        status: 'active'
      };
      storeCart(guestCart);
      setCart(guestCart);
      setIsLoading(false);
      return;
    }

    // Fetch authenticated user's cart
    try {
      setLoadingStates(prev => ({ ...prev, fetching: true }));
      const userCart = await cartService.getCart();
      setCart(userCart);
      storeCart(userCart);
    } catch (error) {
      logger.error('Failed to fetch cart:', { error });
      toast.error('Failed to load cart', {
        description: 'Please try refreshing the page'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, fetching: false }));
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initialize cart
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Handle cart operations
  const addToCart = async (productId: string, quantity = 1) => {
    if (!productId) {
      toast.error('Invalid product', {
        description: 'Could not add item to cart'
      });
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, adding: true }));
      setIsSyncing(true);

      if (!isAuthenticated) {
        // Handle guest cart locally using product data
        const dataProduct = getProductById(productId);
        if (!dataProduct) {
          throw new Error('Product not found');
        }

        const cartProduct = toCartProduct(dataProduct);
        
        setCart(prevCart => {
          const existingItem = prevCart.items.find(item => item.productId === productId);
          
          if (existingItem) {
            const updatedItems = prevCart.items.map(item =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );

            const { totalItems, totalPrice } = calculateTotals(updatedItems);
            const updatedCart: Cart = {
              ...prevCart,
              items: updatedItems,
              totalItems,
              totalPrice,
              updatedAt: new Date().toISOString()
            };
            storeCart(updatedCart);
            return updatedCart;
          }

          const newItem: CartItem = {
            id: `${prevCart.id}_${productId}`,
            productId,
            product: cartProduct,
            quantity,
            addedAt: new Date().toISOString()
          };

          const updatedItems = [...prevCart.items, newItem];
          const { totalItems, totalPrice } = calculateTotals(updatedItems);
          const updatedCart: Cart = {
            ...prevCart,
            items: updatedItems,
            totalItems,
            totalPrice,
            updatedAt: new Date().toISOString()
          };
          storeCart(updatedCart);
          return updatedCart;
        });

        toast.success('Item added to cart', {
          icon: <ShoppingCart className="h-4 w-4" />
        });
        return;
      }

      // Handle authenticated cart
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
      storeCart(updatedCart);

      toast.success('Item added to cart', {
        icon: <ShoppingCart className="h-4 w-4" />
      });
    } catch (error: any) {
      logger.error('Failed to add item to cart:', { error, productId, quantity });
      
      const errorMessage = error?.message === 'Product not found'
        ? 'Product not found'
        : error?.response?.status === 400
        ? 'Invalid quantity or product'
        : 'Failed to add to cart';

      toast.error(errorMessage, {
        icon: <AlertTriangle className="h-4 w-4" />,
        description: 'Please try again'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, adding: false }));
      setIsSyncing(false);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, removing: true }));
      setIsSyncing(true);

      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
      storeCart(updatedCart);

      toast.success('Item removed from cart');
    } catch (error) {
      logger.error('Failed to remove item from cart:', { error, productId });
      toast.error('Failed to remove item');
    } finally {
      setLoadingStates(prev => ({ ...prev, removing: false }));
      setIsSyncing(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, updating: true }));
      setIsSyncing(true);

      const updatedCart = await cartService.updateCartItemQuantity(productId, quantity);
      setCart(updatedCart);
      storeCart(updatedCart);
    } catch (error) {
      logger.error('Failed to update quantity:', { error, productId, quantity });
      toast.error('Failed to update quantity');
    } finally {
      setLoadingStates(prev => ({ ...prev, updating: false }));
      setIsSyncing(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, clearing: true }));
      setIsSyncing(true);

      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
      storeCart(updatedCart);

      toast.success('Cart cleared');
    } catch (error) {
      logger.error('Failed to clear cart:', { error });
      toast.error('Failed to clear cart');
    } finally {
      setLoadingStates(prev => ({ ...prev, clearing: false }));
      setIsSyncing(false);
    }
  };

  const value: CartContextValue = {
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    isLoading,
    isSyncing,
    loadingStates,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook for using cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}