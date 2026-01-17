import React, { useState, useMemo } from 'react';
import {
    Monitor,
    Smartphone,
    Tablet,
    ExternalLink,
    Package,
    Search
} from 'lucide-react';
import SectionRenderer from '../../../components/storefront/SectionRenderer';
import { PAGE_TYPES, PAGE_TYPE_CONFIG, getSectionComponent } from '../../../components/storefront/sections';

/**
 * Live preview component that renders sections in real-time
 * Uses the actual SectionRenderer for accurate preview
 * Supports Home, Catalog, and Product page previews
 */
export default function LivePreview({
    sections,
    selectedSectionId,
    onSelectSection,
    merchantSlug,
    products = [],
    productsLoading = false,
    pageType = PAGE_TYPES.HOME
}) {
    const [device, setDevice] = useState('desktop');

    const deviceWidths = {
        desktop: 'w-full',
        tablet: 'w-[768px]',
        mobile: 'w-[375px]'
    };

    const basePath = `/s/${merchantSlug || 'preview'}`;
    const pageConfig = PAGE_TYPE_CONFIG[pageType];

    // Separate announcement bars from other sections
    const { announcementBars, otherSections } = useMemo(() => {
        const announcements = sections.filter(s => s.type === 'announcement_bar');
        const others = sections.filter(s => s.type !== 'announcement_bar');
        return {
            announcementBars: announcements,
            otherSections: others
        };
    }, [sections]);

    // Render page-specific content wrapper
    const renderPageContent = () => {
        switch (pageType) {
            case PAGE_TYPES.CATALOG:
                return (
                    <div className="bg-gray-50 min-h-[400px]">
                        {/* Catalog sections at top */}
                        <SectionRenderer
                            sections={otherSections}
                            basePath={basePath}
                            products={products}
                            productsLoading={productsLoading}
                            isEditing={true}
                            selectedSectionId={selectedSectionId}
                            onSectionClick={onSelectSection}
                        />

                        {/* Mock product grid preview */}
                        <div className="max-w-7xl mx-auto px-6 py-8">
                            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <div className="w-full h-10 bg-gray-100 rounded-lg pl-10 flex items-center text-gray-400 text-sm">
                                            Search products...
                                        </div>
                                    </div>
                                    <div className="h-10 w-32 bg-gray-100 rounded-lg"></div>
                                    <div className="h-10 w-32 bg-gray-100 rounded-lg"></div>
                                </div>
                            </div>

                            <div className={`grid gap-6 ${device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                                        <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                                            <Package className="text-gray-300" size={32} />
                                        </div>
                                        <div className="p-4">
                                            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                            <div className="h-4 bg-gray-100 rounded w-16"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case PAGE_TYPES.PRODUCT:
                return (
                    <div className="bg-white min-h-[400px]">
                        {/* Mock product detail layout */}
                        <div className="max-w-7xl mx-auto px-6 py-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Product image */}
                                <div className="aspect-[4/5] bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package className="text-gray-300" size={64} />
                                </div>

                                {/* Product info */}
                                <div className="space-y-6">
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                                        <div className="h-6 bg-green-100 rounded-full w-20"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                        <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1 h-12 bg-gray-900 rounded-lg"></div>
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                                    </div>

                                    {/* Product Trust Section placeholder - will be replaced by actual section */}
                                    <SectionRenderer
                                        sections={otherSections}
                                        basePath={basePath}
                                        products={products}
                                        productsLoading={productsLoading}
                                        isEditing={true}
                                        selectedSectionId={selectedSectionId}
                                        onSectionClick={onSelectSection}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case PAGE_TYPES.HOME:
            default:
                return (
                    <SectionRenderer
                        sections={otherSections}
                        basePath={basePath}
                        products={products}
                        productsLoading={productsLoading}
                        isEditing={true}
                        selectedSectionId={selectedSectionId}
                        onSectionClick={onSelectSection}
                    />
                );
        }
    };

    // Render announcement bars for the editor with editing indicators
    const renderAnnouncementBars = () => {
        return announcementBars.map((section) => {
            const AnnouncementComponent = getSectionComponent(section.type);
            if (!AnnouncementComponent) return null;

            const isSelected = selectedSectionId === section.id;
            const isHidden = !section.visible;

            return (
                <div
                    key={section.id}
                    className={`
                        relative transition-all duration-200
                        ${isHidden ? 'opacity-40' : ''}
                        ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                        ${onSelectSection ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => onSelectSection && onSelectSection(section.id)}
                >
                    {/* Hidden indicator badge */}
                    {isHidden && (
                        <div className="absolute top-2 right-2 z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                            Hidden
                        </div>
                    )}

                    {/* Section type label for editor */}
                    <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded capitalize">
                        {section.type.replace(/_/g, ' ')}
                    </div>

                    <AnnouncementComponent
                        settings={section.settings}
                        basePath={basePath}
                    />
                </div>
            );
        });
    };

    return (
        <div className="h-full flex flex-col bg-gray-100">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-700">
                        {pageConfig?.label || 'Live Preview'}
                    </h3>
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        Real-time
                    </span>
                </div>

                {/* Device Toggles */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setDevice('desktop')}
                        className={`p-2 rounded-md transition ${device === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                        title="Desktop view"
                    >
                        <Monitor size={18} className={device === 'desktop' ? 'text-blue-500' : 'text-gray-500'} />
                    </button>
                    <button
                        onClick={() => setDevice('tablet')}
                        className={`p-2 rounded-md transition ${device === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                        title="Tablet view"
                    >
                        <Tablet size={18} className={device === 'tablet' ? 'text-blue-500' : 'text-gray-500'} />
                    </button>
                    <button
                        onClick={() => setDevice('mobile')}
                        className={`p-2 rounded-md transition ${device === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                        title="Mobile view"
                    >
                        <Smartphone size={18} className={device === 'mobile' ? 'text-blue-500' : 'text-gray-500'} />
                    </button>
                </div>

                {/* Open in New Tab */}
                {merchantSlug && (
                    <a
                        href={basePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                    >
                        <span>Open Store</span>
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>

            {/* Preview Container */}
            <div className="flex-1 overflow-auto p-4 flex justify-center">
                <div
                    className={`${deviceWidths[device]} bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 origin-top`}
                    style={{
                        maxHeight: 'calc(100vh - 200px)',
                        transform: device !== 'desktop' ? 'scale(0.85)' : 'scale(1)'
                    }}
                >
                    {/* Mini Store Preview with Navbar */}
                    <div className="overflow-y-auto max-h-[calc(100vh-220px)]">

                        {/* Announcement Bars - ABOVE the navbar */}
                        {renderAnnouncementBars()}

                        {/* Nav Preview */}
                        <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">Your Store</span>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className={pageType === PAGE_TYPES.HOME ? 'text-black font-medium' : ''}>Home</span>
                                    <span className={pageType === PAGE_TYPES.CATALOG ? 'text-black font-medium' : ''}>Shop</span>
                                    <span>Cart</span>
                                </div>
                            </div>
                        </nav>

                        {/* Page Content */}
                        {renderPageContent()}

                        {/* Footer Preview */}
                        <footer className="bg-gray-50 py-6 px-6 text-center">
                            <p className="text-[10px] text-gray-400">
                                © 2024 Your Store. All rights reserved.
                            </p>
                        </footer>

                    </div>
                </div>
            </div>
        </div>
    );
}

