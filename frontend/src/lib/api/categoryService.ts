import apiClient from './apiClient';
import {
  ApiResponse,
  Category,
  CategoryListResponse,
  CategoryQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './types';

class CategoryService {
  private basePath = '/categories';

  private buildQuery(params: CategoryQueryParams = {}): string {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.includeChildren !== undefined) {
      query.append('includeChildren', params.includeChildren.toString());
    }
    if (params.isActive !== undefined) {
      query.append('isActive', params.isActive.toString());
    }
    return query.toString();
  }

  async getCategories(params: CategoryQueryParams = {}): Promise<CategoryListResponse> {
    const query = this.buildQuery(params);
    const url = query ? `${this.basePath}?${query}` : this.basePath;
    const response = await apiClient.get<ApiResponse<CategoryListResponse>>(url);
    return response.data.data;
  }

  async createCategory(payload: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>(this.basePath, payload);
    return response.data.data;
  }

  async updateCategory(id: string, payload: UpdateCategoryRequest): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`${this.basePath}/${id}`, payload);
    return response.data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<unknown>>(`${this.basePath}/${id}`);
  }
}

export const categoryService = new CategoryService();
export default categoryService;

