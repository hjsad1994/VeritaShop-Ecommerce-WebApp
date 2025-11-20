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
export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface VariantInventory {
  id: string;
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  lowStock: boolean;
  updatedAt: string;
}

export interface ProductVariantItem {
  id: string;
  productId: string;
  color: string;
  colorCode?: string | null;
  storage?: string | null;
  ram?: string | null;
  price: string;
  comparePrice?: string | null;
  sku: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  inventory?: VariantInventory | null;
}

export interface VariantListResponse {
  variants: ProductVariantItem[];
}

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
  images?: ProductImage[]; // Product images array
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
  images?: ProductImage[];
  colors?: string[];
  inventory?: {
    quantity: number;
  };
  variants?: ProductVariantItem[];
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

export interface ProductImageData {
  s3Key: string;
  cloudFrontUrl?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
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
  images?: ProductImageData[];
}

export type UpdateProductRequest = Partial<Omit<CreateProductRequest, 'brandId' | 'categoryId'>> & {
  brandId?: string;
  categoryId?: string;
  images?: ProductImageData[];
  imageIdsToDelete?: string[];
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

// Inventory API Types
export interface InventoryProductBrand {
  id: string;
  name: string;
  slug?: string;
}

export interface InventoryProductSummary {
  id: string;
  name: string;
  slug: string;
  brand?: InventoryProductBrand;
}

export interface InventoryVariantSummary {
  id: string;
  productId: string;
  color?: string | null;
  storage?: string | null;
  ram?: string | null;
  price?: number | string | null;
  sku?: string | null;
  product?: InventoryProductSummary;
}

export interface InventoryRecord {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  isArchived?: boolean;
  lastMovementAt?: string | null;
  product?: InventoryProductSummary;
  variant?: InventoryVariantSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryCatalogVariant {
  id: string;
  sku: string;
  color?: string | null;
  storage?: string | null;
  ram?: string | null;
  optionLabels: string[];
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  isLowStock: boolean;
  isActive: boolean;
}

export interface InventoryCatalogProduct {
  id: string;
  name: string;
  slug: string;
  brand?: InventoryProductBrand;
  variants: InventoryCatalogVariant[];
}

export interface InventoryCatalogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  includeArchived?: boolean;
}

export interface InventoryCatalogResult {
  catalog: InventoryCatalogProduct[];
  pagination: PaginationMeta;
}

export interface InventoryPaginationMeta extends PaginationMeta {
  totalPages: number;
}

export interface InventoryListResponse {
  inventories: InventoryRecord[];
  pagination: InventoryPaginationMeta;
}

export interface InventoryStats {
  totalInventory: number;
  totalQuantity: number;
  totalAvailable: number;
  totalReserved?: number;
  lowStockCount: number;
  outOfStockCount?: number;
}

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  productId?: string;
  variantId?: string;
  minAvailable?: number;
  maxAvailable?: number;
  lowStock?: boolean;
  includeArchived?: boolean;
  status?: 'low' | 'out' | 'archived';
  sort?: 'available' | 'updatedAt';
}

export interface CreateInventoryPayload {
  productId?: string;
  variantId: string;
  initialQuantity: number;
  minStock?: number;
  maxStock?: number;
  reason?: string;
}

export interface StockMutationPayload {
  productId?: string;
  variantId: string;
  quantity: number;
  reason?: string;
  referenceId?: string;
}

export interface StockAdjustmentPayload {
  productId?: string;
  variantId: string;
  newQuantity: number;
  reason: string;
}

export interface QuickQuantityUpdatePayload {
  quantity: number;
}

export interface UpdateThresholdPayload {
  minStock: number;
  maxStock: number;
}

export type StockMovementType =
  | 'stock_in'
  | 'stock_out'
  | 'adjustment'
  | 'order'
  | 'order_cancelled'
  | 'return';

export interface StockMovementUser {
  id: string;
  name: string | null;
  email: string;
}

export interface StockMovement {
  id: string;
  inventoryId: string;
  productId?: string;
  variantId: string;
  type: StockMovementType | string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string | null;
  referenceId?: string | null;
  user?: StockMovementUser | null;
  createdAt: string;
}

export interface StockMovementQueryParams {
  page?: number;
  limit?: number;
  type?: StockMovementType | string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface StockMovementListResponse {
  movements: StockMovement[];
  pagination: InventoryPaginationMeta;
}
