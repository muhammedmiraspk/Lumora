import React from 'react';
import { GeometrySettings } from '../../types/editor';
import { DEFAULT_GEOMETRY } from '../../constants/initialState';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Crop } from 'lucide-react';

interface Props {
  geometry: GeometrySettings;
  onChange: (geo: GeometrySettings) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

const ASPECTS: Array<{ id: GeometrySettings['cropAspect']; label: string }> = [
  { id: 'original', label: 'Orig' },
  { id: 'free', label: 'Free' },
  { id: '1:1', label: '1:1' },
  { id: '4:5', label: '4:5' },
  { id: '3:4', label: '3:4' },
  { id: '9:16', label: '9:16' },
  { id: '16:9', label: '16:9' },
];

export const GeometryPanel: React.FC<Props> = ({
  geometry,
  onChange,
  onScrubStart,
  onScrubEnd,
}) => {
  const handleRotate = (delta: number) => {
    let newRot = (geometry.rotation + delta) % 360;
    if (newRot > 180) newRot -= 360;
    if (newRot < -180) newRot += 360;
    onChange({
      ...geometry,
      rotation: newRot,
    });
  };

  const handleFlipH = () => {
    onChange({
      ...geometry,
      flipH: !geometry.flipH,
    });
  };

  const handleFlipV = () => {
    onChange({
      ...geometry,
      flipV: !geometry.flipV,
    });
  };

  const resetGeometry = () => {
    onChange({ ...DEFAULT_GEOMETRY });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Crop className="w-3.5 h-3.5 text-sky-400" />
          Crop, Aspect & Transform
        </span>
        <button
          onClick={resetGeometry}
          title="Reset Geometry"
          className="p-1.5 rounded-lg liquid-button text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="space-y-1.5">
        <span className="text-xs text-zinc-400 font-medium">Aspect Ratio</span>
        <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-panel overflow-x-auto">
          {ASPECTS.map((asp) => (
            <button
              key={asp.id}
              onClick={() => {
                let rect = { x: 0, y: 0, width: 1, height: 1 };
                if (asp.id === '1:1') rect = { x: 0.1, y: 0.1, width: 0.8, height: 0.8 };
                else if (asp.id === '4:5') rect = { x: 0.1, y: 0, width: 0.8, height: 1 };
                else if (asp.id === '9:16') rect = { x: 0.22, y: 0, width: 0.56, height: 1 };
                else if (asp.id === '16:9') rect = { x: 0, y: 0.22, width: 1, height: 0.56 };

                onChange({
                  ...geometry,
                  cropAspect: asp.id,
                  cropRect: rect,
                });
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                geometry.cropAspect === asp.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {asp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rotation & Flip Controls */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button
          onClick={() => handleRotate(-90)}
          className="p-2.5 rounded-xl liquid-button flex flex-col items-center justify-center gap-1 text-xs text-zinc-300 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
          -90°
        </button>
        <button
          onClick={() => handleRotate(90)}
          className="p-2.5 rounded-xl liquid-button flex flex-col items-center justify-center gap-1 text-xs text-zinc-300 hover:text-white"
        >
          <RotateCw className="w-4 h-4" />
          +90°
        </button>
        <button
          onClick={handleFlipH}
          className={`p-2.5 rounded-xl liquid-button flex flex-col items-center justify-center gap-1 text-xs ${
            geometry.flipH ? 'bg-sky-500/30 text-sky-300 border-sky-400' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <FlipHorizontal className="w-4 h-4" />
          Flip H
        </button>
        <button
          onClick={handleFlipV}
          className={`p-2.5 rounded-xl liquid-button flex flex-col items-center justify-center gap-1 text-xs ${
            geometry.flipV ? 'bg-sky-500/30 text-sky-300 border-sky-400' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <FlipVertical className="w-4 h-4" />
          Flip V
        </button>
      </div>

      {/* Fine Straighten Slider */}
      <div className="space-y-1 pt-2 border-t border-white/10">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Straighten Horizon</span>
          <span className="font-mono text-zinc-300">
            {geometry.straighten > 0 ? `+${geometry.straighten}°` : `${geometry.straighten}°`}
          </span>
        </div>
        <input
          type="range"
          min="-45"
          max="45"
          step="0.5"
          value={geometry.straighten}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onChange={(e) =>
            onChange({
              ...geometry,
              straighten: parseFloat(e.target.value),
            })
          }
          className="w-full"
        />
      </div>
    </div>
  );
};
