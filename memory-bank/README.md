# Memory Bank - Quick Reference

## 📚 Cấu trúc Memory Bank

Memory Bank của dự án VeritaShop bao gồm các file sau:

### Core Files (Bắt buộc)

1. **projectbrief.md** - Foundation document
   - Tổng quan dự án
   - Phạm vi và yêu cầu
   - Tech stack
   - Success criteria
   - Risks và constraints

2. **productContext.md** - Product perspective
   - Vấn đề cần giải quyết
   - Giải pháp đề xuất
   - User experience flows
   - Feature implementation status
   - Data structures

3. **systemPatterns.md** - Architecture patterns
   - Layered Architecture
   - Design patterns
   - Component structure
   - Data flow
   - Error handling strategy

4. **techContext.md** - Technical details
   - Technology stack chi tiết
   - Project structure
   - Development setup
   - Environment configuration
   - Build & deployment

5. **activeContext.md** - Current work
   - Current focus
   - Recent changes
   - Next steps
   - Active decisions
   - Blockers

6. **progress.md** - Status tracking
   - Completed features
   - In progress tasks
   - To do items
   - Known issues
   - Timeline estimates

## 🚀 Quick Start Guide

### Đọc Memory Bank (Khi bắt đầu session mới)

Thứ tự đọc được khuyến nghị:

1. **projectbrief.md** → Hiểu tổng quan
2. **progress.md** → Biết status hiện tại
3. **activeContext.md** → Hiểu công việc đang làm
4. **productContext.md** → Hiểu user perspective
5. **systemPatterns.md** → Hiểu architecture
6. **techContext.md** → Hiểu technical details

### Cập nhật Memory Bank

Update khi:
- Hoàn thành major feature
- Architecture decision mới
- User request với từ khóa "update memory bank"
- Phát hiện pattern mới trong project

## 📊 Project Status Snapshot

**Last Updated**: 2025-11-16

### Overall Progress: ~35%
- ✅ Frontend UI: 100%
- ✅ Backend Architecture: 100%
- ✅ User Authentication (Full Stack): 100%
- ✅ Database Setup: 100%
- ✅ Frontend-Backend Integration: 100%
- ✅ Database Schema Design: 100% (13 models)
- ✅ GitIgnore Configuration: 100%
- ⏳ Product APIs: 0%
- ⏳ Order Management: 0%

### Current Focus
**Phase 2 - Session 3**: API Testing & Postman Collection (COMPLETED ✅)
- ✅ Tested all User Management APIs (5 endpoints)
- ✅ Full update profile tested (name, phone, address, avatar)
- ✅ Partial update profile tested (phone only)
- ✅ Authentication middleware verified working
- ✅ Created Postman Collection (9 endpoints total)
- ✅ Created Postman Environment (local dev)
- ✅ Created comprehensive documentation (POSTMAN_GUIDE.md)

**Next Phase**: Product & Category API Implementation
- Implement repositories for new models
- Create services for business logic
- Build REST APIs for products, categories, brands

### Next Actions
1. ✅ COMPLETED: Setup database and testing
2. ✅ COMPLETED: Integrate authentication pages with backend
3. ✅ COMPLETED: Design complete ecommerce database schema
4. ✅ COMPLETED: Setup .gitignore files
5. ✅ COMPLETED: Test User Management APIs
6. ✅ COMPLETED: Create Postman Collection for API testing
7. **NEXT**: Implement Brand/Category repositories and APIs
8. **NEXT**: Implement Product repositories and APIs (with Specs, Variants, Images)
9. **NEXT**: Create seed data for testing

## 🎯 Key Information

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL 13 (Docker)
- **Auth**: JWT + httpOnly cookies
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast

### Ports
- Frontend: http://localhost:3001 (auto-switched from 3000)
- Backend: http://localhost:5000
- PostgreSQL: localhost:5436

### Key Files
- Frontend entry: `frontend/src/app/page.tsx`
- Backend entry: `backend/src/server.ts`
- **Database schema**: `backend/prisma/schema.prisma` (13 models, 382 lines)
- **Schema docs**: `backend/DATABASE_SCHEMA.md` (628 lines)
- Mock data: `frontend/src/lib/data/products.ts` (631 lines, needs migration)
- API services: `frontend/src/lib/api/`
  - `apiClient.ts` - Axios configuration
  - `authService.ts` - Authentication functions
  - `types.ts` - TypeScript interfaces
- GitIgnore: `.gitignore` (root), `backend/.gitignore`, `frontend/.gitignore`
- **Postman Collection**: `VeritaShop-API.postman_collection.json` (9 endpoints)
- **Postman Environment**: `VeritaShop-Local.postman_environment.json`
- **Postman Guide**: `POSTMAN_GUIDE.md` (336 lines)

### Test Credentials
- Email: test@example.com
- Password: Test123
- Status: ✅ Working (user saved in database)

### Architecture Pattern
```
Controllers → Services → Repositories → Database
```

## 📝 Memory Bank Philosophy

Theo Claude's Memory Bank system:
- Memory resets hoàn toàn giữa các sessions
- Memory Bank là cầu nối duy nhất
- Phải đọc ALL files khi bắt đầu task mới
- Update thường xuyên để maintain accuracy
- Focus vào activeContext.md và progress.md

## 🔗 Related Documentation

- **Backend Details**: `backend/ARCHITECTURE.md`
- **Backend Implementation**: `backend/IMPLEMENTATION_SUMMARY.md`
- **Backend Quick Ref**: `backend/QUICK_REFERENCE.md`
- **Database Schema**: `backend/DATABASE_SCHEMA.md`
- **Postman API Testing**: `POSTMAN_GUIDE.md`
- **Frontend Details**: `frontend/README.md`
- **Docker Setup**: `docker-compose.yml`

---

**Version**: 1.0
**Maintained by**: Claude Code
**Update Frequency**: After significant changes
