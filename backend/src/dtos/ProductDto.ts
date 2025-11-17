import { Product, Brand, Category, ProductSpecs, ProductVariant, ProductImage } from '@prisma/client';

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  basePrice: string;
  discount: number;
  finalPrice: string;
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  soldCount: number;
  averageRating: string;
  reviewCount: number;
  primaryImage: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDetailResponse extends ProductResponse {
  specs: ProductSpecs | null;
  variants: Array<{
    id: string;
    color: string;
    colorCode: string | null;
    storage: string | null;
    ram: string | null;
    price: string;
    comparePrice: string | null;
    sku: string;
    images: Array<{
      id: string;
      url: string;
      altText: string | null;
      isPrimary: boolean;
      sortOrder: number;
    }>;
  }>;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
    variantId: string | null;
  }>;
}

export class ProductDto {
  static fromProduct(product: Product & {
    brand: Brand;
    category: Category;
    variants?: ProductVariant[];
    images?: ProductImage[];
  }): ProductResponse {
    const basePriceNumber = Number(product.basePrice);
    const finalPrice = this.calculateFinalPrice(basePriceNumber, product.discount);
    const primaryImage = this.findPrimaryImage(product.images);
    const priceRange = this.calculatePriceRange(product.variants);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
        logo: product.brand.logo,
      },
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      basePrice: product.basePrice.toString(),
      discount: product.discount,
      finalPrice: finalPrice.toString(),
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      viewCount: product.viewCount,
      soldCount: product.soldCount,
      averageRating: product.averageRating.toString(),
      reviewCount: product.reviewCount,
      primaryImage: primaryImage,
      minPrice: priceRange.minPrice !== null ? priceRange.minPrice.toString() : null,
      maxPrice: priceRange.maxPrice !== null ? priceRange.maxPrice.toString() : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Chuyển đổi Product entity sang ProductDetailResponse DTO
   * Dùng cho trang chi tiết sản phẩm (bao gồm specs, variants, images đầy đủ)
   */
  static fromProductDetail(product: Product & {
    brand: Brand;
    category: Category;
    specs: ProductSpecs | null;
    variants: (ProductVariant & {
      images: ProductImage[];
    })[];
    images: ProductImage[];
  }): ProductDetailResponse {
    const baseResponse = this.fromProduct(product);

    const sortedVariants = [];
    for (const variant of product.variants) {
      const variantImages = [];
      const imagesCopy = [...variant.images];
      
      imagesCopy.sort((a, b) => a.sortOrder - b.sortOrder);
      
      for (const img of imagesCopy) {
        variantImages.push({
          id: img.id,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        });
      }

      sortedVariants.push({
        id: variant.id,
        color: variant.color,
        colorCode: variant.colorCode,
        storage: variant.storage,
        ram: variant.ram,
        price: variant.price.toString(),
        comparePrice: variant.comparePrice ? variant.comparePrice.toString() : null,
        sku: variant.sku,
        images: variantImages,
      });
    }

    const imagesCopy = [...product.images];
    imagesCopy.sort((a, b) => a.sortOrder - b.sortOrder);
    
    const sortedImages = [];
    for (const img of imagesCopy) {
      sortedImages.push({
        id: img.id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
        variantId: img.variantId,
      });
    }

    return {
      ...baseResponse,
      specs: product.specs,
      variants: sortedVariants,
      images: sortedImages,
    };
  }

  /**
   * Chuyển đổi mảng Products sang mảng ProductResponse
   * Dùng cho API trả về danh sách nhiều sản phẩm
   */
  static fromProductList(products: Array<Product & {
    brand: Brand;
    category: Category;
    variants?: ProductVariant[];
    images?: ProductImage[];
  }>): ProductResponse[] {
    const result = [];
    for (const product of products) {
      result.push(this.fromProduct(product));
    }
    return result;
  }

  private static calculateFinalPrice(basePrice: number, discount: number = 0): number {
    const discountAmount = basePrice * discount / 100;
    const finalPrice = basePrice - discountAmount;
    return finalPrice;
  }

  private static findPrimaryImage(images?: ProductImage[]): string | null {
    if (!images || images.length === 0) {
      return null;
    }

    for (const image of images) {
      if (image.isPrimary) {
        return image.url;
      }
    }

    return images[0].url;
  }

  private static calculatePriceRange(variants?: ProductVariant[]): {
    minPrice: number | null;
    maxPrice: number | null;
  } {
    if (!variants || variants.length === 0) {
      return { minPrice: null, maxPrice: null };
    }

    const prices = variants.map(variant => Number(variant.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return { minPrice, maxPrice };
  }
}
