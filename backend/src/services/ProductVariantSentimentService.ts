import { ProductVariantSentiment } from '@prisma/client';
import axios from 'axios';
import {
  ProductVariantSentimentRepository,
  SentimentData,
} from '../repositories/ProductVariantSentimentRepository';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_MESSAGES, ML_SERVICE_URL } from '../constants';
import { logger } from '../utils/logger';

export class ProductVariantSentimentService {
  private sentimentRepository: ProductVariantSentimentRepository;

  constructor(sentimentRepository: ProductVariantSentimentRepository) {
    this.sentimentRepository = sentimentRepository;
  }

  async getSentimentByVariantId(variantId: string): Promise<ProductVariantSentiment | null> {
    try {
      const sentiment = await this.sentimentRepository.findByVariantId(variantId);
      return sentiment;
    } catch (error) {
      logger.error('Error in getSentimentByVariantId:', error);
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  async upsertSentiment(data: SentimentData): Promise<ProductVariantSentiment> {
    try {
      const sentiment = await this.sentimentRepository.upsertSentiment(data);
      return sentiment;
    } catch (error) {
      logger.error('Error in upsertSentiment:', error);
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  async analyzeText(text: string): Promise<any> {
    try {
      const response = await axios.post(ML_SERVICE_URL, {
        text,
      });
      return response.data;
    } catch (error) {
      logger.error('AI Service Error:', error);
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to analyze text with AI service'
      );
    }
  }
}
