'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const stats = [
    { number: '10K+', label: 'Khách hàng tin tưởng' },
    { number: '50K+', label: 'Sản phẩm đã bán' },
    { number: '99%', label: 'Khách hàng hài lòng' },
    { number: '24/7', label: 'Hỗ trợ khách hàng' },
  ];

  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Chính hãng 100%',
      description: 'Tất cả sản phẩm đều được nhập khẩu chính hãng với đầy đủ giấy tờ và bảo hành.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Giao hàng nhanh',
      description: 'Giao hàng trong 2-4 giờ tại nội thành và 1-3 ngày toàn quốc.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Thanh toán đa dạng',
      description: 'Hỗ trợ nhiều hình thức thanh toán: COD, chuyển khoản, ví điện tử.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Đổi trả dễ dàng',
      description: 'Chính sách đổi trả trong 30 ngày nếu sản phẩm có lỗi từ nhà sản xuất.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header theme="light" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Về <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">VeritaShop</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Chúng tôi mang đến những sản phẩm công nghệ chính hãng với giá tốt nhất, 
              cùng dịch vụ chăm sóc khách hàng tận tâm.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-black mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Câu chuyện của chúng tôi</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  VeritaShop được thành lập với sứ mệnh mang đến cho khách hàng Việt Nam những sản phẩm 
                  công nghệ chính hãng với giá cả hợp lý nhất. Tên gọi &quot;Verita&quot; xuất phát từ tiếng Latin 
                  có nghĩa là &quot;Sự thật&quot; - thể hiện cam kết của chúng tôi về tính xác thực và chất lượng.
                </p>
                <p>
                  Từ một cửa hàng nhỏ, chúng tôi đã phát triển thành một trong những địa chỉ uy tín 
                  hàng đầu trong lĩnh vực bán lẻ điện thoại và thiết bị điện tử. Với đội ngũ nhân viên 
                  giàu kinh nghiệm và tận tâm, chúng tôi luôn nỗ lực mang đến trải nghiệm mua sắm 
                  tốt nhất cho khách hàng.
                </p>
                <p>
                  Chúng tôi tin rằng mỗi khách hàng đều xứng đáng được sở hữu những sản phẩm công nghệ 
                  tốt nhất với mức giá phải chăng và dịch vụ hậu mãi chu đáo.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl font-bold text-gray-400 mb-4">VS</div>
                  <div className="text-gray-500">VeritaShop</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-black rounded-2xl flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">5+</div>
                  <div className="text-xs">Năm kinh nghiệm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Sẵn sàng trải nghiệm?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Khám phá bộ sưu tập điện thoại và thiết bị công nghệ mới nhất tại VeritaShop
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Mua sắm ngay
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors"
            >
              Liên hệ với chúng tôi
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
