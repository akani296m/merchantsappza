import React, { useMemo } from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
// NEW: Import social icons for the footer design
import { FaXTwitter, FaLinkedin, FaInstagram, FaYoutube, FaPinterest } from "react-icons/fa6";

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
    { id: 'new_arrivals', label: 'New Arrivals', section: 'Shop', path: '/products', enabled: true, order: 0 },
    { id: 'all_products', label: 'All Products', section: 'Shop', path: '/products', enabled: true, order: 1 },
    { id: 'shipping', label: 'Shipping Policy', section: 'Support', path: '/shipping', enabled: true, order: 2 },
    { id: 'privacy', label: 'Privacy Policy', section: 'Support', path: '/privacy', enabled: true, order: 3 },
];

function buildMenuPath(basePath, itemPath) {
    if (itemPath === '/') return basePath || '/';
    return `${basePath}${itemPath}`;
}

function StorefrontLayoutInner() {
    const { getTotalItems } = useCart();
    const { merchant, merchantSlug, loading, notFound, isCustomDomain } = useMerchant();
    const cartCount = getTotalItems();

    const { sections, loading: sectionsLoading } = useSections(merchant?.id);

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
    }, [merchant?.menu_config]);

    const announcementBars = useMemo(() => {
        if (!sections || sections.length === 0) return [];
        return sections
            .filter(section => section.type === 'announcement_bar' && section.visible)
            .sort((a, b) => a.position - b.position);
    }, [sections]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            </div>
        );
    }

    if (notFound || !merchant) return <StorefrontNotFound />;

    const basePath = isCustomDomain ? '' : `/s/${merchantSlug}`;
    const storeName = merchant.store_name || merchant.business_name || 'Store';
    const logoUrl = merchant.logo_url;

    // Font configuration
    const FONT_FAMILIES = {
        'Poppins': 'Poppins, sans-serif',
        'Inter': 'Inter, sans-serif',
        'System Default': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    };

    const fontHeading = FONT_FAMILIES[merchant.font_heading] || FONT_FAMILIES['Poppins'];
    const fontBody = FONT_FAMILIES[merchant.font_body] || FONT_FAMILIES['Poppins'];
    const fontParagraph = FONT_FAMILIES[merchant.font_paragraph] || FONT_FAMILIES['Poppins'];

    const fontStyles = {
        '--font-heading': fontHeading,
        '--font-body': fontBody,
        '--font-paragraph': fontParagraph,
        '--font-heading-weight': merchant.font_heading_weight || '700',
        '--font-body-weight': merchant.font_body_weight || '400',
        '--font-paragraph-weight': merchant.font_paragraph_weight || '400',
    };

    return (
        <div
            className="min-h-screen flex flex-col text-gray-900 bg-white storefront-wrapper"
            style={{ ...fontStyles, fontFamily: fontBody, fontWeight: merchant.font_body_weight || '400' }}
        >
            <style>{`
                .storefront-wrapper h1, .storefront-wrapper h2, .storefront-wrapper h3,
                .storefront-wrapper h4, .storefront-wrapper h5, .storefront-wrapper h6 {
                    font-family: var(--font-heading);
                    font-weight: var(--font-heading-weight);
                }
                .storefront-wrapper p, .storefront-wrapper .product-description {
                    font-family: var(--font-paragraph);
                    font-weight: var(--font-paragraph-weight);
                }
            `}</style>

            {/* --- ANNOUNCEMENT BARS --- */}
            {!sectionsLoading && announcementBars.length > 0 && (
                <div className="w-full">
                    {announcementBars.map((section) => {
                        const AnnouncementBarComponent = getSectionComponent(section.type);
                        if (!AnnouncementBarComponent) return null;
                        return <AnnouncementBarComponent key={section.id} settings={section.settings} basePath={basePath} />;
                    })}
                </div>
            )}

            {/* --- NAV --- */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to={basePath || '/'} className="text-xl font-bold tracking-widest uppercase">
                        {logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="h-8 max-w-[150px] object-contain" />
                        ) : (
                            <>{storeName}<span className="text-gray-400">.</span></>
                        )}
                    </Link>

                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
                        {headerItems.map((item) => (
                            <Link key={item.id} to={buildMenuPath(basePath, item.path)} className="hover:text-gray-500 transition">
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="hover:text-gray-500"><Search size={20} /></button>
                        <Link to={`${basePath}/cart`} className="hover:text-gray-500 relative">
                            <img src="/assets/icons/cart.svg" alt="Cart" className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>
{/* --- NEW DARK FOOTER (FIXED LAYOUT) --- */}
<footer className="bg-black text-white pt-16 pb-8 px-6 md:px-12 lg:px-20 font-sans">
                {/* TOP GRID SECTION - Using 12 columns for better spacing control */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
                    
                    {/* Column 1: Store Branding (Increased width to col-span-4 to prevent overlap) */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-4">
                        <div className="flex flex-col items-start gap-4 mb-6">
                            {logoUrl ? (
                                <img src={logoUrl} alt={storeName} className="h-12 object-contain bg-white rounded p-1" />
                            ) : (
                                <div className="px-4 py-2 bg-white rounded-md flex items-center justify-center">
                                    <span className="text-black font-bold text-xl tracking-tighter uppercase">{storeName}</span>
                                </div>
                            )}
                            {/* Optional: Only show text if logo isn't present, or style it smaller */}
                            <span className="text-lg font-bold tracking-widest uppercase">{storeName}</span>
                        </div>
                    </div>

                    {/* Dynamic Links from Config (Allocating 2 columns each) */}
                    {Object.entries(footerSections).map(([sectionName, items]) => (
                        <div key={sectionName} className="col-span-6 md:col-span-3 lg:col-span-2">
                            <h3 className="font-bold text-lg mb-6 capitalize">{sectionName}</h3>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            to={buildMenuPath(basePath, item.path)}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Socials (Allocating remaining space) */}
                    <div className="col-span-12 md:col-span-12 lg:col-span-4 lg:text-right">
                        <h3 className="font-bold text-lg mb-6">Let's be social</h3>
                        <div className="flex gap-4 lg:justify-end">
                            {[FaXTwitter, FaLinkedin, FaInstagram, FaYoutube, FaPinterest].map((Icon, i) => (
                                <a key={i} href="#" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION */}
                <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row justify-between items-start md:items-end gap-10 border-t border-gray-800 pt-8">
                    
                    {/* Left: Legal & Copyright */}
                    <div className="flex flex-col gap-2 text-sm text-gray-400">
                        <div className="flex gap-6">
                            <Link to={`${basePath}/privacy`} className="hover:text-white transition">Privacy Policy</Link>
                            <Link to={`${basePath}/terms`} className="hover:text-white transition">Terms of Service</Link>
                        </div>
                        <p className="mt-4 text-gray-500">© {new Date().getFullYear()}, {storeName}</p>
                    </div>

                    {/* Right: Newsletter */}
                    <div className="w-full md:w-auto">
                        <form className="flex w-full md:w-[400px] gap-2" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                className="flex-1 bg-transparent border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                            />
                            <button className="bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-200 transition">
                                Join
                            </button>
                        </form>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function StorefrontLayout() {
    return (
        <MerchantProvider>
            <StorefrontLayoutInner />
        </MerchantProvider>
    );
}