# Product Context: VeritaShop

## Vấn Đề Cần Giải Quyết

### 1. Business Problem
Thị trường smartphone tại Việt Nam cần một nền tảng e-commerce chuyên nghiệp với:
- **Catalog đa dạng:** Từ flagship đến budget-friendly, từ gaming phones đến foldables
- **Trải nghiệm mua sắm hiện đại:** UI/UX tốt, responsive, nhanh
- **Thông tin sản phẩm chi tiết:** Specifications đầy đủ, hình ảnh chất lượng
- **Quản lý hệ thống:** Admin panel mạnh mẽ cho inventory, orders, customers

### 2. User Pain Points

**Khách Hàng (Customers):**
- Khó tìm thông tin specs đầy đủ về smartphones
- Giao diện e-commerce cũ, chậm, không responsive
- Quy trình checkout phức tạp
- Không theo dõi được đơn hàng
- Thiếu trust về bảo mật thông tin

**Admin/Shop Owners:**
- Không có hệ thống quản lý products hiệu quả
- Thủ công trong việc quản lý orders
- Khó theo dõi inventory
- Không có dashboard tổng quan
- Thiếu tools để phân tích business

## Giải Pháp

### 1. Frontend Solution (Next.js 15 + React 19)
**Khách hàng trải nghiệm:**
- **Homepage đẹp mắt:**
  - Hero section với rotating text animations
  - Featured products showcase (8 sản phẩm nổi bật)
  - Brand showcase (iPhone, Samsung, ASUS ROG, Huawei, Xiaomi, OnePlus)
  - Categories highlight (Flagship, Gaming, Budget Friendly)
  - Product highlights section
  - Stats section để build trust

- **Shop & Product Pages:**
  - Product grid với filters và search
  - Product badges (HOT DEAL, GAMING, PREMIUM, NEW, etc.)
  - Product detail pages với:
    - Multiple images
    - Detailed specifications
    - Color selection
    - Quantity selector
    - Add to cart functionality
  - Category pages với dynamic routing (`/category/[name]`)

- **Shopping Cart & Checkout:**
  - Context-based cart state management
  - localStorage persistence (survive page refresh)
  - Color variant support
  - Quantity adjustment
  - Real-time total calculation
  - Streamlined checkout flow
  - Order confirmation page

- **Authentication:**
  - Register/Login pages
  - JWT-based authentication (backend ready)
  - User profile management (planned)

**Admin trải nghiệm:**
- **Admin Dashboard:**
  - Statistics overview
  - Recent orders/users
  - Quick actions

- **Product Management:**
  - CRUD operations (Create, Read, Update, Delete)
  - Product form với validation
  - Image upload support
  - Bulk operations (planned)

- **Category Management:**
  - Category CRUD
  - Category-product relationships

- **Account Management:**
  - User management
  - Role assignment (USER, SUPER_ADMIN)

- **Layout Components:**
  - AdminHeader: Navigation và user info
  - AdminSidebar: Menu với icons
  - Responsive admin interface

### 2. Backend Solution (Node.js + TypeScript + Express)

**Layered Architecture Implementation:**
```
┌─────────────────────────────────────────┐
│    Presentation Layer (Controllers)     │
│  - HTTP Request/Response handling       │
│  - Input validation                     │
│  - Response formatting                  │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Business Logic Layer (Services)       │
│  - Authentication & Authorization       │
│  - Business rules enforcement           │
│  - Data transformation                  │
│  - Multi-repo orchestration             │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│    Data Access Layer (Repositories)     │
│  - Database queries (Prisma)            │
│  - CRUD operations                      │
│  - Data mapping                         │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Database Layer (PostgreSQL + Prisma)  │
│  - Data persistence                     │
│  - Relationships & constraints          │
└─────────────────────────────────────────┘
```

**Current Backend Features:**
- ✅ User Registration với password hashing (bcrypt)
- ✅ User Login với JWT tokens
- ✅ Access token (15 minutes) + Refresh token (7 days)
- ✅ Token refresh mechanism
- ✅ User logout
- ✅ Role-based authorization (USER, SUPER_ADMIN)
- ✅ Middleware stack (auth, validation, error handling, logging)

**Planned Backend Features:**
- Product CRUD APIs
- Category CRUD APIs
- Order management APIs
- Cart synchronization APIs
- Image upload service (Cloudinary)
- Search & filtering APIs
- Email notifications (Nodemailer)

### 3. Database Solution (PostgreSQL + Prisma ORM)

**Current Schema:**
```prisma
model User {
  id           String   @id @default(cuid())
  name         String?
  email        String   @unique
  password     String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  refreshToken String?  @unique
}

enum Role {
  USER
  SUPER_ADMIN
}
```

**Planned Schema Extensions:**
- Product model (name, brand, price, specs, images, stock, etc.)
- Category model (name, description, slug)
- Order model (user, status, total, shipping info)
- OrderItem model (product, quantity, price snapshot)
- Cart model (optional - có thể dùng localStorage)
- Review model (future)

## User Experience Goals

### Khách Hàng Experience Flow

**1. Discovery Phase:**
```
User lands on homepage
  ↓
Sees rotating hero text + featured products
  ↓
Explores brands (iPhone, Samsung, ROG, etc.)
  ↓
Clicks on category (Flagship/Gaming/Budget)
  ↓
Arrives at product listing page
```

**2. Research Phase:**
```
Browses products với filters
  ↓
Uses search để tìm specific model
  ↓
Clicks product card
  ↓
Views detailed specs, images, price
  ↓
Reads reviews (planned feature)
  ↓
Compares với other products (planned)
```

**3. Purchase Phase:**
```
Selects color variant
  ↓
Adjusts quantity
  ↓
Clicks "Add to Cart"
  ↓
Sees cart sidebar popup
  ↓
Continues shopping hoặc proceeds to checkout
  ↓
Fills shipping info
  ↓
Reviews order summary
  ↓
Completes payment (planned integration)
  ↓
Receives order confirmation + email
```

**4. Post-Purchase:**
```
Receives order confirmation email
  ↓
Tracks order status (planned)
  ↓
Receives shipping updates
  ↓
Can review product (planned)
```

### Admin Experience Flow

**1. Product Management:**
```
Login to admin panel
  ↓
Navigate to Products page
  ↓
Click "Add New Product"
  ↓
Fill product form (name, brand, price, specs, images)
  ↓
Submit → Product created
  ↓
Can edit/delete existing products
  ↓
Upload product images
```

**2. Order Management:**
```
View orders dashboard
  ↓
Filter orders by status
  ↓
Click order to see details
  ↓
Update order status
  ↓
Print invoice (planned)
  ↓
Contact customer
```

**3. User Management:**
```
View all users
  ↓
Search/filter users
  ↓
View user details
  ↓
Change user role
  ↓
Deactivate/delete accounts (if needed)
```

## Core Features & Implementation Status

### Phase 1: Foundation ✅ (75% Complete)

**Frontend (UI Complete, Data Mock):**
- ✅ HomePage component (E:\...\frontend\src\features\home\HomePage.tsx)
- ✅ Shop Page (E:\...\frontend\src\app\shop\page.tsx)
- ✅ Product Detail (E:\...\frontend\src\features\shop\ProductDetail.tsx)
- ✅ Category Pages (E:\...\frontend\src\app\category\[name]\page.tsx)
- ✅ Shopping Cart (E:\...\frontend\src\components\layout\Cart.tsx)
  - Context: E:\...\frontend\src\contexts\CartContext.tsx
  - localStorage persistence
  - Add/Remove/Update operations
- ✅ Checkout Page (E:\...\frontend\src\features\checkout\CheckoutPage.tsx)
- ✅ Order Confirmation (E:\...\frontend\src\features\checkout\OrderConfirmationPage.tsx)
- ✅ Login/Register Pages
- ✅ Admin Dashboard (E:\...\frontend\src\features\admin\AdminDashboard.tsx)
- ✅ Admin Products Page (E:\...\frontend\src\features\admin\ProductsPage.tsx)
- ✅ Admin Categories Page (E:\...\frontend\src\features\admin\CategoriesPage.tsx)
- ✅ Admin Accounts Page (E:\...\frontend\src\features\admin\AccountsPage.tsx)
- ✅ Layout Components (Header, Footer, Cart, AdminHeader, AdminSidebar)

**Backend (Auth Complete, E-commerce APIs Missing):**
- ✅ Authentication APIs (register, login, logout, refresh)
- ✅ JWT + Refresh token mechanism
- ✅ User model
- ⏳ Product APIs (NOT implemented yet)
- ⏳ Category APIs (NOT implemented yet)
- ⏳ Order APIs (NOT implemented yet)

**Data:**
- ✅ 631 lines of mock product data (E:\...\frontend\src\lib\data\products.ts)
- ✅ Comprehensive product catalog (iPhone, Samsung, ROG, Xiaomi, etc.)
- ⏳ Need to migrate to database

### Phase 2: Core E-commerce (CURRENT FOCUS)

**Priority 1: Database Schema**
- [ ] Product model với all necessary fields
- [ ] Category model
- [ ] Order & OrderItem models
- [ ] Relationships setup
- [ ] Migrations

**Priority 2: Product APIs**
- [ ] GET /api/products (list với pagination, filters)
- [ ] GET /api/products/:id (single product)
- [ ] POST /api/products (admin only)
- [ ] PUT /api/products/:id (admin only)
- [ ] DELETE /api/products/:id (admin only)
- [ ] GET /api/products/search (search query)

**Priority 3: Category APIs**
- [ ] Full CRUD operations
- [ ] GET /api/categories/:slug/products

**Priority 4: Frontend Integration**
- [ ] Replace mock data với API calls
- [ ] Add loading states
- [ ] Error handling
- [ ] Authentication integration

### Phase 3: Orders & Payment (PLANNED)

- [ ] Cart API (sync localStorage với backend)
- [ ] Order creation flow
- [ ] Order status management
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Order confirmation emails
- [ ] Invoice generation

### Phase 4: Advanced Features (FUTURE)

- [ ] Product reviews & ratings
- [ ] Wishlist
- [ ] Advanced search (Elasticsearch hoặc Prisma full-text)
- [ ] Product recommendations
- [ ] Inventory alerts
- [ ] Sales analytics dashboard
- [ ] Discount codes/coupons
- [ ] Multi-image upload cho products

## Product Data Structure

### Current Mock Data Interface
```typescript
interface Product {
  id: number
  name: string
  brand: string
  price: number
  oldPrice?: number
  image: string
  badge?: string
  specs?: Array<{label: string; value: string}>
  description?: string
  colors?: string[]
  stock?: number
  category?: string
  rating?: number
  reviews?: Array<{
    user: string
    rating: number
    comment: string
    date: string
  }>
}
```

### Planned Database Schema
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  brand       String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10,2)
  oldPrice    Decimal? @db.Decimal(10,2)
  stock       Int      @default(0)
  images      String[] // Array of Cloudinary URLs
  badge       String?  // HOT DEAL, GAMING, etc.

  // Relationships
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  // Metadata
  views       Int      @default(0)
  sold        Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  orderItems  OrderItem[]
  reviews     Review[]

  @@map("products")
}

model ProductSpec {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id])
  label     String  // "Screen Size", "RAM", etc.
  value     String  // "6.7 inch", "12GB", etc.

  @@map("product_specs")
}
```

## Success Metrics

### Customer Satisfaction
- Page load time < 2s
- Cart conversion rate > 10%
- User registration rate > 20% of visitors
- Low cart abandonment rate
- Positive user feedback

### Admin Efficiency
- Product upload time < 2 minutes
- Order processing time < 1 minute
- Dashboard load time < 1s
- No training required (intuitive UI)

### Business Metrics
- Growing product catalog (target: 100+ products)
- Increasing order volume
- Repeat customer rate
- Average order value growth

## Technical Excellence

### Frontend Quality
- ✅ TypeScript strict mode
- ✅ Component reusability
- ✅ Responsive design
- ✅ Modern UI/UX patterns
- ✅ Context API for state
- ⏳ API integration needed
- ⏳ Loading states needed
- ⏳ Error boundaries needed

### Backend Quality
- ✅ Layered architecture
- ✅ SOLID principles
- ✅ Type safety
- ✅ Error handling
- ✅ Logging infrastructure
- ✅ Security best practices
- ⏳ Need more feature APIs
- ⏳ Need tests

---

**Last Updated:** 2025-11-15
**Version:** 2.0 (Updated với exploration findings)
**Next Review:** After Phase 2 API implementation
