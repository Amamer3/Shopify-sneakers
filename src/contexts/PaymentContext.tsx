import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'verve' | 'mpesa' | 'airtel-money' | 'mtn-momo' | 'orange-money' | 'tigo-pesa' | 'vodafone-cash' | 'wave';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  holderName: string;
}

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  addPaymentMethod: (data: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('paymentMethods');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPaymentMethod = async (data: Omit<PaymentMethod, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would make an API call to add the payment method
      const newPaymentMethod = {
        ...data,
        id: `pm-${Date.now()}`,
      };

      // If this is the first payment method, make it default
      if (paymentMethods.length === 0) {
        newPaymentMethod.isDefault = true;
      }

      const updatedMethods = [...paymentMethods, newPaymentMethod];
      setPaymentMethods(updatedMethods);
      localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
      toast.success('Payment method added successfully');
    } catch (err) {
      setError('Failed to add payment method');
      toast.error('Failed to add payment method');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removePaymentMethod = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would make an API call to remove the payment method
      const methodToRemove = paymentMethods.find(m => m.id === id);
      if (!methodToRemove) {
        throw new Error('Payment method not found');
      }

      const updatedMethods = paymentMethods.filter(m => m.id !== id);
      
      // If we removed the default method and there are other methods, make the first one default
      if (methodToRemove.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }

      setPaymentMethods(updatedMethods);
      localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
      toast.success('Payment method removed successfully');
    } catch (err) {
      setError('Failed to remove payment method');
      toast.error('Failed to remove payment method');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would make an API call to update the default method
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }));
      setPaymentMethods(updatedMethods);
      localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
      toast.success('Default payment method updated');
    } catch (err) {
      setError('Failed to update default payment method');
      toast.error('Failed to update default payment method');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentMethods,
        isLoading,
        error,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
