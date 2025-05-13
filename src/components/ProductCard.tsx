
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Product, useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow product-card-hover group">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-64 object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
          
          <Link to={`/product/${product.id}`} className="bg-white text-black p-2 rounded-full">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium truncate hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 font-semibold">${product.price.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-1">{product.category}</p>
      </div>
    </div>
  );
};

export default ProductCard;
