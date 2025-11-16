import { UserService } from './UserServices';
import { RepositoryFactory } from '../repositories';
import { AuthService } from './AuthService';

export class ServiceFactory {
  private static authService: AuthService;
  private static userService: UserService;

  static getAuthService(): AuthService {
    if (!this.authService) {
      const userRepository = RepositoryFactory.getUserRepository();
      this.authService = new AuthService(userRepository);
    }
    return this.authService;
  }
  static getUserService(): UserService {
    if (!this.userService) {
      const userRepository = RepositoryFactory.getUserRepository();
      this.userService = new UserService(userRepository);
    }
    return this.userService;
  }
}
