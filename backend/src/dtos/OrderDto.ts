export class OrderUserDto {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
  }
}

export class OrderProductImageDto {
  id: string;
  url: string;

  constructor(data: any) {
    this.id = data.id;
    this.url = data.url;
  }
}

export class OrderProductDto {
  id: string;
  name: string;
  slug: string;
  images: OrderProductImageDto[];

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.images = data.images?.map((img: any) => new OrderProductImageDto(img)) || [];
  }
}

export class OrderVariantDto {
  id: string;
  color: string;
  storage: string | null;
  price: number;
  product: OrderProductDto;

  constructor(data: any) {
    this.id = data.id;
    this.color = data.color;
    this.storage = data.storage;
    this.price = Number(data.price);
    this.product = new OrderProductDto(data.product);
  }
}

export class OrderItemDto {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantInfo: string;
  price: number;
  quantity: number;
  subtotal: number;
  variant: OrderVariantDto;
  createdAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.orderId = data.orderId;
    this.variantId = data.variantId;
    this.productName = data.productName;
    this.variantInfo = data.variantInfo;
    this.price = Number(data.price);
    this.quantity = data.quantity;
    this.subtotal = Number(data.subtotal);
    this.variant = new OrderVariantDto(data.variant);
    this.createdAt = data.createdAt;
  }
}

export class OrderDto {
  id: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  isPaid: boolean;
  paidAt: Date | null;
  notes: string | null;
  cancelReason: string | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: OrderUserDto;
  items: OrderItemDto[];

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.userId;
    this.orderNumber = data.orderNumber;
    this.customerName = data.customerName;
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone;
    this.shippingAddress = data.shippingAddress;
    this.subtotal = Number(data.subtotal);
    this.discount = Number(data.discount);
    this.shippingFee = Number(data.shippingFee);
    this.tax = Number(data.tax);
    this.total = Number(data.total);
    this.status = data.status;
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus;
    this.isPaid = data.isPaid;
    this.paidAt = data.paidAt;
    this.notes = data.notes;
    this.cancelReason = data.cancelReason;
    this.deliveredAt = data.deliveredAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.user = new OrderUserDto(data.user);
    this.items = data.items?.map((item: any) => new OrderItemDto(item)) || [];
  }

  static fromOrder(data: any): OrderDto {
    return new OrderDto(data);
  }

  static fromOrderList(
    data: any[],
    page: number,
    limit: number,
    total: number
  ): {
    items: OrderDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } {
    return {
      items: data.map((item) => new OrderDto(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export class OrderSummaryDto {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.orderNumber = data.orderNumber;
    this.customerName = data.customerName;
    this.total = Number(data.total);
    this.status = data.status;
    this.paymentStatus = data.paymentStatus;
    this.itemCount = data.items?.length || 0;
    this.createdAt = data.createdAt;
  }

  static fromOrderList(
    data: any[],
    page: number,
    limit: number,
    total: number
  ): {
    items: OrderSummaryDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } {
    return {
      items: data.map((item) => new OrderSummaryDto(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
