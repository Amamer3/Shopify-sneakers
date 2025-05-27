import { api } from '@/lib/api';
import type {
  PaystackInitializeRequest,
  PaystackInitializeResponse,
  PaystackVerifyResponse,
  Transaction,
  TransactionListResponse,
} from '@/types/payment';

class PaymentService {
  async initializePayment(data: PaystackInitializeRequest): Promise<PaystackInitializeResponse> {
    const response = await api.post<PaystackInitializeResponse>('/api/payments/initialize', {
      ...data,
      amount: data.amount * 100, // Convert to kobo
    });
    return response.data;
  }

  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    const response = await api.get<PaystackVerifyResponse>(`/api/payments/verify/${reference}`);
    return response.data;
  }

  async getTransactions(page = 1, limit = 10): Promise<TransactionListResponse> {
    const response = await api.get<TransactionListResponse>('/api/payments/transactions', {
      params: { page, limit },
    });
    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/api/payments/transactions/${id}`);
    return response.data;
  }

  async verifyTransaction(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/api/payments/transactions/${id}/verify`);
    return response.data;
  }
}

export const paymentService = new PaymentService();
