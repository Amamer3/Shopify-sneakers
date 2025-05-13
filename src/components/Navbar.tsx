
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { ThemeToggle } from './ThemeToggle';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-10">
          <Link to="/" className="text-xl font-bold flex items-center">
            <span className="mr-1 bg-primary text-white rounded-md w-8 h-8 flex items-center justify-center font-bold text-lg">S</span>
            neakerStore
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              Home
            </Link>
            <Link to="/men" className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              Men
            </Link>
            <Link to="/women" className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              Women
            </Link>
            <Link to="/trending" className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              Trending
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            aria-label="Login"
            className="hidden md:flex"
          >
            <Link to="/">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
            aria-label={`Shopping cart with ${cartCount} items`}
            className="relative"
          >
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="flex flex-col p-4 space-y-4 bg-background">
            <Link 
              to="/" 
              className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/men" 
              className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Men
            </Link>
            <Link 
              to="/women" 
              className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Women
            </Link>
            <Link 
              to="/trending" 
              className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Trending
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-start gap-2"
              asChild
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/">
                <User className="h-4 w-4" />
                Login
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
