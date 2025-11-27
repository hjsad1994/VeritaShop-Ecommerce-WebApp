'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import UserMenu from '@/components/layout/UserMenu';
import categoryService from '@/lib/api/categoryService';
import { Category } from '@/lib/api/types';

interface HeaderProps {
  isScrolled?: boolean;
  theme?: 'dark' | 'light';
  variant?: 'transparent' | 'solid-black' | 'solid-white';
}

export default function Header({ isScrolled = false, theme = 'dark', variant = 'transparent' }: HeaderProps) {
  const { getTotalItems, openCart } = useCart();
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategoryTree();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Determine styling based on variant and theme
  const isSolidBlack = variant === 'solid-black';
  const isLight = theme === 'light' && !isSolidBlack; // Force dark theme styles if solid-black variant

  const textClass = isLight ? 'text-black hover:text-gray-600' : 'text-white hover:text-gray-300';
  const logoClass = isLight ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-300';
  const dropdownBgClass = isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800';
  const dropdownItemClass = isLight ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-gray-800';
  const buttonClass = isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200';

  // Calculate background class
  let headerBgClass = '';
  if (isSolidBlack) {
    headerBgClass = 'bg-black';
  } else if (isLight) {
    headerBgClass = 'bg-white border-b border-gray-200';
  } else {
    // Transparent variant logic
    headerBgClass = isScrolled ? 'bg-black' : 'bg-transparent';
  }

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className={`text-2xl font-bold transition-all cursor-pointer ${logoClass}`}>
              VeritaShop
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className={`transition-all font-medium tracking-wide uppercase ${textClass}`}>
              Cửa hàng
            </Link>

            {/* Category Dropdown */}
            <div className="relative group">
              <button type="button" className={`transition-all font-medium tracking-wide uppercase flex items-center gap-1 ${textClass}`}>
                Danh mục
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute top-full left-0 mt-2 w-56 ${dropdownBgClass} border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2`}>
                <div className="py-2 max-h-[60vh] overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link 
                        key={category.id} 
                        href={`/category/${category.slug}`} 
                        className={`flex items-center gap-3 px-4 py-3 transition-all font-medium ${dropdownItemClass}`}
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className={`px-4 py-3 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      No categories
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link href="/about" className={`transition-all font-medium tracking-wide uppercase ${textClass}`}>Giới thiệu</Link>
            <Link href="/blog" className={`transition-all font-medium tracking-wide uppercase ${textClass}`}>Tin tức</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/orders" className={`p-2 rounded-full transition-all ${textClass} hover:bg-gray-100 dark:hover:bg-gray-800 relative`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className={`p-2 rounded-full transition-all ${textClass} hover:bg-gray-100 dark:hover:bg-gray-800 relative`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {isNotificationDropdownOpen && (
                <div className={`absolute top-full right-0 mt-2 w-80 ${dropdownBgClass} border rounded-lg shadow-xl`}>
                  <div className="p-4">
                    <h3 className={`font-semibold ${isLight ? 'text-black' : 'text-white'} mb-3`}>Notifications</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
                        <p className={`text-sm font-medium ${isLight ? 'text-black' : 'text-white'}`}>Order #1234 has been delivered</p>
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1`}>5 minutes ago</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
                        <p className={`text-sm font-medium ${isLight ? 'text-black' : 'text-white'}`}>New promotion: 20% off iPhone 15</p>
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1`}>1 hour ago</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
                        <p className={`text-sm font-medium ${isLight ? 'text-black' : 'text-white'}`}>Thank you for your purchase!</p>
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1`}>Yesterday</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button className={`text-sm ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'} font-medium`}>
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <UserMenu 
              theme={theme}
              textClass={textClass}
            />

            <button
              onClick={openCart}
              className={`px-6 py-2 rounded-md font-semibold transition-all flex items-center gap-2 relative uppercase ${buttonClass}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Giỏ hàng ({getTotalItems()})
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
