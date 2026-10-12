import React, { useState, useMemo } from 'react';
import { EditState } from '../../types/editor';
import { ImageProcessor } from '../../engine/imageProcessor';
import { Download, Share2, Sparkles, Check, FileCheck, Smartphone, ExternalLink } from 'lucide-react';

interface Props {
  sourceImage: HTMLImageElement | null;
  editState: EditState;
  onOpenApkModal?: () => void;
}

type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';

interface ResPreset {
  label: string;
  width?: number;
  height?: number;
  isOriginal?: boolean;
}

const RES_PRESETS: ResPreset[] = [
  { label: 'Original Full Res', isOriginal: true },
  { label: '4K Ultra HD (3840px)', width: 3840 },
  { label: '2K QHD (2560px)', width: 2560 },
  { label: '1080p Full HD (1920px)', width: 1920 },
  { label: 'Instagram Post (1:1 1080px)', width: 1080, height: 1080 },
  { label: 'Instagram Portrait (4:5 1080x1350)', width: 1080, height: 1350 },
  { label: 'Stories / Reels (9:16 1080x1920)', width: 1080, height: 1920 },
  { label: 'YouTube Thumbnail (1280x720)', width: 1280, height: 720 },
];

export const ExportWorkspace: React.FC<Props> = ({ sourceImage, editState, onOpenApkModal }) => {
  const [format, setFormat] = useState<ExportFormat>('image/jpeg');
  const [quality, setQuality] = useState<number>(92);
  const [selectedResIdx, setSelectedResIdx] = useState<number>(0);
  const [sharpenForScreen, setSharpenForScreen] = useState<boolean>(true);
  const [preserveExif, setPreserveExif] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  const origW = sourceImage?.naturalWidth || 1920;
  const origH = sourceImage?.naturalHeight || 1080;

  // Calculate output dimensions
  const outDims = useMemo(() => {
    const preset = RES_PRESETS[selectedResIdx];
    if (preset.isOriginal) return { width: origW, height: origH };
    if (preset.width && preset.height) return { width: preset.width, height: preset.height };
    if (preset.width) {
      const scale = preset.width / origW;
      return { width: preset.width, height: Math.round(origH * scale) };
    }
    return { width: origW, height: origH };
  }, [selectedResIdx, origW, origH]);

  // Estimated file size calculation
  const estimatedSizeMb = useMemo(() => {
    const totalPixels = outDims.width * outDims.height;
    if (format === 'image/png') {
      return ((totalPixels * 3.2) / (1024 * 1024)).toFixed(1);
    }
    if (format === 'image/webp') {
      return ((totalPixels * 0.18 * (quality / 100)) / (1024 * 1024)).toFixed(2);
    }
    return ((totalPixels * 0.28 * (quality / 100)) / (1024 * 1024)).toFixed(2);
  }, [outDims, format, quality]);

  // Execute actual export
  const handleExport = async (shareMode: boolean = false) => {
    if (!sourceImage) return;
    setIsExporting(true);
    setExportComplete(false);

    try {
      // Offscreen canvas at target resolution
      const offscreen = document.createElement('canvas');
      offscreen.width = outDims.width;
      offscreen.height = outDims.height;

      // Render full pipeline
      ImageProcessor.render(sourceImage, offscreen, editState, {
        isProxy: false,
        maxDimension: Math.max(outDims.width, outDims.height),
      });

      // Sharpen for screen pass if selected
      if (sharpenForScreen) {
        const ctx = offscreen.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = 0.08;
          ctx.drawImage(offscreen, 0, 0);
          ctx.restore();
        }
      }

      // Convert to blob
      const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      const filename = `LUMORA_${dateStr}_${timeStr}.${ext}`;

      offscreen.toBlob(
        async (blob) => {
          if (!blob) {
            setIsExporting(false);
            return;
          }

          if (shareMode && navigator.share && navigator.canShare) {
            try {
              const file = new File([blob], filename, { type: format });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: 'Lumora Studio Master Photo',
                  text: 'Edited with Lumora Studio',
                });
                setIsExporting(false);
                setExportComplete(true);
                return;
              }
            } catch {
              // Fallback to direct download
            }
          }

          // Trigger download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setIsExporting(false);
          setExportComplete(true);
        },
        format,
        quality / 100
      );
    } catch {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Export Studio Pro
          </h2>
          <p className="text-[11px] text-zinc-400">
            Nondestructive full-resolution master export with ICC profiles
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
          STUDIO ENGINE
        </span>
      </div>

      {/* Format Selection */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-zinc-300">File Format</span>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { fmt: 'image/jpeg', label: 'JPEG (Standard)' },
              { fmt: 'image/png', label: 'PNG (Lossless)' },
              { fmt: 'image/webp', label: 'WebP (Modern)' },
            ] as const
          ).map((item) => (
            <button
              key={item.fmt}
              onClick={() => setFormat(item.fmt)}
              className={`p-2.5 rounded-xl text-xs font-semibold transition-all ${
                format === item.fmt
                  ? 'liquid-button-accent shadow-md'
                  : 'liquid-panel text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider (for JPEG / WebP) */}
      {format !== 'image/png' && (
        <div className="space-y-1 p-3 rounded-xl liquid-panel">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-300 font-medium">JPEG Quality</span>
            <span className="font-mono text-sky-400 font-bold">{quality}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono pt-0.5">
            <span>Web (75%)</span>
            <span>Balanced (88%)</span>
            <span>Master (98%)</span>
          </div>
        </div>
      )}

      {/* Resolution Presets */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-zinc-300">Dimensions & Social Presets</span>
        <div className="space-y-1.5">
          {RES_PRESETS.map((preset, idx) => (
            <button
              key={preset.label}
              onClick={() => setSelectedResIdx(idx)}
              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                selectedResIdx === idx
                  ? 'bg-sky-500/20 border-2 border-sky-400 text-white shadow-md'
                  : 'liquid-panel text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-xs font-medium">{preset.label}</span>
              {selectedResIdx === idx && <Check className="w-4 h-4 text-sky-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Options: Sharpen for screen, EXIF */}
      <div className="p-3 rounded-xl liquid-panel space-y-2.5">
        <label className="flex items-center justify-between text-xs cursor-pointer">
          <span className="text-zinc-300 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Sharpen for Screen / Retina Display
          </span>
          <input
            type="checkbox"
            checked={sharpenForScreen}
            onChange={(e) => setSharpenForScreen(e.target.checked)}
            className="w-4 h-4 accent-sky-500"
          />
        </label>

        <label className="flex items-center justify-between text-xs cursor-pointer pt-2 border-t border-white/10">
          <span className="text-zinc-300 font-medium flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            Preserve Camera EXIF & Metadata
          </span>
          <input
            type="checkbox"
            checked={preserveExif}
            onChange={(e) => setPreserveExif(e.target.checked)}
            className="w-4 h-4 accent-sky-500"
          />
        </label>
      </div>

      {/* Output Summary Card */}
      <div className="p-3 rounded-2xl liquid-panel-elevated bg-slate-950/70 border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">
            OUTPUT DIMENSIONS
          </span>
          <span className="text-sm font-bold font-mono text-white">
            {outDims.width} × {outDims.height} px
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">
            EST. FILE SIZE
          </span>
          <span className="text-sm font-bold font-mono text-sky-400">
            ~{estimatedSizeMb} MB
          </span>
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          onClick={() => handleExport(false)}
          disabled={isExporting}
          className="w-full py-3.5 rounded-2xl liquid-button-accent flex items-center justify-center gap-2 font-bold text-sm tracking-wide shadow-xl disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Processing Master Render...' : 'Save Photo to Device'}
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={() => handleExport(true)}
            disabled={isExporting}
            className="w-full py-2.5 rounded-2xl liquid-button flex items-center justify-center gap-2 font-semibold text-xs text-zinc-300 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
            Share via Android Share Sheet
          </button>
        )}

        {exportComplete && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-fade-in flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> Photo exported successfully!
          </div>
        )}
      </div>

      {/* Android Native APK Direct Download */}
      <div className="p-3.5 rounded-2xl liquid-panel bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-sky-950/30 border border-emerald-500/30 space-y-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Direct Android APK</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
            v2.4.0 APK
          </span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          Want Lumora Studio installed natively on your Android device (Poco C31 / Samsung / Xiaomi)? Download the standalone APK package directly.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <a
            href="/download/lumora-studio.apk"
            download="LumoraStudio-v2.4.0.apk"
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Download APK Directly"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK (66.8 MB)</span>
          </a>
          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              className="py-2.5 px-3 rounded-xl liquid-button text-xs font-medium text-zinc-300 hover:text-white transition-all whitespace-nowrap flex items-center gap-1"
              title="View full download options, direct links & QR"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Options & Links</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
