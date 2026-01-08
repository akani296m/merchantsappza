import React, { useState, useEffect } from 'react';
import { Loader2, Store, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStorefrontSettings } from './hooks/useStorefrontSettings';
import EditorSidebar from './components/EditorSidebar';
import LivePreview from './components/LivePreview';

/**
 * Main Storefront Editor Page
 * Split view with live preview on left and editor sidebar on right
 * 
 * Supports optional ?slug=merchant-slug query parameter to edit a specific merchant
 * Falls back to the first merchant if no slug is provided
 */
export default function StorefrontEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const slugParam = searchParams.get('slug');

    const [merchant, setMerchant] = useState(null);
    const [allMerchants, setAllMerchants] = useState([]);
    const [loadingMerchant, setLoadingMerchant] = useState(true);
    const [merchantError, setMerchantError] = useState(null);

    // Fetch merchant data - either by slug or get all and select first
    useEffect(() => {
        async function fetchMerchant() {
            try {
                setLoadingMerchant(true);
                setMerchantError(null);

                if (slugParam) {
                    // Fetch specific merchant by slug
                    const { data, error } = await supabase
                        .from('merchants')
                        .select('id, slug, store_name, business_name')
                        .eq('slug', slugParam)
                        .single();

                    if (error) throw error;
                    setMerchant(data);
                    setAllMerchants([data]);
                } else {
                    // Fetch all merchants to allow selection
                    const { data, error } = await supabase
                        .from('merchants')
                        .select('id, slug, store_name, business_name')
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    if (data && data.length > 0) {
                        setAllMerchants(data);
                        // Default to first merchant
                        setMerchant(data[0]);
                    } else {
                        setMerchantError('No merchants found');
                    }
                }
            } catch (err) {
                console.error('Error fetching merchant:', err);
                setMerchantError(err.message);
            } finally {
                setLoadingMerchant(false);
            }
        }

        fetchMerchant();
    }, [slugParam]);

    // Use the storefront settings hook with merchant ID
    const {
        settings,
        loading: loadingSettings,
        saving,
        error: settingsError,
        hasChanges,
        updateSetting,
        updateTrustBadge,
        saveSettings,
        resetSettings
    } = useStorefrontSettings(merchant?.id);

    // Handle merchant selection change
    const handleMerchantChange = (e) => {
        const selectedId = e.target.value;
        const selected = allMerchants.find(m => m.id === selectedId);
        if (selected) {
            setMerchant(selected);
            // Update URL with slug parameter
            navigate(`/store/editor?slug=${selected.slug}`, { replace: true });
        }
    };

    // Show loading state
    if (loadingMerchant) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading storefront editor...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (merchantError || !merchant) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center max-w-md">
                    <Store size={64} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Store Found</h2>
                    <p className="text-gray-600 mb-4">
                        {merchantError || "We couldn't find your store. Please complete the onboarding process first."}
                    </p>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Complete Onboarding
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Top Bar */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>

                    {/* Store Selector */}
                    <div className="flex items-center gap-2">
                        <Store size={20} className="text-blue-500" />
                        {allMerchants.length > 1 ? (
                            <select
                                value={merchant.id}
                                onChange={handleMerchantChange}
                                className="font-semibold text-gray-900 bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                                {allMerchants.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.store_name || m.business_name || m.slug}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="font-semibold text-gray-900">
                                {merchant.store_name || merchant.business_name || 'Your Store'}
                            </span>
                        )}
                    </div>

                    {/* Editing indicator */}
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Editing: {merchant.slug}
                    </span>
                </div>

                {/* Preview Link */}
                {merchant.slug && (
                    <a
                        href={`/s/${merchant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                    >
                        View Live Store →
                    </a>
                )}
            </header>

            {/* Loading settings indicator */}
            {loadingSettings && (
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 text-blue-700 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading settings for {merchant.slug}...</span>
                </div>
            )}

            {/* Main Content - Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Live Preview */}
                <div className="flex-1 overflow-hidden">
                    <LivePreview
                        settings={settings}
                        merchantSlug={merchant.slug}
                    />
                </div>

                {/* Right: Editor Sidebar */}
                <div className="w-[400px] border-l border-gray-200 overflow-hidden shrink-0">
                    <EditorSidebar
                        settings={settings}
                        updateSetting={updateSetting}
                        updateTrustBadge={updateTrustBadge}
                        saveSettings={saveSettings}
                        resetSettings={resetSettings}
                        saving={saving}
                        hasChanges={hasChanges}
                        error={settingsError}
                        merchantSlug={merchant.slug}
                    />
                </div>
            </div>
        </div>
    );
}
