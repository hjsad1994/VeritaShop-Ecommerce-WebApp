/**
 * ============================================
 * TYPES - ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU
 * ============================================
 * File này chứa tất cả các interface, type dùng chung
 */

import { Role } from '@prisma/client';

/**
 * ====================
 * API RESPONSE TYPES
 * ====================
 */

/**
 * Cấu trúc chuẩn của API Response
 * Mọi API đều trả về theo format này
 */
export interface ApiResponse<T = any> {
  success: boolean;          // true: thành công, false: lỗi
  message: string;           // Thông báo cho người dùng
  data?: T;                  // Dữ liệu trả về (nếu có)
  errors?: ValidationError[]; // Danh sách lỗi validation (nếu có)
}

/**
 * Cấu trúc của một validation error
 * Ví dụ: { field: "email", message: "Email không hợp lệ" }
 */
export interface ValidationError {
  field: string;    // Tên trường bị lỗi
  message: string;  // Thông báo lỗi
}

/**
 * ====================
 * USER TYPES
 * ====================
 */

/**
 * Interface đại diện cho User (không bao gồm password)
 * Dùng để trả về cho frontend
 */
export interface IUser {
  id: string;           // ID người dùng (cuid)
  name: string | null;  // Tên (có thể null)
  email: string;        // Email
  role: Role;           // Vai trò (USER, ADMIN, SUPER_ADMIN)
  createdAt: Date;      // Ngày tạo
  updatedAt: Date;      // Ngày cập nhật
}

/**
 * Interface User + Tokens
 * Dùng khi đăng nhập, trả về cả thông tin user và tokens
 */
export interface IUserWithToken extends IUser {
  accessToken: string;   // JWT access token
  refreshToken: string;  // UUID refresh token
}

/**
 * ====================
 * TOKEN TYPES
 * ====================
 */

/**
 * Dữ liệu được mã hóa trong JWT token
 * Khi decode JWT, ta sẽ nhận được object này
 */
export interface TokenPayload {
  userId: string;   // ID người dùng
  email: string;    // Email người dùng
  role: Role;       // Vai trò người dùng
}

/**
 * Cặp tokens (access + refresh)
 * Được tạo ra khi đăng nhập hoặc refresh token
 */
export interface TokenPair {
  accessToken: string;   // Token ngắn hạn (15 phút)
  refreshToken: string;  // Token dài hạn (7 ngày)
}

/**
 * ====================
 * PAGINATION TYPES
 * ====================
 */

/**
 * Tham số phân trang
 * Dùng khi cần lấy danh sách có phân trang
 */
export interface PaginationParams {
  page?: number;           // Trang hiện tại (mặc định: 1)
  limit?: number;          // Số item mỗi trang (mặc định: 10)
  sortBy?: string;         // Trường dùng để sort (ví dụ: "createdAt")
  sortOrder?: 'asc' | 'desc'; // Thứ tự sort: tăng dần hoặc giảm dần
}

/**
 * Response có phân trang
 * Trả về cả dữ liệu và thông tin phân trang
 */
export interface PaginatedResponse<T> {
  data: T[];              // Mảng dữ liệu
  pagination: {
    page: number;         // Trang hiện tại
    limit: number;        // Số item mỗi trang
    total: number;        // Tổng số items
    totalPages: number;   // Tổng số trang
  };
}

/**
 * ====================
 * REQUEST TYPES
 * ====================
 */

/**
 * Mở rộng Express Request để thêm thuộc tính user
 * Sau khi qua middleware authenticate, req.user sẽ chứa thông tin user đã đăng nhập
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;  // Thông tin user từ JWT token
    }
  }
}
