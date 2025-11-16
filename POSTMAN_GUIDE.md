# VeritaShop API - Postman Collection

## 📦 Files đã tạo

1. **VeritaShop-API.postman_collection.json** - Collection chứa tất cả API endpoints
2. **VeritaShop-Local.postman_environment.json** - Environment cho local development

## 🚀 Hướng dẫn Import vào Postman

### Bước 1: Import Collection
1. Mở Postman
2. Click **Import** (góc trái trên)
3. Kéo thả file `VeritaShop-API.postman_collection.json` vào
4. Hoặc click **Choose Files** và chọn file
5. Click **Import**

### Bước 2: Import Environment
1. Click **Import** lần nữa
2. Kéo thả file `VeritaShop-Local.postman_environment.json` vào
3. Click **Import**

### Bước 3: Active Environment
1. Góc phải trên Postman, click dropdown **No Environment**
2. Chọn **VeritaShop - Local**
3. ✅ Environment đã active!

## 📚 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| POST | `/api/auth/logout` | Đăng xuất | ✅ |
| POST | `/api/auth/refresh` | Refresh access token | ✅ (refresh token) |

### 👤 User Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Lấy thông tin user hiện tại | ✅ |
| PUT | `/api/users/profile` | Cập nhật profile | ✅ |

### 🏥 Health Check
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | ❌ |
| GET | `/api` | API root | ❌ |

## 🔄 Testing Flow (Khuyến nghị)

### 1. Register New User
```
POST /api/auth/register
Body:
{
  "email": "newuser@example.com",
  "password": "Test123",
  "name": "New User"
}
```

### 2. Login
```
POST /api/auth/login
Body:
{
  "email": "test@example.com",
  "password": "Test123"
}
```
⚠️ **Important**: Sau khi login thành công, Postman sẽ tự động lưu cookies (accessToken, refreshToken). Tất cả request sau đó sẽ tự động gửi cookies này.

### 3. Get Current User
```
GET /api/users/me
```
✅ Request này sẽ tự động sử dụng cookie từ login

### 4. Update Profile
```
PUT /api/users/profile
Body:
{
  "name": "Updated Name",
  "phone": "0123456789",
  "address": "123 Test Street, Hanoi",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 5. Logout
```
POST /api/auth/logout
```

## 🍪 Cookie Management

Postman **tự động quản lý cookies** cho bạn:

1. Sau khi login thành công, Postman lưu:
   - `accessToken` (expires in 15 minutes)
   - `refreshToken` (expires in 7 days)

2. Mọi request tiếp theo sẽ tự động gửi cookies

3. Để xem cookies:
   - Click **Cookies** (dưới Send button)
   - Chọn domain `localhost:5000`

4. Để xóa cookies (logout manual):
   - Click **Cookies**
   - Delete `accessToken` và `refreshToken`

## 🧪 Test Data

### Test User (Đã có trong database)
```
Email: test@example.com
Password: Test123
Role: USER
```

### Sample Update Profile
```json
{
  "name": "John Doe",
  "phone": "0123456789",
  "address": "123 Nguyen Trai, Hanoi, Vietnam",
  "avatar": "https://i.pravatar.cc/300"
}
```

### Partial Update (Chỉ update 1 field)
```json
{
  "phone": "0987654321"
}
```

## ⚠️ Lưu ý

### 1. CORS
Backend đã cấu hình CORS cho `http://localhost:3000` (Frontend). Postman **KHÔNG BỊ ẢNH HƯỞNG** bởi CORS.

### 2. httpOnly Cookies
- Cookies được set với `httpOnly: true` (bảo mật)
- Frontend không thể đọc cookies bằng JavaScript
- Postman vẫn nhìn thấy và quản lý được

### 3. Token Expiry
- **Access Token**: 15 phút
- **Refresh Token**: 7 ngày
- Nếu access token hết hạn, sử dụng `/api/auth/refresh`

### 4. Validation Errors
Nếu gửi dữ liệu không hợp lệ, backend sẽ trả về:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful message",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors if any
  ]
}
```

## 🔧 Environment Variables

Collection sử dụng biến `{{baseUrl}}` để dễ dàng chuyển đổi giữa môi trường:

- **Local**: `http://localhost:5000`
- **Production**: (sẽ cập nhật sau)

Để thay đổi base URL:
1. Click icon ⚙️ (Settings) góc phải trên
2. Chọn **VeritaShop - Local**
3. Edit giá trị `baseUrl`

## 🎯 Auto-saved Variables

Collection tự động lưu các biến sau khi login:
- `userId` - ID của user đã login
- `userEmail` - Email của user
- `userRole` - Role của user (USER, ADMIN, MANAGER)

Bạn có thể sử dụng các biến này trong request khác:
```
{{userId}}
{{userEmail}}
{{userRole}}
```

## 📝 Next Steps

Khi có thêm API endpoints mới (Products, Categories, Orders, etc.), chỉ cần:

1. Mở file `VeritaShop-API.postman_collection.json`
2. Thêm endpoints mới vào collection
3. Re-import vào Postman

Hoặc có thể edit trực tiếp trong Postman và export lại.

## 🐛 Troubleshooting

### Lỗi "Unauthorized"
- Kiểm tra đã login chưa
- Kiểm tra cookies có tồn tại không
- Token có thể đã hết hạn, thử login lại

### Lỗi "Cannot connect to server"
- Kiểm tra backend server đã chạy chưa: `cd backend && npm run dev`
- Kiểm tra port 5000 có đang được sử dụng không
- Kiểm tra `baseUrl` trong environment

### Lỗi "Database error"
- Kiểm tra PostgreSQL đã chạy chưa: `docker ps`
- Kiểm tra connection string trong `.env`
- Restart backend server

---

**Happy Testing! 🚀**

Nếu có vấn đề gì, check backend logs: `backend/logs/`
