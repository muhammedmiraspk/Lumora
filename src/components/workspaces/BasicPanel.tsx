import React from 'react';
import { BasicAdjustments } from '../../types/editor';
import { DEFAULT_BASIC } from '../../constants/initialState';
import { Wand2, Pipette, RotateCcw } from 'lucide-react';

interface Props {
  basic: BasicAdjustments;
  onChange: (basic: BasicAdjustments) => void;
  onAutoEnhance: () => void;
  isPickingWb: boolean;
  onTogglePickWb: () => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

export const BasicPanel: React.FC<Props> = ({
  basic,
  onChange,
  onAutoEnhance,
  isPickingWb,
  onTogglePickWb,
  onScrubStart,
  onScrubEnd,
}) => {
  const updateKey = (key: keyof BasicAdjustments, val: number) => {
    onChange({
      ...basic,
      [key]: val,
    });
  };

  const resetBasic = () => {
    onChange({ ...DEFAULT_BASIC });
  };

  return (
    <div className="space-y-4">
      {/* Action Header: Auto Enhance, WB Pipette, Reset */}
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={onAutoEnhance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-button-accent text-xs font-semibold shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Auto Tone
          </button>

          <button
            onClick={onTogglePickWb}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isPickingWb
                ? 'bg-sky-500 text-white shadow-lg'
                : 'liquid-button text-zinc-300 hover:text-white'
            }`}
            title="White balance eye-dropper sampler"
          >
            <Pipette className="w-3.5 h-3.5" />
            WB Picker
          </button>
        </div>

        <button
          onClick={resetBasic}
          title="Reset Basic adjustments"
          className="p-1.5 rounded-lg liquid-button text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Exposure */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Exposure</span>
          <span className="font-mono text-zinc-300">
            {basic.exposure > 0 ? `+${basic.exposure.toFixed(2)}` : basic.exposure.toFixed(2)} EV
          </span>
        </div>
        <input
          type="range"
          min="-3"
          max="3"
          step="0.05"
          value={basic.exposure}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateKey('exposure', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Contrast */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Contrast</span>
          <span className="font-mono text-zinc-300">{basic.contrast > 0 ? `+${basic.contrast}` : basic.contrast}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={basic.contrast}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateKey('contrast', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      {/* Highlights */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Highlights</span>
          <span className="font-mono text-zinc-300">{basic.highlights > 0 ? `+${basic.highlights}` : basic.highlights}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={basic.highlights}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateKey('highlights', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      {/* Shadows */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Shadows</span>
          <span className="font-mono text-zinc-300">{basic.shadows > 0 ? `+${basic.shadows}` : basic.shadows}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={basic.shadows}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateKey('shadows', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      {/* Whites & Blacks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Whites</span>
            <span className="font-mono text-zinc-300">{basic.whites > 0 ? `+${basic.whites}` : basic.whites}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={basic.whites}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onTouchStart={onScrubStart}
            onTouchEnd={onScrubEnd}
            onChange={(e) => updateKey('whites', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Blacks</span>
            <span className="font-mono text-zinc-300">{basic.blacks > 0 ? `+${basic.blacks}` : basic.blacks}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={basic.blacks}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onTouchStart={onScrubStart}
            onTouchEnd={onScrubEnd}
            onChange={(e) => updateKey('blacks', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Temperature (Cool <-> Warm) */}
      <div className="space-y-1 pt-2 border-t border-white/10">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Temperature</span>
          <span className="font-mono text-zinc-300">{basic.temperature > 0 ? `+${basic.temperature}` : basic.temperature}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={basic.temperature}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateKey('temperature', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      {/* Tint (Green <-> Magenta) */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Tint</span>
          <span className="font-mono text-zinc-300">{basic.tint > 0 ? `+${basic.tint}` : basic.tint}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={basic.tint}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) => updateKey('tint', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      {/* Vibrance & Saturation */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Vibrance</span>
            <span className="font-mono text-zinc-300">{basic.vibrance > 0 ? `+${basic.vibrance}` : basic.vibrance}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={basic.vibrance}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onTouchStart={onScrubStart}
            onTouchEnd={onScrubEnd}
            onChange={(e) => updateKey('vibrance', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Saturation</span>
            <span className="font-mono text-zinc-300">{basic.saturation > 0 ? `+${basic.saturation}` : basic.saturation}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={basic.saturation}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onTouchStart={onScrubStart}
            onTouchEnd={onScrubEnd}
            onChange={(e) => updateKey('saturation', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
