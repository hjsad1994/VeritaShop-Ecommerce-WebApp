import { apiClient } from './apiClient';
import { ApiResponse } from './types';

export interface MomoPaymentResponse {
  payUrl: string;
  orderId: string;
  requestId: string;
  amount: number;
  deeplink?: string;
  qrCodeUrl?: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  isPaid: boolean;
  paidAt: Date | null;
}

class PaymentService {
  private baseUrl = '/payment';

  async createMomoPayment(orderId: string): Promise<ApiResponse<MomoPaymentResponse>> {
    const response = await apiClient.post(`${this.baseUrl}/momo/create`, { orderId });
    return response.data;
  }

  async getPaymentStatus(orderId: string): Promise<ApiResponse<PaymentStatusResponse>> {
    const response = await apiClient.get(`${this.baseUrl}/status/${orderId}`);
    return response.data;
  }
}

export const paymentService = new PaymentService();
