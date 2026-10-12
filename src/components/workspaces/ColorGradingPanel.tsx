import React, { useRef, useState, useEffect } from 'react';
import { ColorWheelVal } from '../../types/editor';
import { RotateCcw } from 'lucide-react';

interface Props {
  colorGrading: {
    shadows: ColorWheelVal;
    midtones: ColorWheelVal;
    highlights: ColorWheelVal;
    global: ColorWheelVal;
    blending: number;
    balance: number;
  };
  onChange: (grading: any) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

type WheelTarget = 'shadows' | 'midtones' | 'highlights' | 'global';

export const ColorGradingPanel: React.FC<Props> = ({
  colorGrading,
  onChange,
  onScrubStart,
  onScrubEnd,
}) => {
  const [activeTarget, setActiveTarget] = useState<WheelTarget>('shadows');
  const discRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentWheel = colorGrading[activeTarget] || { hue: 0, saturation: 0, luminance: 0 };

  // Draw 2D chromatic wheel on canvas
  useEffect(() => {
    const canvas = discRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 6;

    ctx.clearRect(0, 0, size, size);

    // Draw chromatic disc
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 1) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
      grad.addColorStop(0, '#71717a'); // Desaturated neutral center
      grad.addColorStop(1, `hsl(${angle}, 100%, 50%)`); // Pure saturated edge
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Outer ring border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair reference lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(center, center - radius);
    ctx.lineTo(center, center + radius);
    ctx.moveTo(center - radius, center);
    ctx.lineTo(center + radius, center);
    ctx.stroke();

    // Draw puck position based on current hue & saturation
    const rad = (currentWheel.hue * Math.PI) / 180;
    const dist = (currentWheel.saturation / 100) * radius;
    const puckX = center + dist * Math.cos(rad);
    const puckY = center + dist * Math.sin(rad);

    // Puck
    ctx.beginPath();
    ctx.arc(puckX, puckY, 7, 0, Math.PI * 2);
    ctx.fillStyle = currentWheel.saturation > 0 ? `hsl(${currentWheel.hue}, 100%, 50%)` : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [currentWheel]);

  const updateFromCoordinates = (clientX: number, clientY: number) => {
    const canvas = discRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    const maxRadius = rect.width / 2 - 6;

    const dist = Math.hypot(x, y);
    const sat = Math.min(100, Math.max(0, Math.round((dist / maxRadius) * 100)));

    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    onChange({
      ...colorGrading,
      [activeTarget]: {
        ...currentWheel,
        hue: Math.round(angle),
        saturation: sat,
      },
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    onScrubStart();
    updateFromCoordinates(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updateFromCoordinates(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onScrubEnd();
    }
  };

  const resetTargetWheel = () => {
    onChange({
      ...colorGrading,
      [activeTarget]: { hue: 0, saturation: 0, luminance: 0 },
    });
  };

  return (
    <div className="space-y-4">
      {/* Target Selector Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-xl liquid-panel">
          {(['shadows', 'midtones', 'highlights', 'global'] as WheelTarget[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTarget(tab)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTarget === tab
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={resetTargetWheel}
          title={`Reset ${activeTarget}`}
          className="p-1.5 rounded-lg liquid-button text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2D Color Disc */}
      <div className="flex flex-col items-center justify-center pt-1">
        <div className="relative p-2 rounded-full border border-white/10 bg-slate-950/70 shadow-inner">
          <canvas
            ref={discRef}
            width={170}
            height={170}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => {
              setIsDragging(true);
              onScrubStart();
              updateFromCoordinates(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (isDragging) {
                updateFromCoordinates(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={() => {
              setIsDragging(false);
              onScrubEnd();
            }}
            className="rounded-full cursor-pointer touch-none"
          />
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400 mt-2">
          <span>Hue: {currentWheel.hue}°</span>
          <span>Sat: {currentWheel.saturation}%</span>
        </div>
      </div>

      {/* Wheel Luminance Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Luminance</span>
          <span className="font-mono text-zinc-300">
            {currentWheel.luminance > 0 ? `+${currentWheel.luminance}` : currentWheel.luminance}
          </span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={currentWheel.luminance}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          onChange={(e) =>
            onChange({
              ...colorGrading,
              [activeTarget]: {
                ...currentWheel,
                luminance: parseInt(e.target.value, 10),
              },
            })
          }
          className="w-full"
        />
      </div>

      {/* Global Blending and Balance Controls */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Blending</span>
            <span className="font-mono text-zinc-300">{colorGrading.blending}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={colorGrading.blending}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) =>
              onChange({
                ...colorGrading,
                blending: parseInt(e.target.value, 10),
              })
            }
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Balance</span>
            <span className="font-mono text-zinc-300">
              {colorGrading.balance > 0 ? `+${colorGrading.balance}` : colorGrading.balance}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={colorGrading.balance}
            onMouseDown={onScrubStart}
            onMouseUp={onScrubEnd}
            onChange={(e) =>
              onChange({
                ...colorGrading,
                balance: parseInt(e.target.value, 10),
              })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
