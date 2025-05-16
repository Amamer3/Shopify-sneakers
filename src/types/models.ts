export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  brand?: string;
  holderName: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

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
  trackingHistory: Array<{
    status: OrderStatus;
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

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
}

export interface AddressInput {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethodInput {
  type: string;
  brand?: string;
  holderName: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvc?: string;
}
