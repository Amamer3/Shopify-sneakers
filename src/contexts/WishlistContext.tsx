import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { Product } from '@/types/models/product';
import { wishlistService } from '../services/wishlist';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadWishlist = async () => {
    try {
      const items = await wishlistService.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await wishlistService.addToWishlist(product.id);
      setWishlistItems((prev) => [...prev, product]);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
