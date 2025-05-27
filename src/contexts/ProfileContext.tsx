import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/ProfileService';
import type { Profile, AddressInput, PaymentMethodInput, UpdateProfileData, PaginatedOrders } from '@/types/models';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

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
  orders: PaginatedOrders | null;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

const ProfileContext = React.createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Profile query
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  // Orders query
  const {
    data: orders,
    isLoading: isOrdersLoading
  } = useQuery({
    queryKey: ['orders', currentPage],
    queryFn: () => profileService.getOrders(currentPage, pageSize),
    enabled: isAuthenticated && !!profile,
    retry: false
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    }
  });

  const addAddressMutation = useMutation({
    mutationFn: profileService.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Address added successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add address',
        variant: 'destructive'
      });
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }: { id: string; address: AddressInput }) => 
      profileService.updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Address updated successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update address',
        variant: 'destructive'
      });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: profileService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Address deleted successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete address',
        variant: 'destructive'
      });
    }
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: profileService.addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Payment method added successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add payment method',
        variant: 'destructive'
      });
    }
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: profileService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Payment method deleted successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payment method',
        variant: 'destructive'
      });
    }
  });

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setCurrentPage(1);
    setPageSize(size);
  }, []);

  const contextValue = React.useMemo(() => ({
    profile: profile ?? null,
    isLoading: isProfileLoading || isOrdersLoading,
    error: profileError ?? null,
    updateProfile: async (data: UpdateProfileData) => {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to update your profile',
          variant: 'destructive'
        });
        return;
      }
      await updateProfileMutation.mutateAsync(data);
    },
    addAddress: async (address: AddressInput) => {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to add an address',
          variant: 'destructive'
        });
        return;
      }
      await addAddressMutation.mutateAsync(address);
    },
    updateAddress: async (id: string, address: AddressInput) => {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to update an address',
          variant: 'destructive'
        });
        return;
      }
      await updateAddressMutation.mutateAsync({ id, address });
    },
    deleteAddress: async (id: string) => {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to delete an address',
          variant: 'destructive'
        });
        return;
      }
      await deleteAddressMutation.mutateAsync(id);
    },
    addPaymentMethod: async (paymentMethod: PaymentMethodInput) => {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to add a payment method',
          variant: 'destructive'
        });
        return;
      }
      await addPaymentMethodMutation.mutateAsync(paymentMethod);
    },
    deletePaymentMethod: async (id: string) => {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to delete a payment method',
          variant: 'destructive'
        });
        return;
      }
      await deletePaymentMethodMutation.mutateAsync(id);
    },
    orders: orders ?? null,
    currentPage,
    pageSize,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange
  }), [
    profile, isProfileLoading, isOrdersLoading, profileError, orders,
    currentPage, pageSize, isAuthenticated, toast,
    handlePageChange, handlePageSizeChange,
    updateProfileMutation, addAddressMutation, updateAddressMutation,
    deleteAddressMutation, addPaymentMethodMutation, deletePaymentMethodMutation
  ]);

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = React.useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}