'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const orderNumber = searchParams.get('orderNumber');
  const message = searchParams.get('message');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-white">
      <Header theme="light" />

      <div className="max-w-2xl mx-auto px-4 py-20 mt-16">
        <div className="text-center">
          {isSuccess ? (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-black mb-4">Thanh toán thành công!</h1>
              <p className="text-gray-600 mb-2">Cảm ơn bạn đã mua hàng tại VeritaShop</p>
              {orderNumber && (
                <p className="text-lg font-semibold text-black mb-8">
                  Mã đơn hàng: <span className="text-green-600">{orderNumber}</span>
                </p>
              )}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Thanh toán qua MoMo đã được xác nhận</span>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  Đơn hàng của bạn đang được xử lý và sẽ sớm được giao.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-black mb-4">Thanh toán không thành công</h1>
              <p className="text-gray-600 mb-2">Đã xảy ra lỗi trong quá trình thanh toán</p>
              {message && (
                <p className="text-sm text-red-600 mb-4">{decodeURIComponent(message)}</p>
              )}
              {orderNumber && (
                <p className="text-lg font-semibold text-black mb-8">
                  Mã đơn hàng: <span className="text-gray-600">{orderNumber}</span>
                </p>
              )}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <p className="text-red-700 font-medium">Đơn hàng đã được tạo nhưng chưa thanh toán</p>
                <p className="text-sm text-red-600 mt-2">
                  Bạn có thể thử thanh toán lại hoặc chọn thanh toán khi nhận hàng.
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderNumber && (
              <Link
                href={`/orders/${orderNumber}`}
                className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Xem đơn hàng
              </Link>
            )}
            <Link
              href="/shop"
              className="bg-white text-black px-8 py-3 rounded-lg font-bold border-2 border-black hover:bg-gray-50 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          {!isSuccess && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                Nếu bạn gặp vấn đề, vui lòng liên hệ hotline: <span className="font-semibold text-black">1900 xxxx</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
