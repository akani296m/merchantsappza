import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Hero Section Component
 * Full-width hero banner with background image, title, subtitle, and CTA button
 */
export default function HeroSection({ settings = {}, basePath = '/store' }) {
    const {
        background_image = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        badge_text = 'New Collection 2024',
        title = 'Redefine Your Everyday Style.',
        subtitle = 'Premium streetwear designed for comfort and durability. Discover the new drop before it sells out.',
        button_text = 'Shop Now',
        button_link = '/catalog',
        overlay_opacity = 60,
        text_alignment = 'left' // 'left', 'center', 'right'
    } = settings;

    const alignmentClasses = {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right'
    };

    return (
        <section className="relative h-[80vh] bg-gray-900 text-white overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0">
                <img
                    src={background_image}
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                    style={{ opacity: overlay_opacity / 100 }}
                />
            </div>

            {/* Content */}
            <div className={`relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center ${alignmentClasses[text_alignment] || alignmentClasses.left}`}>
                {badge_text && (
                    <span className="text-sm font-bold tracking-widest uppercase mb-4 text-gray-300">
                        {badge_text}
                    </span>
                )}
                <h1
                    className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                    dangerouslySetInnerHTML={{
                        __html: title.replace(/\n/g, '<br />')
                    }}
                />
                {subtitle && (
                    <p className={`text-lg text-gray-200 mb-8 ${text_alignment === 'center' ? 'max-w-2xl mx-auto' : 'max-w-lg'}`}>
                        {subtitle}
                    </p>
                )}
                <Link
                    to={`${basePath}${button_link}`}
                    className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-gray-200 transition flex items-center gap-3 w-fit"
                >
                    {button_text} <ArrowRight size={20} />
                </Link>
            </div>
        </section>
    );
}

// Section metadata for the editor
HeroSection.sectionMeta = {
    type: 'hero',
    name: 'Hero Banner',
    description: 'Full-width hero section with background image and call-to-action',
    icon: 'Image',
    defaultSettings: {
        background_image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        badge_text: 'New Collection 2024',
        title: 'Redefine Your Everyday Style.',
        subtitle: 'Premium streetwear designed for comfort and durability. Discover the new drop before it sells out.',
        button_text: 'Shop Now',
        button_link: '/catalog',
        overlay_opacity: 60,
        text_alignment: 'left'
    },
    // Define the settings schema for the editor UI
    settingsSchema: [
        { key: 'background_image', type: 'image', label: 'Background Image', folder: 'hero' },
        { key: 'badge_text', type: 'text', label: 'Badge Text', placeholder: 'e.g., New Collection 2024' },
        { key: 'title', type: 'textarea', label: 'Title', placeholder: 'Enter headline...', hint: 'Use Enter for line breaks' },
        { key: 'subtitle', type: 'textarea', label: 'Subtitle', placeholder: 'Enter description...' },
        { key: 'button_text', type: 'text', label: 'Button Text', placeholder: 'Shop Now' },
        { key: 'button_link', type: 'text', label: 'Button Link', placeholder: '/catalog' },
        { key: 'overlay_opacity', type: 'range', label: 'Image Darkness', min: 0, max: 100 },
        {
            key: 'text_alignment', type: 'select', label: 'Text Alignment', options: [
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' }
            ]
        }
    ]
};
