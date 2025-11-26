import { PrismaClient } from '@prisma/client';
import { UserRepository } from './UserRepository';
import { ProductRepository } from './ProductRepository';
import { BrandRepository } from './BrandRepository';
import { CategoryRepository } from './CategoryRepository';
import { ReviewRepository } from './ReviewRepository';
import { CommentRepository } from './CommentRepository';
import { CartRepository } from './CartRepository';
import { InventoryRepository } from './InventoryRepository';
import { OrderRepository } from './OrderRepository';
import { WishlistRepository } from './WishlistRepository';
import { VoucherRepository } from './VoucherRepository';
import { ProductVariantRepository } from './ProductVariantRepository';
import { ProductVariantSentimentRepository } from './ProductVariantSentimentRepository';

export class RepositoryFactory {
  private static prisma: PrismaClient;

  static initialize(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  static getUserRepository(): UserRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new UserRepository(this.prisma);
  }

  static getProductRepository(): ProductRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new ProductRepository(this.prisma);
  }

  static getProductVariantRepository(): ProductVariantRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new ProductVariantRepository(this.prisma);
  }

  static getBrandRepository(): BrandRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new BrandRepository(this.prisma);
  }

  static getCategoryRepository(): CategoryRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new CategoryRepository(this.prisma);
  }

  static getReviewRepository(): ReviewRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new ReviewRepository(this.prisma);
  }

  static getCommentRepository(): CommentRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new CommentRepository(this.prisma);
  }

  static getCartRepository(): CartRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new CartRepository(this.prisma);
  }

  static getInventoryRepository(): InventoryRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new InventoryRepository(this.prisma);
  }

  static getPrisma(): PrismaClient {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return this.prisma;
  }

  static getOrderRepository(): OrderRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new OrderRepository(this.prisma);
  }

  static getWishlistRepository(): WishlistRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new WishlistRepository(this.prisma);
  }

  static getVoucherRepository(): VoucherRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new VoucherRepository(this.prisma);
  }

  static getProductVariantSentimentRepository(): ProductVariantSentimentRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new ProductVariantSentimentRepository(this.prisma);
  }
}
