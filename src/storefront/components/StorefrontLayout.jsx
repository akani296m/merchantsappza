import React, { useMemo } from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useCart } from '../../context/cartcontext';
import { MerchantProvider, useMerchant } from '../context/MerchantContext';
import { useSections } from '../../hooks/useSections';
import { getSectionComponent } from '../../components/storefront/sections';
import StorefrontNotFound from './StorefrontNotFound';

// Default menu items (used as fallback when no config is saved)
const DEFAULT_HEADER_ITEMS = [
    { id: 'home', label: 'Home', path: '/', enabled: true, order: 0 },
    { id: 'products', label: 'Catalog', path: '/products', enabled: true, order: 1 },
];

const DEFAULT_FOOTER_ITEMS = [
    // Shop section
    { id: 'new_arrivals', label: 'New Arrivals', section: 'Shop', path: '/products', enabled: true, order: 0 },
    { id: 'all_products', label: 'All Products', section: 'Shop', path: '/products', enabled: true, order: 1 },
    // Support section
    { id: 'shipping', label: 'Shipping Policy', section: 'Support', path: '/shipping', enabled: true, order: 2 },
    { id: 'privacy', label: 'Privacy Policy', section: 'Support', path: '/privacy', enabled: true, order: 3 },
];

/**
 * Helper function to build the correct path for menu items
 */
function buildMenuPath(basePath, itemPath) {
    // Handle root path
    if (itemPath === '/') {
        return basePath || '/';
    }
    // Combine basePath with itemPath
    return `${basePath}${itemPath}`;
}

/**
 * Inner layout component that uses the merchant context
 */
function StorefrontLayoutInner() {
    const { getTotalItems } = useCart();
    const { merchant, merchantSlug, loading, notFound, isCustomDomain } = useMerchant();
    const cartCount = getTotalItems();

    // Fetch sections for announcement bars
    const { sections, loading: sectionsLoading } = useSections(merchant?.id);

    // Parse menu configuration with fallbacks
    const { headerItems, footerSections } = useMemo(() => {
        let headerConfig = DEFAULT_HEADER_ITEMS;
        let footerConfig = DEFAULT_FOOTER_ITEMS;

        if (merchant?.menu_config) {
            const config = typeof merchant.menu_config === 'string'
                ? JSON.parse(merchant.menu_config)
                : merchant.menu_config;

            if (config.header && config.header.length > 0) {
                headerConfig = config.header;
            }
            if (config.footer && config.footer.length > 0) {
                footerConfig = config.footer;
            }
        }

        // Filter enabled items and sort by order
        const enabledHeaderItems = headerConfig
            .filter(item => item.enabled)
            .sort((a, b) => a.order - b.order);

        // Group footer items by section
        const enabledFooterItems = footerConfig.filter(item => item.enabled);
        const sections = enabledFooterItems.reduce((acc, item) => {
            const section = item.section || 'Other';
            if (!acc[section]) acc[section] = [];
            acc[section].push(item);
            return acc;
        }, {});

        // Sort items within each section
        Object.keys(sections).forEach(key => {
            sections[key].sort((a, b) => a.order - b.order);
        });

        return {
            headerItems: enabledHeaderItems,
            footerSections: sections,
        };
    }, [merchant?.menu_config]);

    // Extract announcement bar sections
    const announcementBars = useMemo(() => {
        if (!sections || sections.length === 0) return [];

        return sections
            .filter(section => section.type === 'announcement_bar' && section.visible)
            .sort((a, b) => a.position - b.position);
    }, [sections]);

    // Show loading state while fetching merchant
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            </div>
        );
    }

    // Show 404 if merchant not found
    if (notFound || !merchant) {
        return <StorefrontNotFound />;
    }

    // Build base path for this merchant's storefront
    // If on custom domain, use root path. Otherwise use /s/:slug
    const basePath = isCustomDomain ? '' : `/s/${merchantSlug}`;

    // Get merchant branding (with fallbacks)
    const storeName = merchant.store_name || merchant.business_name || 'Store';
    const logoUrl = merchant.logo_url;

    // Font configuration mapping
    const FONT_FAMILIES = {
        'Poppins': 'Poppins, sans-serif',
        'Inter': 'Inter, sans-serif',
        'System Default': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    };

    // Extract font settings with fallbacks
    const fontHeading = FONT_FAMILIES[merchant.font_heading] || FONT_FAMILIES['Poppins'];
    const fontBody = FONT_FAMILIES[merchant.font_body] || FONT_FAMILIES['Poppins'];
    const fontParagraph = FONT_FAMILIES[merchant.font_paragraph] || FONT_FAMILIES['Poppins'];

    const fontHeadingWeight = merchant.font_heading_weight || '700';
    const fontBodyWeight = merchant.font_body_weight || '400';
    const fontParagraphWeight = merchant.font_paragraph_weight || '400';

    // CSS custom properties for fonts (applied to the storefront wrapper)
    const fontStyles = {
        '--font-heading': fontHeading,
        '--font-body': fontBody,
        '--font-paragraph': fontParagraph,
        '--font-heading-weight': fontHeadingWeight,
        '--font-body-weight': fontBodyWeight,
        '--font-paragraph-weight': fontParagraphWeight,
    };

    return (
        <div
            className="min-h-screen flex flex-col text-gray-900 bg-white storefront-wrapper"
            style={{
                ...fontStyles,
                fontFamily: fontBody,
                fontWeight: fontBodyWeight,
            }}
        >
            {/* Global font styles for this storefront */}
            <style>{`
                .storefront-wrapper h1,
                .storefront-wrapper h2,
                .storefront-wrapper h3,
                .storefront-wrapper h4,
                .storefront-wrapper h5,
                .storefront-wrapper h6 {
                    font-family: var(--font-heading);
                    font-weight: var(--font-heading-weight);
                }
                
                .storefront-wrapper p,
                .storefront-wrapper .product-description {
                    font-family: var(--font-paragraph);
                    font-weight: var(--font-paragraph-weight);
                }
            `}</style>

            {/* --- ANNOUNCEMENT BARS (Above Everything) --- */}
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

            {/* --- STORE NAVIGATION --- */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    {/* Logo / Store Name */}
                    <Link to={basePath || '/'} className="text-xl font-bold tracking-widest uppercase">
                        {logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="h-8 max-w-[150px] object-contain" />
                        ) : (
                            <>
                                {storeName}<span className="text-gray-400">.</span>
                            </>
                        )}
                    </Link>

                    {/* Desktop Links - Dynamic from menu config */}
                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
                        {headerItems.map((item) => (
                            <Link
                                key={item.id}
                                to={buildMenuPath(basePath, item.path)}
                                className="hover:text-gray-500 transition"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-6">
                        <button className="hover:text-gray-500"><Search size={20} /></button>
                        <Link to={`${basePath}/cart`} className="hover:text-gray-500 relative">
                            <img src="/assets/icons/cart.svg" alt="Cart" className="w-5 h-5" />
                            {/* Dynamic Cart Badge */}
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- PAGE CONTENT GOES HERE --- */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* --- STORE FOOTER --- */}
            <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Store Info Column */}
                    <div>
                        <h4 className="font-bold mb-4">{storeName}.</h4>
                        <p className="text-sm text-gray-500">Redefining modern commerce.</p>
                    </div>

                    {/* Dynamic Footer Sections from menu config */}
                    {Object.entries(footerSections).map(([sectionName, items]) => (
                        <div key={sectionName}>
                            <h4 className="font-bold mb-4 text-sm uppercase">{sectionName}</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            to={buildMenuPath(basePath, item.path)}
                                            className="hover:text-gray-700 transition"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter Column (always shown) */}
                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase">Newsletter</h4>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="bg-white border p-2 w-full text-sm" />
                            <button className="bg-black text-white px-4 text-sm">Join</button>
                        </div>
                    </div>
                </div>
                <div className="text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} {storeName}. All rights reserved.
                </div>
            </footer>

        </div>
    );
}

/**
 * Main StorefrontLayout that wraps the inner layout with MerchantProvider
 */
export default function StorefrontLayout() {
    return (
        <MerchantProvider>
            <StorefrontLayoutInner />
        </MerchantProvider>
    );
}
