'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { products, type Product } from '@/lib/data/products';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { addToCartLegacy, openCart } = useCart();
  const [addingToCart, setAddingToCart] = React.useState<number | null>(null);
  const [lastClickedTime, setLastClickedTime] = React.useState<{ [key: number]: number }>({});

  const rotatingWords = [
    "gaming beast\nwith ROG Phone",
    "Samsung\nflagship",
    "IPhone you've been waiting for",
    "Huawei\ninnovation"
  ];

  const [currentWord, setCurrentWord] = React.useState(0);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [animateText, setAnimateText] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimateText(false);
      setTimeout(() => {
        setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
        setAnimateText(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header isScrolled={isScrolled} theme="light" variant="solid-black" />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-[128px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-[128px] animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pt-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl order-2 md:order-1 animate-fade-in-up">
              <div className="mb-10">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-[1.1] tracking-tight mb-6">
                  Get the <br />
                  <span className="inline-block relative min-h-[2.4em] w-full overflow-hidden">
                    <span className={`absolute left-0 top-0 transition-all duration-500 ease-in-out whitespace-pre-line text-black ${animateText
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-full opacity-0'
                      }`}>
                      {rotatingWords[currentWord]}
                    </span>
                  </span>
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-light">
                Premium smartphones from the world&apos;s best brands. <span className="text-black font-medium">Free shipping</span> on orders over $500.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="group bg-black text-white px-12 py-5 rounded-full text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  Shop now
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="relative md:flex items-center justify-center order-1 md:order-2 animate-fade-in">
              <div className="relative w-full max-w-[650px] h-[700px] flex items-center justify-center">
                {/* Animated background gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full filter blur-[150px] animate-pulse"></div>
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Product image */}
                <div className="relative z-10 group">
                  <Image
                    src="/images/iphone17.png"
                    alt="Premium Smartphone"
                    width={400}
                    height={650}
                    priority
                    className="relative w-auto h-[650px] object-contain drop-shadow-2xl animate-float group-hover:scale-105 transition-transform duration-700"
                    onError={(event) => {
                      event.currentTarget.src = 'https://images.unsplash.com/photo-1695048064555-7f2f29c9e588?w=800&h=1200&fit=crop&q=80';
                    }}
                  />

                  {/* Decorative elements */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-8 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out forwards;
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 1.5s ease-out forwards;
          }
        `}</style>
      </section>

      {/* Brand Showcase */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-20">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="text-sm uppercase tracking-widest text-blue-600 font-semibold">Explore Brands</span>
            </div>
            <h2
              className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-black"
            >
              Shop by Brand
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Premium smartphones from the world&apos;s leading manufacturers
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>

          <div className="flex animate-scroll-left">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-6 px-3">
                {[
                  {
                    name: 'iPhone',
                    tagline: 'Think Different',
                    gradient: 'from-gray-100 to-gray-200',
                    img: '/images/iphone17.png',
                    link: '/category/iphone'
                  },
                  {
                    name: 'Samsung',
                    tagline: 'Next is Now',
                    gradient: 'from-blue-50 to-gray-100',
                    img: '/images/samsungs24.jpg',
                    link: '/category/samsung'
                  },
                  {
                    name: 'ASUS ROG',
                    tagline: 'For Those Who Dare',
                    gradient: 'from-red-50 to-gray-100',
                    img: '/images/rogphone8.png',
                    link: '/category/gaming'
                  },
                  {
                    name: 'Huawei',
                    tagline: 'Make it Possible',
                    gradient: 'from-purple-50 to-gray-100',
                    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                    link: '/category/huawei'
                  },
                  {
                    name: 'Xiaomi',
                    tagline: 'Innovation For Everyone',
                    gradient: 'from-orange-50 to-gray-100',
                    img: '/images/Xiaomi14.png',
                    link: '/category/xiaomi'
                  },
                  {
                    name: 'OnePlus',
                    tagline: 'Never Settle',
                    gradient: 'from-red-50 to-gray-100',
                    img: '/images/oneplus12.png',
                    link: '/category/oneplus'
                  }
                ].map((brand, index) => (
                  <Link
                    key={`${setIndex}-${index}`}
                    href={brand.link}
                    className={`group relative bg-gradient-to-br ${brand.gradient} rounded-3xl p-8 hover:scale-105 transition-all duration-500 cursor-pointer min-w-[320px] border border-gray-100 hover:border-gray-200 overflow-hidden shadow-md hover:shadow-2xl`}
                  >
                    <div className="absolute inset-0 opacity-50 group-hover:opacity-60 transition-opacity duration-500">
                      <Image
                        src={brand.img}
                        alt={brand.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="320px"
                      />
                    </div>
                    <div className="relative z-10 text-center">
                      <h3 className="text-2xl font-bold text-black mb-2 tracking-wide drop-shadow-sm">{brand.name}</h3>
                      <p className="text-gray-700 text-sm uppercase tracking-wider font-medium drop-shadow-sm">{brand.tagline}</p>
                      <div className="mt-6 inline-block px-6 py-2 bg-black text-white rounded-full text-sm font-bold group-hover:scale-105 transition-all shadow-lg">
                        Explore →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-left {
            animation: scroll-left 30s linear infinite;
          }
          .animate-scroll-left:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <div className="mb-6 md:mb-0">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Limited Time
                </span>
              </div>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight text-black"
              >
                Hot Deals This Week
              </h2>
              <p className="text-gray-600 text-lg font-light">Limited time offers on premium devices</p>
            </div>
            <Link href="/shop" className="group inline-flex items-center gap-2 text-black hover:text-blue-600 font-semibold text-lg transition-all">
              View All
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product, index) => {
              const getBadge = (product: Product) => {
                if (product.badge) return { text: product.badge, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
                if (product.oldPrice && product.oldPrice > product.price) {
                  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
                  if (discount >= 15) return { text: 'HOT DEAL', color: 'bg-gradient-to-r from-red-500 to-orange-500' };
                  return { text: 'SALE', color: 'bg-gradient-to-r from-orange-500 to-amber-500' };
                }
                if (product.brand === 'ASUS' || product.brand === 'RedMagic' || product.brand === 'Black Shark') {
                  return { text: 'GAMING', color: 'bg-gradient-to-r from-purple-500 to-indigo-500' };
                }
                if (product.price >= 1000) return { text: 'PREMIUM', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
                if (product.price <= 500) return { text: 'BEST VALUE', color: 'bg-gradient-to-r from-green-500 to-emerald-500' };
                return { text: 'NEW', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
              };

              const badge = getBadge(product);
              const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

              return (
                <div
                  key={index}
                  className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-gray-200 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                      sizes="(min-width: 1024px) 250px, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className={`absolute top-4 right-4 ${badge.color} text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transform group-hover:scale-105 transition-transform`}>
                      {badge.text}
                    </div>

                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-white text-black border border-gray-100 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        -{discount}% OFF
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Link href={`/shop/${product.id}`} className="block w-full bg-black text-white py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg text-center">
                        Quick View
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-black mb-3 line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-sm">★</span>
                        ))}
                      </div>
                      <span className="text-gray-500 text-xs">(128 reviews)</span>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-3xl font-bold text-black">${product.price}</span>
                      {product.oldPrice && (
                        <span className="text-base text-gray-400 line-through">${product.oldPrice}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Prevent multiple clicks
                        if (addingToCart === product.id) {
                          console.log('Button disabled, ignoring click');
                          return;
                        }

                        // Throttle clicks - prevent clicking within 500ms
                        const now = Date.now();
                        const lastClick = lastClickedTime[product.id] || 0;
                        if (now - lastClick < 500) {
                          console.log('Click throttled, ignoring');
                          return;
                        }
                        setLastClickedTime({ ...lastClickedTime, [product.id]: now });

                        if (!isAuthenticated) {
                          // Save current page for redirect after login
                          sessionStorage.setItem('redirectPath', window.location.pathname);
                          window.location.href = '/login';
                          return;
                        }

                        console.log('🚀 HomePage: Adding to cart -', product.name);

                        // Set loading state
                        setAddingToCart(product.id);

                        // Add to cart logic
                        const selectedColor = product.colors ? product.colors[0] : 'Default';

                        // Map Product to LegacyCartItem format
                        const legacyProduct = {
                          id: product.id.toString(),
                          name: product.name,
                          price: product.price,
                          slug: '', // Not available in this Product type
                          images: product.images || [product.image]
                        };
                        addToCartLegacy(legacyProduct, 1, selectedColor);

                        // Reset loading state and open cart
                        setTimeout(() => {
                          setAddingToCart(null);
                          // Clear click throttle after 1 second
                          setTimeout(() => {
                            setLastClickedTime((prev: typeof lastClickedTime) => ({ ...prev, [product.id]: 0 }));
                          }, 1000);
                          openCart();
                        }, 300);
                      }}
                      disabled={addingToCart === product.id}
                      className={`w-full bg-black text-white py-3.5 rounded-full text-sm font-bold hover:bg-gray-800 hover:scale-[1.02] transition-all duration-300 shadow-lg mt-auto ${addingToCart === product.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h2
            className="text-5xl md:text-6xl font-bold text-center mb-8 tracking-tight text-black"
          >
            Shop by category
          </h2>
          <p className="text-center text-lg text-gray-600 mb-20 max-w-2xl mx-auto font-light">
            Explore our curated collection of premium smartphones across different categories
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-96 hover:scale-105 transition-all shadow-lg hover:shadow-2xl duration-500">
              <Image
                src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop"
                alt="Flagship Phones"
                fill
                className="object-cover"
                unoptimized
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-10">
                <h3 className="text-4xl font-light text-white mb-3 tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">Flagship Phones</h3>
                <p className="text-gray-200 mb-6 font-light text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">The latest and greatest from top brands</p>
                <Link href="/shop" className="text-white font-medium text-xs uppercase tracking-widest inline-flex items-center group-hover:gap-3 transition-all">
                  Shop now <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </Link>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-96 hover:scale-105 transition-all shadow-lg hover:shadow-2xl duration-500">
              <Image
                src="https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=800&fit=crop"
                alt="Gaming Phones"
                fill
                className="object-cover"
                unoptimized
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-10">
                <h3 className="text-4xl font-light text-white mb-3 tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">Gaming Phones</h3>
                <p className="text-gray-200 mb-6 font-light text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Ultimate power for mobile gaming</p>
                <Link href="/shop" className="text-white font-medium text-xs uppercase tracking-widest inline-flex items-center group-hover:gap-3 transition-all">
                  Shop now <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </Link>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-96 hover:scale-105 transition-all shadow-lg hover:shadow-2xl duration-500">
              <Image
                src="https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&h=800&fit=crop"
                alt="Budget Friendly"
                fill
                className="object-cover"
                unoptimized
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-10">
                <h3 className="text-4xl font-light text-white mb-3 tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">Budget Friendly</h3>
                <p className="text-gray-200 mb-6 font-light text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Great phones at amazing prices</p>
                <Link href="/shop" className="text-white font-medium text-xs uppercase tracking-widest inline-flex items-center group-hover:gap-3 transition-all">
                  Shop now <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* iPhone Feature Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <p className="text-sm text-blue-600 font-bold uppercase tracking-widest mb-3">Apple</p>
              <h2 className="text-5xl md:text-6xl font-bold text-black mb-8 leading-tight">
                The iPhone everyone&apos;s talking about
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                Experience the power of the latest iPhone 15 series. A17 Pro chip, ProMotion display, and the best camera system ever.
              </p>
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-100 hover:shadow-lg">
                  <div>
                    <h4 className="font-bold text-black text-xl mb-1 group-hover:text-blue-600 transition-colors">A17 Pro Chip</h4>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors">Console-level gaming and pro workflows</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-100 hover:shadow-lg">
                  <div>
                    <h4 className="font-bold text-black text-xl mb-1 group-hover:text-blue-600 transition-colors">Pro Camera System</h4>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors">48MP main camera with 5x optical zoom</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-100 hover:shadow-lg">
                  <div>
                    <h4 className="font-bold text-black text-xl mb-1 group-hover:text-blue-600 transition-colors">All-day Battery</h4>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors">Up to 29 hours video playback</p>
                  </div>
                </div>
              </div>
              <Link href="/category/iphone" className="inline-block bg-black text-white px-12 py-5 rounded-full text-lg font-bold hover:bg-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300">
                Shop iPhone
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-700 cursor-pointer group relative">
                <Image
                  src="https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=800&h=800&fit=crop"
                  alt="iPhone 15 Pro"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Samsung Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-white border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-700 cursor-pointer group relative">
                <Image
                  src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop"
                  alt="Samsung Galaxy"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm text-blue-600 font-bold uppercase tracking-widest mb-3">Samsung</p>
              <h2 className="text-5xl md:text-6xl font-bold text-black mb-8 leading-tight">
                Galaxy AI is here
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                The new Galaxy S24 Ultra with Galaxy AI. Circle to Search, Live Translate, and intelligent photo editing.
              </p>
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-200 hover:shadow-lg">
                  <div>
                    <h4 className="font-bold text-black text-xl mb-1 group-hover:text-blue-600 transition-colors">Galaxy AI</h4>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors">AI-powered features for everything you do</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-200 hover:shadow-lg">
                  <div>
                    <h4 className="font-bold text-black text-xl mb-1 group-hover:text-blue-600 transition-colors">S Pen Included</h4>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors">Note-taking and creativity redefined</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-200 hover:shadow-lg">
                  <div>
                    <h4 className="font-bold text-black text-xl mb-1 group-hover:text-blue-600 transition-colors">Dynamic AMOLED 2X</h4>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors">6.8&quot; QHD+ 120Hz display</p>
                  </div>
                </div>
              </div>
              <Link href="/category/samsung" className="inline-block bg-black text-white px-12 py-5 rounded-full text-lg font-bold hover:bg-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300">
                Shop Samsung
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gaming Section */}
      <section className="py-32 bg-gradient-to-br from-gray-100 via-white to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-200 rounded-full filter blur-[128px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full filter blur-[128px] animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all duration-300">
                Gaming
              </span>
            </div>
            <h2
              className="text-5xl md:text-6xl font-bold mb-6 text-black"
            >
              Built for gamers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              ROG Phone and gaming smartphones designed for maximum performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[products[2], products[3], products[4]].map((phone, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:scale-105 transition-all duration-500 cursor-pointer hover:border-gray-300 hover:shadow-2xl"
              >
                <div className="h-96 overflow-hidden bg-gray-50 relative">
                  <Image
                    src={phone.image}
                    alt={phone.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                    sizes="(min-width: 768px) 30vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-black mb-2">{phone.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 uppercase tracking-wide font-medium">
                    {phone.specs ? phone.specs.slice(0, 3).map(s => s.value).join(' • ') : `${phone.brand} • Premium Gaming`}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-black">${phone.price}</span>
                    <Link href={`/shop/${phone.id}`} className="bg-black text-white px-8 py-3 rounded-full font-bold border border-black hover:bg-white hover:text-black transition-all duration-300 shadow-lg">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-black"
          >
            Why shop with VeritaShop?
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-slate-50 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-black mb-3">Free Shipping</h3>
              <p className="text-gray-600">Free delivery on orders over $500</p>
            </div>
            <div className="text-center p-8 bg-slate-50 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-black mb-3">100% Authentic</h3>
              <p className="text-gray-600">All products are genuine and sealed</p>
            </div>
            <div className="text-center p-8 bg-slate-50 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-black mb-3">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy, no questions</p>
            </div>
            <div className="text-center p-8 bg-slate-50 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-black mb-3">Warranty</h3>
              <p className="text-gray-600">Official manufacturer warranty</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-2">50K+</div>
              <p className="text-gray-400 text-lg">Happy Customers</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">500+</div>
              <p className="text-gray-400 text-lg">Phone Models</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">4.9★</div>
              <p className="text-gray-400 text-lg">Average Rating</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">24/7</div>
              <p className="text-gray-400 text-lg">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
