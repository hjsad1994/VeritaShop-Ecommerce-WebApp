'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import productService from '@/lib/api/productService';
import type { Product } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { addToCart, openCart } = useCart();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [productsError, setProductsError] = React.useState<string | null>(null);
  const [addingToCart, setAddingToCart] = React.useState<string | null>(null);
  const [lastClickedTime, setLastClickedTime] = React.useState<Record<string, number>>({});

  const rotatingWords = [
    "iPhone\n15 Pro Max",
    "Samsung\nGalaxy S24 Ultra",
    "ASUS ROG\nPhone 8",
    "Huawei\nPura 70 Ultra"
  ];

  const [currentWord, setCurrentWord] = React.useState(0);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [animateText, setAnimateText] = React.useState(true);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimateText(false);
      setTimeout(() => {
        setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
        setAnimateText(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(Math.min((winScroll / height) * 100, 100));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  React.useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        const featured = await productService.getProducts({
          limit: 8,
          isFeatured: true,
        });

        if (featured.products.length > 0) {
          setProducts(featured.products);
          return;
        }

        const latest = await productService.getProducts({
          limit: 8,
        });

        setProducts(latest.products);
      } catch (error) {
        console.error('Failed to fetch homepage products:', error);
        setProductsError('Unable to load products right now.');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  const formatCurrency = (value: string | number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black z-50 transform origin-left transition-transform duration-300"
           style={{ transform: `scaleX(${scrollProgress / 100})` }} />

      <Header isScrolled={isScrolled} theme="light" variant="solid-black" />

      {/* Hero Section - Brutalist Tech Aesthetic */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-black overflow-hidden">
        {/* Dynamic Grid Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Mouse-follower gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] transition-transform duration-1000 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)',
              left: `${mousePosition.x - 300}px`,
              top: `${mousePosition.y - 300}px`,
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

            {/* Left Column - Typography Heavy */}
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <div className="inline-block">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase text-blue-600 mb-2">
                    Premium Smartphones 2025
                  </p>
                </div>

                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
                  THE <br />
                  <span className="relative block h-[1.2em] overflow-hidden">
                    <span className={`absolute left-0 top-0 transition-all duration-700 ease-out whitespace-pre-line ${
                      animateText
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-full opacity-0'
                    }`}>
                      {rotatingWords[currentWord]}
                    </span>
                  </span>
                </h1>
              </div>

              <div className="space-y-6 max-w-lg">
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
                  Experience the pinnacle of mobile technology.
                  <span className="block text-black font-bold mt-2">Crafted for excellence.</span>
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/shop"
                    className="group relative overflow-hidden bg-black text-white px-12 py-5 rounded-full text-lg font-bold hover:shadow-2xl transition-all duration-500 flex items-center gap-3 border border-black"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Shop Collection
                      <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-black">50K+</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-black">4.9★</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-black">24/7</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Support</div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Showcase */}
            <div className="relative order-1 lg:order-2 h-[70vh] lg:h-[80vh] flex items-center justify-center">
              {/* Background Elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-black/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>

              {/* Product Image Container */}
              <div className="relative z-10 group">
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-blue-500/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="relative w-[350px] lg:w-[400px] h-[600px] lg:h-[700px]">
                  <Image
                    src="/images/iphone17.png"
                    alt="Premium Smartphone"
                    fill
                    priority
                    className="object-contain drop-shadow-2xl transition-transform duration-1000 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.src = 'https://images.unsplash.com/photo-1695048064555-7f2f29c9e588?w=800&h=1200&fit=crop&q=80';
                    }}
                  />

                  {/* Floating elements */}
                  <div className="absolute top-10 -left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute bottom-20 -right-10 w-16 h-16 bg-black rounded-full blur-lg opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Showcase - Asymmetrical Layout */}
      <section className="relative py-32 bg-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
          }}></div>
        </div>

        {/* Header - Constrained */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-0.5 bg-white"></div>
            <p className="text-sm font-bold tracking-[0.3em] uppercase">Explore Brands</p>
          </div>

          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
            SHOP BY <br /> <span className="text-blue-400">BRAND</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl">
            Premium smartphones from the world&apos;s leading manufacturers
          </p>
        </div>

        {/* Scrolling Brand Cards - Full Width */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>

          <div className="flex animate-scroll-left gap-8">
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex gap-8 px-4">
                  {[
                    {
                      name: 'iPhone',
                      tagline: 'Think Different',
                      bg: 'bg-gradient-to-br from-gray-900 to-gray-800',
                      img: '/images/iphone17.png',
                      link: '/category/iphone'
                    },
                    {
                      name: 'Samsung',
                      tagline: 'Next is Now',
                      bg: 'bg-gradient-to-br from-blue-900 to-blue-800',
                      img: '/images/samsungs24.jpg',
                      link: '/category/samsung'
                    },
                    {
                      name: 'ASUS ROG',
                      tagline: 'For Those Who Dare',
                      bg: 'bg-gradient-to-br from-red-900 to-red-800',
                      img: '/images/rogphone8.png',
                      link: '/category/gaming'
                    },
                    {
                      name: 'Huawei',
                      tagline: 'Make it Possible',
                      bg: 'bg-gradient-to-br from-purple-900 to-purple-800',
                      img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                      link: '/category/huawei'
                    },
                    {
                      name: 'Xiaomi',
                      tagline: 'Innovation For Everyone',
                      bg: 'bg-gradient-to-br from-orange-900 to-orange-800',
                      img: '/images/Xiaomi14.png',
                      link: '/category/xiaomi'
                    },
                    {
                      name: 'OnePlus',
                      tagline: 'Never Settle',
                      bg: 'bg-gradient-to-br from-red-900 to-pink-900',
                      img: '/images/oneplus12.png',
                      link: '/category/oneplus'
                    }
                  ].map((brand, index) => (
                    <Link
                      key={`${setIndex}-${index}`}
                      href={brand.link}
                      className={`group relative ${brand.bg} rounded-3xl p-8 hover:scale-105 transition-all duration-700 cursor-pointer min-w-[350px] border border-gray-800 hover:border-gray-600 overflow-hidden`}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                        <Image
                          src={brand.img}
                          alt={brand.name}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="350px"
                        />
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{brand.name}</h3>
                        <p className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-6">{brand.tagline}</p>
                        <div className="flex items-center gap-3 text-white group-hover:text-blue-400 transition-all duration-300">
                          <span className="text-sm font-bold uppercase tracking-wider">Explore</span>
                          <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
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
            animation: scroll-left 40s linear infinite;
          }
          .animate-scroll-left:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* Featured Products - Editorial Layout */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-20">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                <div className="w-20 h-0.5 bg-black"></div>
                <div>
                  <p className="text-sm font-bold tracking-[0.3em] uppercase text-red-600 mb-2">Limited Time</p>
                  <h2 className="text-5xl md:text-6xl font-black leading-[0.9] tracking-tighter">
                    HOT DEALS
                  </h2>
                </div>
              </div>
              <Link href="/shop" className="group flex items-center gap-3 text-black hover:text-blue-600 font-bold text-lg transition-all">
                View All
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          {productsLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : productsError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
              {productsError}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-gray-50 px-6 py-10 text-center text-gray-600">
              No live products available yet.
            </div>
          ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => {
              const getBadge = (product: Product) => {
                const basePrice = Number(product.basePrice);
                const finalPrice = Number(product.finalPrice || product.basePrice);

                if (product.discount > 0 && basePrice > finalPrice) {
                  const discount = Math.round(((basePrice - finalPrice) / basePrice) * 100);
                  if (discount >= 15) return { text: 'HOT DEAL', color: 'bg-gradient-to-r from-red-500 to-orange-500' };
                  return { text: 'SALE', color: 'bg-gradient-to-r from-orange-500 to-amber-500' };
                }
                if (['ASUS', 'RedMagic', 'Black Shark'].includes(product.brand.name)) {
                  return { text: 'GAMING', color: 'bg-gradient-to-r from-purple-500 to-indigo-500' };
                }
                if (product.isFeatured) return { text: 'FEATURED', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
                if (finalPrice >= 20000000) return { text: 'PREMIUM', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
                if (finalPrice <= 10000000) return { text: 'BEST VALUE', color: 'bg-gradient-to-r from-green-500 to-emerald-500' };
                return { text: 'NEW', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
              };

              const badge = getBadge(product);
              const basePrice = Number(product.basePrice);
              const finalPrice = Number(product.finalPrice || product.basePrice);
              const discount = product.discount > 0 && basePrice > finalPrice
                ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
                : 0;
              const productImages = product.images?.map((image) => image.url) || [];
              const primaryImage = product.primaryImage || product.images?.[0]?.url || '/placeholder.png';

              return (
                <div
                  key={product.id}
                  className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-gray-400 hover:shadow-2xl transition-all duration-700 cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                      unoptimized
                      sizes="(min-width: 1024px) 250px, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className={`absolute top-4 right-4 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg transform group-hover:scale-110 transition-transform`}>
                      {badge.text}
                    </div>

                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-white text-black border-2 border-black px-3 py-1 rounded-full text-xs font-black shadow-lg">
                        -{discount}%
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-white/90 to-transparent">
                      <Link href={`/shop/${product.slug}`} className="block w-full bg-black text-white py-3 rounded-full text-xs font-black hover:bg-blue-600 transition-all shadow-lg text-center uppercase tracking-wider">
                        Quick View
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-black text-black mb-3 line-clamp-2 min-h-[3rem] leading-tight">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < Math.round(Number(product.averageRating || 0)) ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-500 text-xs">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl font-black text-black">{formatCurrency(finalPrice)}</span>
                      {discount > 0 && (
                        <span className="text-base text-gray-400 line-through">{formatCurrency(basePrice)}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (addingToCart === product.id) return;

                        const now = Date.now();
                        const lastClick = lastClickedTime[product.id] || 0;
                        if (now - lastClick < 500) return;
                        setLastClickedTime({ ...lastClickedTime, [product.id]: now });

                        if (!isAuthenticated) {
                          sessionStorage.setItem('redirectPath', window.location.pathname);
                          window.location.href = '/login';
                          return;
                        }

                        setAddingToCart(product.id);
                        productService.getProductBySlug(product.slug)
                          .then(async (productDetail) => {
                            const variant = productDetail.variants?.find((item) => item.isActive);

                            if (!variant) {
                              toast.error('San pham nay chua co phien ban de them vao gio hang');
                              return;
                            }

                            await addToCart(variant.id, 1, {
                              id: variant.id,
                              productId: variant.productId,
                              color: variant.color,
                              storage: variant.storage || null,
                              price: Number(variant.price),
                              isActive: variant.isActive,
                              product: {
                                id: productDetail.id,
                                name: productDetail.name,
                                slug: productDetail.slug,
                                basePrice: Number(productDetail.basePrice),
                                images: (productDetail.images || []).map((image) => ({
                                  id: image.id,
                                  url: image.url,
                                  sortOrder: image.sortOrder,
                                })),
                              },
                            });

                            openCart();
                          })
                          .catch((error) => {
                            console.error('Failed to add homepage product to cart:', error);
                            toast.error('Khong the them vao gio hang luc nay');
                          })
                          .finally(() => {
                            setAddingToCart(null);
                            setTimeout(() => {
                              setLastClickedTime((prev) => ({ ...prev, [product.id]: 0 }));
                            }, 1000);
                          });
                      }}
                      disabled={addingToCart === product.id}
                      className={`w-full bg-black text-white py-4 rounded-full text-sm font-black hover:bg-blue-600 hover:scale-[1.02] transition-all duration-300 shadow-lg mt-auto uppercase tracking-wider border-2 border-black ${addingToCart === product.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* Categories - Bold Minimalist */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-0.5 bg-white"></div>
              <p className="text-sm font-bold tracking-[0.3em] uppercase">Categories</p>
              <div className="w-20 h-0.5 bg-white"></div>
            </div>

            <h2 className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-8">
              SHOP BY <span className="text-blue-400">CATEGORY</span>
            </h2>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore our curated collection of premium smartphones across different categories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "FLAGSHIP",
                subtitle: "The Best of the Best",
                image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop",
                link: "/shop"
              },
              {
                title: "GAMING",
                subtitle: "Ultimate Power",
                image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=800&fit=crop",
                link: "/shop"
              },
              {
                title: "VALUE",
                subtitle: "Smart Choice",
                image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&h=800&fit=crop",
                link: "/shop"
              }
            ].map((category, index) => (
              <Link key={index} href={category.link} className="group relative">
                <div className="relative rounded-3xl overflow-hidden h-[500px] hover:scale-[1.02] transition-all duration-700 shadow-2xl">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    unoptimized
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-4xl font-black mb-2 tracking-tighter">{category.title}</h3>
                    <p className="text-gray-400 mb-6 text-sm uppercase tracking-wider font-bold">{category.subtitle}</p>
                    <div className="flex items-center gap-3 text-white group-hover:text-blue-400 transition-all duration-300">
                      <span className="text-sm font-black uppercase tracking-wider">Shop Now</span>
                      <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* iPhone Feature Section - Editorial */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-0.5 bg-black"></div>
                <p className="text-sm font-bold tracking-[0.3em] uppercase text-blue-600">Apple</p>
              </div>

              <h2 className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tighter">
                THE IPHONE <br /> <span className="text-gray-400">EVERYONE&apos;S</span> <br /> TALKING ABOUT
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed font-light max-w-lg">
                Experience the power of the latest iPhone 15 series. A17 Pro chip, ProMotion display, and the best camera system ever.
              </p>

              <div className="space-y-4">
                {[
                  { title: "A17 Pro Chip", desc: "Console-level gaming and pro workflows" },
                  { title: "Pro Camera System", desc: "48MP main camera with 5x optical zoom" },
                  { title: "All-day Battery", desc: "Up to 29 hours video playback" }
                ].map((feature, index) => (
                  <div key={index} className="group border-l-2 border-transparent hover:border-black transition-all duration-300 pl-6 py-3">
                    <h4 className="font-black text-xl mb-1 group-hover:text-blue-600 transition-colors">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <Link href="/category/iphone" className="inline-block bg-black text-white px-12 py-5 rounded-full font-black hover:bg-blue-600 hover:shadow-2xl hover:scale-105 transition-all duration-500 uppercase tracking-wider text-sm border-2 border-black">
                Shop iPhone
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 hover:bg-gray-200 transition-all duration-700 group">
                <Image
                  src="https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=800&h=800&fit=crop"
                  alt="iPhone 15 Pro"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  unoptimized
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Bold Statement */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "500+", label: "Phone Models" },
              { number: "4.9★", label: "Average Rating" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-5xl md:text-6xl font-black mb-2 group-hover:text-blue-400 transition-colors duration-300">{stat.number}</div>
                <p className="text-gray-400 text-lg uppercase tracking-wider font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
