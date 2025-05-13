
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ShoppingCart, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sneaker-store-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to parse cart items from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to store cart items in localStorage:', error);
      toast.error('Failed to save your cart', {
        description: 'Your cart may not persist when you close the browser',
        icon: <AlertTriangle className="h-4 w-4" />,
      });
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1) => {
    if (quantity < 1) {
      toast.error('Invalid quantity', {
        description: 'Quantity must be at least 1',
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      return;
    }

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        
        toast.success('Updated quantity in cart', {
          description: `${product.name} (${updatedItems[existingItemIndex].quantity}x)`,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
        
        return updatedItems;
      } else {
        toast.success('Added to cart', {
          description: `${product.name} (${quantity}x)`,
          icon: <ShoppingCart className="h-4 w-4" />,
        });
        
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    
    if (itemToRemove) {
      toast.success('Removed from cart', {
        description: itemToRemove.name,
        icon: <XCircle className="h-4 w-4" />,
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
