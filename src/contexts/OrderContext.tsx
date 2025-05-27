import React, { createContext, useContext, useState, useEffect } from 'react';
import { profileService } from '../services/profile';
import type { Order, OrderStatus } from '../types/models';
import type { OrderHistoryResponse, ExtendedOrder, GetOrdersResponse, PaginatedResponse } from '../types/api';
import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Package, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { logger } from '../lib/logger';

type OrderContextType = {
  orders: ExtendedOrder[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refetchOrders: () => Promise<void>;
  getOrderById: (id: string) => ExtendedOrder | undefined;
  totalPages: number;
  totalOrders: number;
  filterOrders: (status: string, dateRange: { start: Date; end: Date } | null) => ExtendedOrder[];
  sortOrders: (by: 'date' | 'total' | 'status', direction: 'asc' | 'desc') => void;
  trackOrder: (orderId: string) => void;
};

type OrderQueryResponse = {
  orders: {
    items: ExtendedOrder[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: { page: number; pageSize: number }) =>
    [...orderKeys.lists(), { ...filters }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(10);
  const [sortedOrders, setSortedOrders] = useState<ExtendedOrder[]>([]);
  const [trackedOrders, setTrackedOrders] = useState<Set<string>>(new Set());
  const [hasError, setHasError] = useState(false);
  
  const queryClient = useQueryClient();
  const { addListener } = useSocket();
  const { user } = useAuth();
  
  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: orderKeys.list({ page: currentPage, pageSize: internalPageSize }),
    queryFn: async () => {
      try {
        logger.debug('Fetching orders', { page: currentPage, pageSize: internalPageSize });
        const response = await profileService.getOrders(currentPage, internalPageSize);
        logger.debug('Orders fetched successfully', { count: response.total });
        
        const transformedResponse: GetOrdersResponse = {
          orders: (response as any as PaginatedResponse<Order>).items.map(order => ({
            ...order,
            userId: user?.id || '',
            paymentStatus: 'pending',
            items: order.items.map(item => ({
              ...item,
              product: {
                id: item.productId,
                name: item.name,
                description: item.description || '',
                price: item.price,
                image: item.image
              }
            })),
            shippingAddress: {
              ...order.shippingAddress,
              line1: order.shippingAddress.street,
              postalCode: order.shippingAddress.zipCode
            }
          })) as ExtendedOrder[],
          pagination: {
            total: response.total,
            page: response.page,
            pageSize: internalPageSize,
            totalPages: Math.ceil(response.total / internalPageSize)
          }
        };
        
        setHasError(false);
        return transformedResponse;
      } catch (err) {
        logger.error('Error fetching orders', { error: err });
        setHasError(true);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Reset error state when changing pages
  useEffect(() => {
    setHasError(false);
  }, [currentPage, internalPageSize]);

  // Derived state
  const ordersData = ordersResponse ? {
    orders: ordersResponse.orders,
    pagination: ordersResponse.pagination
  } : undefined;

  // Socket event handlers
  useEffect(() => {
    if (!user) return;

    const cleanupFunctions: Array<() => void> = [];

    // Listen for order status updates
    cleanupFunctions.push(
      addListener('order:updated', (orderId: string, status: OrderStatus) => {
        handleOrderStatusUpdate(orderId, status);
      })
    );

    // Listen for new orders
    cleanupFunctions.push(
      addListener('order:created', (order: Order) => {
        // Transform Order to ExtendedOrder
        const extendedOrder: ExtendedOrder = {
          ...order,
          userId: user?.id || '',
          paymentStatus: 'pending',
          items: order.items.map(item => ({
            ...item,
            product: {
              id: item.productId,
              name: item.name,
              description: item.description || '',
              price: item.price,
              image: item.image
            }
          })),
          shippingAddress: {
            ...order.shippingAddress,
            line1: order.shippingAddress.street,
            postalCode: order.shippingAddress.zipCode
          }
        };
        handleNewOrder(extendedOrder);
      })
    );

    // Listen for order cancellations
    cleanupFunctions.push(
      addListener('order:cancelled', (orderId: string) => {
        handleOrderCancellation(orderId);
      })
    );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup && cleanup());
    };
  }, [user, addListener]);

  // Handle real-time order status updates
  const handleOrderStatusUpdate = async (orderId: string, status: OrderStatus) => {
    queryClient.setQueryData<GetOrdersResponse>(
      orderKeys.list({ page: currentPage, pageSize: internalPageSize }),
      old => {
        if (!old) return old;
        
        const updatedItems = old.orders.map(order =>
          order.id === orderId ? { ...order, status } : order
        );

        return { 
          orders: updatedItems,
          pagination: old.pagination
        };
      }
    );

    // Show notification if order is being tracked
    if (trackedOrders.has(orderId)) {
      const order = ordersData?.orders.find(o => o.id === orderId);
      if (order) {
        toast.success(`Order status updated`, {
          description: `Order #${orderId.slice(0, 8)} is now ${status}`,
          icon: <RefreshCw className="h-4 w-4" />
        });
      }
    }
  };

  // Handle new orders
  const handleNewOrder = (newOrder: ExtendedOrder) => {
    // Only handle if it's the user's order
    if (newOrder.userId === user?.id) {
      queryClient.setQueryData<GetOrdersResponse>(
        orderKeys.list({ page: currentPage, pageSize: internalPageSize }),
        old => {
          if (!old) return old;
          return {
            orders: [newOrder, ...old.orders],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1
            }
          };
        }
      );

      // Automatically track new orders
      setTrackedOrders(prev => new Set([...prev, newOrder.id]));

      toast.success('Order placed successfully', {
        description: `Order #${newOrder.id.slice(0, 8)} has been created`,
        icon: <Package className="h-4 w-4" />
      });
    }
  };

  // Handle order cancellations
  const handleOrderCancellation = (orderId: string) => {
    queryClient.setQueryData<GetOrdersResponse>(
      orderKeys.list({ page: currentPage, pageSize: internalPageSize }),
      old => {
        if (!old) return old;
        
        const updatedItems = old.orders.map(order =>
          order.id === orderId ? { ...order, status: 'cancelled' as OrderStatus } : order
        );

        return {
          orders: updatedItems,
          pagination: old.pagination
        };
      }
    );

    // Show notification if order is being tracked
    if (trackedOrders.has(orderId)) {
      toast.error(`Order cancelled`, {
        description: `Order #${orderId.slice(0, 8)} has been cancelled`,
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
  };

  // Update sortedOrders when orders change
  useEffect(() => {
    if (ordersData?.orders) {
      setSortedOrders(ordersData.orders);
    }
  }, [ordersData]);

  // Handle errors
  useEffect(() => {
    if (error || hasError) {
      const message = error instanceof Error ? error.message : 'Failed to fetch orders';
      logger.error('Order context error', { error: message });
      toast.error('Unable to load orders', {
        description: message,
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
  }, [error, hasError]);

  // Set page function with validation
  const setPage = (page: number) => {
    if (page < 1 || (ordersData?.pagination.totalPages && page > ordersData.pagination.totalPages)) return;
    setCurrentPage(page);
  };

  // Set page size function
  const setPageSize = (size: number) => {
    setInternalPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Refetch orders function with proper error handling
  const refetchOrders = async () => {
    try {
      await refetch();
      toast.success('Orders refreshed', {
        icon: <CheckCircle2 className="h-4 w-4" />
      });
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to refresh orders', {
        description: error.message || 'Please try again later',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
  };

  // Get order by ID function with type safety
  const getOrderById = (id: string): ExtendedOrder | undefined => {
    return ordersData?.orders.find(order => order.id === id);
  };

  // Track specific order for real-time updates
  const trackOrder = (orderId: string) => {
    setTrackedOrders(prev => new Set([...prev, orderId]));
    toast.success('Order tracking enabled', {
      description: `You will receive updates for order #${orderId.slice(0, 8)}`,
      icon: <RefreshCw className="h-4 w-4" />
    });
  };

  // Filter orders based on status and date range
  const filterOrders = (status: string, dateRange: { start: Date; end: Date } | null): ExtendedOrder[] => {
    if (!ordersData?.orders) return [];

    return ordersData.orders.filter(order => {
      const matchesStatus = status === 'all' || order.status.toLowerCase() === status.toLowerCase();
      
      if (dateRange) {
        const orderDate = new Date(order.date);
        const matchesDateRange = orderDate >= dateRange.start && orderDate <= dateRange.end;
        return matchesStatus && matchesDateRange;
      }
      
      return matchesStatus;
    });
  };

  // Sort orders
  const sortOrders = (by: 'date' | 'total' | 'status', direction: 'asc' | 'desc') => {
    if (!ordersData?.orders) return;

    const sorted = [...ordersData.orders].sort((a, b) => {
      if (by === 'date') {
        return direction === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (by === 'total') {
        return direction === 'asc' ? a.total - b.total : b.total - a.total;
      }
      // Sort by status
      return direction === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    });

    setSortedOrders(sorted);
  };

  const value: OrderContextType = {
    orders: hasError ? [] : (ordersResponse?.orders ?? []),
    pagination: hasError ? null : (ordersResponse?.pagination ?? null),
    isLoading,
    error: hasError ? new Error('Failed to load orders') : error,
    currentPage,
    pageSize: internalPageSize,
    setPage,
    setPageSize,
    refetchOrders,
    getOrderById,
    totalPages: hasError ? 0 : (ordersResponse?.pagination?.totalPages ?? 0),
    totalOrders: hasError ? 0 : (ordersResponse?.pagination?.total ?? 0),
    filterOrders,
    sortOrders,
    trackOrder
  };

  // Return a loading state when initializing
  if (!user) {
    return (
      <OrderContext.Provider value={{
        ...value,
        orders: [],
        pagination: null,
        isLoading: true,
        error: null
      }}>
        {children}
      </OrderContext.Provider>
    );
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
