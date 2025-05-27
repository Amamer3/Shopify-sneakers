import { Order, OrderStatus } from './models';
import { Product } from './models';
import { User } from './models';

export interface SocketEvents {
  // Socket.IO Events
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  reconnect_attempt: (attempt: number) => void;
  error: (error: Error) => void;

  // Order Events
  'order:created': (order: Order) => void;
  'order:updated': (orderId: string, status: OrderStatus) => void;
  'order:cancelled': (orderId: string) => void;

  // Product Events
  'product:stockUpdate': (productId: string, stockLevel: number) => void;
  'product:priceUpdate': (productId: string, newPrice: number, oldPrice: number) => void;
  'product:contentUpdate': (productId: string, updates: Partial<Product>) => void;

  // Cart Events
  'cart:updated': (userId: string, cartData: any) => void;
  'cart:abandoned': (userId: string, cartData: any) => void;
  'cart:stockWarning': (productId: string, availableStock: number) => void;
  'cart:error': (error: { message: string; productId?: string }) => void;

  // User Events
  'user:browsing': (userData: { userId: string; page: string; timestamp: number }) => void;
  'user:notification': (userId: string, notification: AdminNotification) => void;
  'user:activityUpdate': (userId: string, activity: UserActivity) => void;

  // Admin Events
  'admin:message': (message: AdminMessage) => void;
  'admin:action': (action: AdminAction) => void;

  // Payment Events
  'payment:update': (transaction: import('@/types/payment').Transaction) => void;
  'payment:initialized': (reference: string) => void;
  'payment:failed': (reference: string, error: string) => void;
}

export interface AdminNotification {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  action?: string;
  link?: string;
  timestamp: number;
}

export interface UserActivity {
  type: 'view' | 'cart' | 'order' | 'review';
  target: string;
  metadata: Record<string, any>;
  timestamp: number;
}

export interface AdminMessage {
  type: string;
  content: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface AdminAction {
  type: string;
  target: string;
  data?: Record<string, any>;
  timestamp: number;
}

export interface SocketConnectionConfig {
  reconnectionAttempts: number;
  reconnectionDelay: number;
  autoConnect: boolean;
  auth: {
    token: string;
  };
}

export interface SocketState {
  connected: boolean;
  lastConnected: number | null;
  reconnecting: boolean;
  reconnectAttempts: number;
}
