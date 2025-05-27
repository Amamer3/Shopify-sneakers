import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart, Product as CartProduct, CartContextType } from '../contexts/CartContext';
import { ToastAction } from '@/components/ui/toast';
import { WishlistButton } from './WishlistButton';

// Define Product type (assumed from CartContext)
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

// Define CartContext type
// interface CartContextType {
//   addToCart: (product: Product) => Promise<void>;
//   cartItems: Product[];
// }

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cartItems } = useCart() as CartContextType;
  const { toast, dismiss } = useToast();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      setIsAdding(true);

      // Show loading toast with cancel button
      const loadingToast = toast({
        title: 'Adding to cart...',
        description: product.name,
        action: (
          <ToastAction altText="Cancel" onClick={() => dismiss(loadingToast.id)}>
            Cancel
          </ToastAction>
        ),
      });

      // Check if item is already in cart
      const existingItem = cartItems.find((item) => item.id === product.id);

      // Add to cart
      await addToCart(product);

      // Clear loading toast
      dismiss(loadingToast.id);

      // Show success toast
      toast({
        title: existingItem ? 'Updated cart quantity' : 'Added to cart',
        description: `${product.name} - $${product.price.toFixed(2)}`,
        action: (
          <ToastAction altText="View Cart" onClick={() => navigate('/cart')}>
            View Cart
          </ToastAction>
        ),
        duration: 4000,
      });
    } catch (error: any) {
      const errorMessage = error.code === 'out-of-stock' ? 'Product is out of stock.' : 'Please try again later.';
      toast({
        variant: 'destructive',
        title: 'Failed to add to cart',
        description: errorMessage,
        action: (
          <ToastAction altText="Retry" onClick={() => handleAddToCart(e)}>
            Retry
          </ToastAction>
        ),
        duration: 5000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleProductClick = () => {
    toast({
      title: 'Loading product details...',
      description: product.name,
      duration: 2000,
    });
  };
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow product-card-hover group relative">
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton productId={product.id} />
      </div>
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 sm:h-64 object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = '/fallback-image.jpg')} // Fallback image
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={isAdding ? 'Adding product to cart' : `Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>

          <Link
            to={`/product/${product.id}`}
            className="bg-background text-foreground p-2 rounded-full"
            onClick={handleProductClick}
            role="button"
            aria-label={`View details for ${product.name}`}
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/product/${product.id}`} onClick={handleProductClick}>
          <h3 className="font-medium truncate hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 font-semibold text-foreground">${product.price.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
      </div>
    </div>
  );
}

export default ProductCard;