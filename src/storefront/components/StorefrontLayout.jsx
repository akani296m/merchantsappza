/**
 * Storefront Layout
 * Main layout wrapper for customer-facing storefronts
 * Integrates theme system with variant-based header/footer
 */

import React, { useMemo, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useCart } from '../../context/cartcontext';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { MerchantProvider, useMerchant } from '../context/MerchantContext';
import { useSections } from '../../hooks/useSections';
import { getSectionComponent } from '../../components/storefront/sections';
import StorefrontNotFound from './StorefrontNotFound';
import Header from './Header';
import Footer from './Footer';
import { loadMetaPixel } from '../lib/metaPixel';
import { loadTikTokPixel } from '../lib/tiktokPixel';

// Default menu items (used as fallback when no config is saved)
const DEFAULT_HEADER_ITEMS = [
    { id: 'home', label: 'Home', path: '/', enabled: true, order: 0 },
    { id: 'products', label: 'Catalog', path: '/products', enabled: true, order: 1 },
];

const DEFAULT_FOOTER_ITEMS = [
    { id: 'new_arrivals', label: 'New Arrivals', section: 'Shop', path: '/products', enabled: true, order: 0 },
    { id: 'all_products', label: 'All Products', section: 'Shop', path: '/products', enabled: true, order: 1 },
    { id: 'shipping', label: 'Shipping Policy', section: 'Support', path: '/shipping', enabled: true, order: 2 },
    { id: 'privacy', label: 'Privacy Policy', section: 'Support', path: '/privacy', enabled: true, order: 3 },
];

/**
 * Inner layout component - renders after theme is applied
 */
function StorefrontLayoutContent() {
    const { getTotalItems } = useCart();
    const { merchant, merchantSlug, loading, notFound, isCustomDomain } = useMerchant();
    useTheme(); // Initialize theme CSS variables
    const cartCount = getTotalItems();

    const { sections, loading: sectionsLoading } = useSections(merchant?.id);

    // Load marketing pixels if available and active
    useEffect(() => {
        if (!merchant?.pixels) return;

        // Load Meta Pixel
        const metaPixel = merchant.pixels.find(p => p.platform === "meta" && p.is_active);
        if (metaPixel?.pixel_id) {
            loadMetaPixel(metaPixel.pixel_id);
        }

        // Load TikTok Pixel
        const tiktokPixel = merchant.pixels.find(p => p.platform === "tiktok" && p.is_active);
        if (tiktokPixel?.pixel_id) {
            loadTikTokPixel(tiktokPixel.pixel_id);
        }
    }, [merchant]);

    // Parse menu configuration
    const { headerItems, footerSections } = useMemo(() => {
        let headerConfig = DEFAULT_HEADER_ITEMS;
        let footerConfig = DEFAULT_FOOTER_ITEMS;

        if (merchant?.menu_config) {
            const config = typeof merchant.menu_config === 'string'
                ? JSON.parse(merchant.menu_config)
                : merchant.menu_config;

            if (config.header?.length > 0) headerConfig = config.header;
            if (config.footer?.length > 0) footerConfig = config.footer;
        }

        const enabledHeaderItems = headerConfig
            .filter(item => item.enabled)
            .sort((a, b) => a.order - b.order);

        const enabledFooterItems = footerConfig.filter(item => item.enabled);
        const sections = enabledFooterItems.reduce((acc, item) => {
            const section = item.section || 'Other';
            if (!acc[section]) acc[section] = [];
            acc[section].push(item);
            return acc;
        }, {});

        Object.keys(sections).forEach(key => {
            sections[key].sort((a, b) => a.order - b.order);
        });

        return {
            headerItems: enabledHeaderItems,
            footerSections: sections,
        };
    }, [merchant]);

    // Filter announcement bar sections
    const announcementBars = useMemo(() => {
        if (!sections || sections.length === 0) return [];
        return sections
            .filter(section => section.type === 'announcement_bar' && section.visible)
            .sort((a, b) => a.position - b.position);
    }, [sections]);

    // Loading state
    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-background)' }}
            >
                <Loader2
                    className="w-12 h-12 animate-spin"
                    style={{ color: 'var(--color-text-muted)' }}
                />
            </div>
        );
    }

    // Not found state
    if (notFound || !merchant) return <StorefrontNotFound />;

    const basePath = isCustomDomain ? '' : `/s/${merchantSlug}`;
    const storeName = merchant.store_name || merchant.business_name || 'Store';
    const logoUrl = merchant.logo_url;

    return (
        <div
            className="min-h-screen flex flex-col storefront-wrapper"
            style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-body-weight)'
            }}
        >
            {/* Global Typography Styles */}
            <style>{`
                .storefront-wrapper h1, 
                .storefront-wrapper h2, 
                .storefront-wrapper h3,
                .storefront-wrapper h4, 
                .storefront-wrapper h5, 
                .storefront-wrapper h6 {
                    font-family: var(--font-heading);
                    font-weight: var(--font-heading-weight);
                    color: var(--color-text);
                }
                .storefront-wrapper p, 
                .storefront-wrapper .product-description {
                    font-family: var(--font-paragraph);
                    font-weight: var(--font-paragraph-weight);
                }
                
                /* Surface utility class */
                .storefront-wrapper .surface {
                    background-color: var(--color-surface);
                }
                .storefront-wrapper .surface:hover {
                    background-color: var(--color-surface-hover);
                }
                
                /* Common button styles */
                .storefront-wrapper .btn-primary {
                    background-color: var(--color-primary);
                    color: var(--color-background);
                    padding: var(--button-padding);
                    font-size: var(--button-font-size);
                    border-radius: var(--button-radius);
                    font-weight: 600;
                    transition: opacity 0.2s;
                }
                .storefront-wrapper .btn-primary:hover {
                    opacity: 0.9;
                }
                .storefront-wrapper .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .storefront-wrapper .btn-secondary {
                    background-color: transparent;
                    color: var(--color-primary);
                    padding: var(--button-padding);
                    font-size: var(--button-font-size);
                    border-radius: var(--button-radius);
                    border: 1px solid var(--color-primary);
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .storefront-wrapper .btn-secondary:hover {
                    background-color: var(--color-primary);
                    color: var(--color-background);
                }
                
                /* Card styles */
                .storefront-wrapper .card {
                    background-color: var(--color-surface);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    padding: var(--spacing-card);
                }
                
                /* Section spacing */
                .storefront-wrapper section {
                    padding-top: var(--spacing-section);
                    padding-bottom: var(--spacing-section);
                }
                
                /* Container width */
                .storefront-wrapper .container {
                    max-width: var(--spacing-container);
                    margin-left: auto;
                    margin-right: auto;
                    padding-left: 1.5rem;
                    padding-right: 1.5rem;
                }
            `}</style>

            {/* Announcement Bars */}
            {!sectionsLoading && announcementBars.length > 0 && (
                <div className="w-full">
                    {announcementBars.map((section) => {
                        const AnnouncementBarComponent = getSectionComponent(section.type);
                        if (!AnnouncementBarComponent) return null;
                        return (
                            <AnnouncementBarComponent
                                key={section.id}
                                settings={section.settings}
                                basePath={basePath}
                            />
                        );
                    })}
                </div>
            )}

            {/* Header */}
            <Header
                storeName={storeName}
                logoUrl={logoUrl}
                basePath={basePath}
                headerItems={headerItems}
                cartCount={cartCount}
            />

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <Footer
                storeName={storeName}
                logoUrl={logoUrl}
                basePath={basePath}
                footerSections={footerSections}
            />
        </div>
    );
}

/**
 * Theme wrapper - applies theme after merchant data is loaded
 */
function StorefrontLayoutWithTheme() {
    const { merchant, loading, notFound } = useMerchant();

    // Show loading while fetching merchant
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            </div>
        );
    }

    // Handle not found before theme provider
    if (notFound || !merchant) {
        return <StorefrontNotFound />;
    }

    return (
        <ThemeProvider
            themePreset={merchant.theme}
            merchantSettings={merchant.theme_settings || {}}
        >
            <StorefrontLayoutContent />
        </ThemeProvider>
    );
}

/**
 * Main Storefront Layout export
 * Wraps with MerchantProvider first, then ThemeProvider
 */
export default function StorefrontLayout() {
    return (
        <MerchantProvider>
            <StorefrontLayoutWithTheme />
        </MerchantProvider>
    );
}