'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Search from '@/components/ui/Search';
import ShopFilter from '@/components/ui/Filter';
import { products } from '@/lib/data/products';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState('featured');
  const [currentPage, setCurrentPage] = React.useState(1);
  const productsPerPage = 20;

  const brands = ['Apple', 'Samsung', 'ASUS', 'Xiaomi', 'OnePlus', 'Black Shark', 'RedMagic'];
  const priceRanges = [
    { label: 'Under $500', value: '0-500' },
    { label: '$500 - $800', value: '500-800' },
    { label: '$800 - $1000', value: '800-1000' },
    { label: 'Over $1000', value: '1000-10000' }
  ];

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
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      if (product.price < min || product.price > max) {
        return false;
      }
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        return 0;
    }
  });

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
        FREE SHIPPING ON ORDERS OVER $100
      </div>

      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-8 text-center">All Products</h1>
          
          {/* Search Bar */}
          <Search 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products..."
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentProducts.map(product => (
                <Link key={product.id} href={"/shop/" + product.id} className="group cursor-pointer">
                  <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                      sizes="(min-width: 1024px) 200px, 50vw"
                    />
                    {product.oldPrice && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                        SALE
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-black text-sm mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      {product.oldPrice && (
                        <span className="text-gray-400 line-through text-xs">${product.oldPrice}</span>
                      )}
                      <span className="text-black font-bold text-base">${product.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-black mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                    : 'Try adjusting your filters'}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
                >
                  Clear All Filters
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
                  Prev
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
                  Next
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
