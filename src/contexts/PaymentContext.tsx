import React, { createContext, useContext } from 'react';
import { profileService } from '@/services/profile';
import type { PaymentMethod, PaymentMethodInput, UpdateProfileData } from '@/types/models';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: Error | null;
  addPaymentMethod: (data: PaymentMethodInput) => Promise<PaymentMethod>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Get profile data which includes payment methods
  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    select: (data) => data.paymentMethods,
  });

  // Add payment method mutation
  const addMutation = useMutation({
    mutationFn: profileService.addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Payment method added successfully');
    },
    onError: () => {
      toast.error('Failed to add payment method');
    },
  });

  // Remove payment method mutation
  const removeMutation = useMutation({
    mutationFn: profileService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Payment method removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove payment method');
    },
  });
  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const methods = profile?.map(method => ({
        ...method,
        isDefault: method.id === id
      }));
      const updateData: UpdateProfileData = {
        defaultPaymentMethodId: id
      };
      await profileService.updateProfile(updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Default payment method updated');
    },
    onError: () => {
      toast.error('Failed to update default payment method');
    },
  });

  return (
    <PaymentContext.Provider
      value={{        paymentMethods: profile || [],
        isLoading: isLoading || addMutation.isPending || removeMutation.isPending || setDefaultMutation.isPending,
        error: error as Error | null,
        addPaymentMethod: (data) => addMutation.mutateAsync(data),
        removePaymentMethod: (id) => removeMutation.mutateAsync(id),
        setDefaultPaymentMethod: (id) => setDefaultMutation.mutateAsync(id),
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
