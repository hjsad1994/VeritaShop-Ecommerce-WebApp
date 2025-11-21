'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import categoryService from '@/lib/api/categoryService';
import { Category } from '@/lib/api/types';

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories with limit 5 as requested
        const response = await categoryService.getCategories({ limit: 5, isActive: true });
        setCategories(response.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header theme="light" />

      <div className="bg-black text-white py-3 text-center text-sm font-medium mt-16">
        Explore Our Collections
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <h1 className="text-4xl font-bold text-black mb-12 text-center">Shop by Category</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="group relative h-80 rounded-2xl overflow-hidden block shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="absolute inset-0 bg-gray-200">
                  <Image
                    src={category.image || '/placeholder.png'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-gray-300 text-sm line-clamp-2 mb-4">{category.description}</p>
                  <span className="text-white text-sm font-medium uppercase tracking-wider inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                    View Products <span className="transition-transform">→</span>
                  </span>
                </div>
              </Link>
            ))}
            
            {categories.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No categories found.
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
