'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  isScrolled?: boolean;
  theme?: 'dark' | 'light';
}

export default function Header({ isScrolled = false, theme = 'dark' }: HeaderProps) {
  const { getTotalItems, openCart } = useCart();
  const isLight = theme === 'light';
  
  const textClass = isLight ? 'text-black hover:text-gray-600' : 'text-white hover:text-gray-300';
  const logoClass = isLight ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-300';
  const dropdownBgClass = isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800';
  const dropdownItemClass = isLight ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-gray-800';
  const buttonClass = isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200';
  
  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isLight 
        ? 'bg-white border-b border-gray-200' 
        : isScrolled 
          ? 'bg-black border-b border-gray-800' 
          : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className={`text-2xl font-bold transition-all cursor-pointer ${logoClass}`}>
              VeritaShop
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className={`transition-all font-medium tracking-wide ${textClass}`}>
              Shop
            </Link>
            
            {/* Category Dropdown */}
            <div className="relative group">
              <a href="#" className={`transition-all font-medium tracking-wide flex items-center gap-1 ${textClass}`}>
                Category
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              
              {/* Dropdown Menu */}
              <div className={`absolute top-full left-0 mt-2 w-56 ${dropdownBgClass} border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2`}>
                <div className="py-2">
                  <Link href="/category/iphone" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    iPhone
                  </Link>
                  <Link href="/category/samsung" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    Samsung
                  </Link>
                  <Link href="/category/gaming" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    Gaming Phones
                  </Link>
                  <Link href="/category/huawei" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    Huawei
                  </Link>
                  <Link href="/category/xiaomi" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    Xiaomi
                  </Link>
                  <Link href="/category/oneplus" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    OnePlus
                  </Link>
                </div>
              </div>
            </div>
            
            <a href="#" className={`transition-all font-medium tracking-wide ${textClass}`}>About</a>
            <a href="#" className={`transition-all font-medium tracking-wide ${textClass}`}>Blog</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className={`transition-all font-medium tracking-wide ${textClass}`}>Login</Link>
            <button 
              onClick={openCart}
              className={`px-6 py-2 rounded-md font-semibold transition-all flex items-center gap-2 relative ${buttonClass}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart ({getTotalItems()})
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
