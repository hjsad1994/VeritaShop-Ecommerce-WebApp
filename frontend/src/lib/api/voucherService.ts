import apiClient from './apiClient';
import {
  ApiResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  Voucher,
  VoucherListResponse,
  VoucherQueryParams,
} from './types';

class VoucherService {
  private basePath = '/admin/vouchers';

  async getVouchers(params: VoucherQueryParams = {}): Promise<VoucherListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const url = query.toString() ? `${this.basePath}?${query}` : this.basePath;
    const response = await apiClient.get<ApiResponse<VoucherListResponse>>(url);
    return response.data.data;
  }

  async getVoucher(id: string): Promise<Voucher> {
    const response = await apiClient.get<ApiResponse<Voucher>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  async createVoucher(payload: CreateVoucherRequest): Promise<Voucher> {
    const response = await apiClient.post<ApiResponse<Voucher>>(this.basePath, payload);
    return response.data.data;
  }

  async updateVoucher(id: string, payload: UpdateVoucherRequest): Promise<Voucher> {
    const response = await apiClient.put<ApiResponse<Voucher>>(`${this.basePath}/${id}`, payload);
    return response.data.data;
  }

  async toggleVoucher(id: string, isActive: boolean): Promise<Voucher> {
    const response = await apiClient.patch<ApiResponse<Voucher>>(`${this.basePath}/${id}/toggle`, { isActive });
    return response.data.data;
  }

  async deleteVoucher(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}

const voucherService = new VoucherService();
export default voucherService;

