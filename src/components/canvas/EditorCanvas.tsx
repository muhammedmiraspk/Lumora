import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EditState, MaskItem, HistogramData } from '../../types/editor';
import { ImageProcessor } from '../../engine/imageProcessor';
import { calculateHistogram } from '../../engine/histogram';
import { calculateNeutralWhiteBalance } from '../../engine/autoEnhance';
import { ZoomIn, ZoomOut, Maximize2, SplitSquareVertical } from 'lucide-react';

interface Props {
  sourceImage: HTMLImageElement | null;
  editState: EditState;
  isScrubbing: boolean; // Fast proxy rendering while slider is dragged
  compareMode: 'none' | 'split' | 'hold';
  isHoldingCompare: boolean;
  activeMaskId?: string;
  showMaskOverlay: boolean;
  isPickingWb: boolean;
  onPickWbDone?: (temp: number, tint: number) => void;
  onUpdateMask?: (mask: MaskItem) => void;
  onUpdateCropRect?: (rect: { x: number; y: number; width: number; height: number }) => void;
  isCropActive?: boolean;
  onHistogramUpdate?: (data: HistogramData) => void;
}

export const EditorCanvas: React.FC<Props> = ({
  sourceImage,
  editState,
  isScrubbing,
  compareMode,
  isHoldingCompare,
  activeMaskId,
  showMaskOverlay,
  isPickingWb,
  onPickWbDone,
  onUpdateMask,
  onHistogramUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);

  // Pan and Zoom viewport state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Split-screen comparison slider position (0 to 1)
  const [splitPos, setSplitPos] = useState<number>(0.5);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Active mask interaction
  const activeMask = editState.masks.find((m) => m.id === activeMaskId);

  // Touch gesture tracking for pinch-to-zoom
  const touchDistRef = useRef<number | null>(null);

  // Keep a stable ref to onHistogramUpdate to prevent infinite re-render loops
  const onHistogramUpdateRef = useRef(onHistogramUpdate);
  useEffect(() => {
    onHistogramUpdateRef.current = onHistogramUpdate;
  }, [onHistogramUpdate]);

  // Render pipeline execution
  const renderCanvas = useCallback(() => {
    if (!sourceImage || !mainCanvasRef.current) return;

    // Render edited canvas
    ImageProcessor.render(sourceImage, mainCanvasRef.current, editState, {
      isProxy: isScrubbing,
      showOriginal: isHoldingCompare,
      activeMaskId,
      showMaskOverlay,
    });

    // Update live real-time histogram asynchronously to prevent React update loops
    if (onHistogramUpdateRef.current && mainCanvasRef.current) {
      const canvasEl = mainCanvasRef.current;
      requestAnimationFrame(() => {
        try {
          const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
          if (ctx && canvasEl.width > 0 && canvasEl.height > 0) {
            const imgData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
            const hist = calculateHistogram(imgData);
            onHistogramUpdateRef.current?.(hist);
          }
        } catch {
          // ignore cross-origin if sample
        }
      });
    }

    // If split compare mode is active, also render original canvas
    if (compareMode === 'split' && origCanvasRef.current) {
      ImageProcessor.render(sourceImage, origCanvasRef.current, editState, {
        isProxy: isScrubbing,
        showOriginal: true,
      });
    }
  }, [sourceImage, editState, isScrubbing, isHoldingCompare, compareMode, activeMaskId, showMaskOverlay]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Fit to screen helper
  const fitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.max(0.2, Math.min(6, prev * zoomFactor)));
  };

  // Mouse / Touch Pan Start
  const handleMouseDown = (e: React.MouseEvent) => {
    // If WB picker is active, sample pixel
    if (isPickingWb && mainCanvasRef.current) {
      const rect = mainCanvasRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * mainCanvasRef.current.width);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * mainCanvasRef.current.height);
      const ctx = mainCanvasRef.current.getContext('2d');
      if (ctx) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        const correction = calculateNeutralWhiteBalance(p[0], p[1], p[2]);
        onPickWbDone?.(correction.temperature, correction.tint);
      }
      return;
    }

    // Spacebar or middle click or dragging
    if (e.button === 1 || e.shiftKey || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    if (isDraggingSplit && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setSplitPos(Math.max(0.05, Math.min(0.95, pos)));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSplit(false);
  };

  // Touch events for mobile pinch-to-zoom & pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistRef.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const ratio = currentDist / touchDistRef.current;
      setZoom((prev) => Math.max(0.2, Math.min(6, prev * ratio)));
      touchDistRef.current = currentDist;
    } else if (e.touches.length === 1 && isPanning) {
      setPan({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    touchDistRef.current = null;
    setIsPanning(false);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-black/60 select-none ${
        isPickingWb ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Zoom / Pan viewport container */}
      <div
        className="relative transition-transform duration-75 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Main Canvas */}
        <canvas
          ref={mainCanvasRef}
          className="max-h-[82vh] max-w-[92vw] shadow-2xl rounded-sm object-contain"
        />

        {/* Split screen original preview overlay */}
        {compareMode === 'split' && (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              clipPath: `polygon(0 0, ${splitPos * 100}% 0, ${splitPos * 100}% 100%, 0 100%)`,
            }}
          >
            <canvas
              ref={origCanvasRef}
              className="max-h-[82vh] max-w-[92vw] object-contain"
            />
          </div>
        )}

        {/* Draggable Split Handle Line */}
        {compareMode === 'split' && (
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDraggingSplit(true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsDraggingSplit(true);
            }}
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-30 shadow-lg flex items-center justify-center pointer-events-auto"
            style={{ left: `${splitPos * 100}%` }}
          >
            <div className="w-7 h-7 -ml-[13px] rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-md">
              <SplitSquareVertical className="w-4 h-4 text-white" />
            </div>
            <div className="absolute top-3 left-3 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 pointer-events-none font-mono">
              ORIGINAL
            </div>
            <div className="absolute top-3 right-3 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 pointer-events-none font-mono">
              EDITED
            </div>
          </div>
        )}

        {/* Linear Gradient Interactive Handles */}
        {activeMask?.type === 'linear_gradient' && activeMask.linearStart && activeMask.linearEnd && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full overflow-visible">
              <line
                x1={`${activeMask.linearStart.x * 100}%`}
                y1={`${activeMask.linearStart.y * 100}%`}
                x2={`${activeMask.linearEnd.x * 100}%`}
                y2={`${activeMask.linearEnd.y * 100}%`}
                stroke="rgba(56, 189, 248, 0.85)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Floating Canvas Quick Controls (Zoom, Fit, Compare Indicator) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-xl liquid-panel">
        <button
          onClick={() => setZoom((z) => Math.min(5, z * 1.25))}
          title="Zoom In"
          className="p-1.5 rounded-lg liquid-button text-zinc-300 hover:text-white"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.2, z / 1.25))}
          title="Zoom Out"
          className="p-1.5 rounded-lg liquid-button text-zinc-300 hover:text-white"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={fitToScreen}
          title="Fit to Screen"
          className="p-1.5 rounded-lg liquid-button text-zinc-300 hover:text-white"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-zinc-400 px-1.5 min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Picking WB Hint */}
      {isPickingWb && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl liquid-panel-elevated bg-sky-950/80 border border-sky-400 text-sky-200 text-xs font-medium flex items-center gap-2 shadow-xl animate-pulse">
          Click any neutral gray or white area to sample white balance
        </div>
      )}

      {/* Original Image comparison indicator */}
      {isHoldingCompare && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-lg bg-amber-500/90 text-slate-950 text-xs font-bold tracking-wider shadow-lg">
          SHOWING ORIGINAL
        </div>
      )}
    </div>
  );
};
