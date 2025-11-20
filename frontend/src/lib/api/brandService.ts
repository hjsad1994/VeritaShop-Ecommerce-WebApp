import apiClient from './apiClient';
import type { ApiResponse, Brand, PaginationMeta } from './types';

interface BrandListResponse {
  brands: Brand[];
  pagination: PaginationMeta;
}

interface BrandQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

class BrandService {
  async getBrands(params: BrandQueryParams = {}): Promise<BrandListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/brands?${queryString}` : '/brands';
    
    const response = await apiClient.get<ApiResponse<BrandListResponse>>(url);
    return response.data.data;
  }

  async getBrandById(id: string): Promise<Brand> {
    const response = await apiClient.get<ApiResponse<Brand>>(`/brands/${id}`);
    return response.data.data;
  }

  async createBrand(data: {
    name: string;
    slug?: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
  }): Promise<Brand> {
    const response = await apiClient.post<ApiResponse<Brand>>('/brands', data);
    return response.data.data;
  }

  async updateBrand(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
  }): Promise<Brand> {
    const response = await apiClient.put<ApiResponse<Brand>>(`/brands/${id}`, data);
    return response.data.data;
  }

  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`/brands/${id}`);
  }
}

const brandService = new BrandService();

export { BrandService };
export default brandService;
