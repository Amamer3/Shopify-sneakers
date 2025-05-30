export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockLevel: number;
  images: string[];
  mainImage: string;
  categories: string[];
  sizes?: string[];
  colors?: string[];
  brand?: string;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
    currency: string;
  };
  metadata?: Record<string, any>;
}

// Alias Profile to User since they represent the same entity
export type Profile = User;

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  size?: string;
  color?: string;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
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
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentId: string;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  addedAt: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  updatedAt: Date;
  createdAt: Date;
}
