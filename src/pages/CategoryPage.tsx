
import React from 'react';
import { useParams } from 'react-router-dom';
import { getProductsByCategory } from '../data/products';
import ProductCard from '../components/ProductCard';

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  
  // Make sure categoryName is always a string, default to an empty string if undefined
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  
  // Safely get products
  const products = categoryName ? getProductsByCategory(categoryName) : [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{categoryName} Collection</h1>
        <p className="text-gray-600 mt-2">
          Discover our selection of {typeof categoryName === 'string' ? categoryName.toLowerCase() : ''} sneakers.
        </p>
      </div>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
