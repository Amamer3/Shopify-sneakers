export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  brand?: string;
  holderName: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentMethodInput {
  type: PaymentMethod['type'];
  brand?: string;
  holderName: string;
  cardNumber?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvc?: string;
}
