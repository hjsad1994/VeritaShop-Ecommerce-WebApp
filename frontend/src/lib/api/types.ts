// API Request/Response Types

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Auth API Types
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

// Category API Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: PaginationMeta;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  includeChildren?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  parentId?: string | null;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  isActive?: boolean;
}

// Product API Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  isFeatured?: boolean;
  rating?: number;
  totalReviews?: number;
  stock?: number;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetail extends Product {
  description?: string;
  specs?: Array<{ label: string; value: string }>;
  images?: string[];
  colors?: string[];
  inventory?: {
    quantity: number;
  };
}

export interface ProductListResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
