'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/api/userService';
import toast from 'react-hot-toast';

export default function AdminProfilePage() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: '',
        address: '',
        avatar: ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userService.updateProfile(formData);
      
      // Update user context with new data
      if (response.success && response.data.user) {
        setUser(response.data.user);
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: '',
        address: '',
        avatar: ''
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-500">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Hồ sơ quản trị viên</h2>
        <p className="text-sm text-gray-600">Quản lý thông tin tài khoản quản trị viên</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black">{user.name || 'Admin User'}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {user.role === 'MANAGER' ? 'Quản lý' : user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                </span>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Họ tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                    placeholder="+84 123 456 789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Địa chỉ</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">URL ảnh đại diện</label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Họ tên</h4>
                  <p className="text-black">{user.name || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Địa chỉ email</h4>
                  <p className="text-black">{user.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Vai trò</h4>
                  <p className="text-black">{user.role === 'MANAGER' ? 'Quản lý' : user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Trạng thái tài khoản</h4>
                  <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Hoạt động
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Thông tin tài khoản</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">ID người dùng:</span>
                      <span className="ml-2 text-black">{user.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Thành viên từ:</span>
                      <span className="ml-2 text-black">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Cập nhật lần cuối:</span>
                      <span className="ml-2 text-black">
                        {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-black">Cài đặt bảo mật</h3>
          <p className="text-sm text-gray-600 mt-1">Quản lý mật khẩu và tùy chọn bảo mật</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <button className="w-full md:w-auto px-6 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold text-left">
              Đổi mật khẩu
            </button>
            <button className="w-full md:w-auto px-6 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold text-left">
              Xác thực hai yếu tố
            </button>
            <button className="w-full md:w-auto px-6 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold text-left">
              Lịch sử đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
