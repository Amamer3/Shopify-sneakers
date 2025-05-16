export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  label?: string; // e.g., "Home", "Work"
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money';
  last4?: string;
  expiryDate?: string;
  cardType?: string;
  isDefault?: boolean;
  providerName?: string; // For mobile money
  phoneNumber?: string; // For mobile money
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

export interface PaginatedOrders {
  orders: OrderSummary[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}
