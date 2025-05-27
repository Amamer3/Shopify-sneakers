import { Button } from '@/components/ui/button';
import { HeartIcon, HeartFilledIcon } from '@radix-ui/react-icons';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function WishlistButton({ 
  productId, 
  variant = 'ghost',
  size = 'icon',
  className 
}: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isLiked = isInWishlist(productId);

  const handleClick = async () => {
    if (isLiked) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'group hover:bg-primary/5',
        isLiked && 'text-red-500 hover:text-red-600',
        className
      )}
      onClick={handleClick}
      title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      {isLiked ? (
        <HeartFilledIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
      ) : (
        <HeartIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
      )}
      <span className="sr-only">
        {isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </span>
    </Button>
  );
}
