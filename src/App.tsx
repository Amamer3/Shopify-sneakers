import React, { Suspense } from 'react';
import { AnalyticsWrapper } from "./lib/analytics.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ThemeProvider } from "./hooks/use-theme";
import ErrorBoundary from "./components/ErrorBoundary";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Loader } from "lucide-react";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { WebVitalsProvider } from "./components/WebVitalsProvider";

// Lazy load all pages
const HomePage = React.lazy(() => import("./pages/HomePage"));
const ProductDetailPage = React.lazy(() => import("./pages/ProductDetailPage"));
const CartPage = React.lazy(() => import("./pages/CartPage"));
const CheckoutPage = React.lazy(() => import("./pages/CheckoutPage"));
const CategoryPage = React.lazy(() => import("./pages/CategoryPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const SignupPage = React.lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const VerifyEmailPage = React.lazy(() => import("./pages/VerifyEmailPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const OrdersPage = React.lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = React.lazy(() => import("./pages/OrderDetailPage"));
const PaymentMethodsPage = React.lazy(() => import("./pages/PaymentMethodsPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader className="h-8 w-8 animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (  <ErrorBoundary>
    <AnalyticsWrapper>
      <BrowserRouter>
        <WebVitalsProvider>
          <ThemeProvider defaultTheme="light">
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <PaymentProvider>
                  <OrderProvider>
                    <CartProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner position="top-right" closeButton={true} />
                        <div className="flex flex-col min-h-screen bg-background text-foreground">
                          <Navbar />
                          <main className="flex-grow">
                            <Suspense fallback={<PageLoader />}>
                              <Routes>
                                {/* Public Routes */}
                                <Route 
                                  path="/" 
                                  element={<HomePage />}
                                  errorElement={<RouteErrorBoundary />} 
                                />
                                <Route 
                                  path="/product/:id" 
                                  element={<ProductDetailPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/cart" 
                                  element={<CartPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/checkout" 
                                  element={<CheckoutPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/men" 
                                  element={<CategoryPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/women" 
                                  element={<CategoryPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/trending" 
                                  element={<CategoryPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                
                                {/* Auth Routes */}
                                <Route 
                                  path="/login" 
                                  element={<LoginPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/signup" 
                                  element={<SignupPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/forgot-password" 
                                  element={<ForgotPasswordPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/reset-password" 
                                  element={<ResetPasswordPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                <Route 
                                  path="/verify-email" 
                                  element={<VerifyEmailPage />}
                                  errorElement={<RouteErrorBoundary />}
                                />
                                
                                {/* Protected Routes */}
                                <Route
                                  path="/profile"
                                  element={
                                    <PrivateRoute>
                                      <ProfilePage />
                                    </PrivateRoute>
                                  }
                                  errorElement={<RouteErrorBoundary />}
                                />                            <Route
                              path="/orders"
                              element={
                                <PrivateRoute>
                                  <OrdersPage />
                                </PrivateRoute>
                              }
                              errorElement={<RouteErrorBoundary />}
                            />
                            <Route
                              path="/orders/:orderId"
                              element={
                                <PrivateRoute>
                                  <OrderDetailPage />
                                </PrivateRoute>
                              }
                              errorElement={<RouteErrorBoundary />}
                            />
                                <Route
                                  path="/payment-methods"
                                  element={
                                    <PrivateRoute>
                                      <PaymentMethodsPage />
                                    </PrivateRoute>
                                  }
                                  errorElement={<RouteErrorBoundary />}
                                />
                                
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </Suspense>
                          </main>
                          <Footer />
                        </div>
                      </TooltipProvider>
                    </CartProvider>
                  </OrderProvider>
                </PaymentProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </WebVitalsProvider>
      </BrowserRouter>
    </AnalyticsWrapper>
  </ErrorBoundary>
);

export default App;
