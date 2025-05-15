import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  size?: string;
  color?: string;
}

export interface OrderTrackingEvent {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  location: string;
  description: string;
}

export interface Order {
  customer: any;
  id: string;
  userId: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  trackingHistory: OrderTrackingEvent[];
  paymentMethod: {
    type: string;
    last4?: string;
  };
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  getOrderById: (id: string) => Order | undefined;
  filterOrders: (status?: string, dateRange?: { start: Date; end: Date }) => Order[];
  sortOrders: (by: 'date' | 'total' | 'status', direction: 'asc' | 'desc') => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Mock data with more realistic details
const mockOrders: Order[] = [
  {
      id: 'ORD-2025-001',
      userId: 'user123',
      date: '2025-05-14',
      status: 'shipped',
      total: 299.98,
      items: [
          {
              id: 'item1',
              name: 'Urban Runner X1',
              quantity: 1,
              price: 149.99,
              image: '/placeholder.svg',
              size: '42',
              color: 'Black/Red'
          },
          {
              id: 'item2',
              name: 'Street Walker Pro',
              quantity: 1,
              price: 149.99,
              image: '/placeholder.svg',
              size: '43',
              color: 'White/Blue'
          }
      ],
      shippingAddress: {
          street: '123 Main St',
          city: 'Nairobi',
          state: 'Nairobi',
          zipCode: '00100',
          country: 'Kenya'
      },
      trackingNumber: '1Z999AA1234567890',
      trackingHistory: [
          {
              status: 'shipped',
              date: '2025-05-14T10:00:00',
              location: 'Nairobi, Kenya',
              description: 'Package in transit'
          },
          {
              status: 'processing',
              date: '2025-05-13T15:30:00',
              location: 'Warehouse',
              description: 'Package left warehouse'
          },
          {
              status: 'pending',
              date: '2025-05-12T09:00:00',
              location: 'Online',
              description: 'Order confirmed'
          }
      ],
      paymentMethod: {
          type: 'mpesa',
          last4: '1234'
      },
      customer: undefined
  },
  {
      id: 'ORD-2025-002',
      userId: 'user123',
      date: '2025-05-10',
      status: 'delivered',
      total: 199.99,
      items: [
          {
              id: 'item3',
              name: 'Air Comfort Elite',
              quantity: 1,
              price: 199.99,
              image: '/placeholder.svg',
              size: '41',
              color: 'Grey/White'
          }
      ],
      shippingAddress: {
          street: '456 Park Ave',
          city: 'Lagos',
          state: 'Lagos',
          zipCode: '100001',
          country: 'Nigeria'
      },
      trackingNumber: '1Z999AA1234567891',
      trackingHistory: [
          {
              status: 'delivered',
              date: '2025-05-14T14:00:00',
              location: 'Lagos, Nigeria',
              description: 'Package delivered'
          },
          {
              status: 'shipped',
              date: '2025-05-12T10:00:00',
              location: 'Lagos, Nigeria',
              description: 'Out for delivery'
          },
          {
              status: 'processing',
              date: '2025-05-11T15:30:00',
              location: 'Warehouse',
              description: 'Package left warehouse'
          }
      ],
      paymentMethod: {
          type: 'card',
          last4: '4242'
      },
      customer: undefined
  }
];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch orders
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrders);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };
  const filterOrders = (status?: string, dateRange?: { start: Date; end: Date }) => {
    return orders.filter(order => {
      const matchesStatus = !status || status === 'all' || order.status === status.toLowerCase();
      const matchesDate = !dateRange || (
        new Date(order.date) >= dateRange.start &&
        new Date(order.date) <= dateRange.end
      );
      return matchesStatus && matchesDate;
    });
  };

  const sortOrders = (by: 'date' | 'total' | 'status', direction: 'asc' | 'desc') => {
    const sorted = [...orders].sort((a, b) => {
      if (by === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (by === 'total') {
        return a.total - b.total;
      }
      // by status
      return a.status.localeCompare(b.status);
    });

    if (direction === 'desc') {
      sorted.reverse();
    }

    setOrders(sorted);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        error,
        getOrderById,
        filterOrders,
        sortOrders,
      }}
    >
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
