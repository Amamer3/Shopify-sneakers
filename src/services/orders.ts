import { getAuthHeaders } from './auth';
import { Product } from './products';

const API_VERSION = '/api';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentDetails {
  method: 'credit_card' | 'paypal' | 'stripe';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  last4?: string;
  cardBrand?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentDetails: PaymentDetails;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  shippingAddressId: string;
  paymentMethodId: string;
  notes?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export const orderService = {
  async getMyOrders(params?: {
    page?: number;
    limit?: number;
    status?: Order['status'];
  }): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `${API_VERSION}/orders/my-orders${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to fetch orders' }));
      throw new Error(error.message || 'Failed to fetch orders');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async getOrderById(orderId: string): Promise<Order> {
    const response = await fetch(`${API_VERSION}/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to fetch order' }));
      throw new Error(error.message || 'Failed to fetch order');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await fetch(`${API_VERSION}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to create order' }));
      throw new Error(error.message || 'Failed to create order');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  }
};
