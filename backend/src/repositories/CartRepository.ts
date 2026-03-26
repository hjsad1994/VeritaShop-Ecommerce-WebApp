import type { Prisma, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface CartWithItems {
	id: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	items: Array<any>;
}

export interface CartCalculations {
	subtotal: number;
	totalItems: number;
}

export class CartRepository extends BaseRepository<any> {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	private getPrismaClient(tx?: Prisma.TransactionClient) {
		return tx || this.prisma;
	}

	/**
	 * Find cart by user ID with full relations
	 */
	async findByUserId(
		userId: string,
		tx?: Prisma.TransactionClient,
	): Promise<CartWithItems | null> {
		const prisma = this.getPrismaClient(tx);

		return await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
					include: {
						variant: {
							include: {
								product: {
									select: {
										id: true,
										name: true,
										slug: true,
										basePrice: true,
										images: {
											select: {
												id: true,
												url: true,
												sortOrder: true,
											},
											orderBy: {
												sortOrder: "asc",
											},
										},
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				},
			},
		});
	}

	/**
	 * Create a new cart for user
	 */
	async createCart(userId: string, tx?: Prisma.TransactionClient) {
		const prisma = this.getPrismaClient(tx);

		return await prisma.cart.create({
			data: {
				userId,
			},
			include: {
				items: true,
			},
		});
	}

	/**
	 * Get or create cart for user
	 */
	async getOrCreateCart(
		userId: string,
		tx?: Prisma.TransactionClient,
	): Promise<CartWithItems> {
		let cart = await this.findByUserId(userId, tx);

		if (!cart) {
			const newCart = await this.createCart(userId, tx);
			cart = await this.findByUserId(userId, tx);
		}

		return cart!;
	}

	/**
	 * Find cart item by ID
	 */
	async findCartItemById(itemId: string, tx?: Prisma.TransactionClient) {
		const prisma = this.getPrismaClient(tx);

		return await prisma.cartItem.findUnique({
			where: { id: itemId },
			include: {
				cart: true,
				variant: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								slug: true,
								basePrice: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Find cart item by cart ID and variant ID
	 */
	async findCartItemByVariant(
		cartId: string,
		variantId: string,
		tx?: Prisma.TransactionClient,
	) {
		const prisma = this.getPrismaClient(tx);

		return await prisma.cartItem.findUnique({
			where: {
				cartId_variantId: {
					cartId,
					variantId,
				},
			},
			include: {
				variant: true,
			},
		});
	}

	/**
	 * Add item to cart or update quantity if already exists
	 */
	async addCartItem(
		cartId: string,
		variantId: string,
		quantity: number,
		tx?: Prisma.TransactionClient,
	) {
		const prisma = this.getPrismaClient(tx);

		// Check if item already exists in cart
		const existingItem = await this.findCartItemByVariant(
			cartId,
			variantId,
			tx,
		);

		if (existingItem) {
			// Update quantity if item exists
			return await prisma.cartItem.update({
				where: { id: existingItem.id },
				data: {
					quantity: existingItem.quantity + quantity,
				},
				include: {
					variant: {
						include: {
							product: {
								select: {
									id: true,
									name: true,
									slug: true,
									basePrice: true,
									images: {
										select: {
											id: true,
											url: true,
											sortOrder: true,
										},
										orderBy: {
											sortOrder: "asc",
										},
									},
								},
							},
						},
					},
				},
			});
		}

		// Create new cart item
		return await prisma.cartItem.create({
			data: {
				cartId,
				variantId,
				quantity,
			},
			include: {
				variant: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								slug: true,
								basePrice: true,
								images: {
									select: {
										id: true,
										url: true,
										sortOrder: true,
									},
									orderBy: {
										sortOrder: "asc",
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
	 * Update cart item quantity
	 */
	async updateCartItemQuantity(
		itemId: string,
		quantity: number,
		tx?: Prisma.TransactionClient,
	) {
		const prisma = this.getPrismaClient(tx);

		return await prisma.cartItem.update({
			where: { id: itemId },
			data: { quantity },
			include: {
				variant: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								slug: true,
								basePrice: true,
								images: {
									select: {
										id: true,
										url: true,
										sortOrder: true,
									},
									orderBy: {
										sortOrder: "asc",
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
	 * Remove cart item
	 */
	async removeCartItem(itemId: string) {
		return await this.prisma.cartItem.delete({
			where: { id: itemId },
		});
	}

	/**
	 * Clear all items from cart
	 */
	async clearCart(cartId: string) {
		return await this.prisma.cartItem.deleteMany({
			where: { cartId },
		});
	}

	/**
	 * Calculate cart totals
	 */
	calculateCartTotals(cart: CartWithItems): CartCalculations {
		const subtotal = cart.items.reduce((sum, item) => {
			return sum + item.variant.price * item.quantity;
		}, 0);

		const totalItems = cart.items.reduce((sum, item) => {
			return sum + item.quantity;
		}, 0);

		return {
			subtotal,
			totalItems,
		};
	}

	/**
	 * Get cart with calculations
	 */
	async getCartWithCalculations(userId: string) {
		const cart = await this.findByUserId(userId);

		if (!cart) {
			return null;
		}

		const calculations = this.calculateCartTotals(cart);

		return {
			...cart,
			...calculations,
		};
	}
}
