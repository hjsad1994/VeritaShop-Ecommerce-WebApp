import { StockMovementType } from '@prisma/client';

export class InventoryProductDto {
  id: string;
  name: string;
  slug: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
  }
}

export class InventoryVariantDto {
  id: string;
  productId: string;
  color: string;
  storage: string | null;
  ram: string | null;
  price: number;
  sku: string;
  isActive: boolean;
  product?: InventoryProductDto;

  constructor(data: any) {
    this.id = data.id;
    this.productId = data.productId;
    this.color = data.color;
    this.storage = data.storage;
    this.ram = data.ram;
    this.price = Number(data.price);
    this.sku = data.sku;
    this.isActive = data.isActive;

    if (data.product) {
      this.product = new InventoryProductDto(data.product);
    }
  }
}

export class InventoryDto {
  id: string;
  variantId: string;
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  variant?: InventoryVariantDto;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.variantId = data.variantId;
    this.quantity = data.quantity;
    this.reserved = data.reserved;
    this.available = data.available;
    this.minStock = data.minStock;
    this.maxStock = data.maxStock;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    // Optional fields
    if (data.isLowStock !== undefined) {
      this.isLowStock = data.isLowStock;
    }

    if (data.isOutOfStock !== undefined) {
      this.isOutOfStock = data.isOutOfStock;
    }

    if (data.variant) {
      this.variant = new InventoryVariantDto(data.variant);
    }
  }
}

export class InventoryCatalogVariantDto {
  id: string;
  productId: string;
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

  constructor(data: any) {
    this.id = data.id;
    this.productId = data.productId;
    this.sku = data.sku;
    this.color = data.color ?? null;
    this.storage = data.storage ?? null;
    this.ram = data.ram ?? null;
    this.isActive = Boolean(data.isActive);
    this.optionLabels = [data.color, data.storage, data.ram].filter(Boolean);

    const inventory = data.inventory ?? {};
    this.quantity = inventory.quantity ?? 0;
    this.reserved = inventory.reserved ?? 0;
    this.available = inventory.available ?? 0;
    this.minStock = inventory.minStock ?? 0;
    this.maxStock = inventory.maxStock ?? 0;
    this.isLowStock =
      this.minStock > 0 && this.available < this.minStock;
  }
}

export class InventoryCatalogProductDto {
  id: string;
  name: string;
  slug: string;
  brand?: {
    id: string;
    name: string;
    slug?: string | null;
  };
  variants: InventoryCatalogVariantDto[];

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;

    if (data.brand) {
      this.brand = {
        id: data.brand.id,
        name: data.brand.name,
        slug: data.brand.slug,
      };
    }

    this.variants = Array.isArray(data.variants)
      ? data.variants.map((variant: any) => new InventoryCatalogVariantDto(variant))
      : [];
  }
}

export class UserDto {
  id: string;
  name: string | null;
  email: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
  }
}

export class StockMovementDto {
  id: string;
  inventoryId: string;
  variantId: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  referenceId: string | null;
  userId: string | null;
  variant?: InventoryVariantDto;
  user?: UserDto;
  createdAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.inventoryId = data.inventoryId;
    this.variantId = data.variantId;
    this.type = data.type;
    this.quantity = data.quantity;
    this.previousStock = data.previousStock;
    this.newStock = data.newStock;
    this.reason = data.reason;
    this.referenceId = data.referenceId;
    this.userId = data.userId;
    this.createdAt = data.createdAt;

    if (data.variant) {
      this.variant = new InventoryVariantDto(data.variant);
    }

    if (data.user) {
      this.user = new UserDto(data.user);
    }
  }
}
