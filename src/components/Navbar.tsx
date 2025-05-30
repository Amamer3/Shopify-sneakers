import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/use-wishlist";
import { Link } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingBag, User, Search, Heart, Menu, X, Tag } from "lucide-react";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { cn } from "@/lib/utils";

export const Navbar = () => {  const { isAuthenticated, user } = useAuth();
  const { items: cartItems = [], isLoading: cartLoading } = useCart();
  const { wishlist = { items: [] }, isLoading: wishlistLoading } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Promotional banner content
  const promoBanner = {
    text: "Free Shipping on Orders Over $100 | 30-Day Returns",
    link: "/promotion",
  };

  const navLinks = [
    {
      label: "New Arrivals",
      to: "/new-arrivals",
      featured: [
        {
          name: "Just Dropped",
          description: "Latest releases this week",
          to: "/new-arrivals/latest",
        },
        {
          name: "Coming Soon",
          description: "Upcoming releases",
          to: "/new-arrivals/upcoming",
        },
      ],
    },
    {
      label: "Men",
      to: "/men",
      featured: [
        {
          name: "Running",
          description: "Performance running shoes",
          to: "/men/running",
        },
        {
          name: "Lifestyle",
          description: "Casual and trendy sneakers",
          to: "/men/lifestyle",
        },
        {
          name: "Basketball",
          description: "Court-ready performance",
          to: "/men/basketball",
        },
      ],
    },
    {
      label: "Women",
      to: "/women",
      featured: [
        {
          name: "Running",
          description: "Performance running shoes",
          to: "/women/running",
        },
        {
          name: "Lifestyle",
          description: "Casual and trendy sneakers",
          to: "/women/lifestyle",
        },
        {
          name: "Training",
          description: "Gym and fitness shoes",
          to: "/women/training",
        },
      ],
    },
    {
      label: "Sale",
      to: "/sale",
      featured: [
        {
          name: "All Sale",
          description: "Browse all discounted items",
          to: "/sale",
        },
        {
          name: "Bestsellers",
          description: "Popular items on sale",
          to: "/sale/bestsellers",
        },
      ],
    },
  ];

  return (
    <div className="w-full">
      {/* Promotional Banner */}
      <div className="bg-black text-white py-2 text-center text-sm">
        <Link to={promoBanner.link} className="hover:underline">
          {promoBanner.text}
        </Link>
      </div>

      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Navigation */}
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold">
                URBAN SOLE
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavigationMenu>
                <NavigationMenuList>
                  {navLinks.map((link) => (
                    <NavigationMenuItem key={link.to}>
                      <NavigationMenuTrigger>{link.label}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                          <div className="flex items-center gap-2 mb-4">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Shop {link.label}</span>
                          </div>
                          {link.featured.map((item) => (
                            <NavigationMenuLink key={item.to} asChild>
                              <Link
                                to={item.to}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline hover:bg-accent hover:text-accent-foreground"
                              >
                                <div className="font-medium">{item.name}</div>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Search, Account, Wishlist, Cart */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-[200px] lg:w-[300px] pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Mobile Search Toggle */}
              <button
                className="md:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-6 w-6" />
              </button>

              {/* Account */}
              <Link to={isAuthenticated ? "/profile" : "/login"}>
                <div className="flex items-center space-x-1">
                  <User className="h-6 w-6" />                  <span className="hidden lg:inline text-sm">
                    {isAuthenticated ? `Hi, ${user?.firstName || 'User'}` : "Account"}
                  </span>
                </div>
              </Link>
              {/* Wishlist */}
              <Link to="/wishlist" className="hidden sm:flex items-center space-x-1">
                <div className="relative">
                  <Heart className="h-6 w-6" />
                  {!wishlistLoading && wishlist?.items?.length > 0 && (
                    <Badge 
                      variant="secondary"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                    >
                      {wishlist.items.length}
                    </Badge>
                  )}
                </div>
              </Link>{/* Cart */}
              <Link to="/cart" className="flex items-center space-x-1">
                <div className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  {!cartLoading && cartItems.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                    >
                      {cartItems.length}
                    </Badge>
                  )}
                </div>
                <span className="hidden lg:inline text-sm">Cart</span>
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden py-4">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10"
              />
              <Search className="absolute left-7 top-[72px] h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/new-arrivals"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                New Arrivals
              </Link>
              <Link
                to="/men"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Men
              </Link>
              <Link
                to="/women"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Women
              </Link>
              <Link
                to="/sale"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Sale
              </Link>
              <Link
                to="/brands"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Brands
              </Link>
              <Link
                to="/release-calendar"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Release Calendar
              </Link>
              <Link
                to="/size-guide"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Size Guide
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;