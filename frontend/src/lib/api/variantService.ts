import apiClient from './apiClient';
import type { ApiResponse, ProductVariantItem, ProductVariantSentiment } from './types';

class VariantService {
  private basePath = '/admin/products';

  async list(productId: string): Promise<ProductVariantItem[]> {
    const response = await apiClient.get<ApiResponse<ProductVariantItem[]>>(
      `${this.basePath}/${productId}/variants`
    );
    return response.data.data;
  }

  async get(productId: string, variantId: string): Promise<ProductVariantItem> {
    const response = await apiClient.get<ApiResponse<ProductVariantItem>>(
      `${this.basePath}/${productId}/variants/${variantId}`
    );
    return response.data.data;
  }

  async getSentiment(productId: string, variantId: string): Promise<ProductVariantSentiment | null> {
    const response = await apiClient.get<ApiResponse<ProductVariantSentiment | null>>(
      `${this.basePath}/${productId}/variants/${variantId}/sentiment`
    );
    return response.data.data;
  }

  async create(
    productId: string,
    payload: Record<string, unknown>
  ): Promise<ProductVariantItem> {
    const response = await apiClient.post<ApiResponse<ProductVariantItem>>(
      `${this.basePath}/${productId}/variants`,
      payload
    );
    return response.data.data;
  }

  async update(
    productId: string,
    variantId: string,
    payload: Record<string, unknown>
  ): Promise<ProductVariantItem> {
    const response = await apiClient.patch<ApiResponse<ProductVariantItem>>(
      `${this.basePath}/${productId}/variants/${variantId}`,
      payload
    );
    return response.data.data;
  }

  async delete(productId: string, variantId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${productId}/variants/${variantId}`);
  }
}

const variantService = new VariantService();
export default variantService;

