export class ProductImageDto {
  id: string;
  url: string;
  sortOrder: number;

  constructor(data: any) {
    this.id = data.id;
    this.url = data.url;
    this.sortOrder = data.sortOrder;
  }
}

export class CartProductDto {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: ProductImageDto[];

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.basePrice = Number(data.basePrice); // Convert Decimal to number
    this.images = data.images?.map((img: any) => new ProductImageDto(img)) || [];
  }
}

export class CartVariantDto {
  id: string;
  productId: string;
  color: string;
  storage: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  product: CartProductDto;

  constructor(data: any) {
    this.id = data.id;
    this.productId = data.productId;
    this.color = data.color;
    this.storage = data.storage;
    this.price = Number(data.price); // Convert Decimal to number
    this.stock = data.stock;
    this.isActive = data.isActive;
    this.product = new CartProductDto(data.product);
  }
}

export class CartItemDto {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: CartVariantDto;
  itemSubtotal: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.cartId = data.cartId;
    this.variantId = data.variantId;
    this.quantity = data.quantity;
    this.variant = new CartVariantDto(data.variant);
    this.itemSubtotal = data.variant.price * data.quantity;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class CartDto {
  id: string | null;
  userId: string;
  items: CartItemDto[];
  subtotal: number;
  totalItems: number;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.userId;
    this.items = data.items?.map((item: any) => new CartItemDto(item)) || [];
    this.subtotal = data.subtotal || 0;
    this.totalItems = data.totalItems || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
