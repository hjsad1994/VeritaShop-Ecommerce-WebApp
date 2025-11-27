import { PrismaClient, ProductVariant, Prisma, ProductImage, Inventory } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export interface VariantImageInput {
  s3Key: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface VariantImageUpdateInput {
  id: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface VariantInventoryInput {
  quantity?: number;
  minStock?: number;
  maxStock?: number;
}

export interface CreateVariantData {
  productId: string;
  color: string;
  colorCode?: string | null;
  storage?: string | null;
  ram?: string | null;
  price: Prisma.Decimal | number;
  comparePrice?: Prisma.Decimal | number | null;
  sku: string;
  isActive?: boolean;
  images?: VariantImageInput[];
  inventory?: VariantInventoryInput;
}

export interface UpdateVariantData {
  color?: string;
  colorCode?: string | null;
  storage?: string | null;
  ram?: string | null;
  price?: Prisma.Decimal | number;
  comparePrice?: Prisma.Decimal | number | null;
  sku?: string;
  isActive?: boolean;
}

export class ProductVariantRepository extends BaseRepository<ProductVariant> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async countByProduct(productId: string): Promise<number> {
    return this.prisma.productVariant.count({
      where: { productId },
    });
  }

  async listByProduct(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        inventory: true,
      },
    });
  }

  async findById(productId: string, variantId: string) {
    return this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
      },
      include: {
        images: true,
        inventory: true,
      },
    });
  }

  async findBySku(sku: string, excludeId?: string) {
    return this.prisma.productVariant.findFirst({
      where: {
        sku,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async createVariant(data: CreateVariantData) {
    const variant = await this.prisma.productVariant.create({
      data: {
        productId: data.productId,
        color: data.color,
        colorCode: data.colorCode,
        storage: data.storage,
        ram: data.ram,
        price: data.price,
        comparePrice: data.comparePrice ?? null,
        sku: data.sku,
        isActive: data.isActive ?? true,
        inventory: {
          create: {
            quantity: data.inventory?.quantity ?? 0,
            reserved: 0,
            available: data.inventory?.quantity ?? 0,
            minStock: data.inventory?.minStock ?? 5,
            maxStock: data.inventory?.maxStock ?? 0,
          },
        },
      },
      include: {
        inventory: true,
        images: true,
      },
    });

    if (data.images?.length) {
      await this.createImages(variant.productId, variant.id, data.images);
    }

    return this.findById(variant.productId, variant.id);
  }

  async updateVariant(variantId: string, data: UpdateVariantData) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(data.color !== undefined && { color: data.color }),
        ...(data.colorCode !== undefined && { colorCode: data.colorCode }),
        ...(data.storage !== undefined && { storage: data.storage }),
        ...(data.ram !== undefined && { ram: data.ram }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.comparePrice !== undefined && { comparePrice: data.comparePrice }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        images: true,
        inventory: true,
      },
    });
  }

  async deleteVariant(variantId: string) {
    return this.prisma.productVariant.delete({
      where: { id: variantId },
      include: {
        images: true,
        inventory: true,
      },
    });
  }

  async createImages(productId: string, variantId: string, images: VariantImageInput[]) {
    if (!images.length) return;

    const hasExplicitPrimary = images.some((img) => img.isPrimary);

    const existingPrimaryCount = await this.prisma.productImage.count({
      where: { variantId, isPrimary: true },
    });

    if (hasExplicitPrimary) {
      await this.prisma.productImage.updateMany({
        where: { variantId },
        data: { isPrimary: false },
      });
    }

    await this.prisma.productImage.createMany({
      data: images.map((image, index) => ({
        productId,
        variantId,
        url: image.s3Key,
        altText: image.altText ?? null,
        isPrimary:
          image.isPrimary ??
          (!hasExplicitPrimary && existingPrimaryCount === 0 && index === 0),
        sortOrder: image.sortOrder ?? index,
      })),
    });
  }

  async updateImages(updates: VariantImageUpdateInput[]) {
    if (!updates.length) {
      return;
    }

    await Promise.all(
      updates.map((image) =>
        this.prisma.productImage.update({
          where: { id: image.id },
          data: {
            ...(image.altText !== undefined && { altText: image.altText }),
            ...(image.isPrimary !== undefined && { isPrimary: image.isPrimary }),
            ...(image.sortOrder !== undefined && { sortOrder: image.sortOrder }),
          },
        })
      )
    );
  }

  async deleteImages(imageIds: string[]) {
    if (!imageIds.length) {
      return;
    }

    await this.prisma.productImage.deleteMany({
      where: { id: { in: imageIds } },
    });
  }

  async getImageKeys(imageIds: string[]): Promise<string[]> {
    if (!imageIds.length) {
      return [];
    }

    const images = await this.prisma.productImage.findMany({
      where: { id: { in: imageIds } },
      select: { url: true },
    });

    return images.map((image) => image.url);
  }

  async upsertInventory(variantId: string, input: VariantInventoryInput) {
    let inventory = await this.prisma.inventory.findUnique({
      where: { variantId },
    });

    if (!inventory) {
      inventory = await this.prisma.inventory.create({
        data: {
          variantId,
          quantity: input.quantity ?? 0,
          reserved: 0,
          available: input.quantity ?? 0,
          minStock: input.minStock ?? 5,
          maxStock: input.maxStock ?? 0,
        },
      });
    } else {
      const quantity = input.quantity ?? inventory.quantity;
      const reserved = inventory.reserved;

      inventory = await this.prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity,
          available: Math.max(quantity - reserved, 0),
          minStock: input.minStock ?? inventory.minStock,
          maxStock: input.maxStock ?? inventory.maxStock,
        },
      });
    }

    return inventory;
  }

  async deleteInventory(variantId: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { variantId },
    });

    if (!inventory) {
      return null;
    }

    await this.prisma.inventory.delete({
      where: { id: inventory.id },
    });

    return inventory;
  }

  async softDeleteVariant(variantId: string) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        isActive: false,
      },
      include: {
        images: true,
        inventory: true,
      },
    });
  }

  async resetPrimaryImage(variantId: string) {
    await this.prisma.productImage.updateMany({
      where: { variantId },
      data: { isPrimary: false },
    });
  }
}

