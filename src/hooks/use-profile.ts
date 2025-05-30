import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile';
import type { PaginatedOrders, Profile } from '../types/models';
import type { UserProfile, ProfileServiceError, Address } from '../services/profile';
import type { GetOrdersResponse } from '../types/api';
import { toast } from 'sonner';

const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all] as const,
  orders: (page: number, pageSize: number) => [...profileKeys.all, 'orders', page, pageSize] as const,
};

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  marketingPreferences?: {
    email: boolean;
    sms: boolean;
  };
}

export function useProfile() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch profile data
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    isError,
  } = useQuery<UserProfile, Error>({
    queryKey: profileKeys.profile(),
    queryFn: async () => {
      const profile = await profileService.getProfile();
      return {
        ...profile,
        recentOrders: [], // Add missing required field
      } as UserProfile;
    },
    retry: (failureCount, error) => {
      if ((error as ProfileServiceError).status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Fetch paginated orders
  const {
    data: orders,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useQuery<PaginatedOrders>({
    queryKey: profileKeys.orders(currentPage, pageSize),
    queryFn: async () => {
      const data = await profileService.getOrders(currentPage, pageSize) as GetOrdersResponse;
      return {
        items: data.orders,
        total: data.pagination.total,
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
        totalPages: data.pagination.totalPages,
      };
    },
    enabled: !!profile?.id,
  });

  // Update profile mutation
  const {
    mutate: updateProfileData,
    isPending: isUpdating,
  } = useMutation<UserProfile, Error, UpdateProfileData>({
    mutationFn: async (data) => {
      const updated = await profileService.updateProfile(data);
      return {
        ...updated,
        recentOrders: profile?.recentOrders ?? [],
      } as UserProfile;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.profile(), updatedProfile);
      toast.success('Profile updated', {
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (err: Error) => {
      toast.error('Update failed', {
        description: err.message || 'Failed to update profile',
      });
    },
  });

  // Address mutations
  const addAddressMutation = useMutation({
    mutationFn: profileService.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      toast.success('Address added', {
        description: 'Your new address has been saved',
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }: { id: string; address: Partial<Address> }) =>
      profileService.updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      toast.success('Address updated', {
        description: 'Your address has been updated successfully',
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: profileService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      toast.success('Address deleted', {
        description: 'The address has been removed',
      });
    },
  });

  return {
    profile,
    isLoadingProfile,
    profileError,
    isError,
    orders,
    isLoadingOrders,
    ordersError,
    updateProfileData,
    isUpdating,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    addAddressMutation,
    updateAddressMutation,
    deleteAddressMutation,
  };
}
