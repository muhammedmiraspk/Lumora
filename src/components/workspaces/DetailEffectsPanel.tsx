import React from 'react';
import { ToneAndDetail } from '../../types/editor';
import { DEFAULT_TONE_DETAIL } from '../../constants/initialState';
import { RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  toneDetail: ToneAndDetail;
  onChange: (toneDetail: ToneAndDetail) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

export const DetailEffectsPanel: React.FC<Props> = ({
  toneDetail,
  onChange,
  onScrubStart,
  onScrubEnd,
}) => {
  const updateKey = (key: keyof ToneAndDetail, val: any) => {
    onChange({
      ...toneDetail,
      [key]: val,
    });
  };

  const resetAll = () => {
    onChange({ ...DEFAULT_TONE_DETAIL });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Optics, Detail & Film Effects
        </span>
        <button
          onClick={resetAll}
          title="Reset Detail & Effects"
          className="p-1.5 rounded-lg liquid-button text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Texture, Clarity, Dehaze */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Texture</span>
            <span className="font-mono text-zinc-300">
              {toneDetail.texture > 0 ? `+${toneDetail.texture}` : toneDetail.texture}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={toneDetail.texture}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('texture', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Clarity</span>
            <span className="font-mono text-zinc-300">
              {toneDetail.clarity > 0 ? `+${toneDetail.clarity}` : toneDetail.clarity}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={toneDetail.clarity}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('clarity', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Dehaze</span>
            <span className="font-mono text-zinc-300">
              {toneDetail.dehaze > 0 ? `+${toneDetail.dehaze}` : toneDetail.dehaze}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={toneDetail.dehaze}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('dehaze', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Sharpening & Noise Reduction */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Sharpening</span>
            <span className="font-mono text-zinc-300">{toneDetail.sharpening}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={toneDetail.sharpening}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('sharpening', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Noise Reduction</span>
            <span className="font-mono text-zinc-300">{toneDetail.noiseReduction}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={toneDetail.noiseReduction}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('noiseReduction', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Vignette & Film Grain */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Vignette</span>
            <span className="font-mono text-zinc-300">
              {toneDetail.vignette > 0 ? `+${toneDetail.vignette}` : toneDetail.vignette}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={toneDetail.vignette}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('vignette', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Film Grain</span>
            <span className="font-mono text-zinc-300">{toneDetail.grain}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={toneDetail.grain}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('grain', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Bloom, Halation, Chromatic Aberration */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Bloom Glow</span>
            <span className="font-mono text-zinc-300">{toneDetail.bloom}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={toneDetail.bloom}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('bloom', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Halation</span>
            <span className="font-mono text-zinc-300">{toneDetail.halation}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={toneDetail.halation}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('halation', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Chromatic Aberration (RGB Split)</span>
            <span className="font-mono text-zinc-300">{toneDetail.chromaticAberration}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={toneDetail.chromaticAberration}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) => updateKey('chromaticAberration', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
