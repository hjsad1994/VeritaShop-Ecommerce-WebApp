'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import voucherService from '@/lib/api/voucherService';
import type { Voucher, VoucherStatus, VoucherType } from '@/lib/api/types';

const voucherTypes: VoucherType[] = ['PERCENTAGE', 'FIXED'];
const voucherStatuses: VoucherStatus[] = ['active', 'inactive', 'scheduled', 'expired'];

type VoucherFormState = {
  id?: string;
  code: string;
  type: VoucherType;
  value: string;
  minOrderValue: string;
  usageLimit: string;
  perUserLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const defaultFormState: VoucherFormState = {
  code: '',
  type: 'PERCENTAGE',
  value: '',
  minOrderValue: '',
  usageLimit: '',
  perUserLimit: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Không giới hạn';
  return new Date(value).toLocaleString('vi-VN');
};

const toInputDateValue = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
};

const formatVoucherValue = (voucher: Voucher) => {
  if (voucher.type === 'PERCENTAGE') {
    return `${voucher.value}%`;
  }
  return currencyFormatter.format(voucher.value);
};

const formatMinOrderValue = (voucher: Voucher) => {
  if (!voucher.minOrderValue) return 'Không yêu cầu';
  return currencyFormatter.format(voucher.minOrderValue);
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VoucherStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | VoucherType>('all');
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState<VoucherFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await voucherService.getVouchers({ limit: 100 });
      
      // Validate response structure
      if (!response || !Array.isArray(response.vouchers)) {
        console.error('Invalid response structure:', response);
        setError('Dữ liệu trả về không hợp lệ');
        setVouchers([]);
        return;
      }
      
      setVouchers(response.vouchers || []);
    } catch (err: unknown) {
      console.error('Error fetching vouchers:', err);
      
      // Handle different error types
      let errorMessage = 'Không thể tải danh sách voucher';
      
      if (err && typeof err === 'object') {
        // Check for ApiError format from backend
        if ('message' in err) {
          errorMessage = String(err.message);
          
          // If there are validation errors, append them
          if ('errors' in err && Array.isArray(err.errors) && err.errors.length > 0) {
            const validationErrors = err.errors
              .map((e: { field?: string; message?: string }) => 
                e.field ? `${e.field}: ${e.message || ''}` : e.message || ''
              )
              .filter(Boolean)
              .join(', ');
            
            if (validationErrors) {
              errorMessage += ` (${validationErrors})`;
            }
          }
        } else if (
          'response' in err &&
          err.response &&
          typeof err.response === 'object' &&
          'data' in err.response &&
          err.response.data &&
          typeof err.response.data === 'object'
        ) {
          const responseData = err.response.data;
          if ('message' in responseData) {
            errorMessage = String(responseData.message);
          }
          
          // Include validation errors if present
          if ('errors' in responseData && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
            const validationErrors = responseData.errors
              .map((e: { field?: string; message?: string }) => 
                e.field ? `${e.field}: ${e.message || ''}` : e.message || ''
              )
              .filter(Boolean)
              .join(', ');
            
            if (validationErrors) {
              errorMessage += ` (${validationErrors})`;
            }
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const matchesSearch =
        voucher.code.toLowerCase().includes(search.toLowerCase()) ||
        formatVoucherValue(voucher).toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || voucher.status === statusFilter;
      const matchesType = typeFilter === 'all' || voucher.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vouchers, search, statusFilter, typeFilter]);

  const closeModal = () => {
    setShowModal(false);
    setFormState(defaultFormState);
  };

  const openCreateModal = () => {
    setFormState(defaultFormState);
    setShowModal(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setFormState({
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value.toString(),
      minOrderValue: voucher.minOrderValue ? voucher.minOrderValue.toString() : '',
      usageLimit: voucher.usageLimit ? voucher.usageLimit.toString() : '',
      perUserLimit: voucher.perUserLimit ? voucher.perUserLimit.toString() : '',
      startDate: toInputDateValue(voucher.startDate),
      endDate: toInputDateValue(voucher.endDate),
      isActive: voucher.isActive,
    });
    setShowModal(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    const { name, value } = target;
    const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox';
    setFormState((prev) => ({
      ...prev,
      [name]: isCheckbox ? target.checked : value,
    }));
  };

  const toNullableNumber = (value: string) => (value === '' ? null : Number(value));

  const buildPayload = () => ({
    code: formState.code.trim().toUpperCase(),
    type: formState.type,
    value: Number(formState.value),
    minOrderValue: toNullableNumber(formState.minOrderValue),
    usageLimit: toNullableNumber(formState.usageLimit),
    perUserLimit: toNullableNumber(formState.perUserLimit),
    isActive: formState.isActive,
    startDate: formState.startDate ? new Date(formState.startDate).toISOString() : undefined,
    endDate: formState.endDate ? new Date(formState.endDate).toISOString() : undefined,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.code || !formState.value) {
      setError('Vui lòng nhập đầy đủ mã voucher và giá trị áp dụng');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const payload = buildPayload();

      if (formState.id) {
        await voucherService.updateVoucher(formState.id, payload);
      } else {
        await voucherService.createVoucher(payload);
      }

      closeModal();
      // Refresh the list to ensure all data is synchronized with server
      await fetchVouchers();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Không thể lưu voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (voucher: Voucher) => {
    const shouldDelete = confirm(`Xóa voucher ${voucher.code}?`);
    if (!shouldDelete) return;
    try {
      setIsSubmitting(true);
      await voucherService.deleteVoucher(voucher.id);
      setVouchers((prev) => prev.filter((item) => item.id !== voucher.id));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Không thể xóa voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      const updated = await voucherService.toggleVoucher(voucher.id, !voucher.isActive);
      setVouchers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
            <p className="text-black font-medium">Đang tải vouchers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-black">Quản lý mã giảm giá</h1>
          <p className="text-gray-600">Theo dõi và cấu hình mã giảm giá cho các chiến dịch</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
          Thêm voucher
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm voucher theo mã..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | VoucherStatus)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <option value="all">Tất cả trạng thái</option>
              {voucherStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'all' | VoucherType)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <option value="all">Loại voucher</option>
              {voucherTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Mã</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Giá trị</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Đơn tối thiểu</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Giới hạn</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Thời gian</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Không có voucher nào phù hợp
                  </td>
                </tr>
              )}
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="border-t border-gray-100">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-black">{voucher.code}</span>
                      <span className="text-xs text-gray-500">ID: {voucher.id.slice(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black">{formatVoucherValue(voucher)}</span>
                      <span className="text-xs text-gray-500">
                        {voucher.type === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-black">{formatMinOrderValue(voucher)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col text-sm text-gray-600">
                      <span>
                        Tổng:{' '}
                        {voucher.usageLimit ? `${voucher.usageCount}/${voucher.usageLimit}` : `${voucher.usageCount} / ∞`}
                      </span>
                      <span>
                        Mỗi user:{' '}
                        {voucher.perUserLimit ? `${voucher.perUserLimit} lần` : 'Không giới hạn'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Bắt đầu: {formatDateTime(voucher.startDate)}</p>
                      <p>Kết thúc: {formatDateTime(voucher.endDate)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        voucher.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : voucher.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : voucher.status === 'expired'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {voucher.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditModal(voucher)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(voucher)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100"
                      >
                        {voucher.isActive ? 'Tắt' : 'Bật'}
                      </button>
                      <button
                        onClick={() => handleDelete(voucher)}
                        disabled={isSubmitting}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-10">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-black">
                  {formState.id ? 'Cập nhật voucher' : 'Tạo voucher mới'}
                </h2>
                <p className="text-sm text-gray-500">
                  Cấu hình thông tin voucher và giới hạn sử dụng
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Mã voucher</label>
                  <input
                    name="code"
                    value={formState.code}
                    onChange={handleInputChange}
                    placeholder="VD: FLASH2025"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Loại</label>
                  <select
                    name="type"
                    value={formState.type}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    {voucherTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === 'PERCENTAGE' ? 'Phần trăm' : 'Giảm tiền'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Giá trị</label>
                  <input
                    type="number"
                    name="value"
                    value={formState.value}
                    onChange={handleInputChange}
                    placeholder={formState.type === 'PERCENTAGE' ? 'Tối đa 100%' : 'VND'}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                    min={0}
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Đơn hàng tối thiểu</label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={formState.minOrderValue}
                    onChange={handleInputChange}
                    placeholder="VND"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                    min={0}
                    step="1000"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Giới hạn tổng</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formState.usageLimit}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn nếu để trống"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Giới hạn mỗi user</label>
                  <input
                    type="number"
                    name="perUserLimit"
                    value={formState.perUserLimit}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn nếu để trống"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                    min={0}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formState.startDate}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formState.endDate}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formState.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Kích hoạt ngay khi lưu
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
                >
                  {formState.id ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

