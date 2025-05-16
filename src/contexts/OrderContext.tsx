import React, { createContext, useContext, useState } from 'react';
import { profileService } from '@/services/profile';
import type { PaginatedOrders, Order } from '@/types/models';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type OrderContextType = {
  orders: PaginatedOrders | null;
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  totalPages: number;
  totalOrders: number;
  filterOrders: (status: string, dateRange: { start: Date; end: Date } | null) => Order[];
  sortOrders: (by: 'date' | 'total' | 'status', direction: 'asc' | 'desc') => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortedOrders, setSortedOrders] = useState<Order[]>([]);
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useQuery<PaginatedOrders, Error>({
    queryKey: ['orders', { page: currentPage, pageSize }],
    queryFn: () => profileService.getOrders(currentPage, pageSize),
  });

  // Update sortedOrders when orders change
  React.useEffect(() => {
    if (orders?.items) {
      setSortedOrders(orders.items);
    }
  }, [orders]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch orders';
      toast.error('Unable to load orders', {
        description: message
      });
    }
  }, [error]);

  // Set page function with validation
  const setPage = (page: number) => {
    if (page < 1 || (orders && page > orders.totalPages)) return;
    setCurrentPage(page);
  };

  // Set page size function
  const setSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Refetch orders function with proper error handling
  const refetchOrders = async () => {
    try {
      await refetch();
      toast.success('Orders refreshed');
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to refresh orders', {
        description: error.message || 'Please try again later'
      });
    }
  };

  // Get order by ID function with type safety
  const getOrderById = (id: string): Order | undefined => {
    return orders?.items?.find(order => order.id === id);
  };

  // Filter orders based on status and date range
  const filterOrders = (status: string, dateRange: { start: Date; end: Date } | null) => {
    if (!orders?.items) return [];

    return orders.items.filter(order => {
      const matchesStatus = status === 'all' || order.status.toLowerCase() === status.toLowerCase();
      
      if (dateRange) {
        const orderDate = new Date(order.date);
        const matchesDateRange = orderDate >= dateRange.start && orderDate <= dateRange.end;
        return matchesStatus && matchesDateRange;
      }
      
      return matchesStatus;
    });
  };

  // Sort orders by specified field and direction
  const sortOrders = (by: 'date' | 'total' | 'status', direction: 'asc' | 'desc') => {
    if (!orders?.items) return;

    const sorted = [...orders.items].sort((a, b) => {
      let comparison = 0;
      switch (by) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return direction === 'asc' ? comparison : -comparison;
    });

    setSortedOrders(sorted);
  };

  // Pre-fetch next page
  React.useEffect(() => {
    if (orders && currentPage < orders.totalPages) {
      const nextPage = currentPage + 1;
      void queryClient.prefetchQuery<PaginatedOrders>({
        queryKey: ['orders', { page: nextPage, pageSize }],
        queryFn: () => profileService.getOrders(nextPage, pageSize),
      });
    }
  }, [currentPage, orders, pageSize, queryClient]);

  const value = React.useMemo(() => ({
    orders,
    isLoading,
    error: error || null,
    currentPage,
    pageSize,
    setPage,
    setPageSize: setSize,
    refetchOrders,
    getOrderById,
    totalPages: orders?.totalPages || 0,
    totalOrders: orders?.total || 0,
    filterOrders,
    sortOrders
  }), [orders, isLoading, error, currentPage, pageSize, sortedOrders]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
