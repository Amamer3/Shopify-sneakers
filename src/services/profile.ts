import { Order } from './orders';
import { getAuthHeaders } from './auth';

const API_VERSION = '/api';

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  label?: string; // e.g., "Home", "Work", etc.
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal';
  isDefault: boolean;
  last4?: string;
  cardBrand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardholderName?: string;
  paypalEmail?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  marketingPreferences?: {
    email: boolean;
    sms: boolean;
  };
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  recentOrders: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  marketingPreferences?: {
    email?: boolean;
    sms?: boolean;
  };
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  label?: string;
}

export interface PaymentMethodData {
  type: 'credit_card' | 'paypal';
  isDefault?: boolean;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  paypalEmail?: string;
}

export interface OrderHistoryResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export const profileService = {  
  async getProfile(): Promise<UserProfile | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_VERSION}/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (response.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          throw new Error('Server error: Unable to connect to the service');
        }
        const error = await response.json()
          .catch(() => ({ message: 'Failed to fetch profile' }));
        throw new Error(error.message || 'Failed to fetch profile');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentication required')) {
        return null;
      }
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await fetch(`${API_VERSION}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      const error = await response.json()
        .catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  },

  async addAddress(data: AddressData): Promise<UserProfile> {
    const response = await fetch(`${API_VERSION}/profile/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      const error = await response.json()
        .catch(() => ({ message: 'Failed to add address' }));
      throw new Error(error.message || 'Failed to add address');
    }

    return response.json();
  },

  async updateAddress(addressId: string, data: AddressData): Promise<UserProfile> {
    const response = await fetch(`${API_VERSION}/profile/addresses/${addressId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      const error = await response.json()
        .catch(() => ({ message: 'Failed to update address' }));
      throw new Error(error.message || 'Failed to update address');
    }

    return response.json();
  },

  async deleteAddress(addressId: string): Promise<UserProfile> {
    const response = await fetch(`${API_VERSION}/profile/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      const error = await response.json()
        .catch(() => ({ message: 'Failed to delete address' }));
      throw new Error(error.message || 'Failed to delete address');
    }

    return response.json();
  },

  async addPaymentMethod(data: PaymentMethodData): Promise<UserProfile> {
    const response = await fetch(`${API_VERSION}/profile/payment-methods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      const error = await response.json()
        .catch(() => ({ message: 'Failed to add payment method' }));
      throw new Error(error.message || 'Failed to add payment method');
    }

    return response.json();
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<UserProfile> {
    const response = await fetch(`${API_VERSION}/profile/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      const error = await response.json()
        .catch(() => ({ message: 'Failed to delete payment method' }));
      throw new Error(error.message || 'Failed to delete payment method');
    }

    return response.json();
  },

  async getOrders(page: number = 1, pageSize: number = 10): Promise<OrderHistoryResponse | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const url = `${API_VERSION}/profile/orders?page=${page}&pageSize=${pageSize}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (response.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          throw new Error('Server error: Unable to connect to the service');
        }
        const error = await response.json()
          .catch(() => ({ message: 'Failed to fetch orders' }));
        throw new Error(error.message || 'Failed to fetch orders');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentication required')) {
        return null;
      }
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }
};
