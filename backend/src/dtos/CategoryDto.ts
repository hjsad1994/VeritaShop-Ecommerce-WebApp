import { Category } from '@prisma/client';

export interface CategoryWithChildren extends Category {
    children?: CategoryWithChildren[];
    _count?: {
        products: number;
    };
}

export class CategoryDto {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parentId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    productCount?: number;
    children?: CategoryDto[];

    constructor(category: CategoryWithChildren) {
        this.id = category.id;
        this.name = category.name;
        this.slug = category.slug;
        this.description = category.description;
        this.image = category.image;
        this.parentId = category.parentId;
        this.isActive = category.isActive;
        this.createdAt = category.createdAt;
        this.updatedAt = category.updatedAt;
        this.productCount = category._count?.products;

        // Recursively map children
        if (category.children && category.children.length > 0) {
            this.children = category.children.map(child => new CategoryDto(child));
        }
    }

    /**
     * Convert single category to DTO
     */
    static fromCategory(category: CategoryWithChildren): CategoryDto {
        return new CategoryDto(category);
    }

    /**
     * Convert list of categories to DTOs
     */
    static fromCategoryList(categories: CategoryWithChildren[]): CategoryDto[] {
        return categories.map(category => new CategoryDto(category));
    }

    /**
     * Convert category tree (with nested children) to DTOs
     */
    static fromCategoryTree(categories: CategoryWithChildren[]): CategoryDto[] {
        return categories.map(category => new CategoryDto(category));
    }
}
