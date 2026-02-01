/**
 * Product Card Component with Variants
 * Renders product cards with different layouts based on theme settings
 * Uses variant prop instead of separate components to reduce duplication
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Helper to extract actual URL from nested objects
 */
function getImageUrl(imageItem) {
    if (!imageItem) return null;
    if (typeof imageItem === 'string') return imageItem;
    if (imageItem.url) return getImageUrl(imageItem.url);
    return null;
}

/**
 * Format price for display
 */
function formatPrice(price) {
    return `R ${Number(price).toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

/**
 * ProductCard Component
 * Supports three layout variants: default, overlay, minimal
 * 
 * @param {Object} props
 * @param {Object} props.product - Product data object
 * @param {string} props.basePath - Base path for product links
 * @param {string} props.variant - Override variant (optional, uses theme default)
 */
export default function ProductCard({
    product,
    basePath,
    variant: variantProp,
}) {
    const { productCardVariant: contextVariant } = useTheme();
    const variant = variantProp || contextVariant;

    const imageUrl = product.images?.[0] ? getImageUrl(product.images[0]) : null;
    const productPath = `${basePath}/product/${product.id}`;
    const inStock = product.inventory === null || product.inventory > 0;
    const lowStock = product.inventory !== null && product.inventory > 0 && product.inventory <= 5;

    // ===== VARIANT LAYOUTS =====

    const variants = {
        // Default: Card with image on top, info below
        default: (
            <Link
                to={productPath}
                className="group overflow-hidden block transition-shadow hover:shadow-lg"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                {/* Product Image */}
                <div
                    className="relative aspect-[3/4] overflow-hidden"
                    style={{ backgroundColor: 'var(--color-background)' }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package
                                size={48}
                                style={{ color: 'var(--color-text-muted)' }}
                            />
                        </div>
                    )}

                    {/* Stock Badge */}
                    {lowStock && (
                        <span
                            className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded"
                            style={{
                                backgroundColor: 'var(--color-warning)',
                                color: '#fff'
                            }}
                        >
                            Only {product.inventory} left!
                        </span>
                    )}
                    {!inStock && (
                        <span
                            className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded"
                            style={{
                                backgroundColor: 'var(--color-error)',
                                color: '#fff'
                            }}
                        >
                            Out of Stock
                        </span>
                    )}

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                        <span
                            className="px-6 py-3 font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform"
                            style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text)',
                                borderRadius: 'var(--radius-md)'
                            }}
                        >
                            Quick View
                        </span>
                    </div>
                </div>

                {/* Product Info */}
                <div style={{ padding: 'var(--spacing-card)' }}>
                    {product.category && (
                        <span
                            className="text-xs uppercase tracking-wider"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {product.category}
                        </span>
                    )}
                    <h3
                        className="font-semibold mt-1 mb-2 line-clamp-2 transition-colors group-hover:opacity-70"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {product.title}
                    </h3>
                    {product.description && (
                        <p
                            className="text-sm mb-3 line-clamp-2"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {product.description}
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <span
                            className="text-lg font-bold"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {formatPrice(product.price)}
                        </span>
                        {inStock && !lowStock && (
                            <span
                                className="text-xs font-medium"
                                style={{ color: 'var(--color-success)' }}
                            >
                                In Stock
                            </span>
                        )}
                    </div>

                    {/* Tags */}
                    {Array.isArray(product.tags) && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {product.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 text-xs"
                                    style={{
                                        backgroundColor: 'var(--color-background)',
                                        color: 'var(--color-text-muted)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        ),

        // Overlay: Image fills card, info overlays on hover
        overlay: (
            <Link
                to={productPath}
                className="group relative aspect-[3/4] overflow-hidden block"
                style={{ borderRadius: 'var(--radius-lg)' }}
            >
                {/* Background Image */}
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                    >
                        <Package
                            size={64}
                            style={{ color: 'var(--color-text-muted)' }}
                        />
                    </div>
                )}

                {/* Stock Badge */}
                {!inStock && (
                    <span
                        className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded"
                        style={{
                            backgroundColor: 'var(--color-error)',
                            color: '#fff'
                        }}
                    >
                        Sold Out
                    </span>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Info Overlay (visible on hover) */}
                <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    {product.category && (
                        <span className="text-xs text-white/70 uppercase tracking-wider">
                            {product.category}
                        </span>
                    )}
                    <h3 className="font-semibold text-white mt-1 mb-1 line-clamp-2">
                        {product.title}
                    </h3>
                    <span className="text-white/90 font-bold">
                        {formatPrice(product.price)}
                    </span>
                </div>

                {/* Always visible price badge (bottom right) */}
                <div
                    className="absolute bottom-3 right-3 px-3 py-1 text-sm font-bold group-hover:opacity-0 transition-opacity"
                    style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--radius-full)'
                    }}
                >
                    {formatPrice(product.price)}
                </div>
            </Link>
        ),

        // Minimal: Clean, simple layout with no effects
        minimal: (
            <Link
                to={productPath}
                className="group block"
            >
                {/* Product Image */}
                <div
                    className="aspect-square mb-3 overflow-hidden"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)'
                    }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package
                                size={32}
                                style={{ color: 'var(--color-text-muted)' }}
                            />
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <h3
                    className="text-sm font-medium mb-1 line-clamp-1 group-hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-text)' }}
                >
                    {product.title}
                </h3>
                <span
                    className="text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    {formatPrice(product.price)}
                </span>
                {!inStock && (
                    <span
                        className="block text-xs mt-1"
                        style={{ color: 'var(--color-error)' }}
                    >
                        Sold out
                    </span>
                )}
            </Link>
        ),
    };

    return variants[variant] || variants.default;
}
