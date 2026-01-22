import React, { useState, useEffect } from 'react';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (presetName: string) => void;
  isSaveDisabledReason?: string | null;
  isLoading?: boolean;
  error?: string | null;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaveDisabledReason = null,
  isLoading = false,
  error = null,
}) => {
  const [presetName, setPresetName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPresetName('');
      setValidationError(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmedName = presetName.trim();

    if (!trimmedName) {
      setValidationError('Name of preset cannot be empty');
      return;
    }

    if (trimmedName.length > 50) {
      setValidationError('Name of preset cannot exceed 50 characters');
      return;
    }

    setValidationError(null);
    onSave(trimmedName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Save as a Preset
        </h2>

        <div className="mb-4">
          <label
            htmlFor="preset-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Preset Name
          </label>
          <input
            id="preset-name"
            type="text"
            value={presetName}
            onChange={e => {
              setPresetName(e.target.value);
              setValidationError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="np. Gry na 2 osoby"
            maxLength={50}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              validationError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="mt-1 text-xs text-gray-500">
            {presetName.length}/50 znaków
          </div>
        </div>

        {(validationError || error) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{validationError || error}</p>
          </div>
        )}

        {isSaveDisabledReason && !error && !validationError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">{isSaveDisabledReason}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !presetName.trim() || !!isSaveDisabledReason}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
