import { Address } from './address';
import { PaymentMethod } from './payment-method';
import { Order } from './order';

export interface Profile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  orders: Order[];
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
}
