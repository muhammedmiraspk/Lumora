import React, { useRef, useState, useEffect } from 'react';
import { HistogramData } from '../../types/editor';
import { AlertCircle, Maximize2, Minimize2, Eye } from 'lucide-react';

interface Props {
  liveHistogram: HistogramData | null;
  sourceImage?: HTMLImageElement | null;
}

type ChannelMode = 'all' | 'red' | 'green' | 'blue' | 'luma';

export const HistogramView: React.FC<Props> = ({ liveHistogram }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channelMode, setChannelMode] = useState<ChannelMode>('all');
  const [hoverBin, setHoverBin] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Draw the histogram whenever live data or channel mode changes
  useEffect(() => {
    if (!liveHistogram || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Deep dark background
    ctx.fillStyle = 'rgba(7, 11, 18, 0.9)';
    ctx.fillRect(0, 0, w, h);

    // Grid lines: 4 zones (Blacks/Shadows, Midtones Low, Midtones High, Highlights/Whites)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    for (let x = w / 4; x < w; x += w / 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Horizontal reference lines (25%, 50%, 75%)
    for (let y = h / 4; y < h; y += h / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Helper to draw smooth filled channel curve
    const drawChannel = (arr: number[], color: string, alpha: number, isLineOnly = false) => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w;
        const yVal = arr[i] || 0;
        const y = h - (yVal / 100) * (h - 6);
        ctx.lineTo(x, y);
      }

      if (!isLineOnly) {
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      // Stroke outline
      ctx.strokeStyle = color;
      ctx.globalAlpha = Math.min(1, alpha + 0.3);
      ctx.lineWidth = isLineOnly ? 1.8 : 1.2;
      ctx.stroke();
    };

    if (channelMode === 'all') {
      ctx.globalCompositeOperation = 'screen';
      drawChannel(liveHistogram.red, '#ef4444', 0.45);
      drawChannel(liveHistogram.green, '#22c55e', 0.45);
      drawChannel(liveHistogram.blue, '#3b82f6', 0.45);

      // White Luminance Line on top
      ctx.globalCompositeOperation = 'source-over';
      drawChannel(liveHistogram.luma, '#f8fafc', 0.85, true);
    } else if (channelMode === 'red') {
      drawChannel(liveHistogram.red, '#f87171', 0.65);
    } else if (channelMode === 'green') {
      drawChannel(liveHistogram.green, '#4ade80', 0.65);
    } else if (channelMode === 'blue') {
      drawChannel(liveHistogram.blue, '#60a5fa', 0.65);
    } else if (channelMode === 'luma') {
      drawChannel(liveHistogram.luma, '#e2e8f0', 0.7);
    }

    // Hover inspection line
    if (hoverBin !== null) {
      const hoverX = (hoverBin / 255) * w;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 1.0;
  }, [liveHistogram, channelMode, hoverBin, isExpanded]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const bin = Math.max(0, Math.min(255, Math.round((x / rect.width) * 255)));
    setHoverBin(bin);
  };

  const handleMouseLeave = () => {
    setHoverBin(null);
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-white/10 liquid-panel bg-slate-950/80 p-2.5 shadow-xl transition-all ${
        isExpanded ? 'h-48' : 'h-28'
      }`}
    >
      {/* Top Header: Channel Switcher & Clipping Indicators */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        {/* Channel Pills */}
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'all', label: 'RGB' },
              { id: 'red', label: 'R' },
              { id: 'green', label: 'G' },
              { id: 'blue', label: 'B' },
              { id: 'luma', label: 'Y' },
            ] as const
          ).map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannelMode(ch.id)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-all ${
                channelMode === ch.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'liquid-button text-zinc-400 hover:text-white'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Live Clipping Warning Badges */}
        <div className="flex items-center gap-1.5">
          {liveHistogram?.clippedShadows && (
            <span
              title="Shadow pixels crushed to pure black"
              className="flex items-center gap-1 text-[9px] text-sky-400 font-bold px-1.5 py-0.5 rounded bg-sky-950/70 border border-sky-400/40 animate-pulse"
            >
              <AlertCircle className="w-2.5 h-2.5" />
              {liveHistogram.shadowClipPercent}% SHD
            </span>
          )}
          {liveHistogram?.clippedHighlights && (
            <span
              title="Highlight pixels blown out to pure white"
              className="flex items-center gap-1 text-[9px] text-rose-400 font-bold px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-400/40 animate-pulse"
            >
              <AlertCircle className="w-2.5 h-2.5" />
              {liveHistogram.highlightClipPercent}% HLI
            </span>
          )}

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand detailed histogram'}
            className="p-1 rounded liquid-button text-zinc-400 hover:text-white"
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="relative w-full rounded-xl overflow-hidden border border-white/5">
        <canvas
          ref={canvasRef}
          width={280}
          height={isExpanded ? 110 : 54}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Hover Readout Tooltip */}
        {hoverBin !== null && liveHistogram && (
          <div className="absolute top-1 left-2 pointer-events-none text-[9px] font-mono text-zinc-300 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-2">
            <span>Level: {hoverBin}</span>
            <span className="text-rose-400">R: {Math.round(liveHistogram.red[hoverBin] || 0)}%</span>
            <span className="text-emerald-400">G: {Math.round(liveHistogram.green[hoverBin] || 0)}%</span>
            <span className="text-blue-400">B: {Math.round(liveHistogram.blue[hoverBin] || 0)}%</span>
          </div>
        )}
      </div>

      {/* Channel Mean Readout Bar (Expanded mode) */}
      {isExpanded && liveHistogram && (
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1.5 px-1 pt-1 border-t border-white/5">
          <span className="text-rose-400">Mean R: {liveHistogram.meanR}</span>
          <span className="text-emerald-400">Mean G: {liveHistogram.meanG}</span>
          <span className="text-blue-400">Mean B: {liveHistogram.meanB}</span>
          <span className="text-slate-200">Luma: {liveHistogram.meanLuma}</span>
        </div>
      )}
    </div>
  );
};
