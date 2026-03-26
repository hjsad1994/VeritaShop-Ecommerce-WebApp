import {
	type Order,
	OrderStatus,
	type PaymentStatus,
	type Prisma,
	type PrismaClient,
} from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface CreateOrderData {
	userId: string;
	orderNumber: string;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	shippingAddress: string;
	subtotal: number;
	discount?: number;
	shippingFee?: number;
	tax?: number;
	total: number;
	paymentMethod?: string;
	notes?: string;
	cartId: string;
	items: {
		variantId: string;
		productName: string;
		variantInfo: string;
		price: number;
		quantity: number;
		subtotal: number;
	}[];
}

export interface OrderFilters {
	userId?: string;
	status?: OrderStatus;
	paymentStatus?: PaymentStatus;
	searchTerm?: string;
	startDate?: Date;
	endDate?: Date;
}

export interface OrderListOptions {
	filters?: OrderFilters;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export class OrderRepository extends BaseRepository<Order> {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	/**
	 * Find order by ID with full relations
	 */
	async findById(id: string): Promise<Order | null> {
		return await this.prisma.order.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
				items: {
					include: {
						variant: {
							include: {
								product: {
									select: {
										id: true,
										name: true,
										slug: true,
										images: {
											where: { isPrimary: true },
											take: 1,
										},
									},
								},
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Find order by order number
	 */
	async findByOrderNumber(orderNumber: string): Promise<Order | null> {
		return await this.prisma.order.findUnique({
			where: { orderNumber },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				items: {
					include: {
						variant: {
							include: {
								product: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Find all orders with filters and pagination
	 */
	async findAll(
		options: OrderListOptions,
	): Promise<{ data: Order[]; total: number }> {
		const {
			filters = {},
			page = 1,
			limit = 10,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = options;

		// Build where clause
		const where: Prisma.OrderWhereInput = {};

		if (filters.userId) {
			where.userId = filters.userId;
		}

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.paymentStatus) {
			where.paymentStatus = filters.paymentStatus;
		}

		if (filters.searchTerm) {
			where.OR = [
				{ orderNumber: { contains: filters.searchTerm, mode: "insensitive" } },
				{ customerName: { contains: filters.searchTerm, mode: "insensitive" } },
				{
					customerEmail: { contains: filters.searchTerm, mode: "insensitive" },
				},
				{
					customerPhone: { contains: filters.searchTerm, mode: "insensitive" },
				},
			];
		}

		if (filters.startDate || filters.endDate) {
			where.createdAt = {};
			if (filters.startDate) {
				where.createdAt.gte = filters.startDate;
			}
			if (filters.endDate) {
				where.createdAt.lte = filters.endDate;
			}
		}

		// Build orderBy
		const orderBy: Prisma.OrderOrderByWithRelationInput = {
			[sortBy]: sortOrder,
		};

		// Calculate pagination
		const skip = (page - 1) * limit;
		const take = limit;

		// Execute query
		const [data, total] = await Promise.all([
			this.prisma.order.findMany({
				where,
				orderBy,
				skip,
				take,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					items: {
						include: {
							variant: {
								include: {
									product: {
										select: {
											id: true,
											name: true,
											slug: true,
											images: {
												where: { isPrimary: true },
												take: 1,
											},
										},
									},
								},
							},
						},
					},
				},
			}),
			this.prisma.order.count({ where }),
		]);

		return { data, total };
	}

	/**
	 * Create order with items in a transaction
	 */
	async create(orderData: CreateOrderData): Promise<Order> {
		return await this.prisma.$transaction(async (tx) => {
			// Create order
			const order = await tx.order.create({
				data: {
					userId: orderData.userId,
					orderNumber: orderData.orderNumber,
					customerName: orderData.customerName,
					customerEmail: orderData.customerEmail,
					customerPhone: orderData.customerPhone,
					shippingAddress: orderData.shippingAddress,
					subtotal: orderData.subtotal,
					discount: orderData.discount || 0,
					shippingFee: orderData.shippingFee || 0,
					tax: orderData.tax || 0,
					total: orderData.total,
					paymentMethod: orderData.paymentMethod,
					notes: orderData.notes,
					items: {
						create: orderData.items,
					},
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					items: {
						include: {
							variant: {
								include: {
									product: {
										select: {
											id: true,
											name: true,
											slug: true,
											images: {
												where: { isPrimary: true },
												take: 1,
											},
										},
									},
								},
							},
						},
					},
				},
			});

			// Update product soldCount
			// Note: Stock management is now handled by InventoryService
			for (const item of orderData.items) {
				// Get product ID from variant
				const variant = await tx.productVariant.findUnique({
					where: { id: item.variantId },
					select: { productId: true },
				});

				if (variant) {
					await tx.product.update({
						where: { id: variant.productId },
						data: {
							soldCount: { increment: item.quantity },
						},
					});
				}
			}

			// Deduct inventory for each item
			for (const item of orderData.items) {
				const inventory = await tx.inventory.findUnique({
					where: { variantId: item.variantId },
					select: {
						id: true,
						available: true,
						version: true,
					},
				});

				if (!inventory) {
					throw new Error(`Inventory not found for variant ${item.variantId}`);
				}

				if (inventory.available < item.quantity) {
					throw new Error(`Insufficient stock for variant ${item.variantId}`);
				}

				const updateResult = await tx.inventory.updateMany({
					where: {
						variantId: item.variantId,
						version: inventory.version,
					},
					data: {
						quantity: { decrement: item.quantity },
						available: { decrement: item.quantity },
						version: { increment: 1 },
					},
				});

				if (updateResult.count === 0) {
					throw new Error("Xung đột tồn kho, vui lòng thử lại");
				}

				await tx.stockMovement.create({
					data: {
						inventoryId: inventory.id,
						variantId: item.variantId,
						type: "ORDER",
						quantity: item.quantity,
						previousStock: inventory.available,
						newStock: inventory.available - item.quantity,
						reason: `Order ${orderData.orderNumber}`,
						referenceId: order.id,
					},
				});
			}

			// Clear cart inside transaction
			await tx.cartItem.deleteMany({
				where: { cartId: orderData.cartId },
			});

			return order;
		});
	}

	/**
	 * Update order status
	 */
	async updateStatus(
		id: string,
		status: OrderStatus,
		additionalData?: {
			paymentStatus?: PaymentStatus;
			isPaid?: boolean;
			paidAt?: Date;
			deliveredAt?: Date;
		},
	): Promise<Order> {
		return await this.prisma.order.update({
			where: { id },
			data: {
				status,
				...additionalData,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				items: {
					include: {
						variant: {
							include: {
								product: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Cancel order and restore stock
	 */
	async cancel(id: string, cancelReason?: string): Promise<Order> {
		return await this.prisma.$transaction(async (tx) => {
			// Get order with items
			const order = await tx.order.findUnique({
				where: { id },
				include: { items: true },
			});

			if (!order) {
				throw new Error("Order not found");
			}

			// Update order status
			const updatedOrder = await tx.order.update({
				where: { id },
				data: {
					status: OrderStatus.CANCELLED,
					cancelReason,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					items: {
						include: {
							variant: {
								include: {
									product: true,
								},
							},
						},
					},
				},
			});

			// Restore soldCount if order was not delivered
			// Note: Stock restoration is now handled by InventoryService
			if (order.status !== OrderStatus.DELIVERED) {
				for (const item of order.items) {
					// Get product ID from variant
					const variant = await tx.productVariant.findUnique({
						where: { id: item.variantId },
						select: { productId: true },
					});

					if (variant) {
						await tx.product.update({
							where: { id: variant.productId },
							data: {
								soldCount: { decrement: item.quantity },
							},
						});
					}
				}
			}

			// Restore inventory for each item
			for (const item of order.items) {
				const inventory = await tx.inventory.findUnique({
					where: { variantId: item.variantId },
					select: {
						id: true,
						available: true,
						version: true,
					},
				});

				if (inventory) {
					const updateResult = await tx.inventory.updateMany({
						where: {
							variantId: item.variantId,
							version: inventory.version,
						},
						data: {
							quantity: { increment: item.quantity },
							available: { increment: item.quantity },
							version: { increment: 1 },
						},
					});

					if (updateResult.count === 0) {
						throw new Error("Xung đột tồn kho, vui lòng thử lại");
					}

					await tx.stockMovement.create({
						data: {
							inventoryId: inventory.id,
							variantId: item.variantId,
							type: "ORDER_CANCELLED",
							quantity: item.quantity,
							previousStock: inventory.available,
							newStock: inventory.available + item.quantity,
							reason: `Order cancelled${cancelReason ? ": " + cancelReason : ""}`,
							referenceId: id,
						},
					});
				}
			}

			return updatedOrder;
		});
	}

	/**
	 * Count orders by user
	 */
	async countByUserId(userId: string): Promise<number> {
		return await this.prisma.order.count({
			where: { userId },
		});
	}

	/**
	 * Check if user has purchased a product (delivered order)
	 */
	async hasUserPurchasedProduct(
		userId: string,
		productId: string,
	): Promise<boolean> {
		const order = await this.prisma.order.findFirst({
			where: {
				userId,
				status: OrderStatus.DELIVERED,
				items: {
					some: {
						variant: {
							productId,
						},
					},
				},
			},
		});

		return !!order;
	}

	/**
	 * Generate unique order number
	 */
	async generateOrderNumber(): Promise<string> {
		const today = new Date();
		const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

		// Get count of orders today
		const startOfDay = new Date(today.setHours(0, 0, 0, 0));
		const endOfDay = new Date(today.setHours(23, 59, 59, 999));

		const count = await this.prisma.order.count({
			where: {
				createdAt: {
					gte: startOfDay,
					lte: endOfDay,
				},
			},
		});

		const orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(3, "0")}`;
		return orderNumber;
	}

	/**
	 * Get order statistics
	 */
	async getStatistics(userId?: string): Promise<{
		totalOrders: number;
		totalRevenue: number;
		pendingOrders: number;
		deliveredOrders: number;
	}> {
		const where: Prisma.OrderWhereInput = userId ? { userId } : {};

		const [totalOrders, pendingOrders, deliveredOrders, revenueData] =
			await Promise.all([
				this.prisma.order.count({ where }),
				this.prisma.order.count({
					where: { ...where, status: OrderStatus.PENDING },
				}),
				this.prisma.order.count({
					where: { ...where, status: OrderStatus.DELIVERED },
				}),
				this.prisma.order.aggregate({
					where: { ...where, status: OrderStatus.DELIVERED },
					_sum: { total: true },
				}),
			]);

		return {
			totalOrders,
			totalRevenue: Number(revenueData._sum.total || 0),
			pendingOrders,
			deliveredOrders,
		};
	}
}
