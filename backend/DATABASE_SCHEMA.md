# Database Schema Design - VeritaShop Phone Ecommerce

## Overview
Đây là schema database đầy đủ cho website ecommerce bán điện thoại, được thiết kế để hỗ trợ:
- Quản lý user với 3 roles: USER, ADMIN, MANAGER
- Quản lý sản phẩm điện thoại với specs chi tiết
- Variants (màu sắc, dung lượng) với giá và stock riêng
- Reviews & Comments từ users
- Shopping Cart & Orders
- Full ecommerce workflow

---

## Database Models

### 🔐 USER MANAGEMENT

#### **User**
Quản lý người dùng với 3 roles

```prisma
model User {
  id           String    @id @default(cuid())
  name         String?
  email        String    @unique
  password     String
  role         Role      @default(USER)
  phone        String?
  address      String?
  avatar       String?
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  refreshToken String?   @unique

  // Relations
  reviews      Review[]
  comments     Comment[]
  cart         Cart?
  orders       Order[]
}

enum Role {
  USER        // Khách hàng thông thường
  ADMIN       // Quản trị viên - full access
  MANAGER     // Quản lý - limited admin access
}
```

**Key Features:**
- ✅ 3 roles: USER (khách hàng), ADMIN (full access), MANAGER (limited admin)
- ✅ Email unique để đăng nhập
- ✅ Password được hash với bcrypt
- ✅ JWT refresh token để duy trì session
- ✅ Soft delete với isActive flag
- ✅ Phone & address cho checkout
- ✅ Avatar cho profile

**Permissions:**
- **USER**: Xem sản phẩm, mua hàng, review, comment
- **ADMIN**: Full CRUD products, categories, brands, quản lý orders
- **MANAGER**: CRUD products, categories, xem orders

---

### 📱 PRODUCT MANAGEMENT

#### **Brand**
Thương hiệu điện thoại (Apple, Samsung, Xiaomi, Oppo, v.v.)

```prisma
model Brand {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  logo        String?
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  products    Product[]
}
```

**Examples:**
- Apple (slug: "apple")
- Samsung (slug: "samsung")
- Xiaomi (slug: "xiaomi")
- Oppo (slug: "oppo")

#### **Category**
Danh mục sản phẩm (Flagship, Mid-range, Budget, Gaming, v.v.)

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  parentId    String?   // For nested categories
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  parent      Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryToCategory")
  products    Product[]
}
```

**Examples:**
- Flagship Phones
- Mid-range Phones
- Budget Phones
- Gaming Phones
- Business Phones

**Nested Categories Example:**
```
Phones (parent)
├── Flagship (child)
├── Mid-range (child)
└── Budget (child)
```

#### **Product**
Sản phẩm điện thoại chính

```prisma
model Product {
  id             String    @id @default(cuid())
  name           String    // iPhone 15 Pro Max, Samsung Galaxy S24 Ultra
  slug           String    @unique
  description    String?   @db.Text
  brandId        String
  categoryId     String
  basePrice      Decimal   @db.Decimal(12, 2)  // Giá gốc cơ bản
  discount       Int       @default(0)          // % giảm giá (0-100)
  isFeatured     Boolean   @default(false)      // Hiển thị trên homepage
  isActive       Boolean   @default(true)
  viewCount      Int       @default(0)          // Lượt xem
  soldCount      Int       @default(0)          // Đã bán
  averageRating  Decimal   @default(0) @db.Decimal(3, 2)  // 0.00 - 5.00
  reviewCount    Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  brand          Brand
  category       Category
  specs          ProductSpecs?      // 1-1 relationship
  variants       ProductVariant[]   // 1-many
  images         ProductImage[]
  reviews        Review[]
  comments       Comment[]
}
```

**Key Features:**
- ✅ basePrice là giá cơ bản của sản phẩm (variant sẽ có giá riêng)
- ✅ discount % để tính giá sale
- ✅ isFeatured để hiển thị sản phẩm nổi bật
- ✅ viewCount & soldCount để ranking
- ✅ averageRating & reviewCount tự động cập nhật từ reviews

#### **ProductSpecs**
Thông số kỹ thuật chi tiết của điện thoại

```prisma
model ProductSpecs {
  id               String   @id @default(cuid())
  productId        String   @unique

  // Display
  screenSize       String?  // "6.7 inches"
  screenTech       String?  // "AMOLED", "Dynamic AMOLED 2X"
  resolution       String?  // "2796 x 1290 pixels"
  refreshRate      String?  // "120Hz"
  brightness       String?  // "2000 nits peak"

  // Performance
  cpu              String?  // "Apple A17 Pro", "Snapdragon 8 Gen 3"
  gpu              String?  // "Apple GPU 6-core", "Adreno 750"
  ram              String?  // "8GB"
  storage          String?  // "256GB, 512GB, 1TB"

  // Camera
  rearCamera       String?  // "48MP + 12MP + 12MP"
  frontCamera      String?  // "12MP"
  videoRecording   String?  // "4K@60fps, 8K@30fps"
  cameraFeatures   String?  @db.Text

  // Battery
  battery          String?  // "4422 mAh"
  charging         String?  // "27W Fast Charging"
  wirelessCharge   String?  // "15W MagSafe"

  // Connectivity
  sim              String?  // "Dual SIM"
  network          String?  // "5G"
  wifi             String?  // "Wi-Fi 6E"
  bluetooth        String?  // "Bluetooth 5.3"
  nfc              Boolean  @default(false)

  // Design
  os               String?  // "iOS 17", "Android 14"
  dimensions       String?  // "159.9 x 76.7 x 8.25 mm"
  weight           String?  // "221g"
  material         String?  // "Titanium", "Glass", "Aluminum"
  waterResistant   String?  // "IP68"

  // Features
  fingerprint      Boolean  @default(false)
  faceUnlock       Boolean  @default(false)
  headphoneJack    Boolean  @default(false)
  expandableStorage Boolean @default(false)

  product          Product
}
```

**Example Data - iPhone 15 Pro Max:**
```json
{
  "screenSize": "6.7 inches",
  "screenTech": "Super Retina XDR OLED",
  "resolution": "2796 x 1290 pixels",
  "refreshRate": "120Hz ProMotion",
  "cpu": "Apple A17 Pro",
  "ram": "8GB",
  "rearCamera": "48MP + 12MP + 12MP",
  "battery": "4422 mAh",
  "os": "iOS 17",
  "waterResistant": "IP68"
}
```

#### **ProductVariant**
Các biến thể của sản phẩm (màu sắc, dung lượng)

```prisma
model ProductVariant {
  id          String    @id @default(cuid())
  productId   String

  // Variant details
  color       String    // "Black", "White", "Titanium Natural"
  colorCode   String?   // "#000000" (hex color for UI)
  storage     String?   // "128GB", "256GB", "512GB", "1TB"
  ram         String?   // "8GB", "12GB" (if variants have different RAM)

  // Pricing & Stock
  price       Decimal   @db.Decimal(12, 2)
  comparePrice Decimal? @db.Decimal(12, 2)  // Giá gốc để so sánh
  stock       Int       @default(0)
  sku         String    @unique             // "IPH15PM-BLK-256"

  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  product     Product
  images      ProductImage[]
  cartItems   CartItem[]
  orderItems  OrderItem[]
}
```

**Example - iPhone 15 Pro Max Variants:**

| Color | Storage | Price | SKU | Stock |
|-------|---------|-------|-----|-------|
| Titanium Black | 256GB | 29,990,000 VND | IPH15PM-BLK-256 | 50 |
| Titanium Black | 512GB | 34,990,000 VND | IPH15PM-BLK-512 | 30 |
| Titanium Natural | 256GB | 29,990,000 VND | IPH15PM-NAT-256 | 40 |
| Titanium Blue | 1TB | 39,990,000 VND | IPH15PM-BLU-1TB | 20 |

**Why Variants?**
- Mỗi màu/dung lượng có giá khác nhau
- Quản lý stock riêng cho từng variant
- User chọn variant cụ thể khi mua hàng

#### **ProductImage**
Hình ảnh sản phẩm

```prisma
model ProductImage {
  id          String    @id @default(cuid())
  productId   String
  variantId   String?   // Null = main product image
  url         String
  altText     String?
  isPrimary   Boolean   @default(false)  // Ảnh đại diện
  sortOrder   Int       @default(0)      // Thứ tự hiển thị
  createdAt   DateTime  @default(now())

  product     Product
  variant     ProductVariant?
}
```

**Structure:**
- **Main Product Images**: variantId = null (ảnh chung của sản phẩm)
- **Variant-specific Images**: variantId != null (ảnh riêng của variant, ví dụ: ảnh iPhone màu đen)
- **isPrimary**: Ảnh đầu tiên hiển thị trong listing
- **sortOrder**: Thứ tự carousel ảnh

---

### 💬 REVIEWS & COMMENTS

#### **Review**
Đánh giá và review từ users (có rating 1-5 sao)

```prisma
model Review {
  id          String    @id @default(cuid())
  productId   String
  userId      String
  rating      Int       // 1, 2, 3, 4, 5 stars
  title       String?
  content     String?   @db.Text
  isVerified  Boolean   @default(false)  // Đã mua hàng chưa
  helpful     Int       @default(0)      // Số người vote helpful
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  product     Product
  user        User

  @@unique([productId, userId])  // Mỗi user chỉ review 1 lần
}
```

**Features:**
- ✅ Rating 1-5 stars bắt buộc
- ✅ Title & content tùy chọn
- ✅ isVerified = true nếu user đã mua sản phẩm
- ✅ Mỗi user chỉ review 1 lần cho 1 sản phẩm
- ✅ helpful count để sort reviews

**Example:**
```json
{
  "rating": 5,
  "title": "Sản phẩm tuyệt vời!",
  "content": "iPhone 15 Pro Max rất mượt, camera đẹp, pin trâu...",
  "isVerified": true,
  "helpful": 15
}
```

#### **Comment**
Bình luận thông thường (không có rating)

```prisma
model Comment {
  id          String    @id @default(cuid())
  productId   String
  userId      String
  parentId    String?   // For nested replies
  content     String    @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  product     Product
  user        User
  parent      Comment?  @relation("CommentToComment")
  replies     Comment[] @relation("CommentToComment")
}
```

**Features:**
- ✅ Nested comments (replies)
- ✅ Không có rating (khác với Review)
- ✅ Dùng để hỏi đáp về sản phẩm

**Structure:**
```
Comment 1: "Máy này có bao nhiêu màu?"
  ├── Reply 1: "Có 4 màu: Black, White, Blue, Natural"
  └── Reply 2: "Mình thích màu Blue nhất"
```

---

### 🛒 SHOPPING CART

#### **Cart**
Giỏ hàng của user (1 user = 1 cart)

```prisma
model Cart {
  id          String     @id @default(cuid())
  userId      String     @unique
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user        User
  items       CartItem[]
}
```

#### **CartItem**
Sản phẩm trong giỏ hàng

```prisma
model CartItem {
  id          String    @id @default(cuid())
  cartId      String
  variantId   String    // User thêm VARIANT vào giỏ, không phải Product
  quantity    Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  cart        Cart
  variant     ProductVariant

  @@unique([cartId, variantId])  // Mỗi variant chỉ có 1 lần trong cart
}
```

**Logic:**
- User thêm **ProductVariant** vào giỏ (không phải Product)
- Nếu variant đã tồn tại → tăng quantity
- Nếu chưa tồn tại → tạo mới CartItem

**Example:**
```json
{
  "cartId": "cart123",
  "variantId": "IPH15PM-BLK-256",
  "quantity": 2,
  "variant": {
    "color": "Black",
    "storage": "256GB",
    "price": 29990000
  }
}
```

---

### 📦 ORDERS

#### **Order**
Đơn hàng của khách

```prisma
model Order {
  id              String      @id @default(cuid())
  userId          String
  orderNumber     String      @unique  // "ORD-20250116-001"

  // Customer Info
  customerName    String
  customerEmail   String
  customerPhone   String
  shippingAddress String      @db.Text

  // Pricing
  subtotal        Decimal     @db.Decimal(12, 2)
  discount        Decimal     @default(0) @db.Decimal(12, 2)
  shippingFee     Decimal     @default(0) @db.Decimal(12, 2)
  tax             Decimal     @default(0) @db.Decimal(12, 2)
  total           Decimal     @db.Decimal(12, 2)

  // Status
  status          OrderStatus @default(PENDING)
  paymentMethod   String?     // "COD", "Credit Card", "E-wallet"
  paymentStatus   PaymentStatus @default(UNPAID)
  isPaid          Boolean     @default(false)
  paidAt          DateTime?

  // Tracking
  notes           String?     @db.Text
  cancelReason    String?
  deliveredAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User
  items           OrderItem[]
}

enum OrderStatus {
  PENDING       // Chờ xác nhận
  CONFIRMED     // Đã xác nhận
  PROCESSING    // Đang chuẩn bị hàng
  SHIPPING      // Đang giao hàng
  DELIVERED     // Đã giao thành công
  CANCELLED     // Đã hủy
  RETURNED      // Đã trả hàng
}

enum PaymentStatus {
  UNPAID        // Chưa thanh toán
  PAID          // Đã thanh toán
  REFUNDED      // Đã hoàn tiền
  FAILED        // Thanh toán thất bại
}
```

**Order Workflow:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPING → DELIVERED
    ↓
CANCELLED
```

#### **OrderItem**
Chi tiết sản phẩm trong đơn hàng

```prisma
model OrderItem {
  id          String    @id @default(cuid())
  orderId     String
  variantId   String

  // Snapshot data (lưu giá tại thời điểm mua)
  productName String    // "iPhone 15 Pro Max"
  variantInfo String    // "Black - 256GB"
  price       Decimal   @db.Decimal(12, 2)
  quantity    Int
  subtotal    Decimal   @db.Decimal(12, 2)

  createdAt   DateTime  @default(now())

  order       Order
  variant     ProductVariant
}
```

**Why Snapshot Data?**
- Lưu giá tại thời điểm mua (không bị ảnh hưởng nếu giá thay đổi sau này)
- Lưu tên sản phẩm & variant info để hiển thị trong order history
- Ngay cả khi sản phẩm bị xóa, order history vẫn giữ được thông tin

---

## Relationships Summary

```
User (1) ←→ (∞) Review
User (1) ←→ (∞) Comment
User (1) ←→ (1) Cart
User (1) ←→ (∞) Order

Brand (1) ←→ (∞) Product
Category (1) ←→ (∞) Product
Category (1) ←→ (∞) Category (self-referencing)

Product (1) ←→ (1) ProductSpecs
Product (1) ←→ (∞) ProductVariant
Product (1) ←→ (∞) ProductImage
Product (1) ←→ (∞) Review
Product (1) ←→ (∞) Comment

ProductVariant (1) ←→ (∞) ProductImage
ProductVariant (1) ←→ (∞) CartItem
ProductVariant (1) ←→ (∞) OrderItem

Cart (1) ←→ (∞) CartItem
Order (1) ←→ (∞) OrderItem

Comment (1) ←→ (∞) Comment (self-referencing for replies)
```

---

## Indexes

Đã thêm indexes để tối ưu query performance:

### User
- `@@index([email])` - Login lookup
- `@@index([role])` - Role-based queries

### Product
- `@@index([slug])` - SEO-friendly URLs
- `@@index([brandId])` - Filter by brand
- `@@index([categoryId])` - Filter by category
- `@@index([isFeatured])` - Homepage featured products
- `@@index([isActive])` - Active products only
- `@@index([createdAt])` - Sort by newest

### ProductVariant
- `@@index([productId])` - Get all variants of product
- `@@index([sku])` - SKU lookup
- `@@index([isActive])` - Active variants

### Review
- `@@index([productId])` - Product reviews
- `@@index([userId])` - User reviews
- `@@index([rating])` - Filter by rating

### Order
- `@@index([userId])` - User order history
- `@@index([orderNumber])` - Order lookup
- `@@index([status])` - Filter by status
- `@@index([createdAt])` - Sort by date

---

## Business Rules

### 🔐 User Permissions

| Action | USER | MANAGER | ADMIN |
|--------|------|---------|-------|
| View products | ✅ | ✅ | ✅ |
| Add to cart | ✅ | ✅ | ✅ |
| Create order | ✅ | ✅ | ✅ |
| Review product | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ |
| **CRUD Product** | ❌ | ✅ | ✅ |
| **CRUD Category** | ❌ | ✅ | ✅ |
| **CRUD Brand** | ❌ | ✅ | ✅ |
| **View Orders** | Own only | All | All |
| **Update Order Status** | ❌ | ✅ | ✅ |
| **Manage Users** | ❌ | ❌ | ✅ |

### 📝 Validation Rules

#### Product
- `name`: Required, 1-200 characters
- `slug`: Required, unique, lowercase, no spaces
- `basePrice`: Required, > 0
- `discount`: 0-100 (percentage)

#### ProductVariant
- `color`: Required
- `storage`: Required for phones
- `price`: Required, > 0
- `stock`: >= 0
- `sku`: Required, unique

#### Review
- `rating`: Required, 1-5
- `productId` + `userId`: Unique (user chỉ review 1 lần)

#### Order
- `orderNumber`: Auto-generated, unique, format: "ORD-YYYYMMDD-XXX"
- `total`: Must equal (subtotal - discount + shippingFee + tax)
- `items`: At least 1 item required

---

## Example Queries

### 1. Get Product with all details
```typescript
const product = await prisma.product.findUnique({
  where: { slug: 'iphone-15-pro-max' },
  include: {
    brand: true,
    category: true,
    specs: true,
    variants: {
      where: { isActive: true },
      include: { images: true }
    },
    images: {
      where: { variantId: null },
      orderBy: { sortOrder: 'asc' }
    },
    reviews: {
      where: { rating: { gte: 4 } },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { helpful: 'desc' },
      take: 10
    }
  }
});
```

### 2. Get User Cart with Items
```typescript
const cart = await prisma.cart.findUnique({
  where: { userId: 'user123' },
  include: {
    items: {
      include: {
        variant: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                brand: { select: { name: true } }
              }
            }
          }
        }
      }
    }
  }
});
```

### 3. Create Order from Cart
```typescript
// 1. Get cart items
const cart = await prisma.cart.findUnique({
  where: { userId },
  include: {
    items: {
      include: {
        variant: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    }
  }
});

// 2. Calculate total
const subtotal = cart.items.reduce((sum, item) =>
  sum + (item.variant.price * item.quantity), 0
);

// 3. Create order
const order = await prisma.order.create({
  data: {
    userId,
    orderNumber: generateOrderNumber(),
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: user.phone,
    shippingAddress: user.address,
    subtotal,
    shippingFee: 30000,
    total: subtotal + 30000,
    items: {
      create: cart.items.map(item => ({
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantInfo: `${item.variant.color} - ${item.variant.storage}`,
        price: item.variant.price,
        quantity: item.quantity,
        subtotal: item.variant.price * item.quantity
      }))
    }
  }
});

// 4. Clear cart
await prisma.cartItem.deleteMany({
  where: { cartId: cart.id }
});
```

---

## Migration Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name add_ecommerce_models

# Apply migrations
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

---

## Next Steps

### 1. Create Seed Data
Tạo file `backend/prisma/seed.ts` để seed:
- Sample brands (Apple, Samsung, Xiaomi, etc.)
- Sample categories (Flagship, Mid-range, Budget)
- Sample products với specs & variants
- Sample users (USER, ADMIN, MANAGER)

### 2. Implement Repositories
Tạo repositories cho mỗi model:
- `BrandRepository`
- `CategoryRepository`
- `ProductRepository`
- `ReviewRepository`
- `CartRepository`
- `OrderRepository`

### 3. Implement Services
Tạo business logic services:
- `ProductService` - CRUD products, search, filter
- `CartService` - Add/remove items, calculate total
- `OrderService` - Create order, update status, payment
- `ReviewService` - Create review, update ratings

### 4. Implement Controllers
Tạo API endpoints:
- `/api/products` - Product CRUD & listing
- `/api/categories` - Category CRUD
- `/api/cart` - Cart operations
- `/api/orders` - Order management
- `/api/reviews` - Review & rating

---

**Schema Version**: 1.0
**Last Updated**: 2025-11-16
**Database**: PostgreSQL 13
**ORM**: Prisma 5.15.0
