import { api } from '../lib/api';
import { logger } from '../lib/logger';
import { Order } from './orders';
import { AxiosError } from 'axios';
import { AUTH_TOKEN_KEY } from '../lib/tokenUtils';
import type { GetOrdersResponse } from '../types/api';

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

export interface OrderItemResponse {
  // Define the structure of order item response here
}

export interface OrderHistoryResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: OrderItemResponse[];
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
}

export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

const handleApiError = (error: unknown, operation: string): never => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  
  logger.error(`Failed to ${operation}:`, {
    error: axiosError.message,
    status: axiosError.response?.status,
    data: axiosError.response?.data
  });

  // Handle authentication errors
  if (axiosError.response?.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/login';
    throw new ProfileServiceError('Authentication required', 401);
  }

  // Handle other errors
  throw new ProfileServiceError(
    axiosError.response?.data?.message || 'An unexpected error occurred',
    axiosError.response?.status,
    axiosError.response?.data?.code
  );
};

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get(`${API_VERSION}/profile`, {
        headers: getAuthHeaders(),
        timeout: 30000, // 30 second timeout for initial load
      });
      
      if (!response.data) {
        throw new ProfileServiceError('Invalid profile data received');
      }

      return response.data;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new ProfileServiceError('Authentication required', 401);
        }
        
        logger.error('Failed to fetch profile:', { 
          error: error.message,
          status: error.response?.status,
          data: error.response?.data 
        });
        
        throw new ProfileServiceError(
          error.response?.data?.message || 'Failed to fetch profile',
          error.response?.status
        );
      }
      
      throw new ProfileServiceError('An unexpected error occurred');
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    try {
      const response = await api.put<UserProfile>(`${API_VERSION}/profile`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'update profile');
    }
  },

  getOrders: async (page: number = 1, pageSize: number = 10): Promise<GetOrdersResponse> => {
    try {
      const response = await api.get<GetOrdersResponse>(`${API_VERSION}/profile/orders`, {
        params: {
          page,
          pageSize
        }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'fetch orders');
    }
  },

  updateAddress: async (addressId: string, data: Partial<Address>): Promise<UserProfile> => {
    try {
      const response = await api.put<UserProfile>(`${API_VERSION}/profile/addresses/${addressId}`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'update address');
    }
  },

  addAddress: async (data: Omit<Address, 'id'>): Promise<UserProfile> => {
    try {
      const response = await api.post<UserProfile>(`${API_VERSION}/profile/addresses`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'add address');
    }
  },

  deleteAddress: async (addressId: string): Promise<UserProfile> => {
    try {
      const response = await api.delete<UserProfile>(`${API_VERSION}/profile/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'delete address');
    }
  }
};
