'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  isScrolled?: boolean;
  theme?: 'dark' | 'light';
}

export default function Header({ isScrolled = false, theme = 'dark' }: HeaderProps) {
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    iPhone
                  </Link>
                  <Link href="/category/samsung" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 8.47v7.06L12 21l-10-5.47V8.47L12 3l10 5.47zM6.63 10.5l-2.5-1.37v2.74l2.5 1.37v-2.74zm9.24 5.07l2.5-1.37v-2.74l-2.5 1.37v2.74zm-8-3.3l2.5-1.37v-2.74l-2.5 1.37v2.74zm6.74 2.24l-2.5-1.37V10.4l2.5 1.37v2.74z"/>
                    </svg>
                    Samsung
                  </Link>
                  <Link href="/category/gaming" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm-7 0C7.12 9.5 6 10.62 6 12s1.12 2.5 2.5 2.5S11 13.38 11 12 9.88 9.5 8.5 9.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/>
                    </svg>
                    Gaming Phones
                  </Link>
                  <Link href="/category/huawei" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                    Huawei
                  </Link>
                  <Link href="/category/xiaomi" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                    </svg>
                    Xiaomi
                  </Link>
                  <Link href="/category/oneplus" className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
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
            <button className={`px-6 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${buttonClass}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart (0)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
