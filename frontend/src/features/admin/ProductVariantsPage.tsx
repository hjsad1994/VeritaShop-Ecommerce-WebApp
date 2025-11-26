'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ImageUpload, { ImageUploadRef } from '@/components/admin/ImageUpload';
import productService from '@/lib/api/productService';
import variantService from '@/lib/api/variantService';
import { SentimentAnalysisTable } from './components/SentimentAnalysisTable';
import type {
  ProductDetail,
  ProductImageData,
  ProductVariantItem,
  VariantInventory,
} from '@/lib/api/types';

type VariantFormMode = 'create' | 'edit';

interface VariantFormState {
  color: string;
  storage: string;
  ram: string;
  price: string;
  comparePrice: string;
  sku: string;
  isActive: boolean;
  quantity: string;
  minStock: string;
  maxStock: string;
}

const numberFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

interface ProductVariantsPageProps {
  productId: string;
}

export default function ProductVariantsPage({ productId }: ProductVariantsPageProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<ProductVariantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<VariantFormMode>('create');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantItem | null>(null);
  const [isSentimentOpen, setIsSentimentOpen] = useState(false);
  const [sentimentVariant, setSentimentVariant] = useState<ProductVariantItem | null>(null);

  const [formState, setFormState] = useState<VariantFormState>({
    color: '',
    storage: '',
    ram: '',
    price: '',
    comparePrice: '',
    sku: '',
    isActive: true,
    quantity: '',
    minStock: '',
    maxStock: '',
  });
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<ProductImageData[]>([]);

  const imageUploadRef = useRef<ImageUploadRef | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [productDetail, variantList] = await Promise.all([
        productService.getProductById(productId),
        variantService.list(productId),
      ]);
      setProduct(productDetail);
      setVariants(variantList);
      setFilteredVariants(variantList);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu biến thể');
      toast.error('Không thể tải dữ liệu biến thể');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let data = variants;
    if (search) {
      const value = search.toLowerCase();
      data = data.filter(
        (variant) =>
          variant.color.toLowerCase().includes(value) ||
          variant.storage?.toLowerCase().includes(value) ||
          variant.ram?.toLowerCase().includes(value) ||
          variant.sku.toLowerCase().includes(value)
      );
    }

    if (statusFilter !== 'all') {
      const shouldBeActive = statusFilter === 'active';
      data = data.filter((variant) => variant.isActive === shouldBeActive);
    }

    setFilteredVariants(data);
  }, [search, statusFilter, variants]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedVariant(null);
    setFormState({
      color: '',
      storage: '',
      ram: '',
      price: '',
      comparePrice: '',
      sku: '',
      isActive: true,
      quantity: '',
      minStock: '',
      maxStock: '',
    });
    setImagesToDelete([]);
    setUploadedImages([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (variant: ProductVariantItem) => {
    setFormMode('edit');
    setSelectedVariant(variant);
    setFormState({
      color: variant.color,
      storage: variant.storage || '',
      ram: variant.ram || '',
      price: variant.price,
      comparePrice: variant.comparePrice || '',
      sku: variant.sku,
      isActive: variant.isActive,
      quantity: variant.inventory ? String(variant.inventory.quantity) : '',
      minStock: variant.inventory ? String(variant.inventory.minStock) : '',
      maxStock: variant.inventory ? String(variant.inventory.maxStock) : '',
    });
    setImagesToDelete([]);
    setUploadedImages([]);
    setIsFormOpen(true);
  };

  const resetFormState = () => {
    setIsFormOpen(false);
    setSelectedVariant(null);
    setImagesToDelete([]);
    setUploadedImages([]);
  };

  const handleOpenSentiment = (variant: ProductVariantItem) => {
    setSentimentVariant(variant);
    setIsSentimentOpen(true);
  };

  const closeSentiment = () => {
    setIsSentimentOpen(false);
    setSentimentVariant(null);
  };

  const handleFormChange = (field: keyof VariantFormState, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildPayload = async (): Promise<Record<string, unknown>> => {
    const uploadResults = imageUploadRef.current
      ? await imageUploadRef.current.uploadFiles(product?.slug, formState.sku)
      : [];

    const imagesPayload = uploadResults.length ? uploadResults : uploadedImages;

    const inventoryPayload =
      formState.quantity || formState.minStock || formState.maxStock
        ? {
            quantity: formState.quantity ? Number(formState.quantity) : undefined,
            minStock: formState.minStock ? Number(formState.minStock) : undefined,
            maxStock: formState.maxStock ? Number(formState.maxStock) : undefined,
          }
        : undefined;

    return {
      color: formState.color,
      storage: formState.storage || undefined,
      ram: formState.ram || undefined,
      price: Number(formState.price),
      comparePrice: formState.comparePrice ? Number(formState.comparePrice) : undefined,
      sku: formState.sku.toUpperCase(),
      isActive: formState.isActive,
      images: imagesPayload,
      inventory: inventoryPayload,
      imageIdsToDelete: imagesToDelete.length ? imagesToDelete : undefined,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!product) return;

    try {
      toast.dismiss();
      if (!formState.color || !formState.price || !formState.sku) {
        toast.error('Vui lòng nhập đầy đủ màu sắc, giá và SKU');
        return;
      }

      const payload = await buildPayload();

      if (formMode === 'create') {
        await variantService.create(productId, payload);
        toast.success('Tạo biến thể thành công');
      } else if (selectedVariant) {
        await variantService.update(productId, selectedVariant.id, payload);
        toast.success('Cập nhật biến thể thành công');
      }

      resetFormState();
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Không thể lưu biến thể');
    }
  };

  const handleDelete = async (variant: ProductVariantItem) => {
    if (!confirm(`Xóa biến thể ${variant.sku}?`)) {
      return;
    }
    try {
      await variantService.delete(productId, variant.id);
      toast.success('Đã xóa biến thể');
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Không thể xóa biến thể');
    }
  };

  const handleToggleStatus = async (variant: ProductVariantItem) => {
    try {
      await variantService.update(productId, variant.id, {
        isActive: !variant.isActive,
      });
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const renderInventoryBadge = (inventory?: VariantInventory | null) => {
    if (!inventory) return 'N/A';
    if (inventory.available <= 0) {
      return <span className="text-red-600 font-semibold">Hết hàng</span>;
    }
    if (inventory.lowStock) {
      return <span className="text-orange-600 font-semibold">Sắp hết ({inventory.available})</span>;
    }
    return `${inventory.available}`;
  };

  const currentExistingImages = selectedVariant?.images?.map((img) => ({
    id: img.id,
    url: img.url,
    altText: img.altText,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  }));

  const variantCount = variants.length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-black font-medium">Đang tải biến thể...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            <Link href="/admin/products" className="text-black underline">
              Quản lý sản phẩm
            </Link>{' '}
            / {product?.name || 'Sản phẩm'}
          </p>
          <h1 className="text-3xl font-bold text-black mb-1">Biến thể sản phẩm</h1>
          <p className="text-gray-600">
            {variantCount} biến thể • SKU đầu tiên: {variants[0]?.sku || 'N/A'}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          + Thêm biến thể
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Tìm theo màu, SKU, dung lượng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Tạm ẩn</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Biến thể</th>
              <th className="px-6 py-3">Giá bán</th>
              <th className="px-6 py-3">Tồn kho</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredVariants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy biến thể nào phù hợp.
                </td>
              </tr>
            )}
            {filteredVariants.map((variant) => (
              <tr key={variant.id} className="border-t border-gray-100">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-black">
                        {variant.color} {variant.storage ? `• ${variant.storage}` : ''}
                        {variant.ram ? ` • ${variant.ram}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-black">{numberFormatter.format(Number(variant.price))}</p>
                  {variant.comparePrice && (
                    <p className="text-xs text-gray-500 line-through">
                      {numberFormatter.format(Number(variant.comparePrice))}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">{renderInventoryBadge(variant.inventory)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      variant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {variant.isActive ? 'Đang bán' : 'Tạm ẩn'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleOpenSentiment(variant)}
                      className="text-sm text-blue-600 underline"
                    >
                      Sentiment
                    </button>
                    <button
                      onClick={() => handleToggleStatus(variant)}
                      className="text-sm text-gray-600 hover:text-black underline"
                    >
                      {variant.isActive ? 'Ẩn' : 'Mở bán'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(variant)}
                      className="text-sm text-black underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(variant)}
                      className="text-sm text-red-600 underline"
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

      {isFormOpen && product && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">
                  {formMode === 'create' ? 'Thêm biến thể' : `Chỉnh sửa biến thể ${selectedVariant?.sku}`}
                </h2>
                <p className="text-sm text-gray-500">Sản phẩm: {product.name}</p>
              </div>
              <button
                onClick={resetFormState}
                className="text-gray-500 hover:text-black transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Màu sắc *</label>
                  <input
                    type="text"
                    value={formState.color}
                    onChange={(e) => handleFormChange('color', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Dung lượng lưu trữ</label>
                  <input
                    type="text"
                    value={formState.storage}
                    onChange={(e) => handleFormChange('storage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">RAM</label>
                  <input
                    type="text"
                    value={formState.ram}
                    onChange={(e) => handleFormChange('ram', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Giá bán (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Giá gốc</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.comparePrice}
                    onChange={(e) => handleFormChange('comparePrice', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">SKU *</label>
                  <input
                    type="text"
                    value={formState.sku}
                    onChange={(e) => handleFormChange('sku', e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black uppercase text-black placeholder:text-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="variant-active"
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="variant-active" className="text-sm text-gray-700">
                    Cho phép bán
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">Tồn kho</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Số lượng</label>
                    <input
                      type="number"
                      min="0"
                      value={formState.quantity}
                      onChange={(e) => handleFormChange('quantity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Cảnh báo tối thiểu</label>
                    <input
                      type="number"
                      min="0"
                      value={formState.minStock}
                      onChange={(e) => handleFormChange('minStock', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Giới hạn tối đa</label>
                    <input
                      type="number"
                      min="0"
                      value={formState.maxStock}
                      onChange={(e) => handleFormChange('maxStock', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">Hình ảnh</h3>
                <ImageUpload
                  ref={imageUploadRef}
                  productSlug={product.slug}
                  productName={product.name}
                  existingImages={currentExistingImages}
                  maxImages={5}
                  onRemoveImage={(imageId) =>
                    setImagesToDelete((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]))
                  }
                  onImagesChange={(images) => setUploadedImages(images)}
                />
                {imagesToDelete.length > 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    {imagesToDelete.length} ảnh sẽ được xóa khi lưu.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={resetFormState}
                  className="px-4 py-2 text-gray-600 hover:text-black transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  {formMode === 'create' ? 'Tạo biến thể' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSentimentOpen && sentimentVariant && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeSentiment}
              className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
            >
              ✕
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-black mb-4">
                Sentiment Analysis - {sentimentVariant.sku}
              </h2>
              <SentimentAnalysisTable productId={productId} variantId={sentimentVariant.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

