import React, { useState } from 'react';
import {
    Monitor,
    Smartphone,
    Tablet,
    ExternalLink
} from 'lucide-react';
import SectionRenderer from '../../../components/storefront/SectionRenderer';

/**
 * Live preview component that renders sections in real-time
 * Uses the actual SectionRenderer for accurate preview
 */
export default function LivePreview({
    sections,
    selectedSectionId,
    onSelectSection,
    merchantSlug,
    products = [],
    productsLoading = false
}) {
    const [device, setDevice] = useState('desktop');

    const deviceWidths = {
        desktop: 'w-full',
        tablet: 'w-[768px]',
        mobile: 'w-[375px]'
    };

    const basePath = `/s/${merchantSlug || 'preview'}`;

    return (
        <div className="h-full flex flex-col bg-gray-100">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-700">Live Preview</h3>
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

                        {/* Nav Preview */}
                        <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">Your Store</span>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>Home</span>
                                    <span>Catalog</span>
                                    <span>Cart</span>
                                </div>
                            </div>
                        </nav>

                        {/* Sections Preview */}
                        <div
                            className="transform-gpu"
                            style={{
                                transform: device !== 'desktop' ? 'scale(0.8)' : 'scale(1)',
                                transformOrigin: 'top center'
                            }}
                        >
                            <SectionRenderer
                                sections={sections}
                                basePath={basePath}
                                products={products}
                                productsLoading={productsLoading}
                                isEditing={true}
                                selectedSectionId={selectedSectionId}
                                onSectionClick={onSelectSection}
                            />
                        </div>

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
