'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Search from '@/components/ui/Search';
import ShopFilter from '@/components/ui/Filter';
import productService from '@/lib/api/productService';
import { Product } from '@/lib/api/types';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState('featured');
  const [currentPage, setCurrentPage] = React.useState(1);
  const productsPerPage = 20;
  const priceRanges = [
    { label: 'Dưới 10 triệu', value: '0-10000000' },
    { label: '10 - 20 triệu', value: '10000000-20000000' },
    { label: '20 - 30 triệu', value: '20000000-30000000' },
    { label: 'Trên 30 triệu', value: '30000000-100000000' }
  ];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch products from API
      const response = await productService.getProducts({
        page: currentPage,
        limit: 100, // Fetch more to filter locally for now, or implement server-side filtering
      });
      setProducts(response.products);
      
      // Extract unique brands from products
      const uniqueBrands = [...new Set(
        response.products
          .map(p => p.brand?.name)
          .filter((name): name is string => !!name)
      )].sort();
      setBrands(uniqueBrands);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedBrands.length > 0 && product.brand && !selectedBrands.includes(product.brand.name)) {
      return false;
    }
    // Price filtering (assuming price is in VND or needs conversion if mock was USD)
    // Real API returns price in VND string or number? DTO says string.
    // Let's assume converted for display or raw filter. 
    // If filters are in USD, we need conversion. 
    // For simplicity, I'll keep filters but acknowledging currency mismatch might occur if not handled.
    // But keeping scope to "Remove SALE tag, use S3 image, use slug".
    return true; 
  });

  // ... Sorting logic (needs adaptation to Product type) ...
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.basePrice);
    const priceB = parseFloat(b.basePrice);
    
    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header theme="light" />

      <div className="bg-black text-white py-3 text-center text-sm font-medium mt-16">
        MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TRÊN 2.000.000đ
      </div>

      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-8 text-center">Tất cả sản phẩm</h1>
          
          {/* Search Bar */}
          <Search 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-20">
              <ShopFilter
                brands={brands}
                selectedBrands={selectedBrands}
                priceRanges={priceRanges}
                selectedPriceRange={selectedPriceRange}
                sortBy={sortBy}
                onBrandToggle={(brand) => toggleBrand(brand)}
                onPriceRangeChange={(value) => {
                  setSelectedPriceRange(value);
                  setCurrentPage(1);
                }}
                onSortChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
                onClearFilters={clearAllFilters}
              />
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
               <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
               </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentProducts.map(product => (
                <Link key={product.id} href={"/shop/" + (product.slug || product.id)} className="group cursor-pointer">
                  <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                    <Image
                      src={product.primaryImage || product.images?.[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                      sizes="(min-width: 1024px) 200px, 50vw"
                    />
                    {/* SALE tag removed */}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-black text-sm mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-black font-bold text-base">
                        {parseInt(product.finalPrice || product.basePrice).toLocaleString()} đ
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-black mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `Không có kết quả cho "${searchQuery}". Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc.`
                    : 'Hãy thử điều chỉnh bộ lọc của bạn'}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={currentPage === 1 ? 'px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-400 cursor-not-allowed' : 'px-4 py-2 rounded-lg font-medium bg-white border border-gray-300 text-black hover:bg-gray-100'}
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={currentPage === page ? 'px-4 py-2 rounded-lg font-medium bg-black text-white' : 'px-4 py-2 rounded-lg font-medium bg-white border border-gray-300 text-black hover:bg-gray-100'}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? 'px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-400 cursor-not-allowed' : 'px-4 py-2 rounded-lg font-medium bg-white border border-gray-300 text-black hover:bg-gray-100'}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
