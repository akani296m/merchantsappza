import React, { useState } from 'react';
import { Store, Upload, Palette, Eye } from 'lucide-react';

export default function ManageStoreSettings() {
    const [storeData, setStoreData] = useState({
        storeName: 'My Amazing Store',
        tagline: 'Quality products for everyone',
        logo: null,
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
    });

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
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Open Store Editor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
