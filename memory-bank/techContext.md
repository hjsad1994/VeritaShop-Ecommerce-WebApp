# Tech Context - VeritaShop Backend

## Technology Stack

### Runtime & Language
- **Node.js** (v18+): JavaScript runtime
- **TypeScript** (v5.9.3): Type-safe JavaScript
- **ts-node**: Execute TypeScript directly
- **nodemon**: Development auto-reload

### Web Framework
- **Express** (v5.1.0): Web framework
- **express-rate-limit** (v8.2.1): Rate limiting middleware

### Database & ORM
- **PostgreSQL**: Relational database
- **Prisma** (v6.19.0): Modern ORM
  - Type-safe database client
  - Migration management
  - Schema definition

### Authentication & Security
- **jsonwebtoken** (v9.0.2): JWT implementation
- **bcryptjs** (v3.0.3): Password hashing
- **cors** (v2.8.5): CORS middleware

### Email Service
- **resend** (v6.4.2): Email delivery service

### Environment Management
- **dotenv** (v17.2.3): Environment variables

### Type Definitions
- @types/node
- @types/express
- @types/jsonwebtoken
- @types/bcryptjs
- @types/cors

## Project Structure

```
veritaShop-Ecommerce-WebApp/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access
│   │   ├── dto/           # Data transfer objects
│   │   ├── types/         # TypeScript types
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # Route definitions
│   │   ├── lib/           # External libraries setup
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Application entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── dist/              # Compiled JavaScript (gitignored)
│   ├── node_modules/      # Dependencies (gitignored)
│   ├── .env              # Environment variables (gitignored)
│   ├── .env.example      # Environment template
│   ├── .gitignore        # Git ignore rules
│   ├── package.json      # NPM dependencies & scripts
│   ├── tsconfig.json     # TypeScript configuration
│   └── README.md         # Backend documentation
├── frontend/              # Frontend application (existing)
└── .claude/              # Claude memory bank
    └── memory-bank/
```

## Development Setup

### Prerequisites
- Node.js v18 or higher
- PostgreSQL database
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Environment Variables (.env)
```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/veritashop?schema=public"

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Email
RESEND_API_KEY=your-resend-api-key-here

# CORS
CORS_ORIGIN=http://localhost:3000
```

### NPM Scripts
```json
{
  "dev": "nodemon --watch src --exec ts-node src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

## TypeScript Configuration

### tsconfig.json
- **target**: ES2020
- **module**: commonjs
- **outDir**: ./dist
- **rootDir**: ./src
- **strict**: true
- **esModuleInterop**: true

### Prisma Client Generation
- Output: `src/generated/prisma`
- Auto-generated after schema changes
- Provides full type safety

## Database Configuration

### Prisma Schema Location
`backend/prisma/schema.prisma`

### Current Models
1. **User** (users table)
   - Authentication
   - Profile management
   - Role-based access

### Migration Strategy
- Development: `prisma migrate dev`
- Production: `prisma migrate deploy`
- Schema changes tracked in `prisma/migrations/`

## API Design

### Response Format
```typescript
{
  success: boolean,
  data?: any,
  error?: string,
  message?: string
}
```

### Authentication
- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Expiry**: Configurable (default 7 days)

### Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Applies to**: All endpoints

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```
Server runs on http://localhost:5000

### 2. Database Workflow
```bash
# Edit schema.prisma
# Generate client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Studio (GUI)
npm run prisma:studio
```

### 3. Adding New Features
See `backend/README.md` for step-by-step guide

## Build & Deployment

### Build Process
```bash
npm run build
```
- Compiles TypeScript to JavaScript
- Output: `dist/` folder
- Preserves directory structure

### Production Start
```bash
npm start
```
Runs compiled JavaScript from `dist/`

## Technical Constraints

1. **Database**: PostgreSQL only (Prisma configured for it)
2. **Node Version**: Requires v18+
3. **Environment**: Requires .env file configuration
4. **CORS**: Must configure allowed origins
5. **Email**: Requires Resend API key for email features

## Performance Considerations

1. **Database Connection Pooling**: Managed by Prisma
2. **Rate Limiting**: Prevents abuse
3. **JWT**: Stateless authentication
4. **Logging**: Request/response logging for monitoring

## Security Measures

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Secret**: Must be strong, unique
3. **CORS**: Restricted origins
4. **Input Validation**: Multiple layers
5. **Error Messages**: No sensitive data exposure
