'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { brandService } from '@/lib/api';
import type { Brand, PaginationMeta } from '@/lib/api';

const PAGE_SIZE = 12;
const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: string }).message;
    if (message) return message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return fallback;
};

export default function BrandsPage() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await brandService.getBrands({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setBrands(data.brands);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load brands.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedBrand(null);
    setShowModal(true);
  };

  const handleEdit = (brand: Brand) => {
    setModalMode('edit');
    setSelectedBrand(brand);
    setShowModal(true);
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    setDeletingId(brandId);
    setError(null);
    try {
      await brandService.deleteBrand(brandId);
      await fetchBrands();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete brand.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      name: (formData.get('name') as string) ?? '',
      description: (formData.get('description') as string) || undefined,
      logo: (formData.get('logo') as string) || undefined,
      isActive: formData.get('isActive') === 'on',
    };

    setIsSubmitting(true);
    setError(null);
    try {
      if (modalMode === 'add') {
        await brandService.createBrand(payload);
      } else if (selectedBrand) {
        await brandService.updateBrand(selectedBrand.id, payload);
      }
      await fetchBrands();
      setShowModal(false);
      setSelectedBrand(null);
      setModalMode('add');
      formElement.reset();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save brand.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalProducts = useMemo(
    () => brands.reduce((sum, brand) => sum + (brand.productCount ?? 0), 0),
    [brands]
  );

  const formattedBrands = brands.map((brand) => ({
    ...brand,
    createdDate: new Date(brand.createdAt).toLocaleDateString(),
  }));

  const totalPages = pagination?.totalPages ?? 1;

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) return;
    if (pagination && nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-black mb-2">Brand Management</h2>
          <p className="text-sm text-black">Manage product brands and manufacturers</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black mb-1">Total Brands</p>
              <p className="text-3xl font-bold text-black">{pagination?.total ?? brands.length}</p>
            </div>
            <div className="p-3 bg-black rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black mb-1">Total Products</p>
              <p className="text-3xl font-bold text-black">{totalProducts}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {isLoading && brands.length === 0 ? (
          <div className="p-12 text-center text-black">Loading brands...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {formattedBrands.map((brand) => (
              <div key={brand.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {brand.logo ? (
                      <img 
                        src={brand.logo} 
                        alt={brand.name}
                        className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={brand.logo ? 'hidden' : 'w-12 h-12 bg-black rounded-lg flex items-center justify-center'}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-lg">{brand.name}</h3>
                      <p className="text-xs text-black">/{brand.slug}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-black mb-4 line-clamp-2">{brand.description || 'No description'}</p>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">{brand.productCount ?? 0}</p>
                    <p className="text-xs text-black">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-black">{brand.createdDate}</p>
                    <p className="text-xs text-black">Created</p>
                  </div>
                  <div className="text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    disabled={deletingId === brand.id}
                    className={`px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors font-medium text-sm ${
                      deletingId === brand.id ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && brands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black">No brands found</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 pb-6 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg font-medium ${
                page === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-black hover:bg-gray-100'
              }`}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={
                  page === pageNumber
                    ? 'px-4 py-2 rounded-lg font-medium bg-black text-white'
                    : 'px-4 py-2 rounded-lg font-medium bg-white border border-gray-300 text-black hover:bg-gray-100'
                }
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg font-medium ${
                page === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-black hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">
                {modalMode === 'add' ? 'Add New Brand' : 'Edit Brand'}
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

            <form onSubmit={handleSubmit} className="space-y-4" key={selectedBrand?.id ?? 'new'}>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Brand Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedBrand?.name ?? ''}
                  required
                  placeholder="e.g., Apple, Samsung, Sony"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black mt-1">Slug will be auto-generated</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedBrand?.description ?? ''}
                  rows={3}
                  placeholder="Brief description of this brand"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Logo URL</label>
                <input
                  type="url"
                  name="logo"
                  defaultValue={selectedBrand?.logo ?? ''}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked={selectedBrand?.isActive ?? true}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-black">
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Add Brand' : 'Save Changes'}
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
