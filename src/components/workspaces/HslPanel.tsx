import React, { useState } from 'react';
import { HslChannel, HslColorKey } from '../../types/editor';
import { HSL_COLOR_KEYS, DEFAULT_HSL } from '../../constants/initialState';
import { RotateCcw } from 'lucide-react';

interface Props {
  hsl: Record<HslColorKey, HslChannel>;
  onChange: (hsl: Record<HslColorKey, HslChannel>) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

const COLOR_SWATCHES: Record<HslColorKey, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  cyan: '#06b6d4',
  blue: '#3b82f6',
  purple: '#a855f7',
  magenta: '#ec4899',
};

export const HslPanel: React.FC<Props> = ({
  hsl,
  onChange,
  onScrubStart,
  onScrubEnd,
}) => {
  const [selectedColor, setSelectedColor] = useState<HslColorKey>('orange');
  const current = hsl[selectedColor] || { hue: 0, saturation: 0, luminance: 0 };

  const updateChannel = (key: keyof HslChannel, val: number) => {
    onChange({
      ...hsl,
      [selectedColor]: {
        ...current,
        [key]: val,
      },
    });
  };

  const resetAllHsl = () => {
    onChange(JSON.parse(JSON.stringify(DEFAULT_HSL)));
  };

  return (
    <div className="space-y-4">
      {/* 8 Color Selection Swatches */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-panel overflow-x-auto">
          {HSL_COLOR_KEYS.map((col) => {
            const isSelected = selectedColor === col;
            const hasShift =
              hsl[col].hue !== 0 ||
              hsl[col].saturation !== 0 ||
              hsl[col].luminance !== 0;

            return (
              <button
                key={col}
                onClick={() => setSelectedColor(col)}
                className={`relative w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                  isSelected ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: COLOR_SWATCHES[col] }}
                title={col.toUpperCase()}
              >
                {hasShift && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={resetAllHsl}
          title="Reset All HSL"
          className="p-1.5 rounded-lg liquid-button text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: COLOR_SWATCHES[selectedColor] }}
        />
        {selectedColor} channel
      </div>

      {/* Hue Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Hue</span>
          <span className="font-mono text-zinc-300">{current.hue > 0 ? `+${current.hue}` : current.hue}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={current.hue}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateChannel('hue', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      {/* Saturation Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Saturation</span>
          <span className="font-mono text-zinc-300">{current.saturation > 0 ? `+${current.saturation}` : current.saturation}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={current.saturation}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateChannel('saturation', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      {/* Luminance Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Luminance</span>
          <span className="font-mono text-zinc-300">{current.luminance > 0 ? `+${current.luminance}` : current.luminance}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={current.luminance}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateChannel('luminance', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>
    </div>
  );
};
