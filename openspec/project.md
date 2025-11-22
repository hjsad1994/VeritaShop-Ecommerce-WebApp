# Project Context

## Purpose
VeritaShop is a full-stack e-commerce web application for selling electronics and smartphones. The platform provides a complete shopping experience with product browsing, cart management, order processing, reviews/comments, inventory management, and admin capabilities.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript 5.7+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 13 (local via Docker)
- **ORM**: Prisma 5.15.0
- **Authentication**: JWT with jsonwebtoken & jose
- **Validation**: express-validator
- **File Storage**: AWS S3 with Cloudinary support
- **Email**: Nodemailer
- **Testing**: Jest with ts-jest

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Axios 1.13+
- **Notifications**: react-hot-toast
- **Build**: Next.js build system with custom Windows compatibility settings

### Infrastructure
- **Container**: Docker Compose for PostgreSQL
- **Database Port**: 5436 (mapped to container 5432)
- **CI/CD**: GitHub Actions for backend CI

## Project Conventions

### Code Style
- **Language**: Strict TypeScript with `strict: true` in tsconfig
- **Module System**: CommonJS for backend, ES modules for frontend
- **Import Style**: 
  - Backend uses path aliases (`@/`, `@controllers`, `@services`, etc.)
  - Frontend uses relative imports and `@/` for src root
- **Naming Conventions**:
  - PascalCase for classes, interfaces, types, React components
  - camelCase for functions, variables, methods
  - UPPER_SNAKE_CASE for constants and env variables
  - kebab-case for file names in specs/docs
- **File Naming**:
  - Controllers: `{Entity}Controller.ts`
  - Services: `{Entity}Service.ts`
  - Repositories: `{Entity}Repository.ts`
  - DTOs: `{Entity}Dto.ts`
  - Validations: `{Entity}Validation.ts`
  - React components: PascalCase (e.g., `ProductDetail.tsx`)

### Architecture Patterns

#### Backend (Layered Architecture)
1. **Controllers** - HTTP request/response handling, input validation
2. **Services** - Business logic, orchestration
3. **Repositories** - Data access layer (Prisma queries)
4. **DTOs** - Data transfer objects for type safety
5. **Validations** - express-validator schemas
6. **Middleware** - Auth, error handling, logging

**Key Patterns**:
- Repository pattern with `BaseRepository` and `RepositoryFactory`
- Dependency injection via factory initialization
- Centralized error handling with custom `ApiError` class
- Standardized API responses via `response.ts` utility
- Module aliasing for clean imports

#### Frontend (Feature-Based)
- **App Router**: Next.js 15 app directory structure
- **Features**: Organized by domain (admin, shop, auth)
- **API Layer**: Centralized `apiClient` with interceptors
- **Service Layer**: Separate service files per domain (cartService, productService, etc.)
- **Context API**: For global state (auth, cart)
- **Component Organization**: Reusable components in `/components`, feature-specific in `/features/{domain}/components`

### Testing Strategy
- **Framework**: Jest with ts-jest
- **Backend Scripts**: 
  - `npm test` - Run test suite
  - Manual testing via API endpoints
- **Frontend**: ESLint configured (build-time checks disabled for development speed)
- **Database Testing**: Prisma migrations with seed data

### Git Workflow
- **Main Branch**: `main` (default)
- **Feature Branches**: Format `main#{feature-name}` (e.g., `main#migrate-db-to-local`, `main#home-redesign`)
- **Commit Style**: Descriptive messages, recent examples:
  - "Update package.json and Prisma schema; remove outdated homepage visuals proposal"
  - "Revamp HomePage layout and features for enhanced user experience"
- **Pull Requests**: Merged via GitHub PRs with review
- **CI**: Backend CI runs on GitHub Actions

## Domain Context

### E-commerce Entities
- **Products**: Electronics/smartphones with variants (color, storage, RAM)
- **Variants**: Each product has multiple SKUs with different specs and prices
- **Inventory**: Stock tracking with movements (STOCK_IN, STOCK_OUT, ORDER, etc.)
- **Orders**: Full order lifecycle (PENDING → CONFIRMED → PROCESSING → SHIPPING → DELIVERED)
- **Reviews**: Product ratings with optional responses from admins
- **Comments**: Threaded discussion on products (parent-child relationships)
- **Cart**: Per-user cart with variant items
- **Wishlist**: Save products for later
- **Vouchers**: Fixed or percentage discounts with usage limits

### User Roles
- **USER**: Regular customers (browse, shop, review)
- **ADMIN**: Full system access
- **MANAGER**: Limited admin capabilities

### Key Business Rules
- Variants track individual inventory (not product-level)
- Stock movements are immutable audit logs
- Orders calculate: subtotal + shipping - discount - voucher + tax = total
- Reviews require user-product association (one per user per product)
- Comments support nested replies

## Important Constraints

### Technical
- **Windows Development Environment**: Custom Next.js config for EPERM workarounds
- **React Strict Mode**: Disabled to prevent double function calls
- **TypeScript**: Build errors ignored in frontend for faster iteration
- **Database**: Local PostgreSQL only (migrated from AWS RDS)
- **Port**: Backend on non-standard 5436 to avoid conflicts

### Business
- Each user can only review a product once
- Vouchers have usage limits (global and per-user)
- Inventory must track reserved vs available stock
- Orders cannot be deleted, only cancelled

### Security
- JWT-based authentication with refresh tokens
- Passwords hashed with bcryptjs
- CORS configured for specific origins
- Cookie-based refresh token storage

## External Dependencies

### Required Services
- **PostgreSQL**: Local Docker container (user:password@localhost:5436)
- **AWS S3**: Product images and file uploads
- **Cloudinary**: Alternative image hosting
- **SMTP Server**: Email notifications via Nodemailer

### Environment Variables
Backend requires:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Token signing key
- `AWS_*` - S3 credentials and bucket config
- `CORS_ORIGIN` - Frontend URL
- `SMTP_*` - Email service config

Frontend requires:
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_IMAGE_HOSTS` - Comma-separated CDN hosts for Next.js Image

### Development Tools
- Docker Compose for local database
- Prisma CLI for migrations and schema management
- ts-node for running TypeScript directly
- nodemon for backend hot reload
