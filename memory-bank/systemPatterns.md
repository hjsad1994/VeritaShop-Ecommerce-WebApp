# System Patterns - VeritaShop Backend

## Kiến trúc tổng thể: Layered Architecture

### Sơ đồ kiến trúc
```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (Controllers - HTTP Request/Response)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Business Logic Layer                │
│    (Services - Business Rules & Logic)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Data Access Layer                   │
│  (Repositories - Database Operations)       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            Database Layer                   │
│         (PostgreSQL via Prisma)             │
└─────────────────────────────────────────────┘
```

## Component Structure

### 1. Controllers (Presentation Layer)
**Trách nhiệm:**
- Nhận HTTP requests
- Validate input cơ bản
- Gọi services
- Format responses
- Xử lý HTTP status codes

**Pattern:**
```typescript
class UserController {
  async methodName(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract data from request
      // 2. Call service
      // 3. Return formatted response
    } catch (error) {
      // Error handling
    }
  }
}
```

**File location:** `src/controllers/*.controller.ts`

### 2. Services (Business Logic Layer)
**Trách nhiệm:**
- Business logic chính
- Validation phức tạp
- Xử lý transactions
- Orchestrate multiple repositories
- Transform data

**Pattern:**
```typescript
class UserService {
  async businessMethod(dto: DTO): Promise<Result> {
    // 1. Validate business rules
    // 2. Call repositories
    // 3. Process data
    // 4. Return result
  }
}
```

**File location:** `src/services/*.service.ts`

### 3. Repositories (Data Access Layer)
**Trách nhiệm:**
- Truy cập database
- CRUD operations
- Query building
- Data mapping

**Pattern:**
```typescript
class EntityRepository extends BaseRepository<Entity> {
  // Extend base CRUD operations
  // Add entity-specific queries
}
```

**Base Repository Pattern:**
- Cung cấp CRUD operations cơ bản
- Mọi repository extend từ BaseRepository
- Consistency across all data access

**File location:** `src/repositories/*.repository.ts`

## Key Design Patterns

### 1. Dependency Injection
- Controllers inject Services
- Services inject Repositories
- Loose coupling giữa các layers

### 2. Singleton Pattern
- Prisma Client (database connection)
- Repository instances
- Service instances

### 3. DTO Pattern
- Data Transfer Objects để type safety
- Tách biệt database models và API contracts
- Location: `src/dto/*.dto.ts`

### 4. Middleware Chain
```
Request → Logger → CORS → Rate Limit → Body Parser → Auth → Controller
```

## Folder Structure
```
backend/src/
├── controllers/      # HTTP handlers
├── services/        # Business logic
├── repositories/    # Data access
├── dto/            # Data transfer objects
├── types/          # TypeScript types
├── middleware/     # Express middleware
├── routes/         # Route definitions
├── lib/            # External integrations
├── utils/          # Helper functions
└── index.ts        # App entry point
```

## Data Flow

### Request Flow (Create User Example)
```
POST /api/users/register
  ↓
Router (user.routes.ts)
  ↓
Validation Middleware
  ↓
UserController.register()
  ↓
UserService.register(dto)
  ├─→ Check existing user (UserRepository)
  ├─→ Hash password (bcrypt utility)
  ├─→ Create user (UserRepository)
  └─→ Generate token (JWT utility)
  ↓
Return response to controller
  ↓
HTTP Response
```

## Error Handling Strategy

### Error Flow
```
Error occurs anywhere
  ↓
Throw error or AppError
  ↓
Caught by try-catch in controller
  ↓
Passed to global error handler
  ↓
Formatted API response
```

### Custom Error Class
```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}
```

## Authentication Flow

### JWT Authentication
```
1. User login → Service validates credentials
2. Service generates JWT token
3. Client stores token
4. Client sends token in Authorization header
5. Auth middleware validates token
6. Request proceeds with user context
```

## Database Patterns

### Prisma Schema Structure
```prisma
model Entity {
  id        String   @id @default(uuid())
  // fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("table_name")
}
```

### Naming Conventions
- Models: PascalCase singular (User, Product)
- Tables: snake_case plural (users, products)
- Fields: camelCase
- Relations: descriptive names

## Security Patterns

1. **Password Hashing**: bcryptjs với salt rounds = 10
2. **JWT**: Token-based authentication
3. **Rate Limiting**: 100 requests/15 minutes per IP
4. **CORS**: Configurable origins
5. **Input Validation**: At controller & service layers

## Testing Strategy (Future)
- Unit tests: Services & Utilities
- Integration tests: Controllers & Repositories
- E2E tests: Full API flows
