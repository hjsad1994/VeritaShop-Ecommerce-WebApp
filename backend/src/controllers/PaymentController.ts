import { Request, Response, NextFunction } from 'express';
import { momoService } from '../services/MomoService';
import { RepositoryFactory } from '../repositories';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';
import { PaymentStatus, OrderStatus } from '@prisma/client';

export class PaymentController {
  private get orderRepository() {
    return RepositoryFactory.getOrderRepository();
  }

  createMomoPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      // Get order details
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.ORDER_NOT_FOUND,
        });
      }

      // Check if order belongs to user
      if (order.userId !== req.user?.userId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.ORDER_UNAUTHORIZED,
        });
      }

      // Check if order is already paid
      if (order.isPaid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Đơn hàng này đã được thanh toán',
        });
      }

      // Create MoMo payment
      const momoResponse = await momoService.createPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: Math.round(Number(order.total)),
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Tạo thanh toán MoMo thành công',
        data: {
          payUrl: momoResponse.payUrl,
          orderId: momoResponse.orderId,
          requestId: momoResponse.requestId,
          amount: momoResponse.amount,
          deeplink: momoResponse.deeplink,
          qrCodeUrl: momoResponse.qrCodeUrl,
        },
      });
    } catch (error) {
      logger.error('Create MoMo payment error:', error);
      next(error);
    }
  };

  handleMomoIPN = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipnData = req.body;
      
      logger.info('MoMo IPN received:', {
        orderId: ipnData.orderId,
        resultCode: ipnData.resultCode,
        transId: ipnData.transId,
      });

      // Verify signature
      const isValidSignature = momoService.verifyIPNSignature(ipnData);
      if (!isValidSignature) {
        logger.warn('MoMo IPN invalid signature:', { orderId: ipnData.orderId });
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid signature',
        });
      }

      // Get order
      const order = await this.orderRepository.findById(ipnData.orderId);
      if (!order) {
        logger.warn('MoMo IPN order not found:', { orderId: ipnData.orderId });
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Check if already processed
      if (order.isPaid) {
        logger.info('MoMo IPN order already paid:', { orderId: ipnData.orderId });
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Order already processed',
        });
      }

      // Process payment result
      if (momoService.isPaymentSuccess(ipnData.resultCode)) {
        // Payment successful
        await this.orderRepository.updateStatus(order.id, order.status as OrderStatus, {
          paymentStatus: PaymentStatus.PAID,
          isPaid: true,
          paidAt: new Date(),
        });
        
        logger.info('MoMo payment successful:', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          transId: ipnData.transId,
        });
      } else {
        // Payment failed
        await this.orderRepository.updateStatus(order.id, order.status as OrderStatus, {
          paymentStatus: PaymentStatus.FAILED,
        });
        
        logger.info('MoMo payment failed:', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          resultCode: ipnData.resultCode,
          message: ipnData.message,
        });
      }

      // Return 204 to acknowledge receipt
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      logger.error('MoMo IPN error:', error);
      next(error);
    }
  };

  handleMomoReturn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as Record<string, string>;
      const { orderId, resultCode, message } = query;

      logger.info('MoMo return:', { orderId, resultCode, message });

      // Get order to get orderNumber
      const order = await this.orderRepository.findById(orderId);
      const orderNumber = order?.orderNumber || '';

      // Update order payment status if successful and not already paid
      if (order && resultCode === '0' && !order.isPaid) {
        await this.orderRepository.updateStatus(order.id, order.status as OrderStatus, {
          paymentStatus: PaymentStatus.PAID,
          isPaid: true,
          paidAt: new Date(),
        });
        logger.info('MoMo return - Order marked as paid:', { orderId, orderNumber });
      }

      // Redirect to frontend payment result page
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      const status = resultCode === '0' ? 'success' : 'failed';
      const redirectUrl = `${frontendUrl}/payment/result?status=${status}&orderNumber=${orderNumber}&message=${encodeURIComponent(message || '')}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      logger.error('MoMo return error:', error);
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/payment/result?status=error&message=Có lỗi xảy ra`);
    }
  };

  getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;

      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.ORDER_NOT_FOUND,
        });
      }

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          isPaid: order.isPaid,
          paidAt: order.paidAt,
        },
      });
    } catch (error) {
      logger.error('Get payment status error:', error);
      next(error);
    }
  };
}

export const paymentController = new PaymentController();
