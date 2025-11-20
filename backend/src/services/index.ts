import { UserService } from './UserServices';
import { RepositoryFactory } from '../repositories';
import { AuthService } from './AuthService';
import { ProductService } from './ProductService';
import { BrandService } from './BrandService';
import { CategoryService } from './CategoryService';
import { ReviewService } from './ReviewService';
import { CommentService } from './CommentService';
import { InventoryService } from './InventoryService';
import { WishlistService } from './WishlistService';
import { VoucherService } from './VoucherService';
import { ProductVariantRepository } from '../repositories/ProductVariantRepository';

export class ServiceFactory {
  private static authService: AuthService;
  private static userService: UserService;
  private static productService: ProductService;
  private static brandService: BrandService;
  private static categoryService: CategoryService;
  private static reviewService: ReviewService;
  private static commentService: CommentService;
  private static inventoryService: InventoryService;
  private static wishlistService: WishlistService;
  private static voucherService: VoucherService;

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
      const productVariantRepository = RepositoryFactory.getProductVariantRepository();
      const inventoryRepository = RepositoryFactory.getInventoryRepository();
      this.productService = new ProductService(productRepository, productVariantRepository, inventoryRepository);
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

  static getCommentService(): CommentService {
    if (!this.commentService) {
      const commentRepository = RepositoryFactory.getCommentRepository();
      this.commentService = new CommentService(commentRepository);
    }
    return this.commentService;
  }

  static getInventoryService(): InventoryService {
    if (!this.inventoryService) {
      this.inventoryService = new InventoryService();
    }
    return this.inventoryService;
  }

  static getWishlistService(): WishlistService {
    if (!this.wishlistService) {
      this.wishlistService = new WishlistService();
    }
    return this.wishlistService;
  }

  static getVoucherService(): VoucherService {
    if (!this.voucherService) {
      const voucherRepository = RepositoryFactory.getVoucherRepository();
      this.voucherService = new VoucherService(voucherRepository);
    }
    return this.voucherService;
  }
}
