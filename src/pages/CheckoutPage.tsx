
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  const handleSubmit = async (values: any) => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Handle successful payment
      toast.success('Order placed successfully!', {
        description: 'Thank you for your purchase.',
        icon: <CheckCircle2 className="h-4 w-4" />,
        duration: 5000,
      });
      
      // In a real app, we would save the order to the database
      if (isAuthenticated) {
        console.log(`Saving order for user: ${user?.id}`);
        // This would be an API call in a real app
      }
      
      clearCart();
      navigate('/');
    } catch (error) {
      toast.error('Payment processing failed', {
        description: 'Please try again or use a different payment method.',
        icon: <AlertCircle className="h-4 w-4" />,
      });
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {!isAuthenticated && (
        <div className="mb-8 p-4 bg-muted rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Already have an account?</h2>
              <p className="text-muted-foreground">Sign in for a faster checkout experience</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Tabs defaultValue="shipping" className="mb-6">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              
              <TabsContent value="shipping">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <CheckoutForm onSubmit={handleSubmit} isProcessing={isProcessing} />
              </TabsContent>
              
              <TabsContent value="payment">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="card-payment"
                      name="payment-method"
                      value="card"
                      className="h-4 w-4 border-gray-300 focus:ring-indigo-500"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <label htmlFor="card-payment" className="block text-sm font-medium">
                      Credit/Debit Card
                    </label>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="border rounded-md p-4 mt-2">
                      <p className="text-sm text-muted-foreground mb-4">
                        In a real app, this would be a Stripe Elements form or similar
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium">Card Number</label>
                          <input 
                            type="text" 
                            placeholder="1234 5678 9012 3456" 
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium">Expiry Date</label>
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium">CVC</label>
                            <input 
                              type="text" 
                              placeholder="123" 
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="paypal-payment"
                      name="payment-method"
                      value="paypal"
                      className="h-4 w-4 border-gray-300 focus:ring-indigo-500"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                    />
                    <label htmlFor="paypal-payment" className="block text-sm font-medium">
                      PayPal
                    </label>
                  </div>
                  
                  {paymentMethod === 'paypal' && (
                    <div className="border rounded-md p-4 mt-2">
                      <p className="text-sm text-muted-foreground">
                        You will be redirected to PayPal to complete your purchase securely.
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-6" 
                    onClick={() => handleSubmit({})} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Complete Order'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="review">
                <h2 className="text-xl font-semibold mb-4">Order Review</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium">Items</h3>
                    <ul className="mt-2 space-y-2">
                      {cartItems.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <div>
                            <span className="font-medium">{item.quantity}x </span>
                            {item.name}
                          </div>
                          <div>${(item.price * item.quantity).toFixed(2)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubmit({})} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
