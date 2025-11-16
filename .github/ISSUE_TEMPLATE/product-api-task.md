---
name: Task - Backend
about: Giao task phát triển Backend cho thành viên
title: '[BACKEND TASK] Product API - CRUD & Search/Filter'
labels: backend, task
assignees: 'hjsad1994'

---

## Thông tin Task

**Assignee:** @hjsad1994
**Priority:** [x] High / [ ] Medium / [ ] Low
**Due Date:** 2025-01-19
**Estimated Time:** 2-3 days

## Mô tả Task
Xây dựng hệ thống Product API đầy đủ bao gồm CRUD operations và chức năng tìm kiếm/lọc sản phẩm. API này sẽ phục vụ cho việc quản lý sản phẩm điện thoại trên nền tảng e-commerce VeritaShop.

## Yêu cầu chức năng

- [x] CRUD đầy đủ cho Product (Create, Read, Update, Delete)
- [x] Tìm kiếm và lọc sản phẩm theo nhiều tiêu chí (brand, category, price range, rating)
- [ ] Pagination và sorting cho danh sách sản phẩm
- [ ] Get featured products (sản phẩm nổi bật)
- [ ] Get product details với đầy đủ thông tin (variants, images, specs, reviews)
- [ ] Upload và quản lý product images
- [ ] Tự động tính toán averageRating và reviewCount
- [ ] Tăng viewCount khi xem chi tiết sản phẩm

## API Endpoints cần implement

### 1. Get All Products (với search & filter)
```
Method: GET
Path: /api/products
Description: Lấy danh sách sản phẩm với phân trang, tìm kiếm và lọc
```

**Query params:**
```typescript
{
  page?: number,           // default: 1
  limit?: number,          // default: 10
  search?: string,         // Tìm theo tên
  brandId?: string,        // Lọc theo thương hiệu
  categoryId?: string,     // Lọc theo danh mục
  minPrice?: number,       // Giá tối thiểu
  maxPrice?: number,       // Giá tối đa
  minRating?: number,      // Rating tối thiểu (1-5)
  isFeatured?: boolean,    // Sản phẩm nổi bật
  sortBy?: "price" | "createdAt" | "soldCount" | "rating",
  sortOrder?: "asc" | "desc"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    products: Product[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  },
  message: "Products retrieved successfully"
}
```

### 2. Get Product by ID
```
Method: GET
Path: /api/products/:id
Description: Lấy thông tin chi tiết sản phẩm (bao gồm variants, images, specs, reviews)
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    slug: string,
    description: string,
    basePrice: number,
    discount: number,
    isFeatured: boolean,
    viewCount: number,
    soldCount: number,
    averageRating: number,
    reviewCount: number,
    brand: { id, name, slug, logo },
    category: { id, name, slug },
    specs: ProductSpecs,
    variants: ProductVariant[],
    images: ProductImage[],
    reviews: Review[] // Lấy top reviews mới nhất
  },
  message: "Product details retrieved successfully"
}
```

### 3. Create Product
```
Method: POST
Path: /api/products
Description: Tạo sản phẩm mới (Admin/Manager only)
```

**Request:**
```typescript
{
  name: string,
  description: string,
  brandId: string,
  categoryId: string,
  basePrice: number,
  discount?: number,
  isFeatured?: boolean,
  specs?: ProductSpecsInput,
  variants: ProductVariantInput[],
  images: ProductImageInput[]
}
```

**Response:**
```typescript
{
  success: true,
  data: Product,
  message: "Product created successfully"
}
```

### 4. Update Product
```
Method: PUT
Path: /api/products/:id
Description: Cập nhật thông tin sản phẩm (Admin/Manager only)
```

**Request:**
```typescript
{
  name?: string,
  description?: string,
  brandId?: string,
  categoryId?: string,
  basePrice?: number,
  discount?: number,
  isFeatured?: boolean,
  isActive?: boolean
}
```

**Response:**
```typescript
{
  success: true,
  data: Product,
  message: "Product updated successfully"
}
```

### 5. Delete Product
```
Method: DELETE
Path: /api/products/:id
Description: Xóa sản phẩm (Admin only) - Soft delete (set isActive = false)
```

**Response:**
```typescript
{
  success: true,
  data: null,
  message: "Product deleted successfully"
}
```

### 6. Get Featured Products
```
Method: GET
Path: /api/products/featured
Description: Lấy danh sách sản phẩm nổi bật
```

**Query params:**
```typescript
{
  limit?: number  // default: 8
}
```

### 7. Increment View Count
```
Method: POST
Path: /api/products/:id/view
Description: Tăng lượt xem sản phẩm
```

## Database Changes

**Models đã có sẵn trong schema:**
```prisma
model Product {
  id             String    @id @default(cuid())
  name           String
  slug           String    @unique
  description    String?   @db.Text
  brandId        String
  categoryId     String
  basePrice      Decimal   @db.Decimal(12, 2)
  discount       Int       @default(0)
  isFeatured     Boolean   @default(false)
  isActive       Boolean   @default(true)
  viewCount      Int       @default(0)
  soldCount      Int       @default(0)
  averageRating  Decimal   @default(0) @db.Decimal(3, 2)
  reviewCount    Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

**Migrations cần chạy:**
- [ ] Không cần migration mới - sử dụng schema hiện tại
- [ ] Generate Prisma Client: `npm run prisma:generate`
- [ ] Chạy migration: `npx prisma migrate dev`

## Technical Requirements

**Controllers:**
- File: `backend/src/controllers/ProductController.ts`
- Methods:
  - `getAllProducts` - GET all với search/filter
  - `getProductById` - GET by ID
  - `getFeaturedProducts` - GET featured
  - `createProduct` - POST (Admin/Manager)
  - `updateProduct` - PUT (Admin/Manager)
  - `deleteProduct` - DELETE (Admin)
  - `incrementViewCount` - POST view increment

**Services:**
- File: `backend/src/services/ProductService.ts`
- Business logic:
  - Query building với Prisma (include relations)
  - Tự động tạo slug từ tên sản phẩm
  - Validate brandId và categoryId tồn tại
  - Calculate final price từ basePrice và discount
  - Pagination logic
  - Search và filter logic

**Repositories:**
- File: `backend/src/repositories/ProductRepository.ts`
- Data access:
  - Extend BaseRepository
  - Complex queries với relations (brand, category, variants, images, specs)
  - Filtering và sorting
  - Transaction support cho create/update với nested data

**Middlewares:**
- [x] Authentication required (auth middleware)
- [x] Authorization (roles): Admin/Manager cho create/update/delete
- [x] Validation (validate middleware)
- [ ] Rate limiting (optional)

**DTOs/Validation:**
- File: `backend/src/dtos/ProductValidation.ts`
  - CreateProductSchema
  - UpdateProductSchema
  - QueryProductSchema (cho filter params)
- File: `backend/src/dtos/ProductDto.ts`
  - ProductResponseDto
  - ProductListResponseDto
  - ProductDetailResponseDto

**Routes:**
- File: `backend/src/routes/productRoutes.ts`
- Mount tại: `/api/products`

## Security Considerations

- [x] Input validation (Zod schema validation)
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention (sanitize input)
- [x] Authentication required (JWT)
- [x] Authorization checks (Role-based: Admin/Manager)
- [ ] Rate limiting (implement nếu cần)
- [x] Data sanitization (validate DTOs)

## Acceptance Criteria

- [ ] API endpoints hoạt động đúng theo spec
- [ ] Request/Response validation hoạt động
- [ ] Error handling đầy đủ (ApiError)
- [ ] Database queries optimize (include relations hợp lý)
- [ ] Business logic đúng yêu cầu (slug generation, price calculation)
- [ ] Code được format và lint clean
- [ ] TypeScript types đầy đủ, không có `any`
- [ ] Test thử tất cả endpoints với Postman/Thunder Client

## Files cần làm việc

```
backend/src/
├── controllers/
│   └── ProductController.ts         [CREATE]
├── services/
│   └── ProductService.ts            [CREATE]
├── repositories/
│   └── ProductRepository.ts         [CREATE]
├── routes/
│   └── productRoutes.ts             [CREATE]
├── dtos/
│   ├── ProductDto.ts                [CREATE]
│   └── ProductValidation.ts         [CREATE]
├── middleware/
│   └── auth.ts                      [EXISTING - reuse]
└── server.ts                        [UPDATE - mount routes]
```

## Dependencies

- [ ] Prisma Client (đã có)
- [ ] Zod (đã có cho validation)
- [ ] slugify hoặc tự implement slug generator
- [ ] express-validator (hoặc dùng Zod)

## Environment Variables

```env
# Đã có sẵn, không cần thêm mới
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

## External Services Integration

**Service:** N/A (Internal only)
**Purpose:** N/A
**API Documentation:** N/A
**Authentication:** N/A

## Performance Considerations

- [x] Database query optimization (use Prisma select/include strategically)
- [ ] Caching strategy (implement Redis cache cho featured products nếu cần)
- [x] Pagination implementation (offset-based pagination)
- [ ] Rate limiting (implement nếu traffic cao)
- [x] Response time < 500ms (optimize database indexes)
- [x] Use database indexes (đã có trong schema: slug, brandId, categoryId, isFeatured)

## Notes

**Lưu ý khi implement:**

1. **Slug Generation**: Tự động tạo slug từ tên sản phẩm (vd: "iPhone 15 Pro Max" → "iphone-15-pro-max")
2. **Relations**: Khi get product details, include đầy đủ: brand, category, specs, variants (with images), top reviews
3. **Soft Delete**: DELETE endpoint chỉ set `isActive = false`, không xóa khỏi database
4. **Price Calculation**: Frontend sẽ tính final price = basePrice * (1 - discount/100)
5. **Image Upload**: Chưa implement upload image trong phase này - chỉ nhận URL
6. **Testing**: Test kỹ filter combinations (brand + category + price range)

**Best Practices:**
- Follow cấu trúc code hiện tại (tham khảo UserController, AuthService)
- Sử dụng ApiError cho error handling
- Sử dụng response utility cho consistent responses
- TypeScript strict mode - không dùng `any`

## Deliverables

- [ ] Code implementation (Controller, Service, Repository, Routes, DTOs)
- [ ] API documentation (comment trong code hoặc Postman collection)
- [ ] Database schema validation (đã có sẵn)
- [ ] Pull Request với description chi tiết

## Progress Tracking

- [ ] 0% - Task assigned
- [ ] 25% - DTOs và Validation schemas hoàn thành
- [ ] 50% - Repository và Service layer hoàn thành
- [ ] 75% - Controller và Routes hoàn thành, testing
- [ ] 100% - Code review và ready to merge
