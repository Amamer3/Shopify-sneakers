import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { profileService } from '@/services/ProfileService';
import type { Wishlist, WishlistItem } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const data = await profileService.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    try {
      const newItem = await profileService.addToWishlist(productId);
      setWishlist(prev => prev ? {
        ...prev,
        items: [...prev.items, newItem]
      } : null);
      toast.success('Item added to wishlist');
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
      toast.error('Failed to add item to wishlist');
    }
  }, [isAuthenticated]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      await profileService.removeFromWishlist(productId);
      setWishlist(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.productId !== productId)
      } : null);
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  }, [isAuthenticated]);

  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await profileService.clearWishlist();
      setWishlist(prev => prev ? { ...prev, items: [] } : null);
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  }, [isAuthenticated]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist?.items.some(item => item.productId === productId) ?? false;
  }, [wishlist]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    refresh: fetchWishlist
  };
}
