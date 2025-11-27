'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: '⚙️' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
    { id: 'appearance', label: 'Giao diện', icon: '🎨' },
    { id: 'advanced', label: 'Nâng cao', icon: '🔧' }
  ];

  const [settings, setSettings] = useState({
    general: {
      siteName: 'VeritaShop Admin',
      adminEmail: 'admin@veritashop.com',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi'
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      orderAlerts: true,
      lowStockAlerts: true,
      customerAlerts: false
    },
    appearance: {
      theme: 'light',
      sidebarCollapsed: false,
      compactMode: false
    },
    advanced: {
      debugMode: false,
      maintenanceMode: false,
      apiRateLimit: '100',
      sessionTimeout: '30'
    }
  });

  const handleSettingChange = (category: string, key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Lưu cài đặt thành công');
    } catch {
      toast.error('Không thể lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-black mb-2">Tên trang web</label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-black mb-2">Email quản trị</label>
        <input
          type="email"
          value={settings.general.adminEmail}
          onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-black mb-2">Múi giờ</label>
        <select
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
        >
          <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
          <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-black mb-2">Ngôn ngữ</label>
        <select
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">Tiếng Anh</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-black mb-4">Thông báo qua email</h4>
      
      <div className="space-y-4">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-black capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-sm text-gray-600">
                {key === 'emailAlerts' && 'Nhận thông báo email cho các sự kiện quan trọng'}
                {key === 'pushNotifications' && 'Nhận thông báo đẩy trong trình duyệt'}
                {key === 'orderAlerts' && 'Thông báo khi có đơn hàng mới'}
                {key === 'lowStockAlerts' && 'Cảnh báo khi sản phẩm sắp hết hàng'}
                {key === 'customerAlerts' && 'Thông báo khi có khách hàng mới đăng ký'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
              className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
            />
          </label>
        ))}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-black mb-2">Giao diện</label>
        <select
          value={settings.appearance.theme}
          onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
        >
          <option value="light">Sáng</option>
          <option value="dark">Tối</option>
          <option value="auto">Tự động</option>
        </select>
      </div>

      <div className="space-y-4">
        {Object.entries(settings.appearance).filter(([key]) => key !== 'theme').map(([key, value]) => (
          <label key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-black capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-sm text-gray-600">
                {key === 'sidebarCollapsed' && 'Thu gọn thanh bên theo mặc định'}
                {key === 'compactMode' && 'Sử dụng bố cục thu gọn với khoảng cách giảm'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleSettingChange('appearance', key, e.target.checked)}
              className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
            />
          </label>
        ))}
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Cảnh báo</h4>
        <p className="text-sm text-yellow-700">
          Các cài đặt này dành cho người dùng nâng cao. Cấu hình không đúng có thể ảnh hưởng đến hiệu suất hệ thống.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <div>
            <p className="font-medium text-black">Chế độ gỡ lỗi</p>
            <p className="text-sm text-gray-600">Bật ghi log gỡ lỗi và công cụ phát triển</p>
          </div>
          <input
            type="checkbox"
            checked={settings.advanced.debugMode}
            onChange={(e) => handleSettingChange('advanced', 'debugMode', e.target.checked)}
            className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <div>
            <p className="font-medium text-black">Chế độ bảo trì</p>
            <p className="text-sm text-gray-600">Tạm thời vô hiệu hóa bảng quản trị</p>
          </div>
          <input
            type="checkbox"
            checked={settings.advanced.maintenanceMode}
            onChange={(e) => handleSettingChange('advanced', 'maintenanceMode', e.target.checked)}
            className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
          />
        </label>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">Giới hạn API (yêu cầu/phút)</label>
          <input
            type="number"
            value={settings.advanced.apiRateLimit}
            onChange={(e) => handleSettingChange('advanced', 'apiRateLimit', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
            min="1"
            max="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">Hết phiên đăng nhập (phút)</label>
          <input
            type="number"
            value={settings.advanced.sessionTimeout}
            onChange={(e) => handleSettingChange('advanced', 'sessionTimeout', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
            min="5"
            max="1440"
          />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-500">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Cài đặt quản trị</h2>
        <p className="text-sm text-gray-600">Tùy chỉnh các cài đặt bảng quản trị</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-black border-b-2 border-black bg-gray-50'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')} lúc {new Date().toLocaleTimeString('vi-VN')}
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
