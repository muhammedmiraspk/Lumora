import React, { useState, useMemo } from 'react';
import { Preset, EditState } from '../../types/editor';
import { PRESETS_DATA, PRESET_CATEGORIES } from '../../constants/presetsData';
import { Search, Star, Sliders, Download, Upload, Check } from 'lucide-react';

interface Props {
  editState: EditState;
  onApplyPreset: (preset: Preset) => void;
  onUpdateIntensity: (intensity: number) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onImportPreset: (preset: Preset) => void;
}

export const PresetsWorkspace: React.FC<Props> = ({
  editState,
  onApplyPreset,
  onUpdateIntensity,
  favorites,
  onToggleFavorite,
  onImportPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Filter presets
  const filteredPresets = useMemo(() => {
    return PRESETS_DATA.filter((p) => {
      if (onlyFavorites && !favorites.includes(p.id)) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedCategory, searchQuery, onlyFavorites, favorites]);

  // Export current settings as custom preset JSON
  const handleExportCurrentAsPreset = () => {
    const customPreset: Preset = {
      id: `custom_${Date.now()}`,
      name: `Custom Preset ${new Date().toLocaleDateString()}`,
      category: 'User Custom',
      description: 'Custom created preset from Lumora Studio',
      values: {
        basic: editState.basic,
        toneDetail: editState.toneDetail,
        curves: editState.curves,
        colorGrading: editState.colorGrading,
        hsl: editState.hsl,
      },
    };
    const blob = new Blob([JSON.stringify(customPreset, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LUMORA_PRESET_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import preset file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.values) {
          onImportPreset(parsed);
          onApplyPreset(parsed);
        }
      } catch {
        alert('Invalid preset file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header: Search & Intensity */}
      <div className="p-3 border-b border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search 150+ pro presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl liquid-panel text-xs text-white placeholder-zinc-500 outline-none focus:border-sky-400"
            />
          </div>

          {/* Favorites filter toggle */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            title="Filter Favorites"
            className={`p-2 rounded-xl transition-all ${
              onlyFavorites
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                : 'liquid-button text-zinc-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>

          {/* Export / Import */}
          <button
            onClick={handleExportCurrentAsPreset}
            title="Export Current Looks as Preset File"
            className="p-2 rounded-xl liquid-button text-zinc-300 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </button>
          <label
            title="Import Preset JSON"
            className="p-2 rounded-xl liquid-button text-zinc-300 hover:text-white cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json,.xmp"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Global Preset Intensity Slider */}
        <div className="p-2.5 rounded-xl liquid-panel space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              Preset Intensity
            </span>
            <span className="font-mono text-sky-400 font-semibold">
              {editState.presetIntensity ?? 100}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            value={editState.presetIntensity ?? 100}
            onChange={(e) => onUpdateIntensity(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 overflow-x-auto no-scrollbar">
        {PRESET_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'liquid-button-accent shadow-sm'
                : 'liquid-button text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset Cards Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5">
        {filteredPresets.map((preset) => {
          const isActive = editState.activePresetId === preset.id;
          const isFav = favorites.includes(preset.id);

          return (
            <div
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={`group relative p-2.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-sky-500/20 border-2 border-sky-400 shadow-xl'
                  : 'liquid-panel hover:border-white/25'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {preset.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(preset.id);
                    }}
                    className={`p-1 rounded text-zinc-400 hover:text-amber-400 transition-colors ${
                      isFav ? 'text-amber-400' : ''
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <span className="text-[10px] text-sky-400/90 font-medium tracking-wide uppercase">
                  {preset.category}
                </span>

                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono text-zinc-500">PRO PRESET</span>
                {isActive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400">
                    <Check className="w-3 h-3" /> ACTIVE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
