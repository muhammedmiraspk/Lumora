import React from 'react';
import { MaskItem, MaskType } from '../../types/editor';
import {
  Brush,
  MinusCircle,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Compass,
  Disc,
  Palette,
  Sun,
  User,
  Cloud,
} from 'lucide-react';

interface Props {
  masks: MaskItem[];
  activeMaskId?: string;
  showOverlay: boolean;
  onSelectMask: (id: string) => void;
  onToggleOverlay: () => void;
  onAddMask: (type: MaskType) => void;
  onUpdateMask: (mask: MaskItem) => void;
  onDeleteMask: (id: string) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

const MASK_TYPES: Array<{ type: MaskType; label: string; icon: any }> = [
  { type: 'brush', label: 'Brush', icon: Brush },
  { type: 'linear_gradient', label: 'Linear Grad', icon: Compass },
  { type: 'radial_gradient', label: 'Radial Grad', icon: Disc },
  { type: 'subject', label: 'Select Subject', icon: User },
  { type: 'sky', label: 'Select Sky', icon: Cloud },
  { type: 'color_range', label: 'Color Range', icon: Palette },
  { type: 'luma_range', label: 'Luminance', icon: Sun },
];

export const MaskingPanel: React.FC<Props> = ({
  masks,
  activeMaskId,
  showOverlay,
  onSelectMask,
  onToggleOverlay,
  onAddMask,
  onUpdateMask,
  onDeleteMask,
  onScrubStart,
  onScrubEnd,
}) => {
  const activeMask = masks.find((m) => m.id === activeMaskId);

  const updateActiveAdjustments = (key: keyof MaskItem['adjustments'], val: number) => {
    if (!activeMask) return;
    onUpdateMask({
      ...activeMask,
      adjustments: {
        ...activeMask.adjustments,
        [key]: val,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Mask Dropdown / Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Add New Local Mask
          </span>
          <button
            onClick={onToggleOverlay}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
              showOverlay
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                : 'liquid-button text-zinc-400'
            }`}
          >
            {showOverlay ? 'Overlay: ON' : 'Overlay: OFF'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {MASK_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onAddMask(type)}
              className="p-2 rounded-xl liquid-button flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-300 hover:text-white"
            >
              <Icon className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate w-full text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mask Stack List */}
      {masks.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <span className="text-xs text-zinc-400 font-medium">Mask Layers ({masks.length})</span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {masks.map((mask) => {
              const isSelected = mask.id === activeMaskId;
              return (
                <div
                  key={mask.id}
                  onClick={() => onSelectMask(mask.id)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 border border-sky-400 text-white'
                      : 'liquid-panel text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-xs font-semibold truncate">{mask.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateMask({ ...mask, enabled: !mask.enabled });
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                      title={mask.enabled ? 'Disable' : 'Enable'}
                    >
                      {mask.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-50" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMask(mask.id);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-rose-400"
                      title="Delete mask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Mask Local Adjustments */}
      {activeMask && (
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              {activeMask.name} Adjustments
            </span>
            <button
              onClick={() => onUpdateMask({ ...activeMask, inverted: !activeMask.inverted })}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                activeMask.inverted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'liquid-button text-zinc-400'
              }`}
            >
              Invert Mask
            </button>
          </div>

          {/* Local Exposure */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Local Exposure</span>
              <span className="font-mono text-zinc-300">
                {activeMask.adjustments.exposure > 0
                  ? `+${activeMask.adjustments.exposure.toFixed(1)}`
                  : activeMask.adjustments.exposure.toFixed(1)} EV
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={activeMask.adjustments.exposure}
              onMouseDown={onScrubStart}
              onMouseUp={onScrubEnd}
              onChange={(e) => updateActiveAdjustments('exposure', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Local Temperature */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Local Temperature</span>
              <span className="font-mono text-zinc-300">
                {activeMask.adjustments.temperature > 0
                  ? `+${activeMask.adjustments.temperature}`
                  : activeMask.adjustments.temperature}
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={activeMask.adjustments.temperature}
              onMouseDown={onScrubStart}
              onMouseUp={onScrubEnd}
              onChange={(e) => updateActiveAdjustments('temperature', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Local Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Local Contrast</span>
              <span className="font-mono text-zinc-300">
                {activeMask.adjustments.contrast > 0
                  ? `+${activeMask.adjustments.contrast}`
                  : activeMask.adjustments.contrast}
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={activeMask.adjustments.contrast}
              onMouseDown={onScrubStart}
              onMouseUp={onScrubEnd}
              onChange={(e) => updateActiveAdjustments('contrast', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
