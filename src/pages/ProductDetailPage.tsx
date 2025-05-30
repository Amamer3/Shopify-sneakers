import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/products';
import type { Product as DataProduct } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useRecentlyViewed } from '../hooks/use-recently-viewed';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product as ModelProduct } from '@/types/models';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const product = id ? getProductById(id) : null;

  // Transform data product to model product for recently viewed
  const toModelProduct = (p: DataProduct): ModelProduct => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stockLevel: 10, // Default value since it's not in data product
    images: [p.image],
    mainImage: p.image,
    categories: [p.category],
    sku: p.id, // Use ID as SKU since it's not in data product
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const relatedProducts = product 
    ? getProductById('1') && getProductById('2') && getProductById('3')
      ? [getProductById('1')!, getProductById('2')!, getProductById('3')!]
        .filter(p => p.id !== product.id)
        .slice(0, 3)
      : []
    : [];

  // Load product and handle 404
  useEffect(() => {
    if (!product) {
      navigate('/404');
      return;
    }
  }, [product, navigate]);

  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Add to recently viewed only once when product loads
  useEffect(() => {
    if (product && !isLoading) {
      // Transform to model product before adding
      addToRecentlyViewed(toModelProduct(product));
    }
  }, [product?.id]); // Only depend on product ID

  if (!product) {
    return null;
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 10) { // Use default stock level
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product header */}
      <div className="mb-8 flex items-center">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Product details */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
          <p className="mb-4 text-2xl font-semibold">${product.price.toFixed(2)}</p>
          <p className="mb-6 text-gray-600">{product.description}</p>

          {/* Quantity selector */}
          <div className="mb-6 flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 min-w-[3ch] text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 10} // Use default stock level
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to cart button */}
          <Button
            className="mb-6"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>

          {/* Stock level indicator */}
          <p className="text-sm text-gray-500">
            10 in stock {/* Default stock level */}
          </p>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
