import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Loader2, Package } from 'lucide-react';
import { useProducts } from '../../context/productcontext';

export default function StoreHome() {
  // Fetch real products from Supabase
  const { products, loading } = useProducts();

  // Helper to extract actual URL from nested objects or return string as-is
  const getImageUrl = (imageItem) => {
    if (!imageItem) return null;
    if (typeof imageItem === 'string') return imageItem;
    // Recursively extract URL from nested objects
    if (imageItem.url) return getImageUrl(imageItem.url);
    return null;
  };

  // Filter for active products and take first 4 for trending section
  const activeProducts = products.filter(p => p.is_active);
  const trendingProducts = activeProducts.slice(0, 4);

  return (
    <div className="bg-white">

      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] bg-gray-900 text-white overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-start">
          <span className="text-sm font-bold tracking-widest uppercase mb-4 text-gray-300">
            New Collection 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Redefine Your <br /> Everyday Style.
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-lg">
            Premium streetwear designed for comfort and durability.
            Discover the new drop before it sells out.
          </p>
          <Link
            to="/store/catalog"
            className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-gray-200 transition flex items-center gap-3"
          >
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* 2. TRENDING GRID */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
            <p className="text-gray-500">Our best-selling pieces this week.</p>
          </div>
          {activeProducts.length > 4 && (
            <Link to="/store/catalog" className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition">
              View All <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 mb-4 rounded-sm"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : trendingProducts.length === 0 ? (
          // Empty state
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Products Available Yet</h3>
            <p className="text-gray-500">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {trendingProducts.map((product) => {
              const imageUrl = product.images && product.images[0]
                ? getImageUrl(product.images[0])
                : null;

              return (
                <Link to={`/store/product/${product.id}`} key={product.id} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden rounded-sm">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Package className="text-gray-400" size={48} />
                      </div>
                    )}
                    {/* Quick Add Button (appears on hover) */}
                    <button className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 font-medium text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                      View Product
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition">{product.title}</h3>
                  <p className="text-gray-500 mt-1">R {Number(product.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile View All Button */}
        {!loading && activeProducts.length > 4 && (
          <div className="mt-8 md:hidden">
            <Link to="/store/catalog" className="block w-full text-center border border-gray-300 py-3 font-medium rounded">
              View All Products
            </Link>
          </div>
        )}
      </section>

      {/* 3. PROMO BANNER */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Join the Movement</h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Sign up for our newsletter and get 15% off your first order, plus early access to new drops.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:border-white w-full"
          />
          <button className="bg-white text-black px-6 py-3 font-bold rounded hover:bg-gray-200 transition whitespace-nowrap">
            Sign Up
          </button>
        </div>
      </section>

      {/* 4. TRUST BADGES */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-700">
              <Truck size={24} />
            </div>
            <h4 className="font-bold mb-2">Free Shipping</h4>
            <p className="text-sm text-gray-500">On all orders over R 1,500</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-700">
              <RefreshCw size={24} />
            </div>
            <h4 className="font-bold mb-2">Free Returns</h4>
            <p className="text-sm text-gray-500">30 days money-back guarantee</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-700">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold mb-2">Secure Payment</h4>
            <p className="text-sm text-gray-500">Protected by 256-bit SSL encryption</p>
          </div>
        </div>
      </section>

    </div>
  );
}