import apiClient from './apiClient';
import { Brand, ApiResponse } from './types';

class BrandService {
  private basePath = '/brands';

  /**
   * Get all brands
   */
  async getBrands(params: { page?: number; limit?: number; isActive?: boolean } = {}): Promise<{
    brands: Brand[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const url = queryParams.toString() ? `${this.basePath}?${queryParams}` : this.basePath;

    const response = await apiClient.get<ApiResponse<{
      brands: Brand[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>(url);

    return response.data.data;
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<Brand> {
    const response = await apiClient.get<ApiResponse<Brand>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new brand (Admin only)
   */
  async createBrand(brandData: {
    name: string;
    description?: string;
    logo?: string;
    slug?: string;
  }): Promise<Brand> {
    const response = await apiClient.post<ApiResponse<Brand>>(this.basePath, brandData);
    return response.data.data;
  }

  /**
   * Update a brand (Admin/Manager only)
   */
  async updateBrand(
    id: string,
    updateData: {
      name?: string;
      description?: string;
      logo?: string;
      isActive?: boolean;
      slug?: string;
    }
  ): Promise<Brand> {
    const response = await apiClient.put<ApiResponse<Brand>>(`${this.basePath}/${id}`, updateData);
    return response.data.data;
  }

  /**
   * Delete a brand (Admin only)
   */
  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}

const brandService = new BrandService();
export default brandService;