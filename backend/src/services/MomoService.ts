import crypto from 'crypto';
import axios from 'axios';
import { logger } from '../utils/logger';

interface MomoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
  redirectUrl: string;
  ipnUrl: string;
}

interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  orderInfo?: string;
}

interface MomoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  deeplink?: string;
  qrCodeUrl?: string;
}

interface MomoIPNData {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

export class MomoService {
  private config: MomoConfig;

  constructor() {
    this.config = {
      partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
      accessKey: process.env.MOMO_ACCESS_KEY || '',
      secretKey: process.env.MOMO_SECRET_KEY || '',
      endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn',
      redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5001/api/payment/momo/return',
      ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:5001/api/payment/momo/ipn',
    };
  }

  private generateSignature(rawSignature: string): string {
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  async createPayment(params: CreatePaymentParams): Promise<MomoPaymentResponse> {
    const { orderId, orderNumber, amount, orderInfo } = params;
    
    const requestId = `${this.config.partnerCode}${Date.now()}`;
    const requestType = 'captureWallet';
    const extraData = Buffer.from(JSON.stringify({ orderNumber })).toString('base64');
    const orderDescription = orderInfo || `Thanh toán đơn hàng ${orderNumber}`;

    // Build raw signature string
    const rawSignature = [
      `accessKey=${this.config.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${this.config.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderDescription}`,
      `partnerCode=${this.config.partnerCode}`,
      `redirectUrl=${this.config.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join('&');

    const signature = this.generateSignature(rawSignature);

    const requestBody = {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo: orderDescription,
      redirectUrl: this.config.redirectUrl,
      ipnUrl: this.config.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };

    logger.info('MoMo payment request:', { orderId, amount, requestId });

    try {
      const response = await axios.post<MomoPaymentResponse>(
        `${this.config.endpoint}/v2/gateway/api/create`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('MoMo payment response:', {
        orderId,
        resultCode: response.data.resultCode,
        message: response.data.message,
      });

      if (response.data.resultCode !== 0) {
        throw new Error(`MoMo error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      logger.error('MoMo payment error:', error);
      throw error;
    }
  }

  verifyIPNSignature(data: MomoIPNData): boolean {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = data;

    const rawSignature = [
      `accessKey=${this.config.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join('&');

    const expectedSignature = this.generateSignature(rawSignature);
    
    const isValid = expectedSignature === signature;
    
    if (!isValid) {
      logger.warn('MoMo IPN signature mismatch:', {
        orderId,
        expected: expectedSignature,
        received: signature,
      });
    }

    return isValid;
  }

  verifyReturnSignature(query: Record<string, string>): boolean {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = query;

    const rawSignature = [
      `accessKey=${this.config.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join('&');

    const expectedSignature = this.generateSignature(rawSignature);
    return expectedSignature === signature;
  }

  isPaymentSuccess(resultCode: number): boolean {
    return resultCode === 0;
  }
}

export const momoService = new MomoService();
