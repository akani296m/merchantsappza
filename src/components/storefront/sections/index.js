/**
 * Section Registry
 * Central registry for all storefront section components
 * 
 * This module exports:
 * - Individual section components
 * - A registry object for dynamic section rendering
 * - Helper functions for the editor
 * - Page type constants
 */

// Import all section components
import HeroSection from './HeroSection';
import FeaturedProductsSection from './FeaturedProductsSection';
import NewsletterSection from './NewsletterSection';
import TrustBadgesSection, { TRUST_BADGE_ICONS } from './TrustBadgesSection';
import RichTextSection from './RichTextSection';
import ImageBannerSection from './ImageBannerSection';
import CatalogHeaderSection from './CatalogHeaderSection';
import ProductTrustSection, { PRODUCT_TRUST_ICONS } from './ProductTrustSection';
import RelatedProductsSection from './RelatedProductsSection';

/**
 * Page Types
 * Different pages that can have customizable sections
 */
export const PAGE_TYPES = {
    HOME: 'home',
    CATALOG: 'catalog',
    PRODUCT: 'product'
};

/**
 * Page Type Labels and Icons
 */
export const PAGE_TYPE_CONFIG = {
    [PAGE_TYPES.HOME]: {
        label: 'Home Page',
        icon: 'Home',
        description: 'Your storefront homepage'
    },
    [PAGE_TYPES.CATALOG]: {
        label: 'Catalog Page',
        icon: 'LayoutGrid',
        description: 'Product listing/shop all page'
    },
    [PAGE_TYPES.PRODUCT]: {
        label: 'Product Page',
        icon: 'Package',
        description: 'Individual product detail page'
    }
};

/**
 * Section Registry
 * Maps section type strings to their React components
 */
export const SECTION_REGISTRY = {
    // Home page sections (also available on other pages)
    hero: HeroSection,
    featured_products: FeaturedProductsSection,
    newsletter: NewsletterSection,
    trust_badges: TrustBadgesSection,
    rich_text: RichTextSection,
    image_banner: ImageBannerSection,

    // Catalog page sections
    catalog_header: CatalogHeaderSection,

    // Product page sections
    product_trust: ProductTrustSection,
    related_products: RelatedProductsSection,
};

/**
 * Get a section component by type
 * @param {string} type - The section type identifier
 * @returns {React.Component|null} The section component or null if not found
 */
export const getSectionComponent = (type) => {
    return SECTION_REGISTRY[type] || null;
};

/**
 * Get list of all available sections with their metadata
 * @param {string} pageType - Optional page type to filter sections
 * @returns {Array} Array of section metadata objects
 */
export const getAvailableSections = (pageType = null) => {
    return Object.entries(SECTION_REGISTRY)
        .map(([type, Component]) => ({
            type,
            ...Component.sectionMeta
        }))
        .filter(section => {
            // If no page type filter, return all sections
            if (!pageType) return true;

            // If section has no pageTypes restriction, it's available everywhere
            if (!section.pageTypes) return true;

            // Otherwise, check if the section is available for this page type
            return section.pageTypes.includes(pageType);
        });
};

/**
 * Get default settings for a section type
 * @param {string} type - The section type identifier
 * @returns {Object} Default settings object
 */
export const getSectionDefaults = (type) => {
    const Component = SECTION_REGISTRY[type];
    if (!Component || !Component.sectionMeta) return {};
    return Component.sectionMeta.defaultSettings || {};
};

/**
 * Get the settings schema for a section type
 * @param {string} type - The section type identifier
 * @returns {Array} Settings schema array for building the editor UI
 */
export const getSectionSchema = (type) => {
    const Component = SECTION_REGISTRY[type];
    if (!Component || !Component.sectionMeta) return [];
    return Component.sectionMeta.settingsSchema || [];
};

/**
 * Generate a UUID v4
 * Uses crypto.randomUUID if available, otherwise falls back to manual generation
 */
export const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Generate a unique section ID (UUID)
 * @returns {string} A UUID for the section
 */
export const generateSectionId = () => {
    return generateUUID();
};

/**
 * Create a new section object with defaults
 * @param {string} type - The section type identifier
 * @param {number} position - The position in the sections array
 * @returns {Object} A new section object ready for the database
 */
export const createSection = (type, position = 0) => {
    return {
        id: generateUUID(),
        type,
        position,
        visible: true,
        settings: getSectionDefaults(type)
    };
};

/**
 * Get default sections for a page type
 * @param {string} pageType - The page type
 * @returns {Array} Array of default section configurations
 */
export const getDefaultSectionsForPage = (pageType) => {
    switch (pageType) {
        case PAGE_TYPES.HOME:
            return [
                createSection(SECTION_TYPES.HERO, 0),
                createSection(SECTION_TYPES.FEATURED_PRODUCTS, 1),
                createSection(SECTION_TYPES.NEWSLETTER, 2),
                createSection(SECTION_TYPES.TRUST_BADGES, 3)
            ];
        case PAGE_TYPES.CATALOG:
            return [
                createSection('catalog_header', 0),
                createSection(SECTION_TYPES.NEWSLETTER, 1)
            ];
        case PAGE_TYPES.PRODUCT:
            return [
                createSection('product_trust', 0),
                createSection('related_products', 1)
            ];
        default:
            return [];
    }
};

// Re-export individual components for direct imports if needed
export {
    HeroSection,
    FeaturedProductsSection,
    NewsletterSection,
    TrustBadgesSection,
    RichTextSection,
    ImageBannerSection,
    CatalogHeaderSection,
    ProductTrustSection,
    RelatedProductsSection,
    TRUST_BADGE_ICONS,
    PRODUCT_TRUST_ICONS
};

// Export section type constants for type safety
export const SECTION_TYPES = {
    HERO: 'hero',
    FEATURED_PRODUCTS: 'featured_products',
    NEWSLETTER: 'newsletter',
    TRUST_BADGES: 'trust_badges',
    RICH_TEXT: 'rich_text',
    IMAGE_BANNER: 'image_banner',
    CATALOG_HEADER: 'catalog_header',
    PRODUCT_TRUST: 'product_trust',
    RELATED_PRODUCTS: 'related_products',
};
