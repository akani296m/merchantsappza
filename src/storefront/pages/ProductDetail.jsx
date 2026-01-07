import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Truck, ShieldCheck, ArrowLeft, Minus, Plus, Package, Loader2, Heart, Share2 } from 'lucide-react';
import { useMerchantProduct } from '../hooks/useMerchantProducts';
import { useCart } from '../../context/cartcontext';

export default function ProductDetail() {
    const { merchantSlug, productId } = useParams();
    const navigate = useNavigate();
    const { product, loading } = useMerchantProduct(productId);
    const { addToCart } = useCart();

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    // Base path for this merchant's storefront
    const basePath = `/s/${merchantSlug}`;

    // Helper to extract actual URL from nested objects or return string as-is
    const getImageUrl = (imageItem) => {
        if (!imageItem) return null;
        if (typeof imageItem === 'string') return imageItem;
        if (imageItem.url) return getImageUrl(imageItem.url);
        return null;
    };

    const handleAddToCart = () => {
        const productImages = product.images && Array.isArray(product.images) && product.images.length > 0
            ? product.images.map(img => getImageUrl(img)).filter(Boolean)
            : [];

        const cartItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            image: productImages[0] || null,
            inventory: product.inventory
        };

        addToCart(cartItem, quantity);

        // Show success feedback
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);

        // Ask user if they want to view cart or continue shopping
        const viewCart = window.confirm(`✓ Added ${quantity}x ${product.title} to cart!\n\nView cart now?`);
        if (viewCart) {
            navigate(`${basePath}/cart`);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title,
                    text: product.description,
                    url: url
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-center min-h-[500px]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    // Product not found
    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center py-20">
                    <Package className="mx-auto text-gray-300 mb-4" size={80} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-6">Sorry, we couldn't find the product you're looking for.</p>
                    <Link to={basePath} className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
                        <ArrowLeft size={18} />
                        Back to Store
                    </Link>
                </div>
            </div>
        );
    }

    // Extract and normalize product images
    const productImages = product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images.map(img => getImageUrl(img)).filter(Boolean)
        : [];

    const hasImages = productImages.length > 0;
    const inStock = product.inventory && product.inventory > 0;

    return (
        <div className="bg-white min-h-screen">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <button
                    onClick={() => navigate(basePath)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black transition mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Store
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

                    {/* --- LEFT: IMAGE GALLERY --- */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden relative group">
                            {hasImages ? (
                                <>
                                    <img
                                        src={productImages[activeImage]}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Favorite Button */}
                                    <button
                                        onClick={() => setIsFavorite(!isFavorite)}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Heart
                                            size={20}
                                            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                                        />
                                    </button>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                                    <Package className="text-gray-400 mb-2" size={64} />
                                    <span className="text-gray-500 text-sm">No image available</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {hasImages && productImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all hover:border-gray-400 ${activeImage === idx ? 'border-black' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT: PRODUCT INFO --- */}
                    <div className="flex flex-col">
                        {/* Category */}
                        {product.category && (
                            <span className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                                {product.category}
                            </span>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                            {product.title}
                        </h1>

                        {/* Price & Stock Status */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                            <span className="text-3xl font-bold">
                                R {Number(product.price).toLocaleString('en-ZA', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </span>
                            {inStock ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                    {product.inventory} in stock
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                                    Out of stock
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mb-8">
                                <h3 className="font-bold text-sm uppercase mb-3">Description</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Tags */}
                        {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-bold text-sm uppercase mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="space-y-4 mb-8">
                            {/* Quantity Selector */}
                            <div>
                                <label className="font-bold text-sm uppercase mb-3 block">Quantity</label>
                                <div className="flex items-center border border-gray-300 rounded-lg w-36 justify-between">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 transition rounded-l-lg"
                                        disabled={!inStock}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="font-medium text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => product.inventory ? Math.min(product.inventory, q + 1) : q + 1)}
                                        className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 transition rounded-r-lg"
                                        disabled={!inStock || (product.inventory && quantity >= product.inventory)}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!inStock}
                                    className="flex-1 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition py-4 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                                >
                                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-14 h-14 flex items-center justify-center border border-gray-300 rounded-lg hover:border-black transition"
                                    title="Share product"
                                >
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Trust Signals */}
                        <div className="border-t border-gray-200 pt-6 space-y-4 text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <Truck size={22} className="text-gray-800" />
                                <div>
                                    <p className="font-medium text-gray-900">Free Shipping</p>
                                    <p className="text-xs">On orders over R 1,500</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={22} className="text-gray-800" />
                                <div>
                                    <p className="font-medium text-gray-900">Secure Payment</p>
                                    <p className="text-xs">Protected checkout & 30-day returns</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Product Info Tabs */}
                <div className="mt-16 border-t pt-12">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold mb-6">Product Information</h2>
                        <div className="space-y-4 text-gray-600">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium text-gray-900">Product ID:</span>
                                    <span className="ml-2">#{product.id}</span>
                                </div>
                                {product.category && (
                                    <div>
                                        <span className="font-medium text-gray-900">Category:</span>
                                        <span className="ml-2">{product.category}</span>
                                    </div>
                                )}
                                {product.inventory !== null && (
                                    <div>
                                        <span className="font-medium text-gray-900">Availability:</span>
                                        <span className="ml-2">{product.inventory} units</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
