export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  USER_ALREADY_EXISTS: 'Email này đã được đăng ký',
  UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này',
  INVALID_TOKEN: 'Token không hợp lệ hoặc đã hết hạn',
  TOKEN_REQUIRED: 'Vui lòng cung cấp access token',
  INTERNAL_ERROR: 'Đã xảy ra lỗi, vui lòng thử lại sau',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
  BRAND_NOT_FOUND: 'Không tìm thấy thương hiệu',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục',
  PRODUCT_SLUG_EXISTS: 'Slug sản phẩm đã tồn tại',

} as const;

export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Đăng ký tài khoản thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  TOKEN_REFRESHED: 'Làm mới token thành công',
  GET_CURRENT_USER_SUCCESS: 'Lấy thông tin người dùng thành công',
  UPDATE_USER_SUCCESS: 'Cập nhật thông tin người dùng thành công',
  DELETE_USER_SUCCESS: 'Xóa người dùng thành công',
  GET_PRODUCTS_SUCCESS: 'Lấy danh sách sản phẩm thành công',
  GET_PRODUCT_SUCCESS: 'Lấy thông tin sản phẩm thành công',
  CREATE_PRODUCT_SUCCESS: 'Tạo sản phẩm thành công',
  UPDATE_PRODUCT_SUCCESS: 'Cập nhật sản phẩm thành công',
  DELETE_PRODUCT_SUCCESS: 'Xóa sản phẩm thành công',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
} as const;
