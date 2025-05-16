import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/ProfileService';
import { Profile, Address, PaymentMethod, PaginatedOrders, UpdateProfileData } from '@/types/models';
import { useToast } from '@/components/ui/use-toast';

export function useProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch profile data
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  });

  // Fetch paginated orders
  const {
    data: orders,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useQuery<PaginatedOrders>({
    queryKey: ['profile', 'orders', currentPage, pageSize],
    queryFn: () => profileService.getOrders(currentPage, pageSize),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Address mutations
  const addAddressMutation = useMutation({
    mutationFn: profileService.addAddress,    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Address Added',
        description: 'Your new address has been saved.',
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }: { id: string; address: Partial<Address> }) =>
      profileService.updateAddress(id, address as any),    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Address Updated',
        description: 'Your address has been updated.',
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: profileService.deleteAddress,    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Address Deleted',
        description: 'The address has been removed.',
      });
    },
  });

  // Payment method mutations
  const addPaymentMethodMutation = useMutation({
    mutationFn: profileService.addPaymentMethod,    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Payment Method Added',
        description: 'Your new payment method has been saved.',
      });
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: profileService.deletePaymentMethod,    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Payment Method Deleted',
        description: 'The payment method has been removed.',
      });
    },
  });

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  return {
    // Profile data and state
    profile,
    isLoadingProfile,
    profileError,
    
    // Orders data and state
    orders,
    isLoadingOrders,
    ordersError,
    currentPage,
    pageSize,
    
    // Profile mutations
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    
    // Address mutations
    addAddress: addAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    isModifyingAddress: addAddressMutation.isPending || updateAddressMutation.isPending || deleteAddressMutation.isPending,
    
    // Payment method mutations
    addPaymentMethod: addPaymentMethodMutation.mutate,
    deletePaymentMethod: deletePaymentMethodMutation.mutate,
    isModifyingPaymentMethod: addPaymentMethodMutation.isPending || deletePaymentMethodMutation.isPending,
    
    // Pagination handlers
    handlePageChange,
    handlePageSizeChange,
  };
}
