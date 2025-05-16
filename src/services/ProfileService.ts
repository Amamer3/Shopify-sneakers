import { AddressInput, PaymentMethodInput, Profile, UpdateProfileData, PaginatedOrders } from '@/types/models';

export class ProfileService {
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return response.json();
  }

  async addAddress(address: AddressInput): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });
    if (!response.ok) {
      throw new Error('Failed to add address');
    }
    return response.json();
  }

  async updateAddress(id: string, address: AddressInput): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });
    if (!response.ok) {
      throw new Error('Failed to update address');
    }
    return response.json();
  }

  async deleteAddress(id: string): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/addresses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete address');
    }
    return response.json();
  }

  async addPaymentMethod(paymentMethod: PaymentMethodInput): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentMethod),
    });
    if (!response.ok) {
      throw new Error('Failed to add payment method');
    }
    return response.json();
  }

  async deletePaymentMethod(id: string): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/payment-methods/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete payment method');
    }
    return response.json();
  }

  async getOrders(page: number, pageSize: number): Promise<PaginatedOrders> {
    const response = await fetch(`${this.baseUrl}/orders?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  }
}

export const profileService = new ProfileService();
