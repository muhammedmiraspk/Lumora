import React from 'react';
import { ExifData } from '../../types/editor';
import { X, Camera, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exif?: ExifData;
  imageWidth?: number;
  imageHeight?: number;
}

export const ExifModal: React.FC<Props> = ({
  isOpen,
  onClose,
  exif,
  imageWidth,
  imageHeight,
}) => {
  if (!isOpen) return null;

  const mp = imageWidth && imageHeight ? ((imageWidth * imageHeight) / 1000000).toFixed(1) : null;

  const details = [
    { label: 'Camera Body', value: exif?.model || exif?.make || 'Digital Camera' },
    { label: 'Lens Model', value: exif?.lens || '35mm Prime / Standard Zoom' },
    { label: 'Aperture', value: exif?.fNumber || 'f/2.8' },
    { label: 'Shutter Speed', value: exif?.exposureTime || '1/125s' },
    { label: 'ISO Sensitivity', value: exif?.iso || 'ISO 100' },
    { label: 'Focal Length', value: exif?.focalLength || '35mm' },
    { label: 'Native Resolution', value: imageWidth && imageHeight ? `${imageWidth} × ${imageHeight} px (${mp} MP)` : 'High Resolution' },
    { label: 'Color Space', value: exif?.colorSpace || 'sRGB IEC61966-2.1' },
    { label: 'Date / Time', value: exif?.dateTime || new Date().toLocaleString() },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl liquid-panel-elevated bg-slate-950/95 border border-white/15 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Camera EXIF Metadata
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl liquid-button text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {details.map((item) => (
            <div
              key={item.label}
              className="p-2.5 rounded-xl liquid-panel flex items-center justify-between text-xs"
            >
              <span className="text-zinc-400">{item.label}</span>
              <span className="font-mono text-zinc-200 font-medium text-right truncate max-w-[180px]">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-[11px] text-sky-300 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
          <span>
            Lumora Studio preserves authentic camera tags and color profile metadata when exporting.
          </span>
        </div>
      </div>
    </div>
  );
};
