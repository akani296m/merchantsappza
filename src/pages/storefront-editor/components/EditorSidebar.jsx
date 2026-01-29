import React, { useState, useEffect } from 'react';
import {
    Loader2,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    GripVertical,
    Eye,
    EyeOff,
    Trash2,
    Copy,
    ChevronRight,
    Lock,
    Settings,
    Package,
    ChevronDown
} from 'lucide-react';
import SectionEditor from './SectionEditor';
import AddSectionModal from './AddSectionModal';
import BrandingSettings from './BrandingSettings';
import FontSettings from './FontSettings';
import { PAGE_TYPE_CONFIG, PAGE_TYPES } from '../../../components/storefront/sections';

// Section type to display name mapping
const SECTION_DISPLAY_NAMES = {
    hero: 'Hero',
    featured_products: 'Featured Products',
    newsletter: 'Newsletter',
    trust_badges: 'Trust Badges',
    rich_text: 'Rich Text',
    image_banner: 'Image Banner',
    collection_carousel: 'Collection Carousel',
    announcement_bar: 'Announcement Bar',
    header: 'Header',
    footer: 'Footer',
    us_vs_them: 'Us vs Them',
    testimonials: 'Testimonials'
};

/**
 * Editor Sidebar - Shopify-style Inspector
 * Features:
 * - Page Structure View (default) - shows section hierarchy by location
 * - Section Inspector View - edit one section at a time
 * - Theme Settings View - global styles (branding + fonts)
 */
export default function EditorSidebar({
    sections,
    selectedSectionId,
    onSelectSection,
    onUpdateSectionSetting,
    onToggleVisibility,
    onReorderSections,
    onAddSection,
    onDuplicateSection,
    onRemoveSection,
    saveSections,
    resetSections,
    saving,
    hasChanges,
    error,
    merchantSlug,
    pageType = 'home',
    // New props for product preview
    products = [],
    previewProduct = null,
    onPreviewProductChange = null
}) {
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Sidebar view state: 'page' | 'section' | 'theme'
    const [sidebarView, setSidebarView] = useState('page');

    // Auto-switch to section view when a section is selected
    useEffect(() => {
        if (selectedSectionId) {
            setSidebarView('section');
        }
    }, [selectedSectionId]);

    const selectedSection = sections.find(s => s.id === selectedSectionId);
    const pageConfig = PAGE_TYPE_CONFIG[pageType];

    // Helper to determine section location
    const getSectionLocation = (section) => {
        // Use explicit location if set
        if (section.location) return section.location;

        // Infer location from section type
        const headerTypes = ['announcement_bar', 'header'];
        const footerTypes = ['footer'];

        if (headerTypes.includes(section.type)) return 'header';
        if (footerTypes.includes(section.type)) return 'footer';
        return 'template';
    };

    // Group sections by location
    const headerSections = sections.filter(s => getSectionLocation(s) === 'header');
    const templateSections = sections.filter(s => getSectionLocation(s) === 'template');
    const footerSections = sections.filter(s => getSectionLocation(s) === 'footer');

    // Sort template sections by position
    const sortedTemplateSections = [...templateSections].sort((a, b) => a.position - b.position);

    const handleSave = async () => {
        setSaveError(null);
        console.log('Saving sections...', sections);

        const result = await saveSections();
        console.log('Save result:', result);

        if (result.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } else {
            setSaveError(result.error || 'Failed to save changes');
        }
    };

    const handleSelectSection = (sectionId) => {
        onSelectSection(sectionId);
        setSidebarView('section');
    };

    const handleBackToPage = () => {
        onSelectSection(null);
        setSidebarView('page');
    };

    const handleAddSection = (type) => {
        onAddSection(type);
        setTimeout(() => {
            const newSection = sections[sections.length - 1];
            if (newSection) {
                onSelectSection(newSection.id);
                setSidebarView('section');
            }
        }, 100);
    };

    // Drag and drop handlers for template sections
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('dragIndex', index.toString());
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('opacity-50');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-gray-100');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('bg-gray-100');
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-100');
        const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
        if (dragIndex !== dropIndex && onReorderSections) {
            onReorderSections(dragIndex, dropIndex);
        }
    };

    // Render a single section row
    const renderSectionRow = (section, options = {}) => {
        const { locked = false, draggable = false, index = 0 } = options;
        const isVisible = section.visible !== false;
        const displayName = SECTION_DISPLAY_NAMES[section.type] || section.type.replace(/_/g, ' ');

        return (
            <div
                key={section.id}
                draggable={draggable}
                onDragStart={draggable ? (e) => handleDragStart(e, index) : undefined}
                onDragEnd={draggable ? handleDragEnd : undefined}
                onDragOver={draggable ? handleDragOver : undefined}
                onDragLeave={draggable ? handleDragLeave : undefined}
                onDrop={draggable ? (e) => handleDrop(e, index) : undefined}
                onClick={() => handleSelectSection(section.id)}
                className={`
                    group flex items-center gap-3 px-3 py-2.5 bg-white rounded-lg border border-gray-200 
                    cursor-pointer transition-all hover:border-gray-300 hover:shadow-sm
                    ${!isVisible ? 'opacity-50' : ''}
                `}
            >
                {/* Drag Handle or Lock Icon */}
                {draggable ? (
                    <div
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={16} />
                    </div>
                ) : locked ? (
                    <div className="text-gray-300">
                        <Lock size={14} />
                    </div>
                ) : null}

                {/* Section Name */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 capitalize truncate">
                        {displayName}
                    </p>
                </div>

                {/* Action Buttons (only for non-locked sections) */}
                {!locked && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Visibility Toggle */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleVisibility && onToggleVisibility(section.id);
                            }}
                            className={`p-1.5 rounded hover:bg-gray-100 ${isVisible ? 'text-gray-400' : 'text-amber-500'}`}
                            title={isVisible ? 'Hide section' : 'Show section'}
                        >
                            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        {/* Duplicate */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateSection && onDuplicateSection(section.id);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                            title="Duplicate section"
                        >
                            <Copy size={14} />
                        </button>

                        {/* Delete */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to remove this section?')) {
                                    onRemoveSection && onRemoveSection(section.id);
                                }
                            }}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                            title="Remove section"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}

                {/* Chevron */}
                <ChevronRight size={16} className="text-gray-300" />
            </div>
        );
    };

    // Render Page Structure View
    const renderPageView = () => {
        // Helper to extract actual URL from nested objects
        const getImageUrl = (imageItem) => {
            if (!imageItem) return null;
            if (typeof imageItem === 'string') return imageItem;
            if (imageItem.url) return getImageUrl(imageItem.url);
            return null;
        };

        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Preview Product Selector - Only shown on Product Page */}
                {pageType === PAGE_TYPES.PRODUCT && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Package size={16} className="text-gray-500" />
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Preview Product
                            </h3>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-4">
                                <Package className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-sm text-gray-500">No products available</p>
                                <p className="text-xs text-gray-400 mt-1">Add products to preview this page</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    value={previewProduct?.id || ''}
                                    onChange={(e) => onPreviewProductChange && onPreviewProductChange(e.target.value || null)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-800 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                            </div>
                        )}

                        {/* Preview product thumbnail */}
                        {previewProduct && (
                            <div className="flex items-center gap-3 mt-3 p-2 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    {previewProduct.images && previewProduct.images.length > 0 ? (
                                        <img
                                            src={getImageUrl(previewProduct.images[0])}
                                            alt={previewProduct.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={16} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {previewProduct.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        R {Number(previewProduct.price || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mt-3">
                            This product is used only for preview. It does not affect your live store.
                        </p>
                    </div>
                )}

                {/* Header Sections (Locked) */}
                {headerSections.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Header</h3>
                            <Lock size={12} className="text-gray-400" />
                        </div>
                        <div className="space-y-2">
                            {headerSections.map((section) => renderSectionRow(section, { locked: true }))}
                        </div>
                    </div>
                )}

                {/* Template Sections (Editable, Draggable) */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Template</h3>
                    <div className="space-y-2">
                        {sortedTemplateSections.map((section, index) =>
                            renderSectionRow(section, { draggable: true, index })
                        )}

                        {/* Add Section Button - Only in Template group */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full mt-3 border border-dashed border-gray-300 py-3 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                        >
                            + Add section
                        </button>
                    </div>
                </div>

                {/* Footer Sections (Locked) */}
                {footerSections.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Footer</h3>
                            <Lock size={12} className="text-gray-400" />
                        </div>
                        <div className="space-y-2">
                            {footerSections.map((section) => renderSectionRow(section, { locked: true }))}
                        </div>
                    </div>
                )}

                {/* Theme Settings Link */}
                <button
                    onClick={() => setSidebarView('theme')}
                    className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <Settings size={16} />
                    <span className="underline">Theme settings</span>
                </button>
            </div>
        );
    };

    // Render Section Inspector View
    const renderSectionView = () => (
        <div className="flex-1 overflow-y-auto">
            {/* Back Button Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
                <button
                    onClick={handleBackToPage}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    <span>Back to sections</span>
                </button>
            </div>

            {/* Section Name Header */}
            {selectedSection && (
                <div className="px-4 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900 capitalize">
                        {SECTION_DISPLAY_NAMES[selectedSection.type] || selectedSection.type.replace(/_/g, ' ')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Section settings</p>
                </div>
            )}

            {/* Section Editor */}
            <div className="p-4">
                <SectionEditor
                    section={selectedSection}
                    onUpdateSetting={onUpdateSectionSetting}
                    onBack={handleBackToPage}
                    hideHeader={true}
                />
            </div>
        </div>
    );

    // Render Theme Settings View
    const renderThemeView = () => (
        <div className="flex-1 overflow-y-auto">
            {/* Back Button Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
                <button
                    onClick={() => {
                        setSidebarView('page');
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    <span>Back to sections</span>
                </button>
            </div>

            {/* Theme Settings Header */}
            <div className="px-4 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Theme settings</h2>
                <p className="text-xs text-gray-500 mt-0.5">Global styles and branding</p>
            </div>

            {/* Branding Settings */}
            <div className="border-b border-gray-100">
                <BrandingSettings />
            </div>

            {/* Font Settings */}
            <div>
                <FontSettings />
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#F6F6F7]">
            {/* Dynamic Content Based on View */}
            {sidebarView === 'page' && renderPageView()}
            {sidebarView === 'section' && renderSectionView()}
            {sidebarView === 'theme' && renderThemeView()}

            {/* Sticky Save Bar - Only in Page Structure View */}
            {sidebarView === 'page' && (
                <div className="p-4 border-t bg-white space-y-3">
                    {/* Status Messages */}
                    {(error || saveError) && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                            <AlertCircle size={16} />
                            <span>{error || saveError}</span>
                        </div>
                    )}

                    {saveSuccess && (
                        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                            <CheckCircle size={16} />
                            <span>Changes saved successfully!</span>
                        </div>
                    )}

                    {/* Unsaved Changes Warning */}
                    {hasChanges && (
                        <p className="text-xs text-amber-600 text-center">
                            Unsaved changes
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={resetSections}
                            disabled={!hasChanges || saving}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Add Section Modal */}
            <AddSectionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAddSection={handleAddSection}
                pageType={pageType}
            />
        </div>
    );
}
