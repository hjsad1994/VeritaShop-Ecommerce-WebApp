'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { User, PaginationMeta } from '@/lib/api/types';
import { adminService, type GetAllUsersParams, type CreateUserData, type UpdateUserData as AdminUpdateUserData } from '@/lib/api/adminService';
import toast from 'react-hot-toast';

const normalizeUserDates = (user: User): User => ({
  ...user,
  createdAt: new Date(user.createdAt),
  updatedAt: new Date(user.updatedAt),
  isActive: user.isActive ?? true,
});

export default function AccountsPage() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const filtersRef = useRef<GetAllUsersParams>({});
  const [isMutating, setIsMutating] = useState(false);

  const extractErrorMessage = (error: unknown): string => {
    if (!error) return 'Không thể tải danh sách người dùng';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
      return (error as { message?: string }).message as string;
    }
    return 'Không thể tải danh sách người dùng';
  };

  const getInputValue = (value: FormDataEntryValue | null): string | undefined => {
    if (value === null) return undefined;
    const trimmed = value.toString().trim();
    return trimmed.length ? trimmed : undefined;
  };

  const fetchUsers = useCallback(async (params?: GetAllUsersParams) => {
    setIsLoading(true);
    setError(null);
    const requestParams = params ?? filtersRef.current;
    try {
      const response = await adminService.getAllUsers(requestParams);
      if (response.success && response.data?.users) {
        setUsers(response.data.users.map(normalizeUserDates));
        setPagination(response.data.pagination ?? null);
        filtersRef.current = requestParams;
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return users;
    }
    return users.filter((user) => {
      const nameMatch = (user.name ?? '').toLowerCase().includes(normalizedQuery);
      const emailMatch = user.email.toLowerCase().includes(normalizedQuery);
      return nameMatch || emailMatch;
    });
  }, [searchQuery, users]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    const confirmed = confirm('Bạn có chắc chắn muốn xoá người dùng này?');
    if (!confirmed) {
      return;
    }
    setIsMutating(true);
    try {
      const response = await adminService.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.message || 'Xoá người dùng thất bại');
      }
      toast.success('Đã xoá người dùng');
      await fetchUsers();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setIsMutating(true);
    try {
      const response = await adminService.updateUser(user.id, { isActive: !user.isActive });
      if (!response.success) {
        throw new Error(response.message || 'Không thể cập nhật trạng thái');
      }
      toast.success(`Đã ${user.isActive ? 'vô hiệu hoá' : 'kích hoạt'} người dùng`);
      await fetchUsers();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsMutating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modalMode === 'edit' && !selectedUser) {
      toast.error('Không tìm thấy người dùng để cập nhật');
      setShowModal(false);
      return;
    }
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const name = getInputValue(formData.get('name'));
      const phone = getInputValue(formData.get('phone'));
      const address = getInputValue(formData.get('address'));
      const avatar = getInputValue(formData.get('avatar'));
      const role = (formData.get('role') as string) || 'USER';
      const email = (formData.get('email') as string)?.trim();
      const password = getInputValue(formData.get('password'));
      const isActiveInput = formData.get('isActive');
      const isActive = typeof isActiveInput === 'string' ? isActiveInput === 'true' : undefined;

      if (modalMode === 'add') {
        const createPayload: CreateUserData = {
          email: email || '',
          password: password || '',
          name,
          role,
          phone,
          address,
          avatar,
          isActive: isActive ?? true,
        };

        if (!createPayload.email || !createPayload.password) {
          throw new Error('Email và mật khẩu là bắt buộc');
        }

        const response = await adminService.createUser(createPayload);
        if (!response.success || !response.data?.user) {
          throw new Error(response.message || 'Không thể tạo người dùng');
        }

        toast.success('Đã tạo người dùng mới');
        setShowModal(false);
        await fetchUsers();
      } else if (selectedUser) {
        const updatePayload: AdminUpdateUserData = {
          email,
          name,
          role,
          phone,
          address,
          avatar,
          isActive,
        };

        if (password) {
          updatePayload.password = password;
        }

        const response = await adminService.updateUser(selectedUser.id, updatePayload);
        if (!response.success || !response.data?.user) {
          throw new Error(response.message || 'Không thể cập nhật người dùng');
        }

        toast.success('Đã cập nhật người dùng');
        setShowModal(false);
        await fetchUsers();
      }
    } catch (err) {
      const message = extractErrorMessage(err) || 'Failed to save user';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedQuery = searchQuery.trim();
    const nextFilters: GetAllUsersParams = {
      ...filtersRef.current,
      page: 1,
    };

    if (normalizedQuery.length) {
      nextFilters.search = normalizedQuery;
    } else {
      delete nextFilters.search;
    }

    await fetchUsers(nextFilters);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-black mb-2">Quản lý người dùng</h2>
          <p className="text-sm text-gray-600">Quản lý tài khoản và quyền người dùng</p>
          {pagination && (
            <p className="text-xs text-gray-500 mt-1">
              Hiển thị {users.length} trên {pagination.total} người dùng
            </p>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Người dùng</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Vai trò</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ngày tham gia</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cập nhật lần cuối</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Đang tải người dùng...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-500 space-y-3">
                    <p>{error}</p>
                    <button
                      type="button"
                      onClick={() => fetchUsers()}
                      className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Thử tải lại
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-black">{user.name || 'Chưa có tên'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'ADMIN' || user.role === 'MANAGER'
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {user.role === 'MANAGER' ? 'Quản lý' : user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        disabled={isMutating}
                        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={isMutating}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h4m-2-2v4m-7 4a8 8 0 1116 0 8 8 0 01-16 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isMutating}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy tài khoản</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">
                {modalMode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Họ tên</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedUser?.name || ''}
                  required
                  placeholder="Nhập họ tên đầy đủ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedUser?.email}
                  required
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Vai trò</label>
                <select
                  name="role"
                  defaultValue={selectedUser?.role || 'USER'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black bg-white"
                >
                  <option value="USER">Người dùng</option>
                  <option value="MANAGER">Quản lý</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Trạng thái</label>
                <select
                  name="isActive"
                  defaultValue={(selectedUser?.isActive ?? true) ? 'true' : 'false'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black bg-white"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>

              {modalMode === 'add' && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                  />
                </div>
              )}

              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Mật khẩu mới (Tùy chọn)</label>
                  <input
                    type="password"
                    name="password"
                    minLength={6}
                    placeholder="Để trống nếu giữ mật khẩu hiện tại"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Số điện thoại (Tùy chọn)</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={selectedUser?.phone || ''}
                  placeholder="+84 123 456 789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Địa chỉ (Tùy chọn)</label>
                <textarea
                  name="address"
                  defaultValue={selectedUser?.address || ''}
                  rows={3}
                  placeholder="Nhập địa chỉ người dùng"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">URL ảnh đại diện (Tùy chọn)</label>
                <input
                  type="url"
                  name="avatar"
                  defaultValue={selectedUser?.avatar || ''}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang xử lý...' : modalMode === 'add' ? 'Tạo người dùng' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
