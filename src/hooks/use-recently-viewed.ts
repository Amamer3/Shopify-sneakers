import { useState, useEffect, useCallback } from 'react';
import { type Product } from '../types/models';

const STORAGE_KEY = 'recently-viewed-products';
const MAX_ITEMS = 4;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    // Initialize state from localStorage on mount
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
      console.error('Failed to parse recently viewed products:', error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  // Add a product to recently viewed
  const addToRecentlyViewed = useCallback((product: Product) => {
    if (!product) return;

    setRecentlyViewed(prevItems => {
      // Skip update if product is already at the front
      if (prevItems[0]?.id === product.id) {
        return prevItems;
      }

      // Remove the product if it already exists to avoid duplicates
      const filteredItems = prevItems.filter(item => item.id !== product.id);
      
      // Add the new product at the beginning
      const updatedItems = [product, ...filteredItems].slice(0, MAX_ITEMS);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      
      return updatedItems;
    });
  }, []);

  return { recentlyViewed, addToRecentlyViewed };
}
