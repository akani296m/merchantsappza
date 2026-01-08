import React, { useState } from 'react';

/**
 * Simple color picker component with preset colors
 */
export default function ColorPicker({ value, onChange, label }) {
    const [showPicker, setShowPicker] = useState(false);

    // Preset color palette
    const presetColors = [
        '#000000', '#1a1a1a', '#374151', '#6b7280',
        '#ef4444', '#f97316', '#eab308', '#22c55e',
        '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6',
        '#ec4899', '#f43f5e', '#0ea5e9', '#06b6d4'
    ];

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="flex items-center gap-3">
                {/* Color preview button */}
                <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer hover:border-gray-400 transition"
                    style={{ backgroundColor: value }}
                />

                {/* Hex input */}
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    maxLength={7}
                />

                {/* Native color picker */}
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
            </div>

            {/* Preset colors grid */}
            {showPicker && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Quick colors:</p>
                    <div className="grid grid-cols-8 gap-2">
                        {presetColors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    onChange(color);
                                    setShowPicker(false);
                                }}
                                className={`w-6 h-6 rounded-md border-2 transition hover:scale-110 ${value === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
