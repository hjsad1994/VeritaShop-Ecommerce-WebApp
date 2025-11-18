// API Request/Response Types

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  avatar?: string;
  phone?: string;
  address?: string | null;
  isActive: boolean;
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
  isActive?: boolean;
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
  description?: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  basePrice: string; // Backend returns as string
  discount: number;
  finalPrice: string; // Backend returns as string
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  soldCount: number;
  averageRating: string;
  reviewCount: number;
  primaryImage?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  categoryId: string;
  brandId: string;
  createdAt: string;
  updatedAt: string;
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

// Brand and Category types for product creation
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  brandId: string;
  categoryId: string;
  basePrice: number;
  discount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  slug?: string;
}

export type UpdateProductRequest = Partial<Omit<CreateProductRequest, 'brandId' | 'categoryId'>> & {
  brandId?: string;
  categoryId?: string;
};

// Cart API Types
export interface CartProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: CartProductImage[];
}

export interface CartVariant {
  id: string;
  productId: string;
  color: string;
  storage: string | null;
  price: number;
  isActive: boolean;
  product: CartProduct;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: CartVariant;
  itemSubtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string | null;
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface AddCartItemRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
// Voucher API Types
export type VoucherType = 'FIXED' | 'PERCENTAGE';
export type VoucherStatus = 'active' | 'inactive' | 'scheduled' | 'expired';

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  status: VoucherStatus;
  isExpired: boolean;
  isScheduled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherListResponse {
  vouchers: Voucher[];
  pagination: PaginationMeta;
}

export interface VoucherQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: VoucherType;
  status?: VoucherStatus;
  sortBy?: 'createdAt' | 'value' | 'usageCount' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVoucherRequest {
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export type UpdateVoucherRequest = Partial<CreateVoucherRequest>;
