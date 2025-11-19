import { PrismaClient, Product } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export interface ProductImageData {
    s3Key: string;
    cloudFrontUrl?: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
}

export interface CreateProductData {
    name: string;
    slug?: string;
    description?: string;
    brandId: string;
    categoryId: string;
    basePrice: number;
    discount?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    images?: ProductImageData[];
}

export interface UpdateProductData {
    name?: string;
    slug?: string;
    description?: string;
    brandId?: string;
    categoryId?: string;
    basePrice?: number;
    discount?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    images?: ProductImageData[];
    imageIdsToDelete?: string[];
}

export interface ProductFilters {
    brand?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    isFeatured?: boolean;
    isActive?: boolean;
}

export interface ProductSortOptions {
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'name_asc' | 'name_desc';
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface ProductQueryOptions extends ProductFilters, ProductSortOptions, PaginationOptions {}

export class ProductRepository extends BaseRepository<Product> {
    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    async findAll(options: ProductQueryOptions): Promise<{
        products: Product[];
        total: number;
    }> {
        const {
            page = 1,
            limit = 10,
            brand,
            category,
            minPrice,
            maxPrice,
            search,
            sortBy,
            isFeatured,
            isActive = true
        } = options;

        const skip = (page - 1) * limit;

        const where: any = {
            isActive
        };

        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }

        if (brand) {
            where.brand = {
                OR: [
                    { name: { contains: brand, mode: 'insensitive' } },
                    { slug: { contains: brand, mode: 'insensitive' } }
                ]
            };
        }

        if (category) {
            where.category = {
                OR: [
                    { name: { contains: category, mode: 'insensitive' } },
                    { slug: { contains: category, mode: 'insensitive' } }
                ]
            };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.basePrice = {};
            if (minPrice !== undefined) {
                where.basePrice.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.basePrice.lte = maxPrice;
            }
        }

        let orderBy: any = {};
        switch (sortBy) {
            case 'price_asc':
                orderBy = { basePrice: 'asc' };
                break;
            case 'price_desc':
                orderBy = { basePrice: 'desc' };
                break;
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'name_asc':
                orderBy = { name: 'asc' };
                break;
            case 'name_desc':
                orderBy = { name: 'desc' };
                break;
            case 'popular':
                orderBy = { soldCount: 'desc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }

        const total = await this.prisma.product.count({ where });
        const products = await this.prisma.product.findMany({
            skip,
            take: limit,
            where,
            orderBy,
            include: {
                brand: true,
                category: true
            }
        });
        return { products, total };
    }
    /**
     * Find product by ID with all relations
     */
    async findById(id: string): Promise<Product | null> {
        return this.prisma.product.findFirst({
            where: { 
                OR: [
                    { id },
                    { slug: id }
                ],
                isActive: true 
            },
            include: {
                brand: true,
                category: true,
                specs: true,
                variants: {
                    include: {
                        images: true
                    }
                },
                images: true,
                reviews: true
            }
        });
    }

    async findByIdForAdmin(id: string): Promise<Product | null> {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                brand: true,
                category: true,
                specs: true,
                variants: {
                    include: {
                        images: true,
                    },
                },
                images: true,
            },
        });
    }
    /**
     * Find featured products
     */
    async findFeatured(limit: number = 8): Promise<Product[]> {
        return this.prisma.product.findMany({
            where: { 
                isFeatured: true,
                isActive: true 
            },
            orderBy: { createdAt: 'desc' },
            include: {
                brand: true,
                category: true,
                images: {
                    where: { isPrimary: true },
                    take: 1
                }
            },
            take: limit
        });
    }
    /**
     * Find popular products (by soldCount)
     */
    async findPopular(limit: number = 8): Promise<Product[]> {
        return this.prisma.product.findMany({
            where: { isActive: true },
            orderBy: { soldCount: 'desc' },
            include: {
                brand: true,
                category: true,
                images: {
                    where: { isPrimary: true },
                    take: 1
                }
            },
            take: limit
        });
    }

    async create(data: CreateProductData): Promise<Product> {
        return await this.prisma.$transaction(async (tx) => {
            // 1. Validate brandId exists
            if (data.brandId) {
                const brand = await tx.brand.findUnique({
                    where: { id: data.brandId }
                });
                if (!brand) {
                    throw new Error(`Brand with id ${data.brandId} not found`);
                }
            }

            // 2. Validate categoryId exists
            if (data.categoryId) {
                const category = await tx.category.findUnique({
                    where: { id: data.categoryId }
                });
                if (!category) {
                    throw new Error(`Category with id ${data.categoryId} not found`);
                }
            }

            // 3. Generate slug if not provided
            const slug = data.slug || this.generateSlug(data.name);

            // 4. Check slug uniqueness
            const existingProduct = await tx.product.findUnique({
                where: { slug }
            });
            if (existingProduct) {
                throw new Error(`Product with slug ${slug} already exists`);
            }

            // 5. Create product
            const product = await tx.product.create({
                data: {
                    name: data.name,
                    slug,
                    description: data.description,
                    brandId: data.brandId,
                    categoryId: data.categoryId,
                    basePrice: data.basePrice,
                    discount: data.discount || 0,
                    isActive: data.isActive ?? true,
                    isFeatured: data.isFeatured ?? false,
                },
                include: {
                    brand: true,
                    category: true,
                    variants: true,
                    images: true,
                    reviews: true,
                    specs: true
                }
            });

            // 6. Create images if provided
            if (data.images && data.images.length > 0) {
                // Validate max 4 images
                if (data.images.length > 4) {
                    throw new Error('Maximum 4 images allowed per product');
                }

                const imageData = data.images.map((img, index) => ({
                    productId: product.id,
                    url: img.s3Key, // Store S3 key in database
                    altText: img.altText || null,
                    isPrimary: index === 0 || img.isPrimary || false, // First image is primary by default
                    sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
                }));

                // Ensure only one primary image
                if (imageData.filter(img => img.isPrimary).length > 1) {
                    // Keep only first as primary
                    imageData.forEach((img, idx) => {
                        img.isPrimary = idx === 0;
                    });
                }

                await tx.productImage.createMany({
                    data: imageData,
                });

                // Reload product with images
                return await tx.product.findUnique({
                    where: { id: product.id },
                    include: {
                        brand: true,
                        category: true,
                        variants: true,
                        images: true,
                        reviews: true,
                        specs: true
                    }
                }) as Product;
            }

            return product;
        });
    }
    async update(id: string, data: UpdateProductData): Promise<Product> {
        return await this.prisma.$transaction(async (tx) => {
            // 1. Validate brandId if provided
            if (data.brandId) {
                const brand = await tx.brand.findUnique({
                    where: { id: data.brandId }
                });
                if (!brand) {
                    throw new Error(`Brand with id ${data.brandId} not found`);
                }
            }

            // 2. Validate categoryId if provided
            if (data.categoryId) {
                const category = await tx.category.findUnique({
                    where: { id: data.categoryId }
                });
                if (!category) {
                    throw new Error(`Category with id ${data.categoryId} not found`);
                }
            }

            // 3. Generate slug if name is being updated
            const slug = data.name ? (data.slug || this.generateSlug(data.name)) : data.slug;

            // 4. Check slug uniqueness if slug is being updated
            if (slug) {
                const existingProduct = await tx.product.findFirst({
                    where: {
                        slug,
                        NOT: { id }
                    }
                });
                if (existingProduct) {
                    throw new Error(`Product with slug ${slug} already exists`);
                }
            }

            // 5. Update product
            const product = await tx.product.update({
                where: { id },
                data: {
                    ...(data.name && { name: data.name }),
                    ...(slug && { slug }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.brandId && { brandId: data.brandId }),
                    ...(data.categoryId && { categoryId: data.categoryId }),
                    ...(data.basePrice && { basePrice: data.basePrice }),
                    ...(data.discount !== undefined && { discount: data.discount }),
                    ...(data.isActive !== undefined && { isActive: data.isActive }),
                    ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
                },
                include: {
                    brand: true,
                    category: true,
                    variants: true,
                    images: true,
                    reviews: true,
                    specs: true
                }
            });

            // 6. Handle image deletions
            if (data.imageIdsToDelete && data.imageIdsToDelete.length > 0) {
                await tx.productImage.deleteMany({
                    where: {
                        id: { in: data.imageIdsToDelete },
                        productId: id,
                    },
                });
            }

            // 7. Handle image additions
            if (data.images && data.images.length > 0) {
                // Get current image count
                const currentImageCount = await tx.productImage.count({
                    where: { productId: id },
                });

                // Calculate how many images we can add (max 4 total)
                const remainingSlots = 4 - currentImageCount;
                if (data.images.length > remainingSlots) {
                    throw new Error(`Maximum 4 images allowed per product. Can only add ${remainingSlots} more.`);
                }

                const imageData = data.images.map((img, index) => ({
                    productId: id,
                    url: img.s3Key, // Store S3 key in database
                    altText: img.altText || null,
                    isPrimary: img.isPrimary || false,
                    sortOrder: img.sortOrder !== undefined ? img.sortOrder : currentImageCount + index,
                }));

                // If setting a new primary image, unset others
                if (imageData.some(img => img.isPrimary)) {
                    await tx.productImage.updateMany({
                        where: { productId: id },
                        data: { isPrimary: false },
                    });
                }

                await tx.productImage.createMany({
                    data: imageData,
                });
            }

            // 8. Reload product with updated images
            return await tx.product.findUnique({
                where: { id },
                include: {
                    brand: true,
                    category: true,
                    variants: true,
                    images: true,
                    reviews: true,
                    specs: true
                }
            }) as Product;
        });
    }

    async getProductImageKeys(productId: string, imageIds: string[]): Promise<string[]> {
        if (!imageIds || imageIds.length === 0) {
            return [];
        }

        const images = await this.prisma.productImage.findMany({
            where: {
                id: { in: imageIds },
                productId
            },
            select: {
                url: true
            }
        });

        return images.map((image) => image.url);
    }

    /**
     * Delete product permanently (cascades to related entities)
     */
    async delete(id: string): Promise<Product> {
        return this.prisma.product.delete({
            where: { id },
            include: {
                brand: true,
                category: true,
                variants: true,
                images: true,
                reviews: true,
                specs: true
            }
        });
    }

    /**
     * Increment product view count
     */
    async incrementViewCount(id: string): Promise<Product> {
        return this.prisma.product.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1
                }
            }
        });
    }

    /**
     * Check if brand exists
     */
    async brandExists(brandId: string): Promise<boolean> {
        const brand = await this.prisma.brand.findUnique({
            where: { id: brandId }
        });
        return brand !== null;
    }

    /**
     * Check if category exists
     */
    async categoryExists(categoryId: string): Promise<boolean> {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId }
        });
        return category !== null;
    }

    /**
     * Check if slug exists
     */
    async slugExists(slug: string, excludeId?: string): Promise<boolean> {
        const whereCondition: any = { slug };
        
        // If excludeId is provided, exclude that product from search
        if (excludeId) {
            whereCondition.NOT = { id: excludeId };
        }
        const product = await this.prisma.product.findFirst({
            where: whereCondition
        });

        return product !== null;
    }

    /**
     * Find product variant by ID with product relation
     */
    async findVariantById(variantId: string) {
        return await this.prisma.productVariant.findUnique({
            where: { id: variantId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        isActive: true,
                    },
                },
            },
        });
    }

    /**
     * Generate slug from product name
     */
    private generateSlug(name: string): string {
        return name
            .toLowerCase()                          // 1. Lowercase
            .normalize('NFD')                       // 2. Normalize Unicode (é → e + ́)
            .replace(/[\u0300-\u036f]/g, '')       // 3. Remove diacritics (accents)
            .replace(/đ/g, 'd')                    // 4. Vietnamese đ → d
            .replace(/Đ/g, 'd')                    // 4. Vietnamese Đ → d
            .replace(/[^a-z0-9\s-]/g, '')          // 5. Remove special chars (keep space & -)
            .replace(/\s+/g, '-')                  // 6. Replace spaces with hyphens
            .replace(/-+/g, '-')                   // 7. Replace multiple hyphens with single
            .replace(/^-+|-+$/g, '');              // 8. Trim leading/trailing hyphens
    }

}
