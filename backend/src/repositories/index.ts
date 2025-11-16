import { PrismaClient } from '@prisma/client';
import { UserRepository } from './UserRepository';
import { ProductRepository } from './ProductRepository';
import { BrandRepository } from './BrandRepository';

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

  static getBrandRepository(): BrandRepository {
    if (!this.prisma) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return new BrandRepository(this.prisma);
  }
}
