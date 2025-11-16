# Backend Layered Architecture Documentation

## Overview

This backend follows a **Layered Architecture** pattern, which separates concerns into distinct layers, making the codebase maintainable, testable, and scalable.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Controllers, Routes, Middleware)      │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer            │
│            (Services)                   │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Data Access Layer               │
│          (Repositories)                 │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Database Layer                  │
│       (Prisma ORM + PostgreSQL)         │
└─────────────────────────────────────────┘
```

## Directory Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── index.ts         # Centralized config with env vars
│   │
│   ├── constants/           # Constants and enums
│   │   └── index.ts         # HTTP status codes, messages, etc.
│   │
│   ├── types/               # TypeScript types and interfaces
│   │   └── index.ts         # Shared types
│   │
│   ├── utils/               # Utility functions
│   │   ├── ApiError.ts      # Custom error class
│   │   ├── logger.ts        # Logging utility
│   │   └── response.ts      # API response helper
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # Authentication & authorization
│   │   ├── validate.ts      # Request validation
│   │   ├── errorHandler.ts  # Global error handler
│   │   ├── requestLogger.ts # Request logging
│   │   └── index.ts         # Middleware exports
│   │
│   ├── dtos/                # Data Transfer Objects
│   │   ├── UserDto.ts       # User DTOs
│   │   └── AuthValidation.ts # Validation schemas
│   │
│   ├── repositories/        # Data Access Layer
│   │   ├── BaseRepository.ts    # Base repository class
│   │   ├── UserRepository.ts    # User data access
│   │   └── index.ts             # Repository factory
│   │
│   ├── services/            # Business Logic Layer
│   │   ├── AuthService.ts   # Authentication logic
│   │   └── index.ts         # Service factory
│   │
│   ├── controllers/         # Presentation Layer
│   │   └── authController.ts # Auth HTTP handlers
│   │
│   ├── routes/              # Route definitions
│   │   └── authRoutes.ts    # Auth endpoints
│   │
│   └── server.ts            # Application entry point
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Database seeding
│
├── .env                     # Environment variables
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Layer Descriptions

### 1. **Controllers (Presentation Layer)**
- **Location**: `src/controllers/`
- **Responsibility**: Handle HTTP requests and responses
- **Should**:
  - Receive HTTP requests
  - Validate request data (via middleware)
  - Call appropriate service methods
  - Return formatted responses
- **Should NOT**:
  - Contain business logic
  - Access the database directly
  - Handle errors (delegated to error handler)

**Example**: `src/controllers/authController.ts:12-32`

### 2. **Services (Business Logic Layer)**
- **Location**: `src/services/`
- **Responsibility**: Implement business logic and orchestrate operations
- **Should**:
  - Implement business rules
  - Orchestrate multiple repository calls
  - Transform data
  - Throw domain-specific errors
- **Should NOT**:
  - Know about HTTP (req, res)
  - Access database directly (use repositories)

**Example**: `src/services/AuthService.ts:29-50`

### 3. **Repositories (Data Access Layer)**
- **Location**: `src/repositories/`
- **Responsibility**: Abstract database operations
- **Should**:
  - Provide CRUD operations
  - Encapsulate Prisma queries
  - Return domain entities
- **Should NOT**:
  - Contain business logic
  - Know about HTTP or services

**Example**: `src/repositories/UserRepository.ts:24-28`

### 4. **Middleware**
- **Location**: `src/middleware/`
- **Responsibility**: Process requests before reaching controllers
- **Includes**:
  - **Authentication**: `auth.ts` - Verify JWT tokens
  - **Authorization**: `auth.ts` - Check user roles
  - **Validation**: `validate.ts` - Validate request data
  - **Error Handling**: `errorHandler.ts` - Global error handling
  - **Logging**: `requestLogger.ts` - Log requests/responses

### 5. **DTOs (Data Transfer Objects)**
- **Location**: `src/dtos/`
- **Responsibility**: Define data structure for API requests/responses
- **Includes**:
  - Request validation schemas
  - Response DTOs (exclude sensitive data like passwords)

### 6. **Utilities**
- **Location**: `src/utils/`
- **Includes**:
  - **ApiError**: Custom error class with status codes
  - **Logger**: Structured logging
  - **Response Helper**: Standardized API responses

## Request Flow

```
1. HTTP Request
   ↓
2. Middleware (CORS, Body Parser, Cookie Parser)
   ↓
3. Middleware (Request Logger)
   ↓
4. Route Handler
   ↓
5. Validation Middleware
   ↓
6. Authentication Middleware (if required)
   ↓
7. Controller
   ↓
8. Service (Business Logic)
   ↓
9. Repository (Database Access)
   ↓
10. Database (PostgreSQL via Prisma)
   ↓
11. Response back through layers
   ↓
12. Error Handler (if error occurs)
   ↓
13. HTTP Response
```

## Design Patterns Used

### 1. **Factory Pattern**
- `RepositoryFactory`: Creates repository instances
- `ServiceFactory`: Creates service instances with dependencies

### 2. **Singleton Pattern**
- Prisma Client: Single instance across the application
- Configuration: Single config object

### 3. **Repository Pattern**
- Abstracts data access logic
- Makes database swapping easier

### 4. **Dependency Injection**
- Services receive repositories via constructor
- Controllers receive services via factory

### 5. **DTO Pattern**
- Separates internal models from API contracts
- Excludes sensitive data (passwords)

## Error Handling Strategy

### Custom Error Classes
```typescript
ApiError.badRequest(message)      // 400
ApiError.unauthorized(message)    // 401
ApiError.forbidden(message)       // 403
ApiError.notFound(message)        // 404
ApiError.conflict(message)        // 409
ApiError.internal(message)        // 500
```

### Error Flow
1. Service throws `ApiError`
2. Controller catches and passes to `next(error)`
3. Global error handler catches all errors
4. Returns standardized error response

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Authentication & Authorization

### Authentication Flow
1. User logs in with email/password
2. Service validates credentials
3. Service generates JWT access token (15min) + UUID refresh token (7 days)
4. Tokens stored in httpOnly cookies
5. Access token used for API requests
6. Refresh token used to get new access token

### Middleware Usage
```typescript
// Public route - no auth
router.post('/login', authController.login);

// Protected route - requires auth
router.get('/profile', authenticate, userController.getProfile);

// Admin only route - requires auth + role
router.delete('/users/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.deleteUser);
```

## Environment Variables

Required in `.env`:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

## Best Practices

### 1. **Controllers**
- Keep thin - delegate logic to services
- Use DTOs for request/response
- Always pass errors to `next()`

### 2. **Services**
- Implement single responsibility
- Throw `ApiError` for expected errors
- Log important operations

### 3. **Repositories**
- Keep methods simple and focused
- Return Prisma models directly
- Don't catch errors (let them bubble up)

### 4. **Error Handling**
- Use `ApiError` for operational errors
- Let unexpected errors reach global handler
- Log all errors with context

### 5. **Validation**
- Validate at route level (middleware)
- Use express-validator
- Return clear validation messages

## Adding New Features

### Example: Adding a Product Module

1. **Create Repository**
```typescript
// src/repositories/ProductRepository.ts
export class ProductRepository extends BaseRepository<Product> {
  async findAll() { ... }
  async findById(id: string) { ... }
  async create(data: CreateProductData) { ... }
}
```

2. **Create Service**
```typescript
// src/services/ProductService.ts
export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async createProduct(data: CreateProductInput) {
    // Business logic here
    return this.productRepo.create(data);
  }
}
```

3. **Create Controller**
```typescript
// src/controllers/productController.ts
export class ProductController {
  private productService = ServiceFactory.getProductService();

  createProduct = async (req, res, next) => {
    try {
      const product = await this.productService.createProduct(req.body);
      ApiResponseHelper.created(res, product, 'Product created');
    } catch (error) {
      next(error);
    }
  };
}
```

4. **Create Routes**
```typescript
// src/routes/productRoutes.ts
router.post('/', authenticate, validate(ProductValidation.create()), productController.createProduct);
```

5. **Update Server**
```typescript
// src/server.ts
app.use('/api/products', productRoutes);
```

## Testing Strategy

### Unit Tests
- Test services in isolation (mock repositories)
- Test repositories with in-memory database
- Test utilities and helpers

### Integration Tests
- Test API endpoints end-to-end
- Use test database
- Test authentication flow

### Example Test Structure
```typescript
describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;
    authService = new AuthService(mockUserRepo);
  });

  it('should register new user', async () => {
    // Test implementation
  });
});
```

## Performance Considerations

1. **Database Queries**
   - Use Prisma's select to fetch only needed fields
   - Implement pagination in repositories
   - Use database indexes

2. **Caching**
   - Consider Redis for frequently accessed data
   - Cache at service layer

3. **Logging**
   - Use log levels appropriately
   - Disable verbose logging in production

## Security Considerations

1. **Authentication**
   - Use bcrypt for password hashing (cost factor: 10-12)
   - JWT tokens are signed and verified
   - Refresh tokens stored in database

2. **Authorization**
   - Role-based access control (RBAC)
   - Middleware checks user permissions

3. **Input Validation**
   - Validate all inputs at route level
   - Sanitize data to prevent injection

4. **CORS**
   - Configure allowed origins
   - Enable credentials for cookies

5. **Cookies**
   - httpOnly: prevents XSS
   - secure: HTTPS only in production
   - sameSite: CSRF protection

## Troubleshooting

### Common Issues

1. **"RepositoryFactory not initialized"**
   - Ensure `RepositoryFactory.initialize(prisma)` is called in server.ts

2. **Validation errors not showing**
   - Check middleware order - validation must come before controller

3. **CORS errors**
   - Verify CORS_ORIGIN matches frontend URL
   - Ensure credentials: true in CORS config

## Future Enhancements

1. **Add API Documentation** (Swagger/OpenAPI)
2. **Implement Rate Limiting** (express-rate-limit)
3. **Add Redis Caching**
4. **Implement WebSockets** (Socket.io)
5. **Add File Upload Service** (with Cloudinary)
6. **Implement Email Service** (using nodemailer)
7. **Add Unit & Integration Tests** (Jest/Supertest)
8. **Implement CI/CD Pipeline**
9. **Add API Versioning** (/api/v1, /api/v2)
10. **Implement GraphQL Layer** (optional)

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
