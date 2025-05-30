import React, { createContext, useContext, useState, useCallback } from 'react';
import { useProductUpdates } from '@/hooks/use-product-updates';
import type { Product } from '@/types/models';

interface ProductContextValue {
  products: Product[];
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (productId: string, stockLevel: number) => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  const updateProduct = useCallback((product: Product) => {
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === product.id);
      if (index === -1) return prev;
      
      const updated = [...prev];
      updated[index] = product;
      return updated;
    });
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const updateStock = useCallback((productId: string, stockLevel: number) => {
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === productId);
      if (index === -1) return prev;
      
      const updated = [...prev];
      updated[index] = { ...updated[index], stockLevel };
      return updated;
    });
  }, []);

  // Set up real-time product updates
  useProductUpdates({
    onNewProduct: (product) => setProducts(prev => [product, ...prev]),
    onUpdateProduct: updateProduct,
    onDeleteProduct: deleteProduct,
    onStockUpdate: ({ productId, stockLevel }) => updateStock(productId, stockLevel)
  });

  return (
    <ProductContext.Provider
      value={{
        products,
        updateProduct,
        deleteProduct,
        updateStock,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
