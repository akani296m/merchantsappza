import React, { useState } from 'react';
import {
    Monitor,
    Smartphone,
    Tablet,
    ExternalLink,
    ArrowRight,
    Truck,
    RefreshCw,
    ShieldCheck,
    Clock,
    Heart,
    Star,
    Award,
    Headphones,
    Package
} from 'lucide-react';

// Icon mapping for trust badges
const ICON_MAP = {
    Truck: Truck,
    RefreshCw: RefreshCw,
    ShieldCheck: ShieldCheck,
    Clock: Clock,
    Heart: Heart,
    Star: Star,
    Award: Award,
    Headphones: Headphones
};

/**
 * Live preview component that renders a mini version of StoreHome
 */
export default function LivePreview({ settings, merchantSlug }) {
    const [device, setDevice] = useState('desktop');

    const deviceWidths = {
        desktop: 'w-full',
        tablet: 'w-[768px]',
        mobile: 'w-[375px]'
    };

    const storeName = 'Your Store';
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
                        transform: device !== 'desktop' ? 'scale(0.9)' : 'scale(1)'
                    }}
                >
                    {/* Mini Store Preview */}
                    <div className="overflow-y-auto max-h-[calc(100vh-220px)]">

                        {/* Nav Preview */}
                        <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
                            <div className="flex items-center justify-between">
                                {settings.logo_url ? (
                                    <img src={settings.logo_url} alt="Logo" className="h-6 max-w-[100px] object-contain" />
                                ) : (
                                    <span className="font-bold text-sm">{storeName}</span>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>Home</span>
                                    <span>Catalog</span>
                                </div>
                            </div>
                        </nav>

                        {/* Hero Section Preview */}
                        <section
                            className="relative h-[200px] md:h-[300px] text-white overflow-hidden"
                            style={{ backgroundColor: settings.primary_color || '#1a1a1a' }}
                        >
                            {settings.hero_image_url && (
                                <div className="absolute inset-0">
                                    <img
                                        src={settings.hero_image_url}
                                        alt="Hero"
                                        className="w-full h-full object-cover opacity-60"
                                    />
                                </div>
                            )}
                            <div className="relative h-full flex flex-col justify-center px-6">
                                <span className="text-[10px] font-bold tracking-widest uppercase mb-2 text-gray-300">
                                    New Collection 2024
                                </span>
                                <h1 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
                                    {settings.hero_title || 'Your Hero Title'}
                                </h1>
                                <p className="text-xs text-gray-200 mb-4 max-w-sm line-clamp-2">
                                    {settings.hero_subtitle || 'Your hero subtitle goes here...'}
                                </p>
                                <button
                                    className="self-start px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                                    style={{
                                        backgroundColor: 'white',
                                        color: settings.primary_color || '#000'
                                    }}
                                >
                                    Shop Now <ArrowRight size={14} />
                                </button>
                            </div>
                        </section>

                        {/* Trending Section Preview */}
                        <section className="py-8 px-6">
                            <h2 className="text-lg font-bold mb-4">Trending Now</h2>
                            <div className={`grid gap-4 ${device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="group">
                                        <div className="aspect-[3/4] bg-gray-100 rounded mb-2 flex items-center justify-center">
                                            <Package className="text-gray-300" size={24} />
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Email Capture Section Preview */}
                        <section
                            className="py-12 px-6 text-center text-white"
                            style={{ backgroundColor: settings.primary_color || '#000' }}
                        >
                            <h2 className="text-lg font-bold mb-2">
                                {settings.email_capture_title || 'Join the Movement'}
                            </h2>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4 line-clamp-2">
                                {settings.email_capture_subtitle || 'Sign up for our newsletter...'}
                            </p>
                            <div className="flex gap-2 justify-center max-w-xs mx-auto">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded text-xs"
                                    disabled
                                />
                                <button
                                    className="px-4 py-2 rounded text-xs font-bold"
                                    style={{
                                        backgroundColor: 'white',
                                        color: settings.primary_color || '#000'
                                    }}
                                >
                                    {settings.email_capture_button_text || 'Sign Up'}
                                </button>
                            </div>
                        </section>

                        {/* Trust Badges Section Preview */}
                        <section className="py-8 px-6 border-b border-gray-100">
                            <div className={`grid gap-4 text-center ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                {settings.trust_badges?.map((badge, index) => {
                                    const IconComponent = ICON_MAP[badge.icon] || ShieldCheck;
                                    return (
                                        <div key={index} className="flex flex-col items-center">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                                                style={{ backgroundColor: `${settings.accent_color}20` }}
                                            >
                                                <IconComponent
                                                    size={18}
                                                    style={{ color: settings.accent_color || '#3b82f6' }}
                                                />
                                            </div>
                                            <h4 className="text-xs font-bold">{badge.title}</h4>
                                            <p className="text-[10px] text-gray-500">{badge.subtitle}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Footer Preview */}
                        <footer className="bg-gray-50 py-6 px-6 text-center">
                            <p className="text-[10px] text-gray-400">
                                © 2024 {storeName}. All rights reserved.
                            </p>
                        </footer>

                    </div>
                </div>
            </div>
        </div>
    );
}
