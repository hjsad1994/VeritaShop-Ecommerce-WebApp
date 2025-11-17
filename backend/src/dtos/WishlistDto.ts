export class WishlistImageDto {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;

  constructor(data: any) {
    this.id = data.id;
    this.url = data.url;
    this.altText = data.altText;
    this.sortOrder = data.sortOrder;
  }
}

export class WishlistBrandDto {
  id: string;
  name: string;
  slug: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
  }
}

export class WishlistCategoryDto {
  id: string;
  name: string;
  slug: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
  }
}

export class WishlistProductDto {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  discount: number;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  images: WishlistImageDto[];
  brand: WishlistBrandDto;
  category: WishlistCategoryDto;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.basePrice = Number(data.basePrice); // Convert Decimal to number
    this.discount = data.discount;
    this.isFeatured = data.isFeatured;
    this.averageRating = Number(data.averageRating); // Convert Decimal to number
    this.reviewCount = data.reviewCount;
    this.images = data.images?.map((img: any) => new WishlistImageDto(img)) || [];
    this.brand = new WishlistBrandDto(data.brand);
    this.category = new WishlistCategoryDto(data.category);
  }
}

export class WishlistItemDto {
  id: string;
  wishlistId: string;
  productId: string;
  product: WishlistProductDto;
  createdAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.wishlistId = data.wishlistId;
    this.productId = data.productId;
    this.product = new WishlistProductDto(data.product);
    this.createdAt = data.createdAt;
  }
}

export class WishlistDto {
  id: string | null;
  userId: string;
  items: WishlistItemDto[];
  totalItems: number;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.userId;
    this.items = data.items?.map((item: any) => new WishlistItemDto(item)) || [];
    this.totalItems = data.totalItems || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
