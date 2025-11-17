import { PrismaClient, Category } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { ERROR_MESSAGES } from '../constants';

export interface CreateCategoryData {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive?: boolean;
}

export interface UpdateCategoryData {
    name?: string;
    slug?: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive?: boolean;
}

export interface CategoryQueryOptions {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    includeChildren?: boolean;
}

export class CategoryRepository extends BaseRepository<Category> {
    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Lấy danh sách tất cả categories với pagination và filter
     */
    async findAll(options: CategoryQueryOptions): Promise<{
        categories: any[];
        total: number;
    }> {
        const {
            page = 1,
            limit = 20,
            search,
            isActive = true,
            includeChildren = false
        } = options;

        const skip = (page - 1) * limit;

        const where: any = {
            isActive
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const include: any = {
            _count: {
                select: { products: true }
            }
        };

        if (includeChildren) {
            include.children = {
                include: {
                    _count: {
                        select: { products: true }
                    }
                }
            };
        }

        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take: limit,
                include,
                orderBy: {
                    name: 'asc'
                }
            }),
            this.prisma.category.count({ where })
        ]);

        return { categories, total };
    }

    /**
     * Tìm category theo ID hoặc slug với tất cả relations
     */
    async findById(idOrSlug: string): Promise<any | null> {
        const category = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug }
                ]
            },
            include: {
                parent: true,
                children: {
                    include: {
                        _count: {
                            select: { products: true }
                        }
                    }
                },
                _count: {
                    select: { products: true }
                }
            }
        });

        return category;
    }

    /**
     * Tìm category chỉ theo slug
     */
    async findBySlug(slug: string): Promise<Category | null> {
        const category = await this.prisma.category.findUnique({
            where: { slug }
        });

        return category;
    }

    /**
     * Lấy danh sách top-level categories (không có parent)
     */
    async findTopLevel(limit?: number): Promise<any[]> {
        const categories = await this.prisma.category.findMany({
            where: {
                parentId: null,
                isActive: true
            },
            include: {
                children: {
                    include: {
                        _count: {
                            select: { products: true }
                        }
                    }
                },
                _count: {
                    select: { products: true }
                }
            },
            orderBy: {
                name: 'asc'
            },
            take: limit
        });

        return categories;
    }

    /**
     * Lấy danh sách child categories của một parent
     */
    async findChildren(parentId: string): Promise<any[]> {
        const children = await this.prisma.category.findMany({
            where: {
                parentId,
                isActive: true
            },
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return children;
    }

    /**
     * Lấy category với danh sách products
     */
    async findWithProducts(idOrSlug: string): Promise<any | null> {
        const category = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug }
                ]
            },
            include: {
                products: {
                    where: {
                        isActive: true
                    },
                    include: {
                        brand: true,
                        images: {
                            where: { isPrimary: true },
                            take: 1
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: { products: true }
                }
            }
        });

        return category;
    }

    /**
     * Tạo category mới
     */
    async create(data: CreateCategoryData): Promise<Category> {
        const slug = data.slug || this.generateSlug(data.name);

        // Check slug uniqueness
        const existingCategory = await this.slugExists(slug);
        if (existingCategory) {
            throw new Error(ERROR_MESSAGES.CATEGORY_SLUG_EXISTS);
        }

        // Validate parent exists if provided
        if (data.parentId) {
            const parentExists = await this.prisma.category.findUnique({
                where: { id: data.parentId }
            });
            if (!parentExists) {
                throw new Error(ERROR_MESSAGES.CATEGORY_PARENT_NOT_FOUND);
            }
        }

        const category = await this.prisma.category.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                image: data.image,
                parentId: data.parentId,
                isActive: data.isActive ?? true
            }
        });

        return category;
    }

    /**
     * Cập nhật category
     */
    async update(id: string, data: UpdateCategoryData): Promise<Category> {
        // Check if category exists
        const existingCategory = await this.prisma.category.findUnique({
            where: { id }
        });

        if (!existingCategory) {
            throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }

        // If updating name and no slug provided, regenerate slug
        let slug = data.slug;
        if (data.name && !data.slug) {
            slug = this.generateSlug(data.name);
        }

        // Check slug uniqueness if slug is being updated
        if (slug && slug !== existingCategory.slug) {
            const slugTaken = await this.slugExists(slug, id);
            if (slugTaken) {
                throw new Error(ERROR_MESSAGES.CATEGORY_SLUG_EXISTS);
            }
        }

        // Validate circular reference if updating parentId
        if (data.parentId !== undefined) {
            if (data.parentId === id) {
                throw new Error(ERROR_MESSAGES.CATEGORY_CANNOT_BE_OWN_PARENT);
            }

            if (data.parentId) {
                // Check if new parent exists
                const newParent = await this.prisma.category.findUnique({
                    where: { id: data.parentId }
                });
                if (!newParent) {
                    throw new Error(ERROR_MESSAGES.CATEGORY_PARENT_NOT_FOUND);
                }

                // Check for circular reference (prevent parent being a descendant)
                const isDescendant = await this.isDescendantOf(data.parentId, id);
                if (isDescendant) {
                    throw new Error(ERROR_MESSAGES.CATEGORY_CIRCULAR_REFERENCE);
                }
            }
        }

        // Filter undefined fields
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (slug !== undefined) updateData.slug = slug;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.parentId !== undefined) updateData.parentId = data.parentId;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const category = await this.prisma.category.update({
            where: { id },
            data: updateData
        });

        return category;
    }

    /**
     * Xóa category (hard delete)
     */
    async delete(id: string): Promise<Category> {
        const category = await this.prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }

        // Check if category has active products
        const productCount = await this.prisma.product.count({
            where: {
                categoryId: id,
                isActive: true
            }
        });

        if (productCount > 0) {
            throw new Error(`${ERROR_MESSAGES.CATEGORY_HAS_PRODUCTS} (${productCount} sản phẩm)`);
        }

        await this.prisma.category.delete({
            where: { id }
        });

        return category;
    }

    /**
     * Kiểm tra slug đã tồn tại chưa
     */
    async slugExists(slug: string, excludeId?: string): Promise<boolean> {
        const where: any = { slug };
        if (excludeId) {
            where.id = { not: excludeId };
        }

        const category = await this.prisma.category.findFirst({ where });
        return !!category;
    }

    /**
     * Kiểm tra xem category A có là descendant của category B không (recursive)
     */
    private async isDescendantOf(categoryId: string, ancestorId: string): Promise<boolean> {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category) return false;
        if (!category.parentId) return false;
        if (category.parentId === ancestorId) return true;

        // Recursively check parent chain
        return this.isDescendantOf(category.parentId, ancestorId);
    }

    /**
     * Tạo slug từ name (Vietnamese-aware)
     */
    generateSlug(name: string): string {
        let slug = name.toLowerCase();
        
        // Normalize Unicode (NFD)
        slug = slug.normalize('NFD');
        
        // Remove diacritics
        slug = slug.replace(/[\u0300-\u036f]/g, '');
        
        // Convert đ and Đ
        slug = slug.replace(/đ/g, 'd').replace(/Đ/g, 'd');
        
        // Replace spaces and special chars with hyphens
        slug = slug.replace(/[^a-z0-9]+/g, '-');
        
        // Remove leading/trailing hyphens
        slug = slug.replace(/^-+|-+$/g, '');
        
        return slug;
    }
}
