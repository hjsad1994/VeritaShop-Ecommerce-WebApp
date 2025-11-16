# VeritaShop - E-commerce Web Application

A full-stack e-commerce web application built with Next.js, Express, and PostgreSQL.

## Tech Stack

### Frontend
- **Framework**: Next.js 15.0.3
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **HTTP Client**: Axios 1.13.2
- **Notifications**: React Hot Toast 2.6.0

### Backend
- **Framework**: Express 4.21.2
- **Language**: TypeScript 5.7.3
- **Database**: PostgreSQL 13 (Prisma ORM 5.15.0)
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **File Upload**: Cloudinary + Multer 1.4.5
- **Validation**: express-validator 7.3.0
- **Email**: Nodemailer 6.9.16

## Project Structure

```
veritaShop-Ecommerce-WebApp/
├── backend/                    # Express API Server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, error handling, logging
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── dtos/              # Data validation
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── login/         # Auth pages
│   │   │   ├── shop/          # Shop pages
│   │   │   └── checkout/      # Checkout flow
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   └── lib/               # Utilities
│   └── package.json
│
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   ├── CODEOWNERS             # Code ownership
│   └── pull_request_template.md
│
└── docker-compose.yml         # Docker services
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Docker and Docker Compose (optional)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hjsad1994/VeritaShop-Ecommerce-WebApp.git
cd VeritaShop-Ecommerce-WebApp
```

### 2. Setup Database

#### Option A: Using Docker (Recommended)

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432.

#### Option B: Local PostgreSQL

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE veritashop;
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgresql://user:password@localhost:5432/veritashop
# JWT_SECRET=your-secret-key
# JWT_REFRESH_SECRET=your-refresh-secret-key

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## Available Scripts

### Backend

```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run seed         # Seed database with sample data
npx prisma studio    # Open Prisma Studio (Database GUI)
npx prisma migrate dev  # Create and apply new migration
```

### Frontend

```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## API Documentation

See [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) for detailed API documentation and Postman collection setup.

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

#### User
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile

## Authentication

The application uses JWT-based authentication with HTTP-only cookies:

- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry

Tokens are stored in HTTP-only cookies for security.

## Database Schema

Key models:
- **User**: User accounts and profiles
- **Product**: Product catalog
- **Category**: Product categories
- **Order**: Customer orders
- **OrderItem**: Order line items
- **Cart**: Shopping cart
- **CartItem**: Cart items

See `backend/prisma/schema.prisma` for complete schema.

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/veritashop
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Pull Request Template](.github/pull_request_template.md) before submitting PRs.

## Code Owners

This project uses CODEOWNERS for automatic PR review assignments:

- **Backend**: @hjsad1994 @ty2303
- **Frontend**: @hjsad1994 @NgoTienTai @ty2303
- **Database/Schema**: @hjsad1994
- **Authentication**: @hjsad1994

See [.github/CODEOWNERS](.github/CODEOWNERS) for details.

## CI/CD

GitHub Actions workflows:

- **Backend CI**: Linting, type checking, testing, and build
- **Frontend CI**: Linting, type checking, and build

Workflows run on push to main and on pull requests.

## License

This project is licensed under the ISC License.

## Team

- **Lead Developer**: @hjsad1994
- **Frontend Developer**: @NgoTienTai
- **Fullstack Developer**: @ty2303

## Support

For issues and questions:
- Create an [Issue](https://github.com/hjsad1994/VeritaShop-Ecommerce-WebApp/issues)
- See [Issue Templates](.github/ISSUE_TEMPLATE/)

## Acknowledgments

Built with modern technologies and best practices for e-commerce applications.
