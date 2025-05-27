import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { getCategories, getProductsByCategory } from '../data/products';
import { ToastAction } from '@/components/ui/toast';

// Define Product type (consistent with ProductCard.tsx)
interface Product {
  id: string;
  name: string;
  description: string; // Added description property
  price: number;
  image: string;
  category: string;
}

// Define types for data fetching functions
type GetCategories = () => string[];
type GetProductsByCategory = (category: string) => Product[];

export function HomePage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedCategories = (getCategories as GetCategories)();
        if (fetchedCategories.length === 0) {
          throw new Error('No categories found');
        }
        setCategories(fetchedCategories);

        const fetchedProducts = (getProductsByCategory as GetProductsByCategory)(selectedCategory);
        if (fetchedProducts.length === 0 && selectedCategory !== 'All') {
          toast({
            variant: 'destructive',
            title: 'No products found',
            description: `No products available in the ${selectedCategory} category.`,
            duration: 5000,
          });
        }
        setProducts(fetchedProducts);

        toast({
          title: 'Welcome to Urban Sole Store!',
          description: 'Explore our collection of premium sneakers',
          duration: 4000,
        });
      } catch (err: any) {
        const errorMessage = err.message === 'No categories found'
          ? 'Failed to load categories.'
          : 'Failed to load the store.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: errorMessage,
          description: 'Please refresh the page.',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 1000);
    return () => clearTimeout(timer);
  }, [selectedCategory, toast]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    setError(null);

    toast({
      title: category === 'All' ? 'Showing all products' : `Showing ${category} collection`,
      description: category === 'All'
        ? 'Browse our complete collection'
        : `Explore our ${category.toLowerCase()} selection`,
      action: (
        <ToastAction altText="View All Categories" onClick={() => setSelectedCategory('All')}>
          View All Categories
        </ToastAction>
      ),
      duration: 4000,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60"></div>
          <img
            src="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=1600"
            alt="Hero banner featuring premium sneakers"
            className="w-full h-[50vh] sm:h-[60vh] object-cover"
            onError={(e) => (e.currentTarget.src = '/fallback-hero.jpg')}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 animate-fade-in">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 max-w-xl">
              Step into Style with Premium Sneakers
            </h1>
            <p className="text-white opacity-90 mb-6 max-w-lg">
              Discover the latest trends and classic designs from the world's top brands.
            </p>
            <div>
              <Link
                to="#products"
                className="inline-flex items-center px-6 py-3 bg-background text-primary font-medium rounded-md hover:bg-muted transition-colors"
                role="button"
                aria-label="Shop now for premium sneakers"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Explore Our Collection</h2>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6"
          aria-busy={isLoading}
        >
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted h-48 sm:h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-12" role="alert">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative overflow-hidden rounded-xl h-48 sm:h-64 md:h-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 rounded-xl"></div>
          <img
            src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=800"
            alt="Men's sneaker collection"
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => (e.currentTarget.src = '/fallback-men.jpg')}
          />
          <div className="absolute inset-0 flex flex-col justify-center p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Men's Collection</h3>
            <p className="text-white opacity-90 mb-4">Discover the latest styles for men</p>
            <Link
              to="/men"
              className="inline-block px-4 py-2 bg-background text-primary font-medium rounded-md hover:bg-muted transition-colors"
              role="button"
              aria-label="Shop men's sneaker collection"
            >
              Shop Men
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl h-48 sm:h-64 md:h-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-primary/80 rounded-xl"></div>
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=800"
            alt="Women's sneaker collection"
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => (e.currentTarget.src = '/fallback-women.jpg')}
          />
          <div className="absolute inset-0 flex flex-col justify-center p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Women's Collection</h3>
            <p className="text-white opacity-90 mb-4">Explore our women's selection</p>
            <Link
              to="/women"
              className="inline-block px-4 py-2 bg-background text-primary font-medium rounded-md hover:bg-muted transition-colors"
              role="button"
              aria-label="Shop women's sneaker collection"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;