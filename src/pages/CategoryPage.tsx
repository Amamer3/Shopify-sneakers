import React, { Suspense, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsByCategory } from '../data/products';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useProductUpdates } from '@/hooks/use-product-updates';
import type { Product } from '@/types/models';

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  
  // Make sure categoryName is always a string, default to an empty string if undefined
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', categoryName],
    queryFn: () => getProductsByCategory(categoryName),
    enabled: !!categoryName,
  });

  // Initialize local products when query data arrives
  useEffect(() => {
    if (products.length > 0) {
      setLocalProducts(products);
    }
  }, [products]);

  // Set up real-time product updates
  useProductUpdates({
    onNewProduct: (product) => {
      if (product.categories.includes(categoryName)) {
        setLocalProducts(prev => [product, ...prev]);
      }
    },
    onUpdateProduct: (product) => {
      setLocalProducts(prev => {
        const index = prev.findIndex(p => p.id === product.id);
        if (index === -1) return prev;
        
        const updated = [...prev];
        updated[index] = product;
        return updated;
      });
    },
    onDeleteProduct: (productId) => {
      setLocalProducts(prev => prev.filter(p => p.id !== productId));
    },
    onStockUpdate: ({ productId, stockLevel }) => {
      setLocalProducts(prev => {
        const index = prev.findIndex(p => p.id === productId);
        if (index === -1) return prev;
        
        const updated = [...prev];
        updated[index] = { ...updated[index], stockLevel };
        return updated;
      });
    }
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{categoryName} Collection</h1>
        <p className="text-gray-600 mt-2">
          Discover our selection of {typeof categoryName === 'string' ? categoryName.toLowerCase() : ''} sneakers.
        </p>
      </div>
        {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-medium">Error loading products</h2>
          <p className="text-gray-500">Please try again later.</p>
        </div>
      ) : localProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {localProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-xl font-medium">No products found</h2>
          <p className="text-gray-500">We couldn't find any products in this category.</p>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
