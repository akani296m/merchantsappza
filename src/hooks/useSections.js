import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getSectionDefaults, PAGE_TYPES, getDefaultSectionsForPage } from '../components/storefront/sections';

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
 * Create a new section with UUID
 */
const createSectionWithUUID = (type, position = 0) => ({
    id: generateUUID(),
    type,
    position,
    visible: true,
    settings: getSectionDefaults(type)
});

/**
 * Hook to fetch and manage storefront sections
 * @param {string} merchantId - The merchant's ID
 * @param {string} pageType - The page type ('home', 'catalog', 'product')
 * @returns {Object} Sections state and management functions
 */
export function useSections(merchantId, pageType = PAGE_TYPES.HOME) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalSections, setOriginalSections] = useState([]);

    // Fetch sections on mount or when merchantId/pageType changes
    useEffect(() => {
        async function fetchSections() {
            if (!merchantId) {
                console.log('[useSections] No merchantId provided, using defaults');
                const defaults = getDefaultSectionsForPage(pageType);
                setSections(defaults);
                setOriginalSections(defaults);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log('[useSections] Fetching sections for merchant:', merchantId, 'page:', pageType);

                const { data, error: fetchError } = await supabase
                    .from('storefront_sections')
                    .select('*')
                    .eq('merchant_id', merchantId)
                    .eq('page_type', pageType)
                    .order('position', { ascending: true });

                if (fetchError) {
                    console.error('[useSections] Fetch error:', fetchError);
                    throw fetchError;
                }

                console.log('[useSections] Fetched sections:', data);

                if (!data || data.length === 0) {
                    console.log('[useSections] No sections found, using defaults for', pageType);
                    const defaults = getDefaultSectionsForPage(pageType);
                    setSections(defaults);
                    setOriginalSections(defaults);
                } else {
                    const parsedSections = data.map(section => ({
                        id: section.id,
                        type: section.section_type,
                        position: section.position,
                        visible: section.is_visible,
                        settings: typeof section.settings === 'string'
                            ? JSON.parse(section.settings)
                            : section.settings
                    }));
                    setSections(parsedSections);
                    setOriginalSections(parsedSections);
                }
            } catch (err) {
                console.error('[useSections] Error fetching sections:', err);
                setError(err.message);
                const defaults = getDefaultSectionsForPage(pageType);
                setSections(defaults);
                setOriginalSections(defaults);
            } finally {
                setLoading(false);
            }
        }

        fetchSections();
    }, [merchantId, pageType]);

    // Update a section's settings
    const updateSection = useCallback((sectionId, updates) => {
        setSections(prev => {
            const updated = prev.map(section =>
                section.id === sectionId
                    ? { ...section, ...updates }
                    : section
            );
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSections));
            return updated;
        });
    }, [originalSections]);

    // Update a specific setting within a section
    const updateSectionSetting = useCallback((sectionId, key, value) => {
        setSections(prev => {
            const updated = prev.map(section =>
                section.id === sectionId
                    ? { ...section, settings: { ...section.settings, [key]: value } }
                    : section
            );
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSections));
            return updated;
        });
    }, [originalSections]);

    // Toggle section visibility
    const toggleSectionVisibility = useCallback((sectionId) => {
        setSections(prev => {
            const updated = prev.map(section =>
                section.id === sectionId
                    ? { ...section, visible: !section.visible }
                    : section
            );
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSections));
            return updated;
        });
    }, [originalSections]);

    // Reorder sections
    const reorderSections = useCallback((startIndex, endIndex) => {
        setSections(prev => {
            const result = Array.from(prev);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);

            const updated = result.map((section, index) => ({
                ...section,
                position: index
            }));

            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSections));
            return updated;
        });
    }, [originalSections]);

    // Add a new section
    const addSection = useCallback((type, position = null) => {
        setSections(prev => {
            const insertPosition = position !== null ? position : prev.length;
            const newSection = createSectionWithUUID(type, insertPosition);

            const updated = [
                ...prev.slice(0, insertPosition),
                newSection,
                ...prev.slice(insertPosition).map(s => ({ ...s, position: s.position + 1 }))
            ];

            setHasChanges(true);
            return updated;
        });
    }, []);

    // Remove a section
    const removeSection = useCallback((sectionId) => {
        setSections(prev => {
            const updated = prev
                .filter(section => section.id !== sectionId)
                .map((section, index) => ({ ...section, position: index }));

            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSections));
            return updated;
        });
    }, [originalSections]);

    // Duplicate a section
    const duplicateSection = useCallback((sectionId) => {
        setSections(prev => {
            const sectionToDupe = prev.find(s => s.id === sectionId);
            if (!sectionToDupe) return prev;

            const insertPosition = sectionToDupe.position + 1;
            const newSection = {
                ...sectionToDupe,
                id: generateUUID(),
                position: insertPosition
            };

            const updated = [
                ...prev.slice(0, insertPosition),
                newSection,
                ...prev.slice(insertPosition).map(s => ({ ...s, position: s.position + 1 }))
            ];

            setHasChanges(true);
            return updated;
        });
    }, []);

    // Save sections to database
    const saveSections = useCallback(async () => {
        if (!merchantId) {
            console.error('[useSections] Cannot save - no merchant ID');
            return { success: false, error: 'No merchant ID' };
        }

        try {
            setSaving(true);
            setError(null);

            console.log('[useSections] Saving sections for merchant:', merchantId, 'page:', pageType);

            // Delete existing sections for this merchant AND page type
            const { error: deleteError } = await supabase
                .from('storefront_sections')
                .delete()
                .eq('merchant_id', merchantId)
                .eq('page_type', pageType);

            if (deleteError) {
                console.error('[useSections] Delete error:', deleteError);
                throw deleteError;
            }

            // Insert all current sections with page_type
            const sectionsToInsert = sections.map(section => ({
                id: section.id,
                merchant_id: merchantId,
                page_type: pageType,
                section_type: section.type,
                position: section.position,
                is_visible: section.visible,
                settings: section.settings
            }));

            console.log('[useSections] Inserting sections:', sectionsToInsert);

            const { data, error: insertError } = await supabase
                .from('storefront_sections')
                .insert(sectionsToInsert)
                .select();

            if (insertError) {
                console.error('[useSections] Insert error:', insertError);
                throw insertError;
            }

            console.log('[useSections] Successfully saved sections:', data);

            const savedSections = data.map(section => ({
                id: section.id,
                type: section.section_type,
                position: section.position,
                visible: section.is_visible,
                settings: section.settings
            }));

            setSections(savedSections);
            setOriginalSections(savedSections);
            setHasChanges(false);
            return { success: true };
        } catch (err) {
            console.error('[useSections] Error saving sections:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [merchantId, pageType, sections]);

    // Reset to original sections
    const resetSections = useCallback(() => {
        setSections(originalSections);
        setHasChanges(false);
    }, [originalSections]);

    return {
        sections,
        loading,
        saving,
        error,
        hasChanges,
        pageType,
        updateSection,
        updateSectionSetting,
        toggleSectionVisibility,
        reorderSections,
        addSection,
        removeSection,
        duplicateSection,
        saveSections,
        resetSections
    };
}
