import { User } from '@prisma/client';

export class UserDto {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
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
