import React, { useState, useEffect } from 'react';
import { Store, Upload, Palette, Eye, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAdminMerchant } from '../../context/adminMerchantContext';
import { supabase } from '../../lib/supabase';

export default function ManageStoreSettings() {
    const { merchant, merchantId, loading: merchantLoading, refetch } = useAdminMerchant();

    const [storeData, setStoreData] = useState({
        storeName: '',
        tagline: '',
        logo: null,
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
    });

    const [customDomain, setCustomDomain] = useState({
        domain: '',
        verified: false,
        configuredAt: null
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    // Load merchant data when component mounts or merchant changes
    useEffect(() => {
        if (merchant) {
            setStoreData(prev => ({
                ...prev,
                // Use store_name or name from merchant data
                storeName: merchant.store_name || merchant.name || merchant.business_name || '',
                tagline: merchant.tagline || '',
                logo: merchant.logo_url || null,
                primaryColor: merchant.primary_color || '#3B82F6',
                accentColor: merchant.accent_color || '#10B981',
            }));

            // Load custom domain settings
            setCustomDomain({
                domain: merchant.custom_domain || '',
                verified: merchant.custom_domain_verified || false,
                configuredAt: merchant.custom_domain_configured_at || null
            });
        }
    }, [merchant]);

    const handleSave = async () => {
        if (!merchantId) {
            setSaveStatus('error');
            return;
        }

        setIsSaving(true);
        setSaveStatus(null);

        try {
            const updateData = {
                name: storeData.storeName,
                store_name: storeData.storeName,
                business_name: storeData.storeName,
                tagline: storeData.tagline,
                logo_url: storeData.logo,
                primary_color: storeData.primaryColor,
                accent_color: storeData.accentColor,
            };

            // Add custom domain if provided
            if (customDomain.domain.trim()) {
                updateData.custom_domain = customDomain.domain.trim().toLowerCase();
                // Set configured timestamp if this is the first time
                if (!customDomain.configuredAt) {
                    updateData.custom_domain_configured_at = new Date().toISOString();
                }
            } else {
                // Clear custom domain if empty
                updateData.custom_domain = null;
                updateData.custom_domain_verified = false;
                updateData.custom_domain_configured_at = null;
            }

            const { error } = await supabase
                .from('merchants')
                .update(updateData)
                .eq('id', merchantId);

            if (error) throw error;

            setSaveStatus('success');
            await refetch();

            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving store settings:', err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state while fetching merchant data
    if (merchantLoading) {
        return (
            <div className="max-w-4xl flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Store Identity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Store size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Store Identity</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Customize your store's appearance and branding
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store Name
                        </label>
                        <input
                            type="text"
                            value={storeData.storeName}
                            onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tagline
                        </label>
                        <input
                            type="text"
                            value={storeData.tagline}
                            onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="A short tagline for your store"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                {storeData.logo ? (
                                    <img src={storeData.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <Upload className="text-gray-400" size={32} />
                                )}
                            </div>
                            <div>
                                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                    Upload Logo
                                </button>
                                <p className="text-xs text-gray-500 mt-2">
                                    Recommended: Square image, at least 256x256px
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand Colors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-50 rounded-lg">
                            <Palette size={24} className="text-pink-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Brand Colors</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Customize your store's color scheme
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={storeData.primaryColor}
                                    onChange={(e) => setStoreData({ ...storeData, primaryColor: e.target.value })}
                                    className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={storeData.primaryColor}
                                    onChange={(e) => setStoreData({ ...storeData, primaryColor: e.target.value })}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Accent Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={storeData.accentColor}
                                    onChange={(e) => setStoreData({ ...storeData, accentColor: e.target.value })}
                                    className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={storeData.accentColor}
                                    onChange={(e) => setStoreData({ ...storeData, accentColor: e.target.value })}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
                            <Eye size={18} />
                            Preview Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Online Store */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Online Store</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Manage your storefront appearance
                            </p>
                        </div>
                        <button
                            onClick={() => window.open('/store/editor', '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Open Store Editor
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Domain Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Store size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Custom Domain</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Use your own domain for your storefront
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Storefront URL */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Eye size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                    Current Storefront URL
                                </h3>
                                <a
                                    href={`${window.location.origin}/s/${merchant?.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:text-blue-900 font-medium text-sm underline break-all"
                                >
                                    {window.location.origin}/s/{merchant?.slug}
                                </a>
                                <p className="text-xs text-blue-700 mt-2">
                                    This is your default storefront URL. You can add a custom domain below.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Custom Domain Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Domain
                        </label>
                        <input
                            type="text"
                            value={customDomain.domain}
                            onChange={(e) => setCustomDomain({ ...customDomain, domain: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="shop.yourdomain.com"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Enter your custom domain (e.g., shop.yourdomain.com or www.yourdomain.com)
                        </p>
                    </div>

                    {/* Domain Status */}
                    {customDomain.domain && (
                        <div className={`p-4 rounded-lg border ${customDomain.verified
                            ? 'bg-green-50 border-green-200'
                            : 'bg-yellow-50 border-yellow-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                <CheckCircle
                                    size={20}
                                    className={`mt-0.5 flex-shrink-0 ${customDomain.verified ? 'text-green-600' : 'text-yellow-600'
                                        }`}
                                />
                                <div className="flex-1">
                                    <h3 className={`text-sm font-semibold mb-1 ${customDomain.verified ? 'text-green-900' : 'text-yellow-900'
                                        }`}>
                                        {customDomain.verified ? 'Domain Verified' : 'Domain Not Verified'}
                                    </h3>
                                    <p className={`text-xs ${customDomain.verified ? 'text-green-700' : 'text-yellow-700'
                                        }`}>
                                        {customDomain.verified
                                            ? 'Your custom domain is active and working.'
                                            : 'Follow the DNS instructions below to verify your domain.'}
                                    </p>
                                    {customDomain.configuredAt && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Configured on {new Date(customDomain.configuredAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DNS Configuration Instructions */}
                    {customDomain.domain && !customDomain.verified && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                DNS Configuration Steps
                            </h3>
                            <ol className="space-y-3 text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span className="font-semibold text-blue-600 min-w-[20px]">1.</span>
                                    <div>
                                        <strong>Log in to your domain registrar</strong> (GoDaddy, Namecheap, etc.)
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold text-blue-600 min-w-[20px]">2.</span>
                                    <div>
                                        <strong>Add a CNAME record</strong> with these details:
                                        <div className="mt-2 bg-white border border-gray-300 rounded p-3 font-mono text-xs">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="text-gray-500">Type:</div>
                                                <div className="font-semibold">CNAME</div>
                                                <div className="text-gray-500">Name:</div>
                                                <div className="font-semibold break-all">
                                                    {customDomain.domain.replace(/^https?:\/\//, '').split('.')[0] || 'www'}
                                                </div>
                                                <div className="text-gray-500">Value:</div>
                                                <div className="font-semibold">cname.vercel-dns.com</div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold text-blue-600 min-w-[20px]">3.</span>
                                    <div>
                                        <strong>Save your changes</strong> and wait 24-48 hours for DNS propagation
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold text-blue-600 min-w-[20px]">4.</span>
                                    <div>
                                        <strong>Click "Save Changes"</strong> below to save your custom domain
                                    </div>
                                </li>
                            </ol>
                            <div className="mt-4 pt-4 border-t border-gray-300">
                                <p className="text-xs text-gray-600">
                                    <strong>Note:</strong> After saving, contact our support team to complete the domain verification
                                    and SSL certificate setup. Your domain will be live within 24-48 hours.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* View Storefront Link */}
                    {customDomain.verified && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.open(`https://${customDomain.domain}`, '_blank')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                            >
                                <Eye size={18} />
                                View Storefront
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex justify-between items-center">
                {/* Save Status Message */}
                <div className="flex items-center gap-2">
                    {saveStatus === 'success' && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle size={16} />
                            Store settings saved successfully
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-sm text-red-600">
                            Failed to save settings. Please try again.
                        </span>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
