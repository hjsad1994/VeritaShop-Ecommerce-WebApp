import { PrismaClient, Brand } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { ERROR_MESSAGES } from '../constants';

export interface CreateBrandData {
    name: string;
    slug?: string;
    logo?: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateBrandData {
    name?: string;
    slug?: string;
    logo?: string;
    description?: string;
    isActive?: boolean;
}

export interface BrandQueryOptions {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

export class BrandRepository extends BaseRepository<Brand> {
    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Lấy danh sách tất cả brands với pagination và filter
     */
    async findAll(options: BrandQueryOptions): Promise<{
        brands: Brand[];
        total: number;
    }> {
        const {
            page = 1,
            limit = 20,
            search,
            isActive = true
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

        const [brands, total] = await Promise.all([
            this.prisma.brand.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    name: 'asc'
                }
            }),
            this.prisma.brand.count({ where })
        ]);

        return { brands, total };
    }

    /**
     * Tìm brand theo ID hoặc slug
     */
    async findById(idOrSlug: string): Promise<Brand | null> {
        const brand = await this.prisma.brand.findFirst({
            where: {
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug }
                ]
            }
        });

        return brand;
    }

    /**
     * Tạo brand mới
     */
    async create(data: CreateBrandData): Promise<Brand> {
        const slug = data.slug || this.generateSlug(data.name);

        // Check slug uniqueness
        const existingBrand = await this.slugExists(slug);
        if (existingBrand) {
            throw new Error(ERROR_MESSAGES.BRAND_SLUG_EXISTS);
        }

        const brand = await this.prisma.brand.create({
            data: {
                name: data.name,
                slug,
                logo: data.logo,
                description: data.description,
                isActive: data.isActive ?? true
            }
        });

        return brand;
    }

    /**
     * Cập nhật brand
     */
    async update(id: string, data: UpdateBrandData): Promise<Brand> {
        // Check if brand exists
        const existingBrand = await this.prisma.brand.findUnique({
            where: { id }
        });

        if (!existingBrand) {
            throw new Error(ERROR_MESSAGES.BRAND_NOT_FOUND);
        }

        // If updating name and no slug provided, regenerate slug
        let slug = data.slug;
        if (data.name && !data.slug) {
            slug = this.generateSlug(data.name);
        }

        // Check slug uniqueness if slug is being updated
        if (slug && slug !== existingBrand.slug) {
            const slugTaken = await this.slugExists(slug, id);
            if (slugTaken) {
                throw new Error(ERROR_MESSAGES.BRAND_SLUG_EXISTS);
            }
        }

        // Filter undefined fields
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (slug !== undefined) updateData.slug = slug;
        if (data.logo !== undefined) updateData.logo = data.logo;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const brand = await this.prisma.brand.update({
            where: { id },
            data: updateData
        });

        return brand;
    }

    /**
     * Xóa brand (soft delete)
     */
    async delete(id: string): Promise<Brand> {
        const brand = await this.prisma.brand.update({
            where: { id },
            data: {
                isActive: false
            }
        });

        return brand;
    }

    /**
     * Lấy số lượng sản phẩm của brand
     */
    async getProductCount(brandId: string): Promise<number> {
        const count = await this.prisma.product.count({
            where: {
                brandId,
                isActive: true
            }
        });

        return count;
    }

    /**
     * Kiểm tra slug đã tồn tại chưa
     */
    async slugExists(slug: string, excludeId?: string): Promise<boolean> {
        const where: any = { slug };
        if (excludeId) {
            where.id = { not: excludeId };
        }

        const brand = await this.prisma.brand.findFirst({ where });
        return !!brand;
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
