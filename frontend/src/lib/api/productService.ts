import apiClient from './apiClient';
import { Product, ProductDetail, ProductListResponse, ProductQueryParams, ApiResponse } from './types';

class ProductService {
  private basePath = '/products';

  /**
   * Get products with optional filtering and pagination
   */
  async getProducts(params: ProductQueryParams = {}): Promise<ProductListResponse> {
    const queryParams = new URLSearchParams();

    // Add query parameters if they exist
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = queryParams.toString() ? `${this.basePath}?${queryParams}` : this.basePath;

    const response = await apiClient.get<ApiResponse<ProductListResponse>>(url);
    return response.data.data;
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const response = await apiClient.get<ApiResponse<ProductDetail>>(`${this.basePath}/slug/${slug}`);
    return response.data.data;
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<ProductDetail> {
    const response = await apiClient.get<ApiResponse<ProductDetail>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<ProductListResponse>>(
      `${this.basePath}?isFeatured=true&limit=${limit}`
    );
    return response.data.data.products;
  }

  /**
   * Get related products (products from same category or brand)
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${this.basePath}/${productId}/related?limit=${limit}`
    );
    return response.data.data;
  }

  /**
   * Search products
   */
  async searchProducts(query: string, params: Omit<ProductQueryParams, 'search'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...params, search: query });
  }

  /**
   * Get products by brand
   */
  async getProductsByBrand(brandSlug: string, params: Omit<ProductQueryParams, 'brand'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...params, brand: brandSlug });
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categorySlug: string, params: Omit<ProductQueryParams, 'category'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...params, category: categorySlug });
  }
}

const productService = new ProductService();
export default productService;