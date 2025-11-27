'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'iPhone 16 Pro Max: Đánh giá chi tiết sau 1 tháng sử dụng',
    excerpt: 'Sau 1 tháng trải nghiệm iPhone 16 Pro Max, chúng tôi có những đánh giá khách quan về hiệu năng, camera, pin và trải nghiệm tổng thể của flagship mới nhất từ Apple.',
    category: 'Đánh giá',
    date: '25/11/2025',
    readTime: '8 phút đọc',
    image: '/blog/iphone-16.jpg',
    featured: true,
  },
  {
    id: 2,
    title: 'So sánh Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max',
    excerpt: 'Cuộc đua flagship 2024 giữa hai ông lớn Samsung và Apple. Ai sẽ là người chiến thắng trong từng hạng mục?',
    category: 'So sánh',
    date: '22/11/2025',
    readTime: '10 phút đọc',
    image: '/blog/s24-vs-iphone.jpg',
    featured: true,
  },
  {
    id: 3,
    title: 'Top 5 điện thoại gaming đáng mua nhất 2025',
    excerpt: 'Danh sách những chiếc smartphone gaming với hiệu năng khủng, màn hình mượt mà và tản nhiệt hiệu quả cho game thủ.',
    category: 'Top List',
    date: '20/11/2025',
    readTime: '6 phút đọc',
    image: '/blog/gaming-phones.jpg',
  },
  {
    id: 4,
    title: 'Hướng dẫn chọn mua điện thoại phù hợp với ngân sách',
    excerpt: 'Bạn đang phân vân không biết nên chọn điện thoại nào? Bài viết này sẽ giúp bạn tìm ra chiếc máy phù hợp nhất.',
    category: 'Hướng dẫn',
    date: '18/11/2025',
    readTime: '5 phút đọc',
    image: '/blog/buying-guide.jpg',
  },
  {
    id: 5,
    title: 'Xiaomi 14 Ultra: Camera Leica có thực sự đáng giá?',
    excerpt: 'Khám phá khả năng chụp ảnh của Xiaomi 14 Ultra với hệ thống camera hợp tác cùng Leica huyền thoại.',
    category: 'Đánh giá',
    date: '15/11/2025',
    readTime: '7 phút đọc',
    image: '/blog/xiaomi-14.jpg',
  },
  {
    id: 6,
    title: 'Công nghệ sạc nhanh 2025: Từ 100W đến 300W',
    excerpt: 'Tìm hiểu về cuộc đua công nghệ sạc nhanh và những tiến bộ vượt bậc trong năm 2025.',
    category: 'Công nghệ',
    date: '12/11/2025',
    readTime: '6 phút đọc',
    image: '/blog/fast-charging.jpg',
  },
  {
    id: 7,
    title: 'Bảo vệ điện thoại đúng cách: Những sai lầm cần tránh',
    excerpt: 'Những thói quen tưởng chừng vô hại nhưng lại gây hại cho điện thoại của bạn mỗi ngày.',
    category: 'Mẹo vặt',
    date: '10/11/2025',
    readTime: '4 phút đọc',
    image: '/blog/phone-care.jpg',
  },
  {
    id: 8,
    title: 'OPPO Find X7 Ultra: Flagship với camera periscope ấn tượng',
    excerpt: 'Đánh giá chi tiết OPPO Find X7 Ultra với khả năng zoom quang học vượt trội và thiết kế sang trọng.',
    category: 'Đánh giá',
    date: '08/11/2025',
    readTime: '8 phút đọc',
    image: '/blog/oppo-find.jpg',
  },
];

const categories = ['Tất cả', 'Đánh giá', 'So sánh', 'Top List', 'Hướng dẫn', 'Công nghệ', 'Mẹo vặt'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchCategory = selectedCategory === 'Tất cả' || post.category === selectedCategory;
    const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured || selectedCategory !== 'Tất cả' || searchQuery);

  return (
    <div className="min-h-screen bg-white">
      <Header theme="light" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Công Nghệ</h1>
            <p className="text-lg text-gray-300">
              Cập nhật tin tức, đánh giá và hướng dẫn mới nhất về điện thoại và công nghệ
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {selectedCategory === 'Tất cả' && !searchQuery && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-black mb-8">Bài viết nổi bật</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-4 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-black text-white text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <span className="text-sm text-gray-500">• {post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gray-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black mb-8">
            {selectedCategory === 'Tất cả' && !searchQuery ? 'Tất cả bài viết' : `Kết quả (${filteredPosts.length})`}
          </h2>
          
          {regularPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === 'Tất cả' && !searchQuery ? regularPosts : filteredPosts).map((post) => (
                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-black mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <span className="text-black font-medium text-sm group-hover:underline">Đọc thêm →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy bài viết</h3>
              <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Đăng ký nhận tin</h2>
            <p className="text-gray-400 mb-8">
              Nhận thông báo về bài viết mới và ưu đãi đặc biệt từ VeritaShop
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
