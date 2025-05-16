import {
  Profile,
  UpdateProfileData,
  AddressInput,
  PaymentMethodInput,
  PaginatedOrders,
  Order,
  Address,
  PaymentMethod
} from '@/types/models';

class ProfileService {
  private baseUrl = '/api/profile';

  async getProfile(): Promise<Profile> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  }

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return response.json();
  }

  async addAddress(address: AddressInput): Promise<Address> {
    const response = await fetch(`${this.baseUrl}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
    if (!response.ok) {
      throw new Error('Failed to add address');
    }
    return response.json();
  }

  async updateAddress(id: string, address: AddressInput): Promise<Address> {
    const response = await fetch(`${this.baseUrl}/addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
    if (!response.ok) {
      throw new Error('Failed to update address');
    }
    return response.json();
  }

  async deleteAddress(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/addresses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete address');
    }
  }

  async addPaymentMethod(paymentMethod: PaymentMethodInput): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentMethod),
    });
    if (!response.ok) {
      throw new Error('Failed to add payment method');
    }
    return response.json();
  }

  async deletePaymentMethod(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/payment-methods/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete payment method');
    }
  }

  async getOrders(page: number = 1, pageSize: number = 10): Promise<PaginatedOrders> {
    const response = await fetch(
      `${this.baseUrl}/orders?page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  }
  async getOrderById(orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    return response.json();
  }
}

export const profileService = new ProfileService();
