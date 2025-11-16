---
name: Task - Backend
about: Giao task phát triển Backend cho thành viên
title: '[BACKEND TASK] '
labels: backend, task
assignees: ''

---

## Thông tin Task

**Assignee:** @username
**Priority:** [ ] High / [ ] Medium / [ ] Low
**Due Date:** YYYY-MM-DD
**Estimated Time:** X hours/days

## Mô tả Task
<!-- Mô tả chi tiết về task cần làm -->


## Yêu cầu chức năng
<!-- Liệt kê các yêu cầu chức năng cụ thể -->

- [ ] Yêu cầu 1
- [ ] Yêu cầu 2
- [ ] Yêu cầu 3

## API Endpoints cần implement
<!-- Danh sách API endpoints cần tạo hoặc chỉnh sửa -->

### Endpoint 1
```
Method: GET/POST/PUT/DELETE
Path: /api/[resource]
Description:
```

**Request:**
```typescript
// Body/Query params
{
  field: "type"
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {},
  message: string
}
```

### Endpoint 2
```
Method:
Path:
Description:
```

## Database Changes
<!-- Thay đổi database schema nếu cần -->

**Models cần tạo/update:**
```prisma
model ModelName {
  id        String   @id @default(uuid())
  field     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Migrations cần chạy:**
- [ ] Tạo migration mới
- [ ] Update existing model
- [ ] Add relations
- [ ] Seed data

## Technical Requirements
<!-- Yêu cầu kỹ thuật chi tiết -->

**Controllers:**
- File: `backend/src/controllers/[Name]Controller.ts`
- Methods:

**Services:**
- File: `backend/src/services/[Name]Service.ts`
- Business logic:

**Repositories:**
- File: `backend/src/repositories/[Name]Repository.ts`
- Data access:

**Middlewares:**
- [ ] Authentication required
- [ ] Authorization (roles):
- [ ] Validation
- [ ] Rate limiting

**DTOs/Validation:**
- Request validation schema
- Response DTO

## Security Considerations
<!-- Các vấn đề bảo mật cần lưu ý -->

- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Authentication required
- [ ] Authorization checks
- [ ] Rate limiting
- [ ] Data sanitization

## Acceptance Criteria
<!-- Các tiêu chí để task được coi là hoàn thành -->

- [ ] API endpoints hoạt động đúng
- [ ] Request/Response validation
- [ ] Error handling đầy đủ
- [ ] Database migrations thành công
- [ ] Business logic đúng yêu cầu
- [ ] Code được format và lint clean
- [ ] TypeScript types đầy đủ
- [ ] API documentation updated

## Files cần làm việc
<!-- Danh sách files cần tạo hoặc chỉnh sửa -->

```
backend/src/
├── controllers/
│   └── [Name]Controller.ts
├── services/
│   └── [Name]Service.ts
├── repositories/
│   └── [Name]Repository.ts
├── routes/
│   └── [name]Routes.ts
├── dtos/
│   └── [Name]Dto.ts
├── middleware/
│   └── [middleware-name].ts
└── prisma/
    └── schema.prisma
```

## Dependencies
<!-- Task này phụ thuộc vào task/feature nào khác? -->

- [ ] Task #issue_number
- [ ] Database model: ModelName
- [ ] External service: ServiceName
- [ ] Library: PackageName

## Environment Variables
<!-- Biến môi trường cần thêm -->

```env
NEW_VARIABLE=value
API_KEY=xxx
```

## External Services Integration
<!-- Nếu cần tích hợp service bên ngoài -->

**Service:**
**Purpose:**
**API Documentation:**
**Authentication:**

## Performance Considerations
<!-- Các vấn đề về performance -->

- [ ] Database query optimization
- [ ] Caching strategy
- [ ] Pagination implementation
- [ ] Rate limiting
- [ ] Response time < 500ms

## Notes
<!-- Ghi chú thêm cho người thực hiện -->


## Deliverables
<!-- Những gì cần submit khi hoàn thành -->

- [ ] Code implementation
- [ ] API documentation (Postman/Swagger)
- [ ] Database migration files
- [ ] Environment variables documentation
- [ ] Pull Request

## Progress Tracking
<!-- Cập nhật tiến độ -->

- [ ] 0% - Task assigned
- [ ] 25% - Database schema designed
- [ ] 50% - Core logic implemented
- [ ] 75% - Bug fixes and refinements
- [ ] 100% - Ready for review
