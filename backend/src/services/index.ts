import { UserService } from './UserServices';
import { RepositoryFactory } from '../repositories';
import { AuthService } from './AuthService';
import { ProductService } from './ProductService';
import { BrandService } from './BrandService';
import { CategoryService } from './CategoryService';
import { ReviewService } from './ReviewService';

export class ServiceFactory {
  private static authService: AuthService;
  private static userService: UserService;
  private static productService: ProductService;
  private static brandService: BrandService;
  private static categoryService: CategoryService;
  private static reviewService: ReviewService;

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

  static getBrandService(): BrandService {
    if (!this.brandService) {
      const brandRepository = RepositoryFactory.getBrandRepository();
      this.brandService = new BrandService(brandRepository);
    }
    return this.brandService;
  }

  static getCategoryService(): CategoryService {
    if (!this.categoryService) {
      const categoryRepository = RepositoryFactory.getCategoryRepository();
      this.categoryService = new CategoryService(categoryRepository);
    }
    return this.categoryService;
  }

  static getReviewService(): ReviewService {
    if (!this.reviewService) {
      const reviewRepository = RepositoryFactory.getReviewRepository();
      this.reviewService = new ReviewService(reviewRepository);
    }
    return this.reviewService;
  }
}
