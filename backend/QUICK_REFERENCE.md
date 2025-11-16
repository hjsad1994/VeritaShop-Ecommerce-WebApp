# Layered Architecture - Quick Reference

## 📁 Project Structure

```
backend/src/
├── config/           # Configuration (env vars, settings)
├── constants/        # Constants (status codes, messages)
├── types/            # TypeScript types & interfaces
├── utils/            # Utilities (ApiError, logger, response)
├── middleware/       # Express middleware (auth, validation, errors)
├── dtos/             # DTOs & validation schemas
├── repositories/     # Data access layer (Prisma)
├── services/         # Business logic layer
├── controllers/      # Presentation layer (HTTP handlers)
├── routes/           # Route definitions
└── server.ts         # Application entry point
```

## 🔄 Request Flow

```
Request → Middleware → Validation → Auth → Controller → Service → Repository → Database
                                                                               ↓
Response ← Middleware ← Error Handler ← Controller ← Service ← Repository ← Response
```

## 🎯 Key Design Patterns

1. **Layered Architecture** - Separation of concerns
2. **Repository Pattern** - Abstract data access
3. **Factory Pattern** - Create instances with dependencies
4. **DTO Pattern** - Data transfer objects
5. **Dependency Injection** - Inject dependencies via constructors

## 🛠️ Layer Responsibilities

### Controllers (`src/controllers/`)
- Handle HTTP requests/responses
- Validate input (via middleware)
- Call services
- Return formatted responses
- **Never** contain business logic or database access

### Services (`src/services/`)
- Implement business logic
- Orchestrate operations
- Call repositories
- Throw domain errors
- **Never** know about HTTP (req/res)

### Repositories (`src/repositories/`)
- Encapsulate database queries
- Provide CRUD operations
- Return Prisma models
- **Never** contain business logic

### Middleware (`src/middleware/`)
- `auth.ts` - Authentication & authorization
- `validate.ts` - Request validation
- `errorHandler.ts` - Global error handling
- `requestLogger.ts` - Request/response logging

## 📝 Usage Examples

### Creating a Protected Route
```typescript
router.get(
  '/profile',
  authenticate,                    // Verify JWT
  authorize('USER', 'ADMIN'),      // Check roles
  userController.getProfile
);
```

### Throwing Errors in Services
```typescript
throw ApiError.unauthorized('Invalid credentials');
throw ApiError.notFound('User not found');
throw ApiError.conflict('Email already exists');
```

### Returning Responses in Controllers
```typescript
ApiResponseHelper.success(res, data, 'Success message');
ApiResponseHelper.created(res, data, 'Created successfully');
ApiResponseHelper.error(res, 'Error message', 400);
```

## 🔐 Authentication

- **Access Token**: JWT, 15 minutes, stored in httpOnly cookie
- **Refresh Token**: UUID, 7 days, stored in httpOnly cookie & database
- **Flow**: Login → Get tokens → Access API → Refresh when expired

## ✅ Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

## 🚀 Running the Application

```bash
# Development mode
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start

# Database migrations
npm run prisma:migrate

# Prisma Studio
npx prisma studio
```

## 📦 Adding New Features

1. **Define Prisma model** in `schema.prisma`
2. **Create Repository** in `src/repositories/`
3. **Create Service** in `src/services/`
4. **Create DTOs** in `src/dtos/`
5. **Create Controller** in `src/controllers/`
6. **Define Routes** in `src/routes/`
7. **Mount routes** in `src/server.ts`

## 🔑 Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5436/nextecommerce"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

## 📚 Files to Reference

- **Full documentation**: `ARCHITECTURE.md`
- **Configuration**: `src/config/index.ts`
- **Types**: `src/types/index.ts`
- **Constants**: `src/constants/index.ts`
- **Error handling**: `src/utils/ApiError.ts`

## 🎓 Key Principles

1. **Each layer has a single responsibility**
2. **Dependencies flow downward** (Controller → Service → Repository)
3. **Errors bubble upward** (Repository → Service → Controller → ErrorHandler)
4. **Never bypass layers** (Controller should not call Repository directly)
5. **Keep controllers thin** (Delegate all logic to services)
6. **Services are framework-agnostic** (No Express types in services)
7. **Repositories only handle data** (No business logic)
