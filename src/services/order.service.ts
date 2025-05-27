import { socketService } from './socket.service';
import { api } from '../lib/api';
import { logger } from '../lib/logger';
import type { Order, OrderStatus } from '../types/models';

class OrderService {
  private trackedOrders: Set<string> = new Set();

  constructor() {
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    socketService.on('order:updated', (orderId: string, status: OrderStatus) => {
      if (this.trackedOrders.has(orderId)) {
        this.notifyOrderUpdate(orderId, status);
      }
    });

    socketService.on('order:cancelled', (orderId: string) => {
      if (this.trackedOrders.has(orderId)) {
        this.notifyOrderCancellation(orderId);
      }
    });
  }

  private async notifyOrderUpdate(orderId: string, status: OrderStatus) {
    try {
      // Fetch latest order details
      const response = await api.get(`/orders/${orderId}`);
      const order: Order = response.data;

      // Emit event for UI updates
      socketService.emit('order:updated', orderId, status);

      // Update order status in local storage
      this.updateLocalOrderStatus(orderId, status);

    } catch (error) {
      logger.error('Failed to process order update:', error);
    }
  }

  private notifyOrderCancellation(orderId: string) {
    // Remove from tracked orders
    this.trackedOrders.delete(orderId);
    
    // Update local storage
    this.updateLocalOrderStatus(orderId, 'cancelled');
    
    // Emit cancellation event
    socketService.emit('order:cancelled', orderId);
  }

  private updateLocalOrderStatus(orderId: string, status: OrderStatus) {
    try {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders = JSON.parse(ordersJson);
        const updatedOrders = orders.map((order: Order) =>
          order.id === orderId ? { ...order, status } : order
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
    } catch (error) {
      logger.error('Failed to update local order status:', error);
    }
  }

  public async trackOrder(orderId: string) {
    try {
      // Add to tracked orders set
      this.trackedOrders.add(orderId);

      // Subscribe to order updates on the server
      await api.post(`/orders/${orderId}/track`);

      logger.info(`Started tracking order: ${orderId}`);
      return true;
    } catch (error) {
      logger.error('Failed to start order tracking:', error);
      return false;
    }
  }

  public async untrackOrder(orderId: string) {
    try {
      // Remove from tracked orders set
      this.trackedOrders.delete(orderId);

      // Unsubscribe from order updates on the server
      await api.delete(`/orders/${orderId}/track`);

      logger.info(`Stopped tracking order: ${orderId}`);
      return true;
    } catch (error) {
      logger.error('Failed to stop order tracking:', error);
      return false;
    }
  }

  public isTracking(orderId: string): boolean {
    return this.trackedOrders.has(orderId);
  }

  public async getOrderTimeline(orderId: string) {
    try {
      const response = await api.get(`/orders/${orderId}/timeline`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch order timeline:', error);
      return [];
    }
  }
}

export const orderService = new OrderService();
