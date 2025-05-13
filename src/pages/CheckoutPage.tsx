
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  const handleSubmit = async (values: any) => {
    setIsProcessing(true);
    
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Order placed successfully!', {
      description: 'Thank you for your purchase.',
      icon: <CheckCircle2 className="h-4 w-4" />,
      duration: 5000,
    });
    
    clearCart();
    navigate('/');
    setIsProcessing(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <CheckoutForm onSubmit={handleSubmit} isProcessing={isProcessing} />
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
