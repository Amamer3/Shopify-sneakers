import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Product } from '@/contexts/CartContext';

const WishlistPage = () => {
  const { wishlist, isLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addItem, isLoading: isCartLoading } = useCart();
  const navigate = useNavigate();
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  // Handle adding item to cart
  const handleAddToCart = async (item: typeof wishlist.items[number]) => {
    try {
      setLoadingItems(prev => new Set([...prev, item.productId]));
        const product: Product = {
        id: item.productId,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image,
        category: '',
        stockLevel: 1
      };

      await addItem(product);
      toast.success(`${item.name} added to cart`);
      
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist(item.productId);
    } catch (error) {
      toast.error('Failed to add item to cart', {
        description: error instanceof Error ? error.message : 'Please try again',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev);
        next.delete(item.productId);
        return next;
      });
    }
  };

  // Handle clearing wishlist
  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your wishlist?')) {
      return;
    }

    try {
      await clearWishlist();
      toast.success('Wishlist cleared');
    } catch (error) {
      toast.error('Failed to clear wishlist', {
        description: error instanceof Error ? error.message : 'Please try again',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
  };

  // Handle removing item from wishlist
  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Item removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item', {
        description: error instanceof Error ? error.message : 'Please try again',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
  };

  // Render auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
        <Heart className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-semibold text-center">Your Wishlist is Waiting</h1>
        <p className="text-gray-500 text-center max-w-md">
          Log in to view and manage your wishlist. Save your favorite items and never lose track of what you love.
        </p>
        <Button onClick={() => navigate('/login', { state: { from: '/wishlist' } })}>
          Login to View Wishlist
        </Button>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Render empty state
  if (!wishlist?.items?.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
        <Heart className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-semibold text-center">Your Wishlist is Empty</h1>
        <p className="text-gray-500 text-center max-w-md">
          Start adding items to your wishlist by clicking the heart icon on any product.
        </p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Wishlist ({wishlist.items.length} items)</h1>
        <Button
          variant="outline"
          onClick={handleClearWishlist}
          disabled={isCartLoading}
        >
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.items.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard 
              product={{
                id: item.productId,
                name: item.name,
                description: item.description || '',
                price: item.price,
                image: item.image,
                category: ''
              }} 
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleAddToCart(item)}
                  disabled={loadingItems.has(item.productId) || isCartLoading}
                  className="rounded-full"
                >
                  {loadingItems.has(item.productId) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                  disabled={loadingItems.has(item.productId)}
                  className="rounded-full"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
