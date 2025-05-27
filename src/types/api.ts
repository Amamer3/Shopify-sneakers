import type { Order, OrderItem, PaymentMethod, Address, OrderStatus } from './models';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type OrderHistoryResponse = PaginatedResponse<ExtendedOrder>;

export interface OrderItemResponse extends OrderItem {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  };
}

export interface ExtendedOrder extends Omit<Order, 'items' | 'shippingAddress'> {
  items: OrderItemResponse[];
  userId: string;
  status: OrderStatus;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  shippingAddress: ExtendedAddress;
}

export interface ExtendedAddress extends Omit<Address, 'zipCode'> {
  name: string;
  line1: string;
  line2?: string;
  postalCode: string;
}

export interface GetOrdersResponse {
  orders: ExtendedOrder[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
