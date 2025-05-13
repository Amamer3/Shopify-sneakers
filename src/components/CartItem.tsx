
import React from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useCart, CartItem as CartItemType } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  
  return (
    <div className="flex items-center py-4 border-b last:border-b-0">
      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
        <Link to={`/product/${item.id}`}>
          <img 
            src={item.image} 
            alt={item.name} 
            className="h-full w-full object-cover object-center"
          />
        </Link>
      </div>
      
      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <Link to={`/product/${item.id}`}>
            <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors">
              {item.name}
            </h3>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-red-500" 
            onClick={() => removeFromCart(item.id)}
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="mt-1 text-sm text-gray-500">{item.category}</p>
        <p className="mt-1 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
        
        <div className="mt-2 flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="mx-3 text-gray-900 w-6 text-center">{item.quantity}</span>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
