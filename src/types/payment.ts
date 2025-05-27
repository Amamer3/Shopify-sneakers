export interface PaystackInitializeRequest {
  email: string;
  amount: number; // Amount in kobo (multiply by 100)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    status: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata: Record<string, any>;
  };
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    status: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata: Record<string, any>;
  };
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: string;
  currency: string;
  metadata: Record<string, any>;
  customer: {
    email: string;
    customerId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
