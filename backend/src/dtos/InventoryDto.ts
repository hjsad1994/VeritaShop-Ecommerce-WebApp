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
