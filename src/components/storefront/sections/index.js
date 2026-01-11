/**
 * Section Registry
 * Central registry for all storefront section components
 * 
 * This module exports:
 * - Individual section components
 * - A registry object for dynamic section rendering
 * - Helper functions for the editor
 */

// Import all section components
import HeroSection from './HeroSection';
import FeaturedProductsSection from './FeaturedProductsSection';
import NewsletterSection from './NewsletterSection';
import TrustBadgesSection, { TRUST_BADGE_ICONS } from './TrustBadgesSection';
import RichTextSection from './RichTextSection';
import ImageBannerSection from './ImageBannerSection';

/**
 * Section Registry
 * Maps section type strings to their React components
 */
export const SECTION_REGISTRY = {
    hero: HeroSection,
    featured_products: FeaturedProductsSection,
    newsletter: NewsletterSection,
    trust_badges: TrustBadgesSection,
    rich_text: RichTextSection,
    image_banner: ImageBannerSection,
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
 * Useful for the "Add Section" UI in the editor
 * @returns {Array} Array of section metadata objects
 */
export const getAvailableSections = () => {
    return Object.entries(SECTION_REGISTRY).map(([type, Component]) => ({
        type,
        ...Component.sectionMeta
    }));
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

// Re-export individual components for direct imports if needed
export {
    HeroSection,
    FeaturedProductsSection,
    NewsletterSection,
    TrustBadgesSection,
    RichTextSection,
    ImageBannerSection,
    TRUST_BADGE_ICONS
};

// Export section type constants for type safety
export const SECTION_TYPES = {
    HERO: 'hero',
    FEATURED_PRODUCTS: 'featured_products',
    NEWSLETTER: 'newsletter',
    TRUST_BADGES: 'trust_badges',
    RICH_TEXT: 'rich_text',
    IMAGE_BANNER: 'image_banner',
};
