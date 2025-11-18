# VeritaShop Frontend

E-commerce platform built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
npm install         # First time only
npm run dev         # Start server
```

**Server:** http://localhost:3000

### Nếu gặp lỗi EPERM hoặc port busy:
```bash
npm run kill        # Stop old Node processes
npm run dev         # Start again
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run kill` | Stop all Node processes |
| `npm run dev:fresh` | Kill old processes + start fresh |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** React 19
- **Node:** v20.13.1

## 📂 Project Structure

```
src/
├── app/              # Next.js pages (routing)
│   ├── login/        # Login page
│   ├── register/     # Register page
│   └── shop/         # Shop pages
├── components/       # Shared components
│   ├── layout/       # Header, Footer
│   └── ui/          # Filter, etc.
├── features/        # Feature-specific code
│   ├── home/        # HomePage component
│   └── shop/        # ShopPage, ProductDetail
└── lib/            # Utilities & data
    └── data/        # products.ts
```

## 🔧 Import Paths

Use `@/` alias for clean imports:

```typescript
import Header from '@/components/layout/Header';
import { products } from '@/lib/data/products';
import HomePage from '@/features/home/HomePage';
```

## 🎟️ Voucher Management

- **Backend API:** `POST/GET/PUT/PATCH/DELETE /api/admin/vouchers` (protected by `ADMIN`/`MANAGER` roles).
- **Frontend UI:** Navigate to `/admin/vouchers` to manage codes (create, edit, toggle, delete) with filters for status/type.
- **Form fields:** code, type (`PERCENTAGE` or `FIXED`), value, minimum order, total/user limits, active window, status toggle.
- **Client helpers:** use `voucherService` + `Voucher` types from `src/lib/api`.
- **Validation:** Admin forms enforce uppercase codes and numeric ranges before calling the API.

## 📄 Key Files

- `setup-trace.js` - Predev script that disables tracing to prevent EPERM errors
- `.env.local` - Environment variables (tracing disabled)
- `next.config.js` - Next.js configuration

## 🐛 Common Issues

### EPERM Error (Windows)
**Fixed automatically** by predev script. Just run `npm run dev` normally.

### Port Already in Use
Next.js will automatically use another port (3001, 3002, etc.)

---

**Built with ❤️ for VeritaShop**
