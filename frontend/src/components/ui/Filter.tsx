'use client';

import React from 'react';

interface ShopFilterProps {
  brands: string[];
  selectedBrands: string[];
  priceRanges: { label: string; value: string }[];
  selectedPriceRange: string;
  sortBy: string;
  onBrandToggle: (brand: string) => void;
  onPriceRangeChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function ShopFilter({
  brands,
  selectedBrands,
  priceRanges,
  selectedPriceRange,
  sortBy,
  onBrandToggle,
  onPriceRangeChange,
  onSortChange,
  onClearFilters,
}: ShopFilterProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-black">Filters</h2>
        {(selectedBrands.length > 0 || selectedPriceRange) && (
          <button 
            onClick={onClearFilters}
            className="text-gray-600 hover:text-black transition-all text-xs font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Brand Filter */}
      <div className="mb-5 pb-5 border-b border-gray-200">
        <h3 className="font-semibold text-black mb-3 text-sm">Brand</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => onBrandToggle(brand)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-gray-700 text-xs">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-5 pb-5 border-b border-gray-200">
        <h3 className="font-semibold text-black mb-3 text-sm">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map(range => (
            <label key={range.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition">
              <input
                type="radio"
                name="priceRange"
                checked={selectedPriceRange === range.value}
                onChange={() => onPriceRangeChange(range.value)}
                className="w-3.5 h-3.5 border-gray-300 text-black focus:ring-black"
              />
              <span className="text-gray-700 text-xs">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-semibold text-black mb-3 text-sm">Sort By</h3>
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-xs focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>
    </div>
  );
}
