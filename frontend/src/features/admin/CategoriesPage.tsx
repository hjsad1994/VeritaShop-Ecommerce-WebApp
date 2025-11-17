'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { categoryService } from '@/lib/api';
import type { Category, PaginationMeta } from '@/lib/api';

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

export default function CategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setCategories(data.categories);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load categories.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setDeletingId(categoryId);
    setError(null);
    try {
      await categoryService.deleteCategory(categoryId);
      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete category.'));
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
      image: (formData.get('image') as string) || undefined,
      parentId: (formData.get('parentId') as string) || undefined,
    };

    setIsSubmitting(true);
    setError(null);
    try {
      if (modalMode === 'add') {
        await categoryService.createCategory(payload);
      } else if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory.id, payload);
      }
      await fetchCategories();
      setShowModal(false);
      setSelectedCategory(null);
      setModalMode('add');
      formElement.reset();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save category.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalProducts = useMemo(
    () => categories.reduce((sum, cat) => sum + (cat.productCount ?? 0), 0),
    [categories]
  );

  const formattedCategories = categories.map((category) => ({
    ...category,
    createdDate: new Date(category.createdAt).toLocaleDateString(),
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
          <h2 className="text-3xl font-bold text-black mb-2">Category Management</h2>
          <p className="text-sm text-black">Organize your product categories</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black mb-1">Total Categories</p>
              <p className="text-3xl font-bold text-black">{pagination?.total ?? categories.length}</p>
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
              placeholder="Search categories..."
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

        {isLoading && categories.length === 0 ? (
          <div className="p-12 text-center text-black">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {formattedCategories.map((category) => (
              <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-lg">{category.name}</h3>
                      <p className="text-xs text-black">/{category.slug}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-black mb-4 line-clamp-2">{category.description || 'No description'}</p>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">{category.productCount ?? 0}</p>
                    <p className="text-xs text-black">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-black">{category.createdDate}</p>
                    <p className="text-xs text-black">Created</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className={`px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors font-medium text-sm ${
                      deletingId === category.id ? 'opacity-60 cursor-not-allowed' : ''
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

        {!isLoading && categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black">No categories found</p>
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
                {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
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

            <form onSubmit={handleSubmit} className="space-y-4" key={selectedCategory?.id ?? 'new'}>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Category Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedCategory?.name ?? ''}
                  required
                  placeholder="e.g., iPhone, Samsung"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black mt-1">Slug will be auto-generated</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedCategory?.description ?? ''}
                  required
                  rows={3}
                  placeholder="Brief description of this category"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  defaultValue={selectedCategory?.image ?? ''}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Parent Category ID</label>
                <input
                  type="text"
                  name="parentId"
                  defaultValue={selectedCategory?.parentId ?? ''}
                  placeholder="Optional parent category ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Add Category' : 'Save Changes'}
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
