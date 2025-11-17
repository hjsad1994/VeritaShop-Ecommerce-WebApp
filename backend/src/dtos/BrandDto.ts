import { Brand } from '@prisma/client';

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  isActive: boolean;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class BrandDto {
  /**
   * Chuyển đổi Brand entity sang BrandResponse DTO
   */
  static fromBrand(brand: Brand, productCount?: number): BrandResponse {
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      description: brand.description,
      isActive: brand.isActive,
      productCount,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }

  /**
   * Chuyển đổi mảng Brands sang mảng BrandResponse
   */
  static fromBrandList(brands: Brand[], productCounts?: Map<string, number>): BrandResponse[] {
    const result = [];
    for (const brand of brands) {
      const productCount = productCounts?.get(brand.id);
      result.push(this.fromBrand(brand, productCount));
    }
    return result;
  }
}
