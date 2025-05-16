import { OrderItem } from './order-item';
import { Address } from './address';
import { PaymentMethod } from './payment-method';
import { OrderStatus, TrackingEvent } from './tracking';

export interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  trackingHistory: TrackingEvent[];
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
