import { PrismaClient } from '@prisma/client';
import { UserRepository } from './UserRepository';

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
}
