
import React, { useState } from 'react';
import { getCategories, getProductsByCategory } from '../data/products';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = getCategories();
  const products = getProductsByCategory(selectedCategory);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90"></div>
          <img 
            src="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=1600" 
            alt="Hero" 
            className="w-full h-[60vh] object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-xl">Step into Style with Premium Sneakers</h1>
            <p className="text-white/90 mb-6 max-w-lg">Discover the latest trends and classic designs from the world's top brands.</p>
            <div>
              <a 
                href="#products" 
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Explore Our Collection</h2>
        
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative overflow-hidden rounded-xl h-64 md:h-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 rounded-xl"></div>
          <img 
            src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=800" 
            alt="Men's collection" 
            className="w-full h-full object-cover rounded-xl"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Men's Collection</h3>
            <p className="text-white/90 mb-4">Discover the latest styles for men</p>
            <a href="/men" className="inline-block px-4 py-2 bg-white text-purple-600 font-medium rounded-md hover:bg-gray-100 transition-colors">
              Shop Men
            </a>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl h-64 md:h-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 rounded-xl"></div>
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=800" 
            alt="Women's collection" 
            className="w-full h-full object-cover rounded-xl"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Women's Collection</h3>
            <p className="text-white/90 mb-4">Explore our women's selection</p>
            <a href="/women" className="inline-block px-4 py-2 bg-white text-purple-600 font-medium rounded-md hover:bg-gray-100 transition-colors">
              Shop Women
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
