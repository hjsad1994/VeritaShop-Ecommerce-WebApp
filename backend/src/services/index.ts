import { RepositoryFactory } from '../repositories';
import { AuthService } from './AuthService';

export class ServiceFactory {
  private static authService: AuthService;

  static getAuthService(): AuthService {
    if (!this.authService) {
      const userRepository = RepositoryFactory.getUserRepository();
      this.authService = new AuthService(userRepository);
    }
    return this.authService;
  }
}
