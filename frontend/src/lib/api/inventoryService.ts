import apiClient from './apiClient';
import type {
  ApiResponse,
  CreateInventoryPayload,
  InventoryCatalogQueryParams,
  InventoryCatalogProduct,
  InventoryCatalogResult,
  InventoryListResponse,
  InventoryQueryParams,
  InventoryRecord,
  InventoryStats,
  PaginationMeta,
  StockAdjustmentPayload,
  StockMovement,
  StockMovementListResponse,
  StockMovementQueryParams,
  StockMutationPayload,
  QuickQuantityUpdatePayload,
  UpdateThresholdPayload,
} from './types';

class InventoryService {
  private basePath = '/inventory';

  private buildQuery(params: Record<string, string | number | boolean | undefined>) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      searchParams.append(key, String(value));
    });
    return searchParams.toString();
  }

  async getInventory(params: InventoryQueryParams = {}): Promise<InventoryListResponse> {
    const queryString = this.buildQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      brandId: params.brandId,
      productId: params.productId,
      minAvailable: params.minAvailable,
      maxAvailable: params.maxAvailable,
      lowStock: params.lowStock,
      includeArchived: params.includeArchived,
      status: params.status,
      sort: params.sort,
    });

    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    const response = await apiClient.get<ApiResponse<InventoryListResponse>>(url);
    return response.data.data;
  }

  async getCatalog(params: InventoryCatalogQueryParams = {}): Promise<InventoryCatalogResult> {
    const queryString = this.buildQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      brandId: params.brandId,
      includeArchived: params.includeArchived,
    });

    const url = queryString ? `${this.basePath}/catalog?${queryString}` : `${this.basePath}/catalog`;
    const response = await apiClient.get<
      ApiResponse<InventoryCatalogProduct[]>
    >(url);

    const payload = response.data;
    const pagination =
      (payload as unknown as { pagination?: PaginationMeta }).pagination ??
      {
        page: params.page ?? 1,
        limit: params.limit ?? payload.data.length ?? 0,
        total: payload.data.length ?? 0,
        totalPages: 1,
      };

    return {
      catalog: payload.data,
      pagination,
    };
  }

  async getInventoryStats(): Promise<InventoryStats> {
    const response = await apiClient.get<ApiResponse<InventoryStats>>(`${this.basePath}/stats`);
    return response.data.data;
  }

  async getStockMovements(
    productId: string,
    params: StockMovementQueryParams = {}
  ): Promise<StockMovementListResponse> {
    const queryString = this.buildQuery({
      page: params.page,
      limit: params.limit,
      type: params.type,
      userId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
    });

    const url = queryString
      ? `${this.basePath}/movements/${productId}?${queryString}`
      : `${this.basePath}/movements/${productId}`;
    const response = await apiClient.get<ApiResponse<StockMovementListResponse>>(url);
    return response.data.data;
  }

  async createInventory(payload: CreateInventoryPayload): Promise<{
    inventory: InventoryRecord;
    movement: StockMovement | null;
  }> {
    const response = await apiClient.post<ApiResponse<{
      inventory: InventoryRecord;
      movement: StockMovement | null;
    }>>(this.basePath, payload);
    return response.data.data;
  }

  async stockIn(payload: StockMutationPayload): Promise<{
    inventory: InventoryRecord;
    movement: StockMovement;
  }> {
    const response = await apiClient.post<ApiResponse<{
      inventory: InventoryRecord;
      movement: StockMovement;
    }>>(`${this.basePath}/stock-in`, payload);
    return response.data.data;
  }

  async stockOut(payload: StockMutationPayload): Promise<{
    inventory: InventoryRecord;
    movement: StockMovement;
  }> {
    const response = await apiClient.post<ApiResponse<{
      inventory: InventoryRecord;
      movement: StockMovement;
    }>>(`${this.basePath}/stock-out`, payload);
    return response.data.data;
  }

  async adjustStock(payload: StockAdjustmentPayload): Promise<{
    inventory: InventoryRecord;
    movement: StockMovement | null;
    message?: string;
  }> {
    const response = await apiClient.post<ApiResponse<{
      inventory: InventoryRecord;
      movement: StockMovement | null;
      message?: string;
    }>>(`${this.basePath}/adjustment`, payload);
    return response.data.data;
  }

  async quickUpdateQuantity(
    productId: string,
    payload: QuickQuantityUpdatePayload
  ): Promise<{
    inventory: InventoryRecord;
    movement: StockMovement | null;
  }> {
    const response = await apiClient.put<
      ApiResponse<{
        inventory: InventoryRecord;
        movement: StockMovement | null;
      }>
    >(`${this.basePath}/${productId}/quantity`, payload);
    return response.data.data;
  }

  async updateThresholds(
    productId: string,
    payload: UpdateThresholdPayload
  ): Promise<InventoryRecord> {
    const response = await apiClient.put<ApiResponse<InventoryRecord>>(
      `${this.basePath}/${productId}/thresholds`,
      payload
    );
    return response.data.data;
  }

  async archiveInventory(productId: string): Promise<InventoryRecord> {
    const response = await apiClient.delete<ApiResponse<InventoryRecord>>(
      `${this.basePath}/${productId}`
    );
    return response.data.data;
  }

  async checkAvailability(productId: string): Promise<{
    productId: string;
    available: number;
    inStock: boolean;
    isLowStock: boolean;
    quantity?: number;
    reserved?: number;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        productId: string;
        available: number;
        inStock: boolean;
        isLowStock: boolean;
        quantity?: number;
        reserved?: number;
      }>
    >(
      `${this.basePath}/check/${productId}`
    );
    return response.data.data;
  }

  async getLowStockItems(limit: number = 20): Promise<InventoryRecord[]> {
    const response = await apiClient.get<ApiResponse<InventoryRecord[]>>(
      `${this.basePath}/low-stock?limit=${limit}`
    );
    return response.data.data;
  }
}

const inventoryService = new InventoryService();
export default inventoryService;
