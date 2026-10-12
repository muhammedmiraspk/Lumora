import React, { useRef, useState, useEffect } from 'react';
import { CurvePoint } from '../../types/editor';
import { RotateCcw } from 'lucide-react';

interface Props {
  curves: {
    rgb: CurvePoint[];
    red: CurvePoint[];
    green: CurvePoint[];
    blue: CurvePoint[];
  };
  onChange: (curves: {
    rgb: CurvePoint[];
    red: CurvePoint[];
    green: CurvePoint[];
    blue: CurvePoint[];
  }) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

type Channel = 'rgb' | 'red' | 'green' | 'blue';

export const CurvesPanel: React.FC<Props> = ({
  curves,
  onChange,
  onScrubStart,
  onScrubEnd,
}) => {
  const [activeChannel, setActiveChannel] = useState<Channel>('rgb');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);

  const currentPoints = curves[activeChannel] || [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ];

  // Draw curves on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.fillStyle = 'rgba(10, 14, 22, 0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo((w / 4) * i, 0);
      ctx.lineTo((w / 4) * i, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, (h / 4) * i);
      ctx.lineTo(w, (h / 4) * i);
      ctx.stroke();
    }

    // 45 degree diagonal baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Channel color
    let strokeColor = '#38bdf8';
    if (activeChannel === 'red') strokeColor = '#f87171';
    else if (activeChannel === 'green') strokeColor = '#4ade80';
    else if (activeChannel === 'blue') strokeColor = '#60a5fa';

    // Interpolate points smoothly
    const sorted = [...currentPoints].sort((a, b) => a.x - b.x);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const normX = (x / w) * 255;
      // Hermite spline evaluation
      let normY = normX;
      for (let i = 0; i < sorted.length - 1; i++) {
        if (normX >= sorted[i].x && normX <= sorted[i + 1].x) {
          const dx = sorted[i + 1].x - sorted[i].x;
          const t = dx > 0 ? (normX - sorted[i].x) / dx : 0;
          const smoothT = t * t * (3 - 2 * t);
          normY = sorted[i].y + (sorted[i + 1].y - sorted[i].y) * smoothT;
          break;
        }
      }
      const canvasY = h - (normY / 255) * h;
      if (x === 0) ctx.moveTo(x, canvasY);
      else ctx.lineTo(x, canvasY);
    }
    ctx.stroke();

    // Draw control points
    sorted.forEach((pt, idx) => {
      const cx = (pt.x / 255) * w;
      const cy = h - (pt.y / 255) * h;
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(cx, cy, idx === draggingPointIndex ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [currentPoints, activeChannel, draggingPointIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 255;
    const clickY = 255 - ((e.clientY - rect.top) / rect.height) * 255;

    // Check if clicked near existing point
    const threshold = 18;
    const foundIdx = currentPoints.findIndex(
      (p) => Math.hypot(p.x - clickX, p.y - clickY) < threshold
    );

    onScrubStart();

    if (foundIdx !== -1) {
      setDraggingPointIndex(foundIdx);
    } else {
      // Add new point
      const newPoints = [...currentPoints, { x: Math.round(clickX), y: Math.round(clickY) }].sort(
        (a, b) => a.x - b.x
      );
      const newIndex = newPoints.findIndex(
        (p) => Math.abs(p.x - clickX) < 2 && Math.abs(p.y - clickY) < 2
      );
      setDraggingPointIndex(newIndex);
      onChange({
        ...curves,
        [activeChannel]: newPoints,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingPointIndex === null || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(255, Math.round(((e.clientX - rect.left) / rect.width) * 255)));
    const newY = Math.max(0, Math.min(255, Math.round(255 - ((e.clientY - rect.top) / rect.height) * 255)));

    const pts = [...currentPoints];
    // First and last points locked to x=0 and x=255
    if (draggingPointIndex === 0) {
      pts[0] = { x: 0, y: newY };
    } else if (draggingPointIndex === pts.length - 1) {
      pts[pts.length - 1] = { x: 255, y: newY };
    } else {
      pts[draggingPointIndex] = { x: newX, y: newY };
    }

    onChange({
      ...curves,
      [activeChannel]: pts.sort((a, b) => a.x - b.x),
    });
  };

  const handleMouseUp = () => {
    setDraggingPointIndex(null);
    onScrubEnd();
  };

  const resetCurrentChannel = () => {
    onChange({
      ...curves,
      [activeChannel]: [
        { x: 0, y: 0 },
        { x: 255, y: 255 },
      ],
    });
  };

  return (
    <div className="space-y-3">
      {/* Channel Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-panel">
          <button
            onClick={() => setActiveChannel('rgb')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeChannel === 'rgb'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            RGB
          </button>
          <button
            onClick={() => setActiveChannel('red')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeChannel === 'red'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Red
          </button>
          <button
            onClick={() => setActiveChannel('green')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeChannel === 'green'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Green
          </button>
          <button
            onClick={() => setActiveChannel('blue')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeChannel === 'blue'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Blue
          </button>
        </div>

        <button
          onClick={resetCurrentChannel}
          title="Reset Channel Curve"
          className="p-1.5 rounded-lg liquid-button text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg">
        <canvas
          ref={canvasRef}
          width={240}
          height={200}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-48 block cursor-crosshair"
        />
        <div className="absolute bottom-1 right-2 text-[9px] text-zinc-500 font-mono">
          Click to add points, drag to sculpt tone
        </div>
      </div>
    </div>
  );
};
