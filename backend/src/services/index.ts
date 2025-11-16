import { UserService } from './UserServices';
import { RepositoryFactory } from '../repositories';
import { AuthService } from './AuthService';
import { ProductService } from './ProductService';

export class ServiceFactory {
  private static authService: AuthService;
  private static userService: UserService;
  private static productService: ProductService;

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

  static getProductService(): ProductService {
    if (!this.productService) {
      const productRepository = RepositoryFactory.getProductRepository();
      this.productService = new ProductService(productRepository);
    }
    return this.productService;
  }
}
