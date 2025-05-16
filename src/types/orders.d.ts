export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    id: string;
    type: 'card' | 'paypal' | 'bank';
    last4?: string;
    brand?: string;
  };
  trackingNumber?: string;
  trackingHistory: Array<{
    status: Order['status'];
    date: Date;
    location?: string;
    description: string;
  }>;
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
