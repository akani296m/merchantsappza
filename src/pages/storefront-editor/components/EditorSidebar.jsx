import React, { useState } from 'react';
import {
    Save,
    RotateCcw,
    Loader2,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Layers
} from 'lucide-react';
import SectionList from './SectionList';
import SectionEditor from './SectionEditor';
import AddSectionModal from './AddSectionModal';

/**
 * Editor Sidebar with section management
 * Supports listing, reordering, editing, and adding sections
 */
export default function EditorSidebar({
    sections,
    selectedSectionId,
    onSelectSection,
    onUpdateSectionSetting,
    onToggleVisibility,
    onReorderSections,
    onAddSection,
    onDuplicateSection,
    onRemoveSection,
    saveSections,
    resetSections,
    saving,
    hasChanges,
    error,
    merchantSlug
}) {
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editMode, setEditMode] = useState('list'); // 'list' or 'edit'

    const selectedSection = sections.find(s => s.id === selectedSectionId);

    const handleSave = async () => {
        setSaveError(null);
        console.log('Saving sections...', sections);

        const result = await saveSections();
        console.log('Save result:', result);

        if (result.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } else {
            setSaveError(result.error || 'Failed to save changes');
        }
    };

    const handleSelectSection = (sectionId) => {
        onSelectSection(sectionId);
        setEditMode('edit');
    };

    const handleBackToList = () => {
        onSelectSection(null);
        setEditMode('list');
    };

    const handleAddSection = (type) => {
        onAddSection(type);
        // Find the newly added section (it will be at the end)
        setTimeout(() => {
            const newSection = sections[sections.length - 1];
            if (newSection) {
                onSelectSection(newSection.id);
                setEditMode('edit');
            }
        }, 100);
    };

    return (
        <div className="h-full flex flex-col bg-[#F6F6F7]">
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    <Layers size={20} className="text-blue-500" />
                    <h2 className="text-lg font-bold text-gray-900">Sections</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    {editMode === 'list'
                        ? 'Drag to reorder, click to edit'
                        : 'Editing section settings'
                    }
                </p>
                {merchantSlug && (
                    <a
                        href={`/s/${merchantSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                    >
                        <ExternalLink size={12} />
                        Preview: /s/{merchantSlug}
                    </a>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {editMode === 'list' ? (
                    <SectionList
                        sections={sections}
                        selectedSectionId={selectedSectionId}
                        onSelectSection={handleSelectSection}
                        onToggleVisibility={onToggleVisibility}
                        onDuplicateSection={onDuplicateSection}
                        onRemoveSection={onRemoveSection}
                        onReorder={onReorderSections}
                        onAddSection={() => setShowAddModal(true)}
                    />
                ) : (
                    <SectionEditor
                        section={selectedSection}
                        onUpdateSetting={onUpdateSectionSetting}
                        onBack={handleBackToList}
                    />
                )}
            </div>

            {/* Fixed Footer with Actions */}
            <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                {/* Status Messages */}
                {(error || saveError) && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        <AlertCircle size={16} />
                        <span>{error || saveError}</span>
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
                        onClick={resetSections}
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

            {/* Add Section Modal */}
            <AddSectionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAddSection={handleAddSection}
            />
        </div>
    );
}
