import React, { useState } from 'react';
import { ChevronDown, Package, Truck, Sparkles, Shield, Info } from 'lucide-react';

/**
 * Available tab icons for the product tabs section
 */
export const PRODUCT_TAB_ICONS = {
    Package,
    Truck,
    Sparkles,
    Shield,
    Info
};

/**
 * Product Tabs Section Component
 * Displays product information (specs, shipping, care, warranty, etc.) in an accordion-style interface
 * Perfect for organizing detailed product information without overwhelming the user
 */
export default function ProductTabsSection({ settings = {}, product = null }) {
    const {
        title = 'Product Details',
        subtitle = '',
        tabs = [
            {
                label: 'Product Specifications',
                icon: 'Package',
                content: 'Detailed specifications about the product will appear here. Add dimensions, materials, weight, and other technical details.'
            },
            {
                label: 'Shipping & Returns',
                icon: 'Truck',
                content: 'Free standard shipping on orders over R 1,500. Express shipping available. 30-day return policy on all items in original condition.'
            },
            {
                label: 'Care Instructions',
                icon: 'Sparkles',
                content: 'To keep your product in perfect condition, follow these care instructions. Machine wash cold, tumble dry low. Do not bleach or iron.'
            }
        ],
        style = 'modern', // 'modern', 'minimal', 'bordered'
        allow_multiple_open = false, // whether multiple tabs can be open at once
        default_open_index = 0, // which tab should be open by default (-1 for none)
        background_color = '#ffffff',
        accent_color = '#000000',
        text_color = '#111827',
        border_color = '#E5E7EB',
        show_icons = true
    } = settings;

    // State to track which tabs are open
    const [openTabs, setOpenTabs] = useState(
        default_open_index >= 0 ? [default_open_index] : []
    );

    const toggleTab = (index) => {
        if (allow_multiple_open) {
            // Multiple tabs can be open at once
            setOpenTabs(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            );
        } else {
            // Only one tab can be open at a time
            setOpenTabs(prev =>
                prev.includes(index) ? [] : [index]
            );
        }
    };

    // Style variants for the tabs
    const getTabStyles = () => {
        switch (style) {
            case 'minimal':
                return {
                    container: 'border-b last:border-b-0',
                    header: 'py-5',
                    content: 'pb-6 pt-2'
                };
            case 'bordered':
                return {
                    container: 'border rounded-xl mb-3 last:mb-0 overflow-hidden',
                    header: 'px-6 py-5',
                    content: 'px-6 pb-6'
                };
            case 'modern':
            default:
                return {
                    container: 'bg-white border rounded-2xl mb-4 last:mb-0 overflow-hidden transition-all duration-300 hover:shadow-md',
                    header: 'px-6 py-5',
                    content: 'px-6 pb-6'
                };
        }
    };

    const tabStyles = getTabStyles();

    const renderTab = (tab, index) => {
        const isOpen = openTabs.includes(index);
        const IconComponent = show_icons && tab.icon ? PRODUCT_TAB_ICONS[tab.icon] : null;

        return (
            <div
                key={index}
                className={tabStyles.container}
                style={{
                    backgroundColor: style === 'modern' ? '#FAFAFA' : background_color,
                    borderColor: isOpen && style === 'bordered' ? accent_color : border_color,
                    borderWidth: style === 'minimal' ? '0 0 1px 0' : '1px'
                }}
            >
                <button
                    onClick={() => toggleTab(index)}
                    className={`w-full flex items-center justify-between text-left ${tabStyles.header} group transition-colors`}
                    aria-expanded={isOpen}
                    style={{
                        backgroundColor: isOpen && style === 'modern' ? background_color : undefined
                    }}
                >
                    <div className="flex items-center gap-3 flex-1">
                        {IconComponent && (
                            <div
                                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                                style={{
                                    backgroundColor: isOpen ? accent_color : `${accent_color}15`,
                                    color: isOpen ? '#ffffff' : accent_color
                                }}
                            >
                                <IconComponent size={20} />
                            </div>
                        )}
                        <span
                            className="font-semibold text-base md:text-lg transition-colors"
                            style={{ color: isOpen ? accent_color : text_color }}
                        >
                            {tab.label}
                        </span>
                    </div>

                    <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180' : ''
                            }`}
                        style={{
                            backgroundColor: isOpen ? `${accent_color}15` : 'rgba(0,0,0,0.05)',
                            color: isOpen ? accent_color : text_color
                        }}
                    >
                        <ChevronDown size={18} />
                    </div>
                </button>

                {/* Tab Content with smooth animation */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className={tabStyles.content}>
                        <div
                            className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: tab.content }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <section
            className="py-6"
            style={{ backgroundColor: background_color }}
        >
            <div>
                {/* Header */}
                {(title || subtitle) && (
                    <div className="mb-6">
                        {title && (
                            <h2
                                className="text-xl md:text-2xl font-bold mb-2"
                                style={{ color: text_color }}
                            >
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-gray-500 text-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div className="space-y-0">
                    {tabs.map((tab, index) => renderTab(tab, index))}
                </div>
            </div>
        </section>
    );
}

// Section metadata for the editor
ProductTabsSection.sectionMeta = {
    type: 'product_tabs',
    name: 'Product Tabs',
    description: 'Display product details in an accordion-style tabbed interface',
    icon: 'AlignLeft',
    pageTypes: ['product'], // Only available on product pages
    zone: 'inline', // Renders inside the product info column
    defaultSettings: {
        title: 'Product Details',
        subtitle: '',
        tabs: [
            {
                label: 'Product Specifications',
                icon: 'Package',
                content: '<p><strong>Material:</strong> Premium cotton blend</p><p><strong>Dimensions:</strong> 30cm x 40cm x 15cm</p><p><strong>Weight:</strong> 500g</p><p><strong>Color Options:</strong> Black, Navy, Grey</p>'
            },
            {
                label: 'Shipping & Returns',
                icon: 'Truck',
                content: '<p>📦 <strong>Free Standard Shipping</strong> on orders over R 1,500</p><p>✈️ <strong>Express Shipping</strong> available (1-2 business days)</p><p>🔄 <strong>30-Day Returns</strong> on all items in original condition</p><p>💯 <strong>100% Satisfaction Guarantee</strong></p>'
            },
            {
                label: 'Care Instructions',
                icon: 'Sparkles',
                content: '<p>To keep your product looking its best:</p><ul><li>Machine wash cold with like colors</li><li>Tumble dry on low heat</li><li>Do not bleach</li><li>Iron on low if needed</li><li>Store in a cool, dry place</li></ul>'
            },
            {
                label: 'Warranty & Support',
                icon: 'Shield',
                content: '<p><strong>1-Year Limited Warranty</strong></p><p>We stand behind our products. This item is covered by a 1-year warranty against manufacturing defects.</p><p><strong>Customer Support:</strong> Our team is here to help Monday-Friday, 9am-5pm SAST.</p>'
            }
        ],
        style: 'modern',
        allow_multiple_open: false,
        default_open_index: 0,
        background_color: '#ffffff',
        accent_color: '#000000',
        text_color: '#111827',
        border_color: '#E5E7EB',
        show_icons: true
    },
    settingsSchema: [
        { key: 'title', type: 'text', label: 'Section Title', placeholder: 'Product Details' },
        { key: 'subtitle', type: 'text', label: 'Section Subtitle', placeholder: 'Everything you need to know' },
        {
            key: 'tabs',
            type: 'array',
            label: 'Tabs',
            itemSchema: [
                { key: 'label', type: 'text', label: 'Tab Label', placeholder: 'Shipping & Returns' },
                {
                    key: 'icon',
                    type: 'select',
                    label: 'Icon',
                    options: [
                        { value: 'Package', label: '📦 Package' },
                        { value: 'Truck', label: '🚚 Truck/Shipping' },
                        { value: 'Sparkles', label: '✨ Sparkles/Care' },
                        { value: 'Shield', label: '🛡️ Shield/Warranty' },
                        { value: 'Info', label: 'ℹ️ Info' }
                    ]
                },
                {
                    key: 'content',
                    type: 'rich_text',
                    label: 'Content',
                    placeholder: 'Enter the tab content here. HTML is supported.',
                    rows: 5
                }
            ],
            maxItems: 8
        },
        {
            key: 'style',
            type: 'select',
            label: 'Style',
            options: [
                { value: 'modern', label: 'Modern (Cards with shadow)' },
                { value: 'minimal', label: 'Minimal (Simple lines)' },
                { value: 'bordered', label: 'Bordered (Outlined)' }
            ]
        },
        { key: 'allow_multiple_open', type: 'checkbox', label: 'Allow Multiple Tabs Open' },
        {
            key: 'default_open_index',
            type: 'number',
            label: 'Default Open Tab (0 = first, -1 = none)',
            min: -1,
            max: 7
        },
        { key: 'show_icons', type: 'checkbox', label: 'Show Tab Icons' },
        { key: 'background_color', type: 'color', label: 'Background Color' },
        { key: 'accent_color', type: 'color', label: 'Accent Color' },
        { key: 'text_color', type: 'color', label: 'Text Color' },
        { key: 'border_color', type: 'color', label: 'Border Color' }
    ]
};
