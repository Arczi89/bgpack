import React from 'react';
import { Preset } from '../types/Game';

interface PresetListProps {
  presets: Preset[];
  onSelectPreset: (preset: Preset) => void;
  isLoading?: boolean;
}

export const PresetList: React.FC<PresetListProps> = ({
  presets,
  onSelectPreset,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="text-sm text-gray-500">Ładowanie presetów...</div>;
  }

  if (presets.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Brak zapisanych presetów. Zapisz swój pierwszy preset, aby szybko
        przywracać ulubione filtry.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map(preset => (
        <div
          key={preset.id}
          className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
        >
          <button
            onClick={() => onSelectPreset(preset)}
            className="focus:outline-none"
            disabled={isLoading}
          >
            {preset.presetName}
          </button>
        </div>
      ))}
    </div>
  );
};
