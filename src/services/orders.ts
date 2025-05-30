import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/tokenUtils';
import { logger } from '@/lib/logger';

export interface OrderItem {
  productId: string;
  quantity: number;
  price?: number;
  productDetails?: {
    name: string;
    image?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shippingAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetOrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: string;
  notes?: string;
}

const ORDERS_API = '/api/orders';

const EMPTY_ORDERS_RESPONSE: GetOrdersResponse = {
  orders: [],
  pagination: {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  }
};

export const orderService = {
  // Get all orders (now accessible to authenticated users)
  async getAllOrders(): Promise<Order[]> {
    const response = await api.get(ORDERS_API);
    return response.data;
  },

  // Get current user's orders
  async getMyOrders(): Promise<GetOrdersResponse> {
    if (!isAuthenticated()) {
      return EMPTY_ORDERS_RESPONSE;
    }

    try {
      const response = await api.get('/api/orders/my-orders');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch orders:', error);
      return EMPTY_ORDERS_RESPONSE;
    }
  },

  // Get single order
  async getOrder(orderId: string): Promise<Order> {
    const response = await api.get(`${ORDERS_API}/${orderId}`);
    return response.data;
  },

  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await api.post(ORDERS_API, orderData);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const response = await api.put(`${ORDERS_API}/${orderId}/status`, { status });
    return response.data;
  },

  // Delete order
  async deleteOrder(orderId: string): Promise<void> {
    await api.delete(`${ORDERS_API}/${orderId}`);
  }
};
