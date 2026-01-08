import React from 'react';
import {
    Image,
    Palette,
    Shield,
    Mail,
    Save,
    RotateCcw,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import AccordionSection from './AccordionSection';
import ImageUploader from './ImageUploader';
import ColorPicker from './ColorPicker';

/**
 * Editor Sidebar with all customization controls
 */
export default function EditorSidebar({
    settings,
    updateSetting,
    updateTrustBadge,
    saveSettings,
    resetSettings,
    saving,
    hasChanges,
    error
}) {
    const [saveSuccess, setSaveSuccess] = React.useState(false);

    const handleSave = async () => {
        const result = await saveSettings();
        if (result.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#F6F6F7]">
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-bold text-gray-900">Storefront Editor</h2>
                <p className="text-sm text-gray-500 mt-1">Customize your store's appearance</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* HERO SECTION */}
                <AccordionSection title="Hero Section" icon={Image} defaultOpen={true}>
                    <ImageUploader
                        label="Hero Background Image"
                        value={settings.hero_image_url}
                        onChange={(url) => updateSetting('hero_image_url', url)}
                        folder="hero"
                        aspectRatio="aspect-video"
                        placeholder="Upload hero image"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hero Title
                        </label>
                        <input
                            type="text"
                            value={settings.hero_title || ''}
                            onChange={(e) => updateSetting('hero_title', e.target.value)}
                            placeholder="Enter a catchy headline..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1">Keep it short and impactful</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hero Subtitle
                        </label>
                        <textarea
                            value={settings.hero_subtitle || ''}
                            onChange={(e) => updateSetting('hero_subtitle', e.target.value)}
                            placeholder="Describe your brand or current promotion..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                </AccordionSection>

                {/* BRANDING SECTION */}
                <AccordionSection title="Branding & Colors" icon={Palette}>
                    <ImageUploader
                        label="Store Logo"
                        value={settings.logo_url}
                        onChange={(url) => updateSetting('logo_url', url)}
                        folder="logos"
                        aspectRatio="aspect-[3/1]"
                        placeholder="Upload your logo"
                    />

                    <ColorPicker
                        label="Primary Color"
                        value={settings.primary_color}
                        onChange={(color) => updateSetting('primary_color', color)}
                    />

                    <ColorPicker
                        label="Accent Color"
                        value={settings.accent_color}
                        onChange={(color) => updateSetting('accent_color', color)}
                    />

                    <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        💡 Primary color is used for buttons and key elements. Accent color is used for highlights.
                    </p>
                </AccordionSection>

                {/* TRUST BADGES SECTION */}
                <AccordionSection title="Guarantee Badges" icon={Shield} badge="3">
                    {settings.trust_badges?.map((badge, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </span>
                                <span className="text-sm font-medium text-gray-700">Badge {index + 1}</span>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Icon</label>
                                <select
                                    value={badge.icon}
                                    onChange={(e) => updateTrustBadge(index, 'icon', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Truck">🚚 Truck (Shipping)</option>
                                    <option value="RefreshCw">🔄 Refresh (Returns)</option>
                                    <option value="ShieldCheck">🛡️ Shield (Security)</option>
                                    <option value="Clock">⏰ Clock (Fast)</option>
                                    <option value="Heart">❤️ Heart (Love)</option>
                                    <option value="Star">⭐ Star (Quality)</option>
                                    <option value="Award">🏆 Award (Best)</option>
                                    <option value="Headphones">🎧 Headphones (Support)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={badge.title || ''}
                                    onChange={(e) => updateTrustBadge(index, 'title', e.target.value)}
                                    placeholder="e.g., Free Shipping"
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={badge.subtitle || ''}
                                    onChange={(e) => updateTrustBadge(index, 'subtitle', e.target.value)}
                                    placeholder="e.g., On all orders over R 1,500"
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    ))}
                </AccordionSection>

                {/* EMAIL CAPTURE SECTION */}
                <AccordionSection title="Email Signup Section" icon={Mail}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Headline
                        </label>
                        <input
                            type="text"
                            value={settings.email_capture_title || ''}
                            onChange={(e) => updateSetting('email_capture_title', e.target.value)}
                            placeholder="Join our newsletter"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={settings.email_capture_subtitle || ''}
                            onChange={(e) => updateSetting('email_capture_subtitle', e.target.value)}
                            placeholder="Tell visitors why they should subscribe..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Button Text
                        </label>
                        <input
                            type="text"
                            value={settings.email_capture_button_text || ''}
                            onChange={(e) => updateSetting('email_capture_button_text', e.target.value)}
                            placeholder="Subscribe"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </AccordionSection>

            </div>

            {/* Fixed Footer with Actions */}
            <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                {/* Status Messages */}
                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {saveSuccess && (
                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle size={16} />
                        <span>Changes saved successfully!</span>
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
