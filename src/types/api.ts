import { ReactNode, Key } from 'react';
import type { Order, OrderItem, PaymentMethod, Address, OrderStatus } from './models';

export interface ExtendedAddress extends Address {
  phone: any;
  line2: any;
  name: ReactNode;
  line1: string;
  postalCode: string;
  label?: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type OrderHistoryResponse = PaginatedResponse<ExtendedOrder>;

export interface OrderItemResponse extends OrderItem {
  id: Key;
  image: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  };
}

export interface ExtendedOrder extends Omit<Order, 'items' | 'shippingAddress'> {
  paymentMethod: any;
  orderNumber: ReactNode;
  items: OrderItemResponse[];
  userId: string;
  status: OrderStatus;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  shippingAddress: ExtendedAddress;
  date: string; // Add date field that's being used in the context
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
