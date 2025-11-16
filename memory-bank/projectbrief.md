# Project Brief - VeritaShop E-commerce Platform

## Tổng Quan Dự Án

**Tên dự án**: VeritaShop - Nền tảng E-commerce smartphone toàn diện

**Mục tiêu**: Xây dựng một hệ thống thương mại điện tử hiện đại, chuyên về smartphone, với đầy đủ tính năng quản trị và mua sắm cho người dùng cuối.

## Phạm Vi Dự Án

### Core Features

1. **Hệ thống người dùng**
   - Đăng ký/Đăng nhập với JWT authentication
   - Quản lý profile người dùng
   - Phân quyền (USER, SUPER_ADMIN)
   - Access token (15 phút) + Refresh token (7 ngày)
   - httpOnly cookies cho bảo mật

2. **Trang khách hàng (Customer-facing)**
   - **Homepage**: Hero section, featured products, brands showcase, categories
   - **Shop**: Product grid với filters và search
   - **Product Detail**: Specs đầy đủ, hình ảnh, color selection
   - **Shopping Cart**: Context-based state, localStorage persistence
   - **Checkout**: Streamlined flow với shipping info
   - **Order Confirmation**: Trang xác nhận đơn hàng

3. **Trang quản trị (Admin Panel)**
   - Dashboard với statistics overview
   - Quản lý sản phẩm (CRUD operations)
   - Quản lý danh mục (CRUD operations)
   - Quản lý tài khoản người dùng
   - Custom AdminHeader và AdminSidebar
   - Responsive admin interface

4. **Sản phẩm và danh mục**
   - Product catalog: iPhone, Samsung, ASUS ROG, Xiaomi, OnePlus, Huawei
   - Categories: Flagship, Gaming, Budget Friendly, Foldable
   - Product badges: HOT DEAL, GAMING, PREMIUM, NEW, etc.
   - Chi tiết specs đầy đủ
   - Multiple images per product
   - Color variants
   - Stock management

## Yêu Cầu Kỹ Thuật

### Công Nghệ Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3.4.1
- Context API cho state management

**Backend:**
- Node.js v20+
- Express 5.1.0
- TypeScript 5.7.3
- Prisma ORM 5.15.0
- PostgreSQL 13

**Authentication & Security:**
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- httpOnly cookies
- CORS configured
- Rate limiting (100 req/15min)

**Development Tools:**
- ts-node, nodemon
- Docker (PostgreSQL container)
- Git (version control)

### Kiến Trúc

**Frontend:**
- Component-based architecture
- Feature-based folder structure
- Context API cho cart state
- localStorage cho persistence

**Backend:**
- Layered Architecture:
  - Controllers (Presentation)
  - Services (Business Logic)
  - Repositories (Data Access)
  - Database (Prisma + PostgreSQL)
- Design Patterns: Repository, Singleton, DTO, Dependency Injection

**Database:**
- Relational model với Prisma ORM
- Migrations management
- Type-safe queries

### Môi Trường Phát Triển

- Node.js: v20.13.1
- PostgreSQL: v13 (Docker, port 5436)
- Frontend dev server: http://localhost:3000
- Backend API server: http://localhost:5000
- Operating System: Windows

## Các Bên Liên Quan

### End Users

**Khách hàng (Customers):**
- Browse smartphones từ nhiều brands
- Tìm kiếm và filter products
- Xem chi tiết specs
- Add to cart và checkout
- Theo dõi orders (planned)

**Admin:**
- Quản lý product catalog
- Xử lý orders
- Quản lý users
- View dashboard statistics

**Super Admin:**
- All admin permissions
- Manage admin accounts
- System configuration

### Development Team
- Full-stack developers
- Working với Git version control
- Using Claude Code cho development

## Success Criteria

### 1. Chức Năng
- ✅ Frontend UI hoàn chỉnh (done)
- ✅ Backend authentication (done)
- ⏳ Product/Category APIs
- ⏳ Cart và Order processing
- ⏳ Admin operations
- ⏳ Payment integration

### 2. Hiệu Suất
- Page load time < 3 giây
- API response time < 500ms
- Smooth UI transitions
- Responsive trên mobile/tablet/desktop

### 3. Bảo Mật
- Password hashing với bcrypt (salt rounds: 10)
- JWT tokens trong httpOnly cookies
- Input validation trên both frontend/backend
- Protection khỏi XSS, CSRF, SQL injection
- CORS configured properly
- Rate limiting enabled

### 4. Code Quality
- TypeScript strict mode
- Clean architecture patterns
- Comprehensive documentation
- Consistent coding style
- Proper error handling
- Type safety throughout

## Ràng Buộc và Giới Hạn

### Technical Constraints
- **Frontend**: Must use Next.js 15 App Router
- **Backend**: Must follow Layered Architecture
- **Database**: PostgreSQL only
- **Platform**: Development on Windows

### Time Constraints
- Dự án trong giai đoạn active development
- Priority: Core features → Advanced features

### Resource Constraints
- Docker required for PostgreSQL
- Resend API key for emails (planned)
- Payment gateway account (planned)
- Image storage solution needed (Cloudinary?)

## Risks và Mitigation

### Technical Risks

1. **EPERM errors on Windows**
   - Mitigation: setup-trace.js disables tracing ✅

2. **Port conflicts**
   - Mitigation: Next.js auto-switches ports ✅

3. **Database connection issues**
   - Mitigation: Docker Compose for PostgreSQL ✅

4. **JWT token security**
   - Mitigation: httpOnly cookies, short expiry

### Development Risks

1. **Frontend-Backend integration**
   - Mitigation: Mock data first, gradual API integration

2. **Type safety across stack**
   - Mitigation: TypeScript on both sides, Prisma types

3. **State management complexity**
   - Mitigation: Context API, keep it simple

## Current Status

### Completed ✅
- Frontend UI (100%)
- Backend architecture (100%)
- User authentication (100%)
- Memory Bank setup (100%)

### In Progress ⏳
- Database setup
- Product/Category APIs
- Frontend-Backend integration

### Planned 📋
- Cart synchronization
- Order processing
- Payment integration
- Email notifications
- Testing
- Deployment

## Next Steps

### Phase 2 (Current): Product & Category APIs
1. Extend Prisma schema với Product, Category models
2. Implement Product repository, service, controller
3. Implement Category repository, service, controller
4. Create API endpoints
5. Test APIs
6. Integrate with frontend

### Phase 3: Cart & Orders
1. Cart model và operations
2. Order processing flow
3. Order status management
4. Email confirmations

### Phase 4: Payment & Advanced Features
1. Payment gateway integration
2. Product reviews
3. Search optimization
4. Analytics dashboard

### Phase 5: Testing & Deployment
1. Unit tests
2. Integration tests
3. Production build
4. Deploy backend
5. Deploy frontend
6. CI/CD setup

## Repository Structure

```
veritaShop-Ecommerce-WebApp/
├── frontend/           # Next.js 15 application
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/ # Shared components
│   │   ├── features/  # Feature-specific code
│   │   ├── contexts/  # React contexts
│   │   └── lib/       # Utilities & data
│   └── package.json
│
├── backend/           # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── dto/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── .claude/           # Claude Code memory bank
│   ├── rules.md
│   └── memory-bank/
│       ├── projectbrief.md
│       ├── productContext.md
│       ├── systemPatterns.md
│       ├── techContext.md
│       ├── activeContext.md
│       └── progress.md
│
├── docker-compose.yml # PostgreSQL container
├── LICENSE
└── README.md
```

## Documentation

- **Backend Architecture**: backend/ARCHITECTURE.md
- **Frontend README**: frontend/README.md
- **API Documentation**: backend/README.md
- **Memory Bank**: .claude/memory-bank/

---

**Last Updated**: 2025-11-15
**Version**: 1.0
**Status**: Active Development
**Next Review**: After Phase 2 completion
