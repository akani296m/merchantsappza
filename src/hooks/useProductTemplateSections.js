import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getSectionDefaults } from '../components/storefront/sections';

/**
 * Generate a UUID v4
 */
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Default sections for product pages
 */
const getDefaultProductSections = () => [
    {
        id: generateUUID(),
        type: 'product_trust',
        position: 0,
        visible: true,
        settings: getSectionDefaults('product_trust')
    },
    {
        id: generateUUID(),
        type: 'related_products',
        position: 1,
        visible: true,
        settings: getSectionDefaults('related_products')
    }
];

/**
 * Hook to get sections for a product page
 * If the product has a template_id, it fetches sections from that template
 * Otherwise, it falls back to the merchant's default product page sections or default sections
 * 
 * @param {string} merchantId - The merchant's ID
 * @param {string} templateId - Optional template ID from the product
 * @returns {Object} Sections and loading state
 */
export function useProductTemplateSections(merchantId, templateId) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!merchantId) {
            setSections(getDefaultProductSections());
            setLoading(false);
            return;
        }

        fetchSections();
    }, [merchantId, templateId]);

    const fetchSections = async () => {
        try {
            setLoading(true);
            setError(null);

            // If product has a specific template, use that
            if (templateId) {
                console.log('[useProductTemplateSections] Fetching template:', templateId);

                const { data: template, error: templateError } = await supabase
                    .from('product_page_templates')
                    .select('sections')
                    .eq('id', templateId)
                    .eq('merchant_id', merchantId)
                    .single();

                if (templateError) {
                    console.warn('[useProductTemplateSections] Template not found, falling back to default');
                } else if (template && template.sections && template.sections.length > 0) {
                    console.log('[useProductTemplateSections] Using template sections:', template.sections.length);
                    setSections(template.sections);
                    setLoading(false);
                    return;
                }
            }

            // Fall back to merchant's default product page sections from storefront_sections
            console.log('[useProductTemplateSections] Fetching merchant default product sections');

            const { data: storefrontSections, error: sectionsError } = await supabase
                .from('storefront_sections')
                .select('*')
                .eq('merchant_id', merchantId)
                .eq('page_type', 'product')
                .order('position', { ascending: true });

            if (sectionsError) throw sectionsError;

            if (storefrontSections && storefrontSections.length > 0) {
                const parsedSections = storefrontSections.map(section => ({
                    id: section.id,
                    type: section.section_type,
                    position: section.position,
                    visible: section.is_visible,
                    settings: typeof section.settings === 'string'
                        ? JSON.parse(section.settings)
                        : section.settings
                }));
                console.log('[useProductTemplateSections] Using storefront sections:', parsedSections.length);
                setSections(parsedSections);
            } else {
                // Use hardcoded defaults
                console.log('[useProductTemplateSections] Using default sections');
                setSections(getDefaultProductSections());
            }
        } catch (err) {
            console.error('[useProductTemplateSections] Error:', err);
            setError(err.message);
            setSections(getDefaultProductSections());
        } finally {
            setLoading(false);
        }
    };

    return {
        sections,
        loading,
        error
    };
}
