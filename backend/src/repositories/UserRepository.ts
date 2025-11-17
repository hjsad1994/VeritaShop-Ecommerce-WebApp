import { PrismaClient, User, Role, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  role?: Role;
  phone?: string;
  address?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  refreshToken?: string | null;
  role?: Role;
  isActive?: boolean;
}

export interface FindUsersParams {
  skip?: number;
  take?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}

export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { refreshToken },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  private buildUserWhereClause(params?: Omit<FindUsersParams, 'skip' | 'take'>): Prisma.UserWhereInput | undefined {
    if (!params) return undefined;

    const filters: Prisma.UserWhereInput[] = [];

    if (params.search) {
      filters.push({
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
        ],
      });
    }

    if (params.role) {
      filters.push({ role: params.role });
    }

    if (typeof params.isActive === 'boolean') {
      filters.push({ isActive: params.isActive });
    }

    if (!filters.length) {
      return undefined;
    }

    return { AND: filters };
  }

  async findAll(params: FindUsersParams = {}): Promise<User[]> {
    const { skip, take, ...filterParams } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      where: this.buildUserWhereClause(filterParams),
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(params?: Omit<FindUsersParams, 'skip' | 'take'>): Promise<number> {
    return this.prisma.user.count({
      where: this.buildUserWhereClause(params),
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null
  ): Promise<User> {
    return this.update(userId, { refreshToken });
  }
  async updateProfile(userId: string, data: UpdateUserData): Promise<User> {
    return this.update(userId, data);
  }
}
