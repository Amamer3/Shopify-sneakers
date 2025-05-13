
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useRecentlyViewed } from '../hooks/use-recently-viewed';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const product = id ? getProductById(id) : null;
  const relatedProducts = product 
    ? getProductById('1') && getProductById('2') && getProductById('3')
      ? [getProductById('1')!, getProductById('2')!, getProductById('3')!]
        .filter(p => p.id !== product.id)
        .slice(0, 3)
      : []
    : [];
    
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!product) {
      navigate('/404');
    } else {
      // Add to recently viewed
      addToRecentlyViewed(product);
    }
  }, [product, navigate, addToRecentlyViewed]);
  
  if (!product) {
    return null;
  }
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative">
          <div className="sticky top-24">
            {isLoading ? (
              <div className="aspect-square bg-muted animate-pulse rounded-xl"></div>
            ) : (
              <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
        
        <div>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded-md w-3/4"></div>
              <div className="h-6 bg-muted animate-pulse rounded-md w-1/4"></div>
              <div className="h-4 bg-muted animate-pulse rounded-md w-1/6 mt-2"></div>
              <div className="mt-8 space-y-2">
                <div className="h-5 bg-muted animate-pulse rounded-md w-1/4"></div>
                <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
                <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
              <p className="text-lg font-semibold mt-2 text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</p>
              <p className="mt-2 inline-block bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">{product.category}</p>
              
              <div className="mt-8">
                <h2 className="font-medium text-lg mb-2">Description</h2>
                <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
              </div>
              
              <div className="mt-8">
                <h2 className="font-medium text-lg mb-4">Quantity</h2>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="mx-6 font-medium">{quantity}</span>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  className="w-full md:w-auto px-8"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Recently viewed products */}
      {recentlyViewed.length > 1 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentlyViewed
              .filter(p => p.id !== product.id) // Don't show current product
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </div>
      )}
      
      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
