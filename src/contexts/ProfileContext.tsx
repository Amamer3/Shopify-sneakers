import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/ProfileService';
import { AddressInput, PaymentMethodInput, Profile, UpdateProfileData } from '@/types/models';
import { useToast } from '../components/ui/use-toast';

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  addAddress: (address: AddressInput) => Promise<void>;
  updateAddress: (id: string, address: AddressInput) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  addPaymentMethod: (paymentMethod: PaymentMethodInput) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
}

const ProfileContext = React.createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile, Error>({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (address: AddressInput) => profileService.addAddress(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Address added',
        description: 'Your address has been successfully added.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add address',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }: { id: string; address: AddressInput }) =>
      profileService.updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Address updated',
        description: 'Your address has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update address',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => profileService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Address deleted',
        description: 'Your address has been successfully deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete address',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: (paymentMethod: PaymentMethodInput) =>
      profileService.addPaymentMethod(paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Payment method added',
        description: 'Your payment method has been successfully added.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add payment method',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: (id: string) => profileService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Payment method deleted',
        description: 'Your payment method has been successfully deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete payment method',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const value: ProfileContextType = {
    profile: profile ?? null,
    isLoading,
    error: error ?? null,    updateProfile: async (data: UpdateProfileData) => {
      await updateProfileMutation.mutateAsync(data);
    },
    addAddress: async (address: AddressInput) => {
      await addAddressMutation.mutateAsync(address);
    },
    updateAddress: async (id: string, address: AddressInput) => {
      await updateAddressMutation.mutateAsync({ id, address });
    },
    deleteAddress: async (id: string) => {
      await deleteAddressMutation.mutateAsync(id);
    },
    addPaymentMethod: async (paymentMethod: PaymentMethodInput) => {
      await addPaymentMethodMutation.mutateAsync(paymentMethod);
    },
    deletePaymentMethod: async (id: string) => {
      await deletePaymentMethodMutation.mutateAsync(id);
    },
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = React.useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}