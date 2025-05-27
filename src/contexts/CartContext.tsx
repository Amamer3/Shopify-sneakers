import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ShoppingCart, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { api } from '../lib/api';
import { logger } from '../lib/logger';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockLevel: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  lastUpdated: number;
  syncing: boolean;
}

interface CartContextValue {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'sneaker-store-cart';
const SYNC_DEBOUNCE_TIME = 500; // ms

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    items: [],
    total: 0,
    loading: false,
    lastUpdated: Date.now(),
    syncing: false,
  });

  const { isAuthenticated, user } = useAuth();
  const { addListener, sendEvent } = useSocket();

  // Load cart from storage or server
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            setState((prev) => ({
              ...prev,
              items: parsedCart.items,
              total: parsedCart.total,
              lastUpdated: Date.now(),
            }));
          } catch (error) {
            logger.error('Failed to load cart from storage:', error);
          }
        }
        return;
      }

      try {
        setState((prev) => ({ ...prev, syncing: true }));
        const response = await api.get('/cart');
        const serverCart = response.data;

        setState((prev) => ({
          ...prev,
          items: serverCart.items,
          total: serverCart.total,
          lastUpdated: Date.now(),
          syncing: false,
        }));
      } catch (error) {
        logger.error('Failed to sync cart with server:', error);
        setState((prev) => ({ ...prev, syncing: false }));
        toast.error('Failed to sync cart with server');
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items: state.items,
          total: state.total,
        })
      );
    }
  }, [state.items, state.total, isAuthenticated]);

  // Set up real-time listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const cleanupFunctions: Array<() => void> = [];

    if (addListener) {
      cleanupFunctions.push(
        addListener('product:stockUpdate', handleStockUpdate),
        addListener('product:priceUpdate', (productId: string, newPrice: number) => {
          handlePriceUpdate(productId, newPrice);
        }),
        addListener('cart:updated', (userId: string, cartData: any) => {
          if (userId === user?.id) handleCartUpdate(cartData);
        }),
        addListener('cart:stockWarning', handleStockWarning),
        addListener('cart:error', handleCartError)
      );
    }

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup && cleanup());
    };
  }, [isAuthenticated, user?.id, addListener]);

  const handleStockUpdate = async (productId: string, stockLevel: number) => {
    const item = state.items.find((i) => i.product.id === productId);
    if (item && item.quantity > stockLevel) {
      toast.warning(`Stock level updated for ${item.product.name}`, {
        description: `Only ${stockLevel} items available`,
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      await updateQuantity(productId, Math.min(item.quantity, stockLevel));
    }
  };

  const handlePriceUpdate = (productId: string, newPrice: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, product: { ...item.product, price: newPrice } }
          : item
      ),
      lastUpdated: Date.now(),
    }));
    calculateTotal();
  };

  const handleCartUpdate = (cartData: { items: CartItem[]; total: number }) => {
    setState((prev) => ({
      ...prev,
      items: cartData.items,
      total: cartData.total,
      lastUpdated: Date.now(),
    }));
  };

  const handleStockWarning = (productId: string, availableStock: number) => {
    const item = state.items.find((i) => i.product.id === productId);
    if (item) {
      toast.warning(`Limited stock for ${item.product.name}`, {
        description: `Only ${availableStock} items remaining`,
        icon: <AlertTriangle className="h-4 w-4" />,
      });
    }
  };

  const handleCartError = (error: { message: string; productId?: string }) => {
    toast.error(error.message, {
      icon: <XCircle className="h-4 w-4" />,
    });

    if (error.productId) {
      removeItem(error.productId).catch(err => {
        logger.error('Failed to remove item after error:', err);
      });
    }
  };

  const calculateTotal = () => {
    const total = state.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setState((prev) => ({ ...prev, total }));
  };

  const addItem = async (product: Product, quantity: number = 1) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Validate stock level
      const response = await api.get(`/products/${product.id}/stock`);
      const availableStock = response.data.stockLevel;

      if (quantity > availableStock) {
        toast.error('Not enough stock available', {
          icon: <XCircle className="h-4 w-4" />,
        });
        return;
      }

      const existingItem = state.items.find((i) => i.product.id === product.id);
      const newQuantity = (existingItem?.quantity || 0) + quantity;

      if (newQuantity > availableStock) {
        toast.error('Requested quantity exceeds available stock', {
          icon: <XCircle className="h-4 w-4" />,
        });
        return;
      }

      const updatedItems = existingItem
        ? state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: newQuantity }
              : i
          )
        : [...state.items, { product, quantity }];

      // Update server if authenticated
      if (isAuthenticated) {
        await api.post('/cart/items', {
          productId: product.id,
          quantity: newQuantity,
        });

        if (user?.id && sendEvent) {
          sendEvent('cart:updated', user.id, {
            items: updatedItems,
            total: state.total,
            operation: 'add',
            productId: product.id,
            quantity: newQuantity,
          });
        }
      }

      setState((prev) => ({
        ...prev,
        items: updatedItems,
        lastUpdated: Date.now(),
      }));

      calculateTotal();

      toast.success('Added to cart', {
        description: product.name,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } catch (error) {
      logger.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart', {
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const itemToRemove = state.items.find(item => item.product.id === productId);
      if (!itemToRemove) return;

      // Update server if authenticated
      if (isAuthenticated) {
        await api.delete(`/cart/items/${productId}`);

        if (user?.id && sendEvent) {
          sendEvent('cart:updated', user.id, {
            items: state.items.filter(item => item.product.id !== productId),
            total: state.total,
            operation: 'remove',
            productId
          });
        }
      }

      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.product.id !== productId),
        lastUpdated: Date.now(),
      }));

      calculateTotal();

      toast.success('Removed from cart', {
        description: itemToRemove.product.name,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } catch (error) {
      logger.error('Failed to remove item from cart:', error);
      toast.error('Failed to remove item from cart', {
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Validate stock level
      const response = await api.get(`/products/${productId}/stock`);
      const availableStock = response.data.stockLevel;

      if (quantity > availableStock) {
        toast.error('Requested quantity exceeds available stock', {
          icon: <XCircle className="h-4 w-4" />,
        });
        return;
      }

      const updatedItems = state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );

      // Update server if authenticated
      if (isAuthenticated) {
        await api.put(`/cart/items/${productId}`, { quantity });

        if (user?.id && sendEvent) {
          sendEvent('cart:updated', user.id, {
            items: updatedItems,
            total: state.total,
            operation: 'update',
            productId,
            quantity
          });
        }
      }

      setState(prev => ({
        ...prev,
        items: updatedItems,
        lastUpdated: Date.now(),
      }));

      calculateTotal();

      toast.success('Updated quantity', {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } catch (error) {
      logger.error('Failed to update item quantity:', error);
      toast.error('Failed to update quantity', {
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const clearCart = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Update server if authenticated
      if (isAuthenticated) {
        await api.delete('/cart');

        if (user?.id && sendEvent) {
          sendEvent('cart:updated', user.id, {
            items: [],
            total: 0,
            operation: 'clear'
          });
        }
      }

      setState(prev => ({
        ...prev,
        items: [],
        total: 0,
        lastUpdated: Date.now(),
      }));

      toast.success('Cart cleared', {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } catch (error) {
      logger.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart', {
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const value: CartContextValue = {
    items: state.items,
    total: state.total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isLoading: state.loading,
    isSyncing: state.syncing,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
