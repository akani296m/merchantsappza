import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAdminMerchant } from '../context/adminMerchantContext';
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
 * Hook to manage sections for a single template
 * Similar to useSections but works with template's embedded sections
 */
export function useTemplateSections(templateId) {
    const { merchantId, loading: merchantLoading } = useAdminMerchant();
    const [template, setTemplate] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalSections, setOriginalSections] = useState([]);

    // Fetch template on mount or when templateId changes
    useEffect(() => {
        if (merchantLoading) return;

        if (!merchantId || !templateId) {
            setTemplate(null);
            setSections([]);
            setLoading(false);
            return;
        }

        fetchTemplate();
    }, [merchantId, merchantLoading, templateId]);

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('product_page_templates')
                .select('*')
                .eq('id', templateId)
                .eq('merchant_id', merchantId)
                .single();

            if (fetchError) throw fetchError;

            setTemplate(data);

            // Parse sections from template
            const templateSections = data.sections || [];
            setSections(templateSections);
            setOriginalSections(templateSections);
        } catch (err) {
            console.error('[useTemplateSections] Error fetching template:', err);
            setError(err.message);
            setTemplate(null);
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

    // Update template name
    const updateTemplateName = useCallback(async (newName) => {
        if (!merchantId || !templateId) {
            return { success: false, error: 'No template ID' };
        }

        try {
            const { error: updateError } = await supabase
                .from('product_page_templates')
                .update({ name: newName })
                .eq('id', templateId)
                .eq('merchant_id', merchantId);

            if (updateError) throw updateError;

            setTemplate(prev => ({ ...prev, name: newName }));
            return { success: true };
        } catch (err) {
            console.error('[useTemplateSections] Error updating name:', err);
            return { success: false, error: err.message };
        }
    }, [merchantId, templateId]);

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

    // Save sections to the template
    const saveSections = useCallback(async () => {
        if (!merchantId || !templateId) {
            console.error('[useTemplateSections] Cannot save - no template ID');
            return { success: false, error: 'No template ID' };
        }

        try {
            setSaving(true);
            setError(null);

            console.log('[useTemplateSections] Saving sections for template:', templateId);

            const { data, error: updateError } = await supabase
                .from('product_page_templates')
                .update({ sections: sections })
                .eq('id', templateId)
                .eq('merchant_id', merchantId)
                .select()
                .single();

            if (updateError) throw updateError;

            console.log('[useTemplateSections] Successfully saved sections');

            setOriginalSections(sections);
            setHasChanges(false);
            return { success: true };
        } catch (err) {
            console.error('[useTemplateSections] Error saving sections:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [merchantId, templateId, sections]);

    // Reset to original sections
    const resetSections = useCallback(() => {
        setSections(originalSections);
        setHasChanges(false);
    }, [originalSections]);

    return {
        template,
        sections,
        loading: loading || merchantLoading,
        saving,
        error,
        hasChanges,
        updateTemplateName,
        updateSection,
        updateSectionSetting,
        toggleSectionVisibility,
        reorderSections,
        addSection,
        removeSection,
        duplicateSection,
        saveSections,
        resetSections,
        refetch: fetchTemplate
    };
}
