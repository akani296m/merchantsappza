import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

/**
 * Default settings structure for new merchants or as fallback
 */
const DEFAULT_SETTINGS = {
    // Hero Section
    hero_image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    hero_title: 'Redefine Your Everyday Style.',
    hero_subtitle: 'Premium products designed for comfort and quality. Discover the new collection before it sells out.',

    // Branding
    logo_url: '',
    primary_color: '#000000',
    accent_color: '#3b82f6',

    // Trust Badges
    trust_badges: [
        { icon: 'Truck', title: 'Free Shipping', subtitle: 'On all orders over R 1,500' },
        { icon: 'RefreshCw', title: 'Free Returns', subtitle: '30 days money-back guarantee' },
        { icon: 'ShieldCheck', title: 'Secure Payment', subtitle: 'Protected by 256-bit SSL encryption' }
    ],

    // Email Capture
    email_capture_title: 'Join the Movement',
    email_capture_subtitle: 'Sign up for our newsletter and get 15% off your first order, plus early access to new drops.',
    email_capture_button_text: 'Sign Up'
};

/**
 * Hook to fetch and save storefront settings from Supabase
 * @param {string} merchantId - The merchant's ID
 */
export function useStorefrontSettings(merchantId) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalSettings, setOriginalSettings] = useState(null);

    // Fetch settings on mount
    useEffect(() => {
        async function fetchSettings() {
            if (!merchantId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase
                    .from('merchants')
                    .select(`
                        hero_image_url,
                        hero_title,
                        hero_subtitle,
                        logo_url,
                        primary_color,
                        accent_color,
                        trust_badges,
                        email_capture_title,
                        email_capture_subtitle,
                        email_capture_button_text
                    `)
                    .eq('id', merchantId)
                    .single();

                if (fetchError) throw fetchError;

                // Merge fetched data with defaults (in case some fields are null)
                const mergedSettings = {
                    ...DEFAULT_SETTINGS,
                    ...data,
                    // Parse trust_badges if it's a string
                    trust_badges: typeof data?.trust_badges === 'string'
                        ? JSON.parse(data.trust_badges)
                        : (data?.trust_badges || DEFAULT_SETTINGS.trust_badges)
                };

                setSettings(mergedSettings);
                setOriginalSettings(mergedSettings);
            } catch (err) {
                console.error('Error fetching storefront settings:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, [merchantId]);

    // Update a single setting
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: value };
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSettings));
            return updated;
        });
    }, [originalSettings]);

    // Update a trust badge
    const updateTrustBadge = useCallback((index, field, value) => {
        setSettings(prev => {
            const updatedBadges = [...prev.trust_badges];
            updatedBadges[index] = { ...updatedBadges[index], [field]: value };
            const updated = { ...prev, trust_badges: updatedBadges };
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSettings));
            return updated;
        });
    }, [originalSettings]);

    // Save settings to Supabase
    const saveSettings = useCallback(async () => {
        if (!merchantId) return { success: false, error: 'No merchant ID' };

        try {
            setSaving(true);
            setError(null);

            const { error: updateError } = await supabase
                .from('merchants')
                .update({
                    hero_image_url: settings.hero_image_url,
                    hero_title: settings.hero_title,
                    hero_subtitle: settings.hero_subtitle,
                    logo_url: settings.logo_url,
                    primary_color: settings.primary_color,
                    accent_color: settings.accent_color,
                    trust_badges: settings.trust_badges,
                    email_capture_title: settings.email_capture_title,
                    email_capture_subtitle: settings.email_capture_subtitle,
                    email_capture_button_text: settings.email_capture_button_text
                })
                .eq('id', merchantId);

            if (updateError) throw updateError;

            setOriginalSettings(settings);
            setHasChanges(false);
            return { success: true };
        } catch (err) {
            console.error('Error saving storefront settings:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [merchantId, settings]);

    // Reset to original settings
    const resetSettings = useCallback(() => {
        if (originalSettings) {
            setSettings(originalSettings);
            setHasChanges(false);
        }
    }, [originalSettings]);

    return {
        settings,
        loading,
        saving,
        error,
        hasChanges,
        updateSetting,
        updateTrustBadge,
        saveSettings,
        resetSettings,
        DEFAULT_SETTINGS
    };
}
