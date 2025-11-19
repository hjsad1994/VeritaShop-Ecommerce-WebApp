# Project Context

## Purpose
VeritaShop is a modern full-stack e-commerce web application designed for selling products online. The platform supports product catalog management, shopping cart functionality, order processing, inventory management, user reviews, wishlists, and voucher/discount systems. The application focuses on providing a seamless shopping experience with features like product variants (color, storage, RAM), detailed product specifications, and comprehensive inventory tracking.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (strict mode enabled)
- **ORM**: Prisma 5.15.0
- **Database**: PostgreSQL 13
- **Authentication**: JWT (jsonwebtoken, jose) with refresh tokens
- **File Upload**: Multer, Cloudinary
- **Validation**: express-validator
- **Other**: bcryptjs, cookie-parser, cors, nodemailer, axios, lodash, uuid

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React Context API (AuthContext, CartContext, UserContext)
- **Notifications**: react-hot-toast
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker Compose
- **Database**: PostgreSQL (via Docker)

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled in both frontend and backend
- **Naming Conventions**:
  - Files: PascalCase for components/classes (e.g., `ProductController.ts`), camelCase for utilities
  - Classes: PascalCase (e.g., `ProductService`, `BaseRepository`)
  - Variables/Functions: camelCase (e.g., `getAllProducts`, `productService`)
  - Constants: UPPER_SNAKE_CASE (e.g., `ERROR_MESSAGES`, `SUCCESS_MESSAGES`)
- **Formatting**: ESLint with Next.js core-web-vitals and TypeScript configs
- **Indentation**: 4 spaces (backend), 2 spaces (frontend - Next.js default)
- **File Organization**: Feature-based structure with clear separation of concerns

### Architecture Patterns

#### Backend Architecture (Layered Architecture)
1. **Routes Layer** (`routes/`): Define API endpoints and middleware chains
2. **Controllers Layer** (`controllers/`): Handle HTTP requests/responses, input validation, error handling
3. **Services Layer** (`services/`): Business logic, orchestration, data transformation
4. **Repositories Layer** (`repositories/`): Data access abstraction using Prisma
5. **DTOs Layer** (`dtos/`): Data Transfer Objects for API responses
6. **Validations Layer** (`validations/`): Request validation schemas using express-validator
7. **Middleware** (`middleware/`): Authentication, error handling, request logging, validation

**Key Patterns**:
- Repository Pattern: Abstract data access through repositories
- Service Factory Pattern: Centralized service instantiation
- Repository Factory Pattern: Centralized repository instantiation
- DTO Pattern: Separate API contracts from domain models
- Dependency Injection: Services receive repositories via constructor

#### Frontend Architecture (Next.js App Router)
1. **App Directory** (`app/`): Next.js 15 App Router pages and layouts
2. **Components** (`components/`): Reusable UI components organized by feature/type
   - `layout/`: Layout components (Header, Footer, Cart, etc.)
   - `ui/`: Generic UI components
   - `auth/`: Authentication-related components
   - `admin/`: Admin-specific components
3. **Features** (`features/`): Feature-specific components and logic
4. **Contexts** (`contexts/`): React Context providers for global state
5. **Lib** (`lib/`): Utilities and API clients
   - `api/`: API client functions organized by resource
   - `data/`: Data utilities

**Key Patterns**:
- Server Components by default, Client Components when needed
- Context API for global state (auth, cart, user)
- Feature-based organization
- API client abstraction layer

### Testing Strategy
- **Current Status**: No automated tests implemented (test script returns "No tests specified")
- **Future Considerations**: 
  - Unit tests for services and utilities
  - Integration tests for API endpoints
  - Component tests for React components
  - E2E tests for critical user flows

### Git Workflow
- **Branching Strategy**: Feature branches (e.g., `main#Feature-UploadImgToS3`)
- **Main Branch**: `main`
- **Naming Convention**: Feature branches follow pattern `main#Feature-<FeatureName>`
- **Commit Conventions**: Not explicitly documented, but descriptive commit messages recommended

## Domain Context

### Core Entities
- **Products**: Main catalog items with variants (color, storage, RAM), specifications, images, and pricing
- **Product Variants**: Specific configurations of products (e.g., iPhone 15 Pro - Black - 256GB)
- **Brands**: Product manufacturers (e.g., Apple, Samsung, OnePlus)
- **Categories**: Hierarchical product categorization (supports parent-child relationships)
- **Inventory**: Stock management with quantity, reserved, and available counts per variant
- **Stock Movements**: Audit trail for inventory changes (STOCK_IN, STOCK_OUT, ADJUSTMENT, ORDER, etc.)
- **Users**: Customer accounts with roles (USER, ADMIN, MANAGER)
- **Cart**: Shopping cart with items linked to product variants
- **Orders**: Purchase orders with status tracking (PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED)
- **Order Items**: Individual line items in orders
- **Reviews**: Product reviews with ratings, images, and verified purchase status
- **Comments**: Product discussion threads with nested replies
- **Wishlist**: User's saved products
- **Vouchers**: Discount codes (FIXED or PERCENTAGE) with usage limits and date ranges

### Business Rules
- Products can have multiple variants with different prices and stock levels
- Inventory tracks available quantity (total - reserved)
- Orders automatically update inventory when confirmed/cancelled
- Reviews can be verified (purchase verification)
- Vouchers have minimum order values and usage limits
- Categories support hierarchical structure (parent-child)
- Users have role-based access (USER, ADMIN, MANAGER)

### Key Workflows
1. **Product Management**: Create products → Add variants → Set inventory → Upload images
2. **Shopping Flow**: Browse → Add to cart → Apply voucher → Checkout → Order confirmation
3. **Order Processing**: Pending → Confirmed (inventory reserved) → Processing → Shipping → Delivered
4. **Inventory Management**: Stock movements tracked with reasons and references
5. **Review System**: Users can review purchased products with ratings and images

## Important Constraints
- **Database**: PostgreSQL required (via Docker Compose)
- **Environment Variables**: Required variables include `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- **CORS**: Configured for specific origin (default: `http://localhost:3000`)
- **Authentication**: Currently using JWT with refresh tokens stored in database
- **File Upload**: Cloudinary integration for image storage
- **TypeScript**: Strict mode enforced in both frontend and backend
- **Next.js**: Using App Router (not Pages Router)

## External Dependencies

### Services
- **Cloudinary**: Image upload and management service
- **PostgreSQL**: Primary database (via Docker)
- **Nodemailer**: Email service (configured but usage not visible in current codebase)

### APIs
- Backend API runs on configurable port (default: 3000)
- Frontend runs on Next.js default port (typically 3000, may conflict with backend)
- CORS configured for frontend-backend communication

### Development Tools
- **Docker Compose**: Local PostgreSQL database
- **Prisma**: Database migrations and schema management
- **Nodemon**: Development server auto-reload (backend)
- **TypeScript**: Type checking and compilation
