import { Inventory, ProductVariant, ProductImage } from '@prisma/client';
import { toCloudFrontUrl } from '../utils/cdn';

export interface VariantInventoryResponse {
  id: string;
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  lowStock: boolean;
  updatedAt: Date;
}

export interface VariantImageResponse {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariantResponse {
  id: string;
  productId: string;
  color: string;
  colorCode: string | null;
  storage: string | null;
  ram: string | null;
  price: string;
  comparePrice: string | null;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: VariantImageResponse[];
  inventory?: VariantInventoryResponse | null;
}

type VariantWithRelations = ProductVariant & {
  images: ProductImage[];
  inventory?: Inventory | null;
};

export class ProductVariantDto {
  static fromVariant(variant: VariantWithRelations): ProductVariantResponse {
    return {
      id: variant.id,
      productId: variant.productId,
      color: variant.color,
      colorCode: variant.colorCode,
      storage: variant.storage,
      ram: variant.ram,
      price: variant.price.toString(),
      comparePrice: variant.comparePrice ? variant.comparePrice.toString() : null,
      sku: variant.sku,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      images: this.mapImages(variant.images),
      inventory: this.mapInventory(variant.inventory),
    };
  }

  static fromVariantList(variants: VariantWithRelations[]): ProductVariantResponse[] {
    return variants.map((variant) => this.fromVariant(variant));
  }

  private static mapImages(images: ProductImage[] = []): VariantImageResponse[] {
    return images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        id: img.id,
        url: toCloudFrontUrl(img.url),
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      }));
  }

  private static mapInventory(inventory?: Inventory | null): VariantInventoryResponse | null {
    if (!inventory) {
      return null;
    }

    return {
      id: inventory.id,
      quantity: inventory.quantity,
      reserved: inventory.reserved,
      available: inventory.available,
      minStock: inventory.minStock,
      maxStock: inventory.maxStock,
      lowStock: inventory.minStock > 0 && inventory.available < inventory.minStock,
      updatedAt: inventory.updatedAt,
    };
  }
}

