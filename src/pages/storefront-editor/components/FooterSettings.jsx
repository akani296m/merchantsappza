import React, { useState, useEffect } from 'react';
import {
    Save,
    RotateCcw,
    Loader2,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    GripVertical,
    Eye,
    EyeOff,
    Edit2,
    Check,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useAdminMerchant } from '../../../context/adminMerchantContext';
import { supabase } from '../../../lib/supabase';

// Default footer items
const DEFAULT_FOOTER_ITEMS = [
    { id: 'new_arrivals', label: 'New Arrivals', section: 'Shop', path: '/products', enabled: true, order: 0 },
    { id: 'all_products', label: 'All Products', section: 'Shop', path: '/products', enabled: true, order: 1 },
    { id: 'shipping', label: 'Shipping Policy', section: 'Support', path: '/shipping', enabled: true, order: 2 },
    { id: 'privacy', label: 'Privacy Policy', section: 'Support', path: '/privacy', enabled: true, order: 3 },
    { id: 'about', label: 'About Us', section: 'Support', path: '/about', enabled: false, order: 4 },
    { id: 'faq', label: 'FAQ', section: 'Support', path: '/faq', enabled: false, order: 5 },
    { id: 'returns', label: 'Returns', section: 'Support', path: '/returns', enabled: false, order: 6 },
];

/**
 * Footer Settings Component
 * Allows merchants to customize footer tagline and menu items
 */
export default function FooterSettings() {
    const { merchant, merchantId, refetch } = useAdminMerchant();

    const [footerTagline, setFooterTagline] = useState('Redefining modern commerce.');
    const [footerItems, setFooterItems] = useState(DEFAULT_FOOTER_ITEMS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState({ tagline: '', items: [] });

    const [editingItemId, setEditingItemId] = useState(null);
    const [editingLabel, setEditingLabel] = useState('');

    // Load footer config when merchant data loads
    useEffect(() => {
        if (merchant) {
            const tagline = merchant.footer_tagline || 'Redefining modern commerce.';
            setFooterTagline(tagline);

            let footerConfig = DEFAULT_FOOTER_ITEMS;
            if (merchant.menu_config) {
                const config = typeof merchant.menu_config === 'string'
                    ? JSON.parse(merchant.menu_config)
                    : merchant.menu_config;

                if (config.footer && config.footer.length > 0) {
                    footerConfig = config.footer;
                }
            }
            setFooterItems(footerConfig);

            setOriginalData({
                tagline,
                items: JSON.stringify(footerConfig)
            });
            setLoading(false);
        }
    }, [merchant]);

    // Check for changes
    useEffect(() => {
        const currentItemsStr = JSON.stringify(footerItems);
        const changed = footerTagline !== originalData.tagline ||
            currentItemsStr !== originalData.items;
        setHasChanges(changed);
    }, [footerTagline, footerItems, originalData]);

    const handleSave = async () => {
        if (!merchantId) {
            setSaveError('No merchant ID found');
            return;
        }

        setSaving(true);
        setSaveSuccess(false);
        setSaveError(null);

        try {
            // Get existing menu_config to preserve header items
            const existingConfig = merchant?.menu_config
                ? (typeof merchant.menu_config === 'string'
                    ? JSON.parse(merchant.menu_config)
                    : merchant.menu_config)
                : {};

            const updatedMenuConfig = {
                ...existingConfig,
                footer: footerItems
            };

            const { error } = await supabase
                .from('merchants')
                .update({
                    footer_tagline: footerTagline,
                    menu_config: updatedMenuConfig
                })
                .eq('id', merchantId);

            if (error) throw error;

            setSaveSuccess(true);
            setOriginalData({
                tagline: footerTagline,
                items: JSON.stringify(footerItems)
            });
            setHasChanges(false);

            // Refetch merchant data
            await refetch();

            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving footer settings:', err);
            setSaveError(err.message || 'Failed to save footer settings');
        } finally {
            setSaving(false);
        }
    };

    const resetSettings = () => {
        setFooterTagline(originalData.tagline);
        setFooterItems(JSON.parse(originalData.items));
        setHasChanges(false);
    };

    const toggleItemVisibility = (itemId) => {
        setFooterItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    const startEditing = (item) => {
        setEditingItemId(item.id);
        setEditingLabel(item.label);
    };

    const saveEditing = () => {
        setFooterItems(prev =>
            prev.map(item =>
                item.id === editingItemId ? { ...item, label: editingLabel } : item
            )
        );
        setEditingItemId(null);
        setEditingLabel('');
    };

    const cancelEditing = () => {
        setEditingItemId(null);
        setEditingLabel('');
    };

    const moveItem = (itemId, direction) => {
        const currentIndex = footerItems.findIndex(item => item.id === itemId);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= footerItems.length) return;

        const newItems = [...footerItems];
        [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];

        const updatedItems = newItems.map((item, index) => ({
            ...item,
            order: index,
        }));

        setFooterItems(updatedItems);
    };

    // Group footer items by section
    const groupedFooterItems = footerItems.reduce((acc, item) => {
        const section = item.section || 'Other';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Tagline Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    <h3 className="font-semibold text-gray-900">Footer Tagline</h3>
                    <p className="text-sm text-gray-500">
                        This text appears below your store name in the footer.
                    </p>

                    <div>
                        <input
                            type="text"
                            value={footerTagline}
                            onChange={(e) => setFooterTagline(e.target.value)}
                            placeholder="Enter your tagline..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Example: "Redefining modern commerce." or "Quality products since 2020"
                        </p>
                    </div>
                </div>

                {/* Menu Items Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    <h3 className="font-semibold text-gray-900">Footer Menu Items</h3>
                    <p className="text-sm text-gray-500">
                        Toggle visibility and reorder the links shown in your footer.
                    </p>

                    <div className="space-y-4">
                        {Object.entries(groupedFooterItems).map(([section, items]) => (
                            <div key={section}>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    {section} Section
                                </h4>
                                <div className="space-y-2">
                                    {items
                                        .sort((a, b) => a.order - b.order)
                                        .map((item, index) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${item.enabled
                                                        ? 'bg-white border-gray-200 hover:border-gray-300'
                                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                                    }`}
                                            >
                                                {/* Drag Handle */}
                                                <div className="cursor-grab active:cursor-grabbing text-gray-400">
                                                    <GripVertical size={18} />
                                                </div>

                                                {/* Item Content */}
                                                <div className="flex-1 min-w-0">
                                                    {editingItemId === item.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={editingLabel}
                                                                onChange={(e) => setEditingLabel(e.target.value)}
                                                                className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') saveEditing();
                                                                    if (e.key === 'Escape') cancelEditing();
                                                                }}
                                                            />
                                                            <button
                                                                onClick={saveEditing}
                                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-medium ${item.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                {item.label}
                                                            </span>
                                                            <button
                                                                onClick={() => startEditing(item)}
                                                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-gray-400">{item.path}</span>
                                                </div>

                                                {/* Reorder Buttons */}
                                                <div className="flex flex-col gap-0.5">
                                                    <button
                                                        onClick={() => moveItem(item.id, 'up')}
                                                        disabled={index === 0}
                                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => moveItem(item.id, 'down')}
                                                        disabled={index === items.length - 1}
                                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>

                                                {/* Visibility Toggle */}
                                                <button
                                                    onClick={() => toggleItemVisibility(item.id)}
                                                    className={`p-2 rounded-lg transition-colors ${item.enabled
                                                            ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                                            : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                    title={item.enabled ? 'Click to hide' : 'Click to show'}
                                                >
                                                    {item.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Footer Preview</h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">
                                    {merchant?.store_name || 'Your Store'}.
                                </h4>
                                <p className="text-gray-500">{footerTagline}</p>
                            </div>
                            {Object.entries(groupedFooterItems).map(([section, sectionItems]) => {
                                const enabledItems = sectionItems.filter(i => i.enabled);
                                if (enabledItems.length === 0) return null;

                                return (
                                    <div key={section}>
                                        <h4 className="font-bold uppercase text-gray-900 mb-1">{section}</h4>
                                        <ul className="space-y-0.5">
                                            {enabledItems
                                                .sort((a, b) => a.order - b.order)
                                                .map(item => (
                                                    <li key={item.id} className="text-gray-500">
                                                        {item.label}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Footer with Actions */}
            <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                {/* Status Messages */}
                {saveError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        <AlertCircle size={16} />
                        <span>{saveError}</span>
                    </div>
                )}

                {saveSuccess && (
                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle size={16} />
                        <span>Footer settings saved successfully!</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={resetSettings}
                        disabled={!hasChanges || saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw size={18} />
                        <span>Reset</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>

                {hasChanges && (
                    <p className="text-xs text-amber-600 text-center">
                        ⚠️ You have unsaved changes
                    </p>
                )}
            </div>
        </div>
    );
}
