'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import productService from '@/lib/api/productService';
import brandService from '@/lib/api/brandService';
import categoryService from '@/lib/api/categoryService';
import ImageUpload, { ImageUploadRef } from '@/components/admin/ImageUpload';
import { generateSlug } from '@/lib/utils/slug';
import {
  Product,
  Brand,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
  ProductImageData
} from '@/lib/api/types';

type ProductFormValues = {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  basePrice: string;
  discount: string;
  isFeatured: boolean;
  isActive: boolean;
};

export default function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from API
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form data
  const [formData, setFormData] = useState<ProductFormValues>({
    name: '',
    description: '',
    brandId: '',
    categoryId: '',
    basePrice: '',
    discount: '0',
    isFeatured: false,
    isActive: true
  });

  // Image upload state
  const [productImages, setProductImages] = useState<ProductImageData[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [existingProductImages, setExistingProductImages] = useState<Array<{
    id: string;
    url: string;
    altText?: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>>([]);
  const imageUploadRef = useRef<ImageUploadRef | null>(null);

  const getErrorMessage = (err: unknown, fallback = 'An unexpected error occurred'): string => {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'string') {
      return err;
    }
    return fallback;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        brandService.getBrands({ isActive: true, limit: 100 }),
        categoryService.getCategories({ isActive: true, limit: 100 })
      ]);

      setProducts(productsRes.products);
      setBrands(brandsRes.brands);
      setCategories(categoriesRes.categories);
    } catch (err: unknown) {
      console.error('Error loading data:', err);
      setError(getErrorMessage(err, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || product.category?.id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      brandId: brands.length > 0 ? brands[0].id : '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      basePrice: '',
      discount: '0',
      isFeatured: false,
      isActive: true
    });
    setProductImages([]);
    setImagesToDelete([]);
    setExistingProductImages([]);
    setShowModal(true);
  };

  const handleImagesChange = (images: ProductImageData[]) => {
    setProductImages(images);
  };

  const handleRemoveImage = (imageId: string) => {
    // Add to deletion list
    setImagesToDelete((prev) => {
      if (!prev.includes(imageId)) {
        return [...prev, imageId];
      }
      return prev;
    });
    
    // Remove from existing images to update UI immediately
    setExistingProductImages((prev) => prev.filter(img => img.id !== imageId));
  };

  const handleEdit = async (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      brandId: product.brand?.id || product.brandId || '', // Hiển thị thương hiệu hiện tại
      categoryId: product.category?.id || product.categoryId || '', // Hiển thị danh mục hiện tại
      basePrice: (parseFloat(product.basePrice) / 1000000).toString(), // Convert from VND to millions for display
      discount: product.discount.toString(),
      isFeatured: product.isFeatured,
      isActive: product.isActive
    });
    
    // Reset new uploads and deletions
    setProductImages([]);
    setImagesToDelete([]);
    setExistingProductImages([]);
    
    // Fetch product detail to get images
    try {
      const productDetail = await productService.getProductById(product.id);
      if (productDetail.images && productDetail.images.length > 0) {
        // Map images to the format expected by ImageUpload component
        const mappedImages = productDetail.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          altText: img.altText || null,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder || 0
        }));
        setExistingProductImages(mappedImages);
      }
    } catch (error) {
      console.error('Failed to load product images:', error);
      // If fetch fails, try to use images from product if available
      if (product.images && product.images.length > 0) {
        const mappedImages = product.images.map(img => ({
          id: img.id,
          url: img.url,
          altText: img.altText || null,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder || 0
        }));
        setExistingProductImages(mappedImages);
      }
    }
    
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setSubmitting(true);
      await productService.deleteProduct(productId);

      // Remove from local state
      setProducts(products.filter(p => p.id !== productId));

      alert('Product deleted successfully!');
    } catch (err: unknown) {
      console.error('Error deleting product:', err);
      alert(getErrorMessage(err, 'Failed to delete product'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.basePrice) {
      alert('Vui lòng điền tên sản phẩm và giá');
      return;
    }

    // For new products, brand and category are required
    if (modalMode === 'add' && (!formData.brandId || !formData.categoryId)) {
      alert('Vui lòng chọn thương hiệu và danh mục cho sản phẩm mới');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const basePriceVnd = parseFloat(formData.basePrice) * 1000000; // Convert from millions to VND
      const discountValue = parseFloat(formData.discount) || 0;

      if (modalMode === 'add') {
        // Generate slug for image upload
        const productSlug = formData.name ? generateSlug(formData.name) : '';
        
        // Upload images to S3 first (if any selected files)
        let uploadedImages: ProductImageData[] = [];
        if (imageUploadRef.current) {
          try {
            uploadedImages = await imageUploadRef.current.uploadFiles(productSlug);
          } catch (uploadError: any) {
            console.error('Image upload error:', uploadError);
            alert(`Failed to upload images: ${uploadError.message || 'Unknown error'}`);
            return; // Stop product creation if image upload fails
          }
        }

        const newProductPayload: CreateProductRequest = {
          name: formData.name,
          brandId: formData.brandId,
          categoryId: formData.categoryId,
          basePrice: basePriceVnd,
          discount: discountValue,
          isFeatured: formData.isFeatured,
          isActive: formData.isActive
        };

        if (formData.description) {
          newProductPayload.description = formData.description;
        }

        // Add uploaded images
        if (uploadedImages.length > 0) {
          newProductPayload.images = uploadedImages;
        }

        const newProduct = await productService.createProduct(newProductPayload);
        setProducts([...products, newProduct]);
        // Clear uploaded images after successful creation
        setProductImages([]);
        alert('Product created successfully!');
      } else if (selectedProduct) {
        const productData: UpdateProductRequest = {
          name: formData.name,
          basePrice: basePriceVnd,
          discount: discountValue,
          isFeatured: formData.isFeatured,
          isActive: formData.isActive
        };

        if (formData.description) {
          productData.description = formData.description;
        }
        if (formData.brandId) {
          productData.brandId = formData.brandId;
        }
        if (formData.categoryId) {
          productData.categoryId = formData.categoryId;
        }

        // Add images if uploaded
        if (productImages.length > 0) {
          productData.images = productImages;
        }

        // Add images to delete
        if (imagesToDelete.length > 0) {
          productData.imageIdsToDelete = imagesToDelete;
        }

        const updatedProduct = await productService.updateProduct(selectedProduct.id, productData);
        setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
        alert('Product updated successfully!');
      }

      setShowModal(false);
    } catch (err: unknown) {
      console.error('Error saving product:', err);
      const errorMsg = getErrorMessage(err, 'Failed to save product');
      setError(errorMsg);
      
      // If product creation failed, show specific message about slug conflict
      if (errorMsg.includes('slug') || errorMsg.includes('already exists')) {
        alert(`Error: ${errorMsg}\n\nTip: Try using a different product name, or edit the existing product instead.`);
      } else {
        alert(`Error: ${errorMsg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof ProductFormValues;
    const nextValue = (type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : value) as ProductFormValues[typeof fieldName];

    setFormData(prev => ({
      ...prev,
      [fieldName]: nextValue
    }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-black">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-black mb-2">Product Management</h2>
          <p className="text-sm text-black">Manage your product catalog ({products.length} products)</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Product</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Brand</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Category</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Price</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {(() => {
                          // Try to get image from multiple sources:
                          // 1. primaryImage field (string URL)
                          // 2. images array (primary or first)
                          const imageUrl = 
                            product.primaryImage || 
                            product.images?.find(img => img.isPrimary)?.url || 
                            product.images?.[0]?.url;
                          
                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Hide image and show placeholder on error
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : null;
                        })()}
                        {/* Placeholder icon - shown when no image or image fails to load */}
                        {!product.primaryImage && 
                         (!product.images || product.images.length === 0 || 
                          !product.images.find(img => img.isPrimary)?.url && !product.images[0]?.url) && (
                          <svg className="w-8 h-8 text-gray-400 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-black">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {product.brand?.name || 'Unknown Brand'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {product.category?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-black">
                      ${product.finalPrice ? parseInt(product.finalPrice).toLocaleString() : 'N/A'}
                    </p>
                    {product.discount > 0 && product.basePrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ${parseInt(product.basePrice).toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {product.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={submitting}
                        className="p-2 text-black hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-gray-300 disabled:opacity-50"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black">No products found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., iPhone 15 Pro Max"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Enter product description..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-black placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Brand</label>
                    <select
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                    >
                      {modalMode === 'add' && (
                        <option value="">-- Chọn thương hiệu --</option>
                      )}
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Category</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                    >
                      {modalMode === 'add' && (
                        <option value="">-- Chọn danh mục --</option>
                      )}
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Base Price ($) *</label>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-semibold text-black">Featured Product</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-semibold text-black">Active</span>
                  </label>
                </div>

                {/* Image Upload */}
                <ImageUpload
                  ref={imageUploadRef}
                  productSlug={formData.name ? generateSlug(formData.name) : ''}
                  productName={formData.name}
                  maxImages={4}
                  existingImages={existingProductImages}
                  onImagesChange={handleImagesChange}
                  onRemoveImage={handleRemoveImage}
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (modalMode === 'add' ? 'Add Product' : 'Save Changes')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}