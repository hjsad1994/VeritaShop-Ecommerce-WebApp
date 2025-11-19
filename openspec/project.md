# Project Context

## Purpose
VeritaShop is a full-stack e-commerce platform focused on premium consumer electronics. The goal is to provide a fast shopping experience for end users, while giving store operators an opinionated admin workspace to manage catalog content, vouchers, orders, inventory, and customer accounts without touching the database manually.

## Tech Stack
- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Axios, react-hot-toast.
- Backend: Node.js 20, Express 4, TypeScript, Prisma ORM, PostgreSQL 13 (Docker), AWS SDK v3, Cloudinary SDK, Nodemailer.
- Tooling: ESLint (frontend), ts-node + tsc builds, Prisma Migrate/Seed, Docker Compose for local data stores.

## Project Conventions

### Code Style
- TypeScript everywhere; avoid `any` unless interacting with third-party SDK responses.
- Frontend uses Next.js ESLint config (`npm run lint`); formatting follows Prettier defaults (2-space indent).
- Backend favors explicit return types on exported functions, PascalCase for classes, camelCase for variables/functions, and keeps files ASCII-only.
- API routes, DTOs, and Prisma models use singular PascalCase names; REST paths use kebab-case plural nouns (e.g., `/api/products`).
- Environment variables live in `.env` files but must also be documented in READMEs or `.env.example` before use.

### Architecture Patterns
- Backend follows layered architecture:
  - Routes wire Express handlers and attach middleware (auth, validation, file upload).
  - Controllers perform request/response orchestration and translate validation errors into `ApiError`.
  - Services hold business logic, coordinate repositories, and enforce invariants (stock checks, voucher windows, role gates).
  - Repositories wrap Prisma queries; no service should reach Prisma directly.
  - Shared DTOs/validations ensure consistent payload shapes between layers.
- Frontend uses the App Router with co-located layouts; feature directories (`features/*`) encapsulate UI + hooks per domain.
- State is shared via React Contexts (`AuthContext`, `CartContext`, `UserContext`) plus server components where possible.
- Image uploads use a presigned URL flow (`/images/presigned-url` → direct S3 upload). Keep all media helpers inside `S3Service` on the backend and `imageService` on the frontend.

### Testing Strategy
- Run `npm run lint` in `frontend/` before every commit; treat warnings as errors.
- Backend currently lacks formal automated tests; when adding coverage prefer Jest + Supertest for routes and Prisma test transactions for repositories.
- Critical flows (auth, checkout, admin CRUD) must be verified end-to-end via manual smoke tests using seeded data (`npm run prisma:seed`).
- When fixing bugs, add at least a regression test (service-level or component) or document manual steps in PR description until the automated suite exists.

### Git Workflow
- Work happens on short-lived feature branches (`feature/<summary>` or `fix/<summary>`). Keep `main` deployable.
- Rebase on top of `main` before opening a PR; resolve conflicts locally.
- Commit messages follow `<type>: <imperative summary>` where `type ∈ {feat, fix, chore, docs, refactor, test}`.
- For spec-driven work, create an OpenSpec change (`openspec/changes/<change-id>/`) and get the proposal approved before merging implementation code.
- Every PR must mention how to test the change (lint/test commands or manual steps) and call out migrations or env var changes.

## Domain Context
- The storefront sells high-end phones and accessories. Catalog entries belong to both brands and nested categories; slugs must be unique.
- Customers can browse, search, manage carts/wishlists, and place orders. Authentication uses JWT access tokens (15 min) plus UUID refresh tokens persisted in the user table.
- The admin portal (under `/admin/*`) exposes dashboards for users, products (with variants), inventory thresholds, vouchers, and orders. Access requires `ADMIN` or `MANAGER` roles.
- Inventory is tracked separately from products; adjustments propagate through services to prevent overselling.
- Voucher management enforces uppercase codes, numeric bounds, and active windows as validated in `VoucherValidation.ts`. Frontend mirrors these rules to fail fast.
- Error messages and copy are primarily Vietnamese; keep localization consistent when adding new API responses or UI text.

## Important Constraints
- Target Node.js 20+ and Next.js 15; do not introduce dependencies that lack support.
- PostgreSQL is the single source of truth; all schema updates must go through Prisma migrations checked into source control.
- JWT secrets, database URLs, mail credentials, and S3 keys must never be hard-coded. Use `.env` + `config/index.ts` accessors.
- Direct S3 uploads rely on the CORS policy documented in `backend/S3_CORS_CONFIG.md`; changing the flow requires updating that doc.
- Backend responses standardize on `{ success, message, data }`. New controllers should stick to this contract so the frontend error handling remains consistent.
- Image metadata and large payloads are stored in S3/CloudFront; avoid persisting base64 blobs in the database.

## External Dependencies
- PostgreSQL 13 (local via Docker, managed in production).
- AWS S3 + optional CloudFront distribution for product media (presigned upload + CDN delivery).
- Cloudinary (legacy asset host) — keep credentials valid until all assets migrate to S3.
- Nodemailer SMTP account for transactional email (order confirmations, password flows).
- Any client consuming the backend must provide `NEXT_PUBLIC_API_URL` or equivalent base URL; CORS is configured to allow the Next.js host plus admin domain.
