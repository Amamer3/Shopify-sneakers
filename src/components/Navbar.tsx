import { memo, useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogIn, UserPlus, Search } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

// Define context types
interface CartContextType {
  getCartCount: () => number;
}

interface AuthContextType {
  user: { id: string; name?: string } | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { getCartCount } = useCart() as CartContextType;
  const { user, isAuthenticated, logout } = useAuth() as AuthContextType;
  const cartCount = getCartCount();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Focus management for mobile menu
  useEffect(() => {
    if (isMenuOpen) {
      const firstMenuItem = document.querySelector('.mobile-menu a');
      (firstMenuItem as HTMLElement)?.focus();
    }
  }, [isMenuOpen]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-10">
          <Link
            to="/"
            className="text-xl font-bold flex items-center transition-transform hover:scale-105"
            aria-label="SNEAKR Home"
          >
            <span className="mr-1 bg-purple-600 text-white rounded-md w-8 h-8 flex items-center justify-center font-bold text-lg">
              S
            </span>
            SNEAKR
          </Link>

          <nav className="hidden md:flex gap-6">
            {[
              { to: '/', label: 'Home' },
              { to: '/men', label: 'Men' },
              { to: '/women', label: 'Women' },
              { to: '/trending', label: 'Trending' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-purple-600"
                aria-current={location.pathname === to ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Search products"
          >
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <ThemeToggle />

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Profile"
              className="hidden md:flex"
            >
              <Link to="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/signup" className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}

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
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background transition-all duration-300 mobile-menu"
        >
          <nav className="flex flex-col p-6 space-y-4">
            {[
              { to: '/', label: 'Home' },
              { to: '/men', label: 'Men' },
              { to: '/women', label: 'Women' },
              { to: '/trending', label: 'Trending' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-2 text-foreground hover:bg-purple-50 rounded-md transition-colors"
                onClick={toggleMenu}
                aria-current={location.pathname === to ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-start gap-2"
                  asChild
                  onClick={toggleMenu}
                >
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-start gap-2 text-red-600"
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                >
                  <LogIn className=" Back to Top Button h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-start gap-2"
                  asChild
                  onClick={toggleMenu}
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center justify-start gap-2 bg-purple-600 hover:bg-purple-700"
                  asChild
                  onClick={toggleMenu}
                >
                  <Link to="/signup">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default memo(Navbar);