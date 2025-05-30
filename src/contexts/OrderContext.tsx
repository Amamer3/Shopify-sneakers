import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { orderService } from '../services/orders';
import { logger } from '../lib/logger';
import { validateToken, handleApiError, AUTH_TOKEN_KEY } from '../lib/tokenUtils';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

// Types
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

interface GetOrdersResponse {
  data?: Order[];
  message?: string;
  errorCode?: string;
  // missing success property
}

interface CreateOrderData {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: string;
  notes?: string;
}

// Query keys for React Query
const orderKeys = {
  all: ['orders'] as const,
  myOrders: () => [...orderKeys.all, 'my'] as const,
  order: (id: string) => [...orderKeys.all, id] as const,
};

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  loadingStates: {
    fetching: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };
  error: string | null;
  refetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  createOrder: (data: CreateOrderData) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
  });

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch user's orders
  const { data: orders = [], isLoading: isFetching } = useQuery({
    queryKey: orderKeys.myOrders(),
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        return [];
      }
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token || !(await validateToken(token))) {
        toast.error('Session expired', { description: 'Please log in again' });
        logout();
        return [];
      }
      try {
        setLoadingStates((prev) => ({ ...prev, fetching: true }));
        const response: OrderServiceResponse<Order[]> = await orderService.getMyOrders();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.errorCode || response.message || 'Failed to fetch orders');
      } catch (error: unknown) {
        const errorMessage = handleApiError(error, 'Failed to fetch orders');
        setError(errorMessage);
        logger.error('Error fetching orders:', { error, userId: user.uid, route: '/orders' });
        throw error;
      } finally {
        setLoadingStates((prev) => ({ ...prev, fetching: false }));
      }
    },
    enabled: isAuthenticated && !!user,
    retry: 1,
  });

  // Sync orders on window focus
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleFocus = () => refetchOrders();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated]);

  const refetchOrders = async () => {
    try {
      await queryClient.refetchQueries({ queryKey: orderKeys.myOrders() });
    } catch (error: unknown) {
      const errorMessage = handleApiError(error, 'Failed to refresh orders');
      setError(errorMessage);
      logger.error('Failed to refresh orders:', { error, userId: user?.uid, route: '/orders' });
      toast.error('Failed to refresh orders', { description: errorMessage, icon: <AlertTriangle className="h-4 w-4" /> });
    }
  };

  const getOrderById = useCallback((id: string) => {
    return orders.find((order) => order.id === id);
  }, [orders]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderData) => {
      if (!isAuthenticated || !user) {
        throw new Error('UNAUTHENTICATED');
      }
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token || !(await validateToken(token))) {
        toast.error('Session expired', { description: 'Please log in again' });
        logout();
        throw new Error('SESSION_EXPIRED');
      }
      const response: OrderServiceResponse<Order> = await orderService.createOrder(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.errorCode || response.message || 'Failed to create order');
    },
    onMutate: () => {
      setLoadingStates((prev) => ({ ...prev, creating: true }));
      setError(null);
    },
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
      queryClient.setQueryData(orderKeys.order(newOrder.id), newOrder);
      toast.success('Order created successfully', { icon: <CheckCircle2 className="h-4 w-4" /> });
    },
    onError: (error: unknown) => {
      const errorMessage = handleApiError(error, 'Failed to create order');
      setError(errorMessage);
      logger.error('Failed to create order:', { error, userId: user?.uid, route: '/orders/create' });
      toast.error('Failed to create order', { description: errorMessage, icon: <AlertTriangle className="h-4 w-4" /> });
    },
    onSettled: () => {
      setLoadingStates((prev) => ({ ...prev, creating: false }));
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      if (!isAuthenticated || !user) {
        throw new Error('UNAUTHENTICATED');
      }
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token || !(await validateToken(token))) {
        toast.error('Session expired', { description: 'Please log in again' });
        logout();
        throw new Error('SESSION_EXPIRED');
      }
      const response: OrderServiceResponse = await orderService.updateOrderStatus(orderId, status);
      if (response.success) {
        return { orderId, status };
      }
      throw new Error(response.errorCode || response.message || 'Failed to update order status');
    },
    onMutate: () => {
      setLoadingStates((prev) => ({ ...prev, updating: true }));
      setError(null);
    },
    onSuccess: ({ orderId, status }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
      queryClient.setQueryData<Order | undefined>(orderKeys.order(orderId), (old) =>
        old ? { ...old, status, updatedAt: new Date().toISOString() } : undefined,
      );
      toast.success('Order status updated', { icon: <CheckCircle2 className="h-4 w-4" /> });
    },
    onError: (error: unknown) => {
      const errorMessage = handleApiError(error, 'Failed to update order status');
      setError(errorMessage);
      logger.error('Failed to update order status:', { error, userId: user?.uid, route: '/orders/update' });
      toast.error('Failed to update order status', { description: errorMessage, icon: <AlertTriangle className="h-4 w-4" /> });
    },
    onSettled: () => {
      setLoadingStates((prev) => ({ ...prev, updating: false }));
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!isAuthenticated || !user) {
        throw new Error('UNAUTHENTICATED');
      }
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token || !(await validateToken(token))) {
        toast.error('Session expired', { description: 'Please log in again' });
        logout();
        throw new Error('SESSION_EXPIRED');
      }
      const response: OrderServiceResponse = await orderService.deleteOrder(orderId);
      if (response.success) {
        return orderId;
      }
      throw new Error(response.errorCode || response.message || 'Failed to delete order');
    },
    onMutate: () => {
      setLoadingStates((prev) => ({ ...prev, deleting: true }));
      setError(null);
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
      queryClient.removeQueries({ queryKey: orderKeys.order(orderId) });
      toast.success('Order deleted', { icon: <XCircle className="h-4 w-4" /> });
    },
    onError: (error: unknown) => {
      const errorMessage = handleApiError(error, 'Failed to delete order');
      setError(errorMessage);
      logger.error('Failed to delete order:', { error, userId: user?.uid, route: '/orders/delete' });
      toast.error('Failed to delete order', { description: errorMessage, icon: <AlertTriangle className="h-4 w-4" /> });
    },
    onSettled: () => {
      setLoadingStates((prev) => ({ ...prev, deleting: false }));
    },
  });

  const createOrder = (data: CreateOrderData) => createOrderMutation.mutateAsync(data);
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatusMutation.mutateAsync({ orderId, status });
  };
  const deleteOrder = async (orderId: string) => {
    await deleteOrderMutation.mutateAsync(orderId);
  };

  const value: OrderContextType = {
    orders,
    isLoading: isFetching,
    loadingStates,
    error,
    refetchOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};