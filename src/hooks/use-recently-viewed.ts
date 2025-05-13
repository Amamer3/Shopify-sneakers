
import { useState, useEffect } from 'react';
import { Product } from '../contexts/CartContext';

const STORAGE_KEY = 'recently-viewed-products';
const MAX_ITEMS = 4;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load recently viewed products from localStorage on mount
  useEffect(() => {
    const storedItems = localStorage.getItem(STORAGE_KEY);
    if (storedItems) {
      try {
        setRecentlyViewed(JSON.parse(storedItems));
      } catch (error) {
        console.error('Failed to parse recently viewed products:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Add a product to recently viewed
  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prevItems => {
      // Remove the product if it already exists to avoid duplicates
      const filteredItems = prevItems.filter(item => item.id !== product.id);
      
      // Add the new product at the beginning
      const updatedItems = [product, ...filteredItems].slice(0, MAX_ITEMS);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      
      return updatedItems;
    });
  };

  return { recentlyViewed, addToRecentlyViewed };
}
