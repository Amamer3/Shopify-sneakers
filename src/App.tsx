
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./hooks/use-theme";
import ErrorBoundary from "./components/ErrorBoundary";

// Layouts and Pages
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CategoryPage from "./pages/CategoryPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-right" closeButton={true} />
              <BrowserRouter>
                <div className="flex flex-col min-h-screen bg-background text-foreground">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/men" element={<CategoryPage />} />
                      <Route path="/women" element={<CategoryPage />} />
                      <Route path="/trending" element={<CategoryPage />} />
                      
                      {/* Auth Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      
                      {/* Protected Routes */}
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/payment-methods" element={<PaymentMethodsPage />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
