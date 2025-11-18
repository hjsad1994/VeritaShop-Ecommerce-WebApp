import { User } from '@prisma/client';

export class UserDto {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  isActive: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.phone = user.phone;
    this.address = user.address;
    this.avatar = user.avatar;
    this.isActive = user.isActive;
  }

  static fromUser(user: User): UserDto {
    return new UserDto(user);
  }

  static fromUsers(users: User[]): UserDto[] {
    return users.map(user => new UserDto(user));
  }
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken?: string;
  refreshToken?: string;
}

export interface UpdateUserDataDto {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}
