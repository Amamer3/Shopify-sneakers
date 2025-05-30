import { User } from './models';

// Profile is an extension of User that includes additional profile-specific fields
export interface Profile extends User {
  // Additional profile-specific fields can be added here
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
    currency: string;
    theme?: 'light' | 'dark' | 'system';
  };
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal';
  isDefault?: boolean;
  lastFour?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardType?: string;
  paypalEmail?: string;
}

export interface AddressInput extends Omit<Address, 'id'> {
  id?: string;
}

export interface PaymentMethodInput extends Omit<PaymentMethod, 'id'> {
  id?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  preferences?: Profile['preferences'];
}
