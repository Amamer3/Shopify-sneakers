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

export interface ShippingAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface TrackingEvent {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: Date;
  location?: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: TrackingEvent['status'];
  total: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
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

export interface Profile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses: ShippingAddress[];
  paymentMethods: PaymentMethod[];
  orders: Order[];
}

// Update profile request types
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface PaymentMethodInput extends Omit<PaymentMethod, 'id'> {
  cardNumber?: string;
  expMonth?: number;
  expYear?: number;
  cvc?: string;
}

export interface AddressInput extends Omit<ShippingAddress, 'id'> {}
