export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface TrackingEvent {
  status: OrderStatus;
  date: Date;
  location?: string;
  description: string;
}
