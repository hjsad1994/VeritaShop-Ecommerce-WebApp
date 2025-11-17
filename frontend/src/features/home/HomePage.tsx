'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { products, type Product } from '@/lib/data/products';

export default function HomePage() {
  const rotatingWords = [
    "gaming beast\nwith ROG Phone",
    "Samsung\nflagship",
    "IPhone you've\nbeen waiting for",
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
    <div className="min-h-screen bg-black">
      <Header isScrolled={isScrolled} />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl order-2 md:order-1">
              <div className="mb-10">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                  Get the <br />
                  <span className="inline-block relative min-h-[2.4em] w-full overflow-hidden">
                    <span className={`absolute left-0 top-0 transition-all duration-500 ease-in-out whitespace-pre-line text-white ${animateText
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-full opacity-0'
                      }`}>
                      {rotatingWords[currentWord]}
                    </span>
                  </span>
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed font-light">
                Premium smartphones from the world&apos;s best brands. <span className="text-white font-medium">Free shipping</span> on orders over $500.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="group bg-white text-black px-12 py-5 rounded-full text-lg font-bold hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  Shop now
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="relative md:flex items-center justify-center order-1 md:order-2">
              <div className="relative w-full max-w-[650px] h-[700px] flex items-center justify-center">
                {/* Animated background gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full filter blur-[150px] animate-pulse"></div>
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Product image */}
                <div className="relative z-10 group">
                  <img
                    src="/images/iphone17.png"
                    alt="Premium Smartphone"
                    className="relative w-auto h-[650px] object-contain drop-shadow-[0_50px_100px_rgba(59,130,246,0.5)] animate-float group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1695048064555-7f2f29c9e588?w=800&h=1200&fit=crop&q=80";
                    }}
                  />

                  {/* Decorative elements */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-8 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-xl"></div>
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
        `}</style>
      </section>

      {/* Brand Showcase */}
      <section className="py-32 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-20">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="text-sm uppercase tracking-widest text-blue-400 font-semibold">Explore Brands</span>
            </div>
            <h2 
              className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
              style={{
                background: 'linear-gradient(257deg, #e2e6ea 14.04%, #909fb0 30.93%, #fff 90.58%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Shop by Brand
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Premium smartphones from the world&apos;s leading manufacturers
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10"></div>

          <div className="flex animate-scroll-left">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-6 px-3">
                {[
                  {
                    name: 'iPhone',
                    tagline: 'Think Different',
                    gradient: 'from-slate-800 to-slate-900',
                    img: '/images/iphone17.png',
                    link: '/category/iphone'
                  },
                  {
                    name: 'Samsung',
                    tagline: 'Next is Now',
                    gradient: 'from-blue-900 to-slate-900',
                    img: '/images/samsungs24.jpg',
                    link: '/category/samsung'
                  },
                  {
                    name: 'ASUS ROG',
                    tagline: 'For Those Who Dare',
                    gradient: 'from-red-900 to-slate-900',
                    img: '/images/rogphone8.png',
                    link: '/category/gaming'
                  },
                  {
                    name: 'Huawei',
                    tagline: 'Make it Possible',
                    gradient: 'from-purple-900 to-slate-900',
                    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                    link: '/category/huawei'
                  },
                  {
                    name: 'Xiaomi',
                    tagline: 'Innovation For Everyone',
                    gradient: 'from-orange-900 to-slate-900',
                    img: '/images/Xiaomi14.png',
                    link: '/category/xiaomi'
                  },
                  {
                    name: 'OnePlus',
                    tagline: 'Never Settle',
                    gradient: 'from-red-800 to-slate-900',
                    img: '/images/oneplus12.png',
                    link: '/category/oneplus'
                  }
                ].map((brand, index) => (
                  <Link
                    key={`${setIndex}-${index}`}
                    href={brand.link}
                    className={`group relative bg-gradient-to-br ${brand.gradient} rounded-3xl p-8 hover:scale-105 transition-all duration-500 cursor-pointer min-w-[320px] border border-white/5 hover:border-white/20 overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-30">
                      <img src={brand.img} alt={brand.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 text-center">
                      <h3 className="text-2xl font-bold text-white mb-2 tracking-wide drop-shadow-md">{brand.name}</h3>
                      <p className="text-gray-300 text-sm uppercase tracking-wider font-medium drop-shadow">{brand.tagline}</p>
                      <div className="mt-6 inline-block px-6 py-2 bg-white rounded-full text-black text-sm font-bold border border-white group-hover:scale-105 transition-all shadow-lg">
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
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <div className="mb-6 md:mb-0">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Limited Time
                </span>
              </div>
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight"
                style={{
                  background: 'linear-gradient(257deg, #e2e6ea 14.04%, #909fb0 30.93%, #fff 90.58%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Hot Deals This Week
              </h2>
              <p className="text-gray-400 text-lg">Limited time offers on premium devices</p>
            </div>
            <Link href="/shop" className="group inline-flex items-center gap-2 text-white hover:text-blue-400 font-semibold text-base transition-all">
              View All
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="group relative bg-gradient-to-br from-zinc-900/95 to-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-500 cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

                    <div className={`absolute top-4 right-4 ${badge.color} text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg`}>
                      {badge.text}
                    </div>

                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 rounded-full text-xs font-bold">
                        -{discount}% OFF
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Link href={`/shop/${product.id}`} className="block w-full bg-white text-black py-3 rounded-full text-sm font-bold hover:bg-gray-100 transition-all shadow-lg text-center">
                        Quick View
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem]">
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
                      <span className="text-3xl font-bold text-white">${product.price}</span>
                      {product.oldPrice && (
                        <span className="text-base text-gray-500 line-through">${product.oldPrice}</span>
                      )}
                    </div>

                    <button className="w-full bg-white text-black py-3.5 rounded-full text-sm font-bold hover:bg-gray-100 hover:scale-[1.02] transition-all duration-300 shadow-lg mt-auto">
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h2 
            className="text-5xl md:text-6xl font-bold text-center mb-8 tracking-tight"
            style={{
              background: 'linear-gradient(257deg, #e2e6ea 14.04%, #909fb0 30.93%, #fff 90.58%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Shop by category
          </h2>
          <p className="text-center text-lg text-gray-400 mb-20 max-w-2xl mx-auto">
            Explore our curated collection of premium smartphones across different categories
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-96 hover:scale-105 transition-all">
              <img
                src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop"
                alt="Flagship Phones"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col justify-end p-10">
                <h3 className="text-4xl font-light text-white mb-3 tracking-tight">Flagship Phones</h3>
                <p className="text-gray-400 mb-6 font-light text-sm">The latest and greatest from top brands</p>
                <Link href="/shop" className="text-white font-light text-xs uppercase tracking-widest inline-flex items-center group-hover:gap-3 transition-all">
                  Shop now <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </Link>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-96 hover:scale-105 transition-all">
              <img
                src="https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=800&fit=crop"
                alt="Gaming Phones"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col justify-end p-10">
                <h3 className="text-4xl font-light text-white mb-3 tracking-tight">Gaming Phones</h3>
                <p className="text-gray-400 mb-6 font-light text-sm">Ultimate power for mobile gaming</p>
                <Link href="/shop" className="text-white font-light text-xs uppercase tracking-widest inline-flex items-center group-hover:gap-3 transition-all">
                  Shop now <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </Link>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-96 hover:scale-105 transition-all">
              <img
                src="https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&h=800&fit=crop"
                alt="Budget Friendly"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col justify-end p-10">
                <h3 className="text-4xl font-light text-white mb-3 tracking-tight">Budget Friendly</h3>
                <p className="text-gray-400 mb-6 font-light text-sm">Great phones at amazing prices</p>
                <Link href="/shop" className="text-white font-light text-xs uppercase tracking-widest inline-flex items-center group-hover:gap-3 transition-all">
                  Shop now <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* iPhone Feature Section */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-3 font-medium">Apple</p>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
                The iPhone everyone's talking about
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Experience the power of the latest iPhone 15 series. A17 Pro chip, ProMotion display, and the best camera system ever.
              </p>
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-900 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-800">
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1 group-hover:text-blue-400 transition-colors">A17 Pro Chip</h4>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Console-level gaming and pro workflows</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-900 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-800">
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1 group-hover:text-blue-400 transition-colors">Pro Camera System</h4>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">48MP main camera with 5x optical zoom</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-900 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-800">
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1 group-hover:text-blue-400 transition-colors">All-day Battery</h4>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Up to 29 hours video playback</p>
                  </div>
                </div>
              </div>
              <Link href="/category/iphone" className="inline-block bg-white text-black px-10 py-4 rounded-md text-lg font-semibold hover:bg-gray-200 transition-all">
                Shop iPhone
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-500 cursor-pointer group">
                <img
                  src="https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=800&h=800&fit=crop"
                  alt="iPhone 15 Pro"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Samsung Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 to-black border border-gray-800 hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-500 cursor-pointer group">
                <img
                  src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop"
                  alt="Samsung Galaxy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-3 font-medium">Samsung</p>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
                Galaxy AI is here
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                The new Galaxy S24 Ultra with Galaxy AI. Circle to Search, Live Translate, and intelligent photo editing.
              </p>
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-900 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-800">
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1 group-hover:text-blue-400 transition-colors">Galaxy AI</h4>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">AI-powered features for everything you do</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-900 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-800">
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1 group-hover:text-blue-400 transition-colors">S Pen Included</h4>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Note-taking and creativity redefined</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-900 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-800">
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1 group-hover:text-blue-400 transition-colors">Dynamic AMOLED 2X</h4>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">6.8" QHD+ 120Hz display</p>
                  </div>
                </div>
              </div>
              <Link href="/category/samsung" className="inline-block bg-white text-black px-10 py-4 rounded-md text-lg font-semibold hover:bg-gray-200 transition-all">
                Shop Samsung
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gaming Section */}
      <section className="py-24 bg-gradient-to-br from-gray-950 via-red-950/20 to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full filter blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[128px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="bg-white text-black px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Gaming
              </span>
            </div>
            <h2 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(257deg, #e2e6ea 14.04%, #909fb0 30.93%, #fff 90.58%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Built for gamers
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              ROG Phone and gaming smartphones designed for maximum performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[products[2], products[3], products[4]].map((phone, index) => (
              <div
                key={index}
                className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:scale-105 transition-all duration-500 cursor-pointer hover:border-white hover:shadow-[0_0_35px_rgba(255,255,255,0.35)]"
              >
                <div className="h-96 overflow-hidden bg-gradient-to-br from-gray-900 to-black relative">
                  <img
                    src={phone.image}
                    alt={phone.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{phone.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {phone.specs ? phone.specs.slice(0, 3).map(s => s.value).join(' • ') : `${phone.brand} • Premium Gaming`}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-white">${phone.price}</span>
                    <Link href={`/shop/${phone.id}`} className="bg-black text-white px-6 py-3 rounded-lg font-semibold border border-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 hover:shadow-lg">
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
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            style={{
              background: 'linear-gradient(257deg, #e2e6ea 14.04%, #909fb0 30.93%, #fff 90.58%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Why shop with VeritaShop?
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Free Shipping</h3>
              <p className="text-gray-400">Free delivery on orders over $500</p>
            </div>
            <div className="text-center p-8 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">100% Authentic</h3>
              <p className="text-gray-400">All products are genuine and sealed</p>
            </div>
            <div className="text-center p-8 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Easy Returns</h3>
              <p className="text-gray-400">30-day return policy, no questions</p>
            </div>
            <div className="text-center p-8 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Warranty</h3>
              <p className="text-gray-400">Official manufacturer warranty</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-950">
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
