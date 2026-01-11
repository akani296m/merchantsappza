import React, { useState, useEffect } from 'react';
import { Loader2, Store, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSections } from '../../hooks/useSections';
import { useAdminMerchant } from '../../context/adminMerchantContext';
import { useProducts } from '../../context/productcontext';
import EditorSidebar from './components/EditorSidebar';
import LivePreview from './components/LivePreview';

/**
 * Main Storefront Editor Page
 * Split view with live preview on left and editor sidebar on right
 * 
 * SECURITY: Only allows editing stores the logged-in user has access to
 * Uses the AdminMerchantContext to scope access to authorized merchants only
 */
export default function StorefrontEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const slugParam = searchParams.get('slug');

    // Get the merchant the current user has access to
    const {
        merchant: authorizedMerchant,
        merchantId: authorizedMerchantId,
        loading: merchantLoading,
        hasMerchant
    } = useAdminMerchant();

    // Get products for preview
    const { products, loading: productsLoading } = useProducts();

    const [merchant, setMerchant] = useState(null);
    const [loadingMerchant, setLoadingMerchant] = useState(true);
    const [merchantError, setMerchantError] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);

    // Set merchant data from context - SECURITY: Only use authorized merchant
    useEffect(() => {
        // Wait for auth context to load
        if (merchantLoading) {
            setLoadingMerchant(true);
            return;
        }

        // If user has no merchant access, show error
        if (!hasMerchant || !authorizedMerchant) {
            setMerchantError('You do not have access to any stores. Please complete onboarding first.');
            setLoadingMerchant(false);
            return;
        }

        // SECURITY: If a slug parameter is provided, verify the user has access to it
        if (slugParam && slugParam !== authorizedMerchant.slug) {
            console.warn('[StorefrontEditor] Access denied - user tried to access unauthorized store:', slugParam);
            setMerchantError('You do not have permission to edit this store.');
            setLoadingMerchant(false);
            return;
        }

        // User is authorized - set merchant data
        setMerchant(authorizedMerchant);
        setMerchantError(null);
        setLoadingMerchant(false);

    }, [merchantLoading, hasMerchant, authorizedMerchant, slugParam]);

    // Use the sections hook with merchant ID
    const {
        sections,
        loading: loadingSections,
        saving,
        error: sectionsError,
        hasChanges,
        updateSectionSetting,
        toggleSectionVisibility,
        reorderSections,
        addSection,
        removeSection,
        duplicateSection,
        saveSections,
        resetSections
    } = useSections(merchant?.id);

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

                    {/* Store Name - Users can only edit their own store */}
                    <div className="flex items-center gap-2">
                        <Store size={20} className="text-blue-500" />
                        <span className="font-semibold text-gray-900">
                            {merchant.store_name || merchant.business_name || 'Your Store'}
                        </span>
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

            {/* Loading sections indicator */}
            {loadingSections && (
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 text-blue-700 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading sections for {merchant.slug}...</span>
                </div>
            )}

            {/* Main Content - Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Live Preview */}
                <div className="flex-1 overflow-hidden">
                    <LivePreview
                        sections={sections}
                        selectedSectionId={selectedSectionId}
                        onSelectSection={setSelectedSectionId}
                        merchantSlug={merchant.slug}
                        products={products}
                        productsLoading={productsLoading}
                    />
                </div>

                {/* Right: Editor Sidebar */}
                <div className="w-[400px] border-l border-gray-200 overflow-hidden shrink-0">
                    <EditorSidebar
                        sections={sections}
                        selectedSectionId={selectedSectionId}
                        onSelectSection={setSelectedSectionId}
                        onUpdateSectionSetting={updateSectionSetting}
                        onToggleVisibility={toggleSectionVisibility}
                        onReorderSections={reorderSections}
                        onAddSection={addSection}
                        onDuplicateSection={duplicateSection}
                        onRemoveSection={removeSection}
                        saveSections={saveSections}
                        resetSections={resetSections}
                        saving={saving}
                        hasChanges={hasChanges}
                        error={sectionsError}
                        merchantSlug={merchant.slug}
                    />
                </div>
            </div>
        </div>
    );
}
