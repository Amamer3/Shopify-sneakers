import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { paymentService } from '@/services/payment';
import type { Transaction } from '@/types/payment';
import { socketService } from '@/services/socket.service';

interface PaymentContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  initializePayment: (amount: number) => Promise<string>;
  verifyPayment: (reference: string) => Promise<boolean>;
  refreshTransactions: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await paymentService.getTransactions();
      setTransactions(response.transactions);
      setError(null);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const initializePayment = useCallback(async (amount: number) => {
    if (!user?.email) throw new Error('User email is required');

    try {
      const response = await paymentService.initializePayment({
        email: user.email,
        amount,
        metadata: {
          userId: user.id
        }
      });
      return response.data.authorization_url;
    } catch (err) {
      setError('Failed to initialize payment');
      throw err;
    }
  }, [user]);

  const verifyPayment = useCallback(async (reference: string) => {
    try {
      const response = await paymentService.verifyPayment(reference);
      if (response.status) {
        await refreshTransactions();
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to verify payment');
      return false;
    }
  }, [refreshTransactions]);

  // Setup socket listeners for real-time payment updates
  useEffect(() => {
    if (!socketService.getState().connected) return;

    const handlePaymentUpdate = (transaction: Transaction) => {
      setTransactions(prev => {
        const index = prev.findIndex(t => t.reference === transaction.reference);
        if (index === -1) return [...prev, transaction];
        const updated = [...prev];
        updated[index] = transaction;
        return updated;
      });

      toast.success(`Payment ${transaction.status}: ${transaction.reference}`);

      // Invalidate queries to refresh related data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };    socketService.on('payment:update', handlePaymentUpdate);

    return () => {
      socketService.off('payment:update', handlePaymentUpdate);
    };
  }, [queryClient]);

  // Load initial transactions
  useEffect(() => {
    if (user && socketService.getState().connected) {
      refreshTransactions();
    }
  }, [user, refreshTransactions]);

  return (
    <PaymentContext.Provider
      value={{
        transactions,
        isLoading,
        error,
        initializePayment,
        verifyPayment,
        refreshTransactions,
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
