import React, { useState } from 'react';
import { LayerItem, BlendMode } from '../../types/editor';
import {
  Layers,
  Plus,
  Type,
  Square,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface Props {
  layers: LayerItem[];
  onChange: (layers: LayerItem[]) => void;
}

const BLEND_MODES: Array<{ mode: BlendMode; label: string }> = [
  { mode: 'source-over', label: 'Normal' },
  { mode: 'multiply', label: 'Multiply' },
  { mode: 'screen', label: 'Screen' },
  { mode: 'overlay', label: 'Overlay' },
  { mode: 'soft-light', label: 'Soft Light' },
  { mode: 'hard-light', label: 'Hard Light' },
  { mode: 'darken', label: 'Darken' },
  { mode: 'lighten', label: 'Lighten' },
  { mode: 'difference', label: 'Difference' },
  { mode: 'color-dodge', label: 'Color Dodge' },
  { mode: 'luminosity', label: 'Luminosity' },
];

export const LayersWorkspace: React.FC<Props> = ({ layers, onChange }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    layers.length > 0 ? layers[0].id : null
  );

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Add new Text Layer
  const handleAddText = () => {
    const newLayer: LayerItem = {
      id: `layer_text_${Date.now()}`,
      name: `Text ${layers.length + 1}`,
      type: 'text',
      visible: true,
      opacity: 100,
      blendMode: 'source-over',
      x: 300,
      y: 300,
      width: 200,
      height: 60,
      rotation: 0,
      text: 'LUMORA STUDIO',
      fontSize: 48,
      fontFamily: 'Plus Jakarta Sans',
      fontColor: '#ffffff',
      textShadow: true,
      strokeWidth: 0,
      strokeColor: '#000000',
    };
    onChange([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Add new Shape Layer
  const handleAddShape = (shapeType: 'rectangle' | 'circle') => {
    const newLayer: LayerItem = {
      id: `layer_shape_${Date.now()}`,
      name: `${shapeType === 'circle' ? 'Circle' : 'Frame'} ${layers.length + 1}`,
      type: 'shape',
      visible: true,
      opacity: 85,
      blendMode: 'overlay',
      x: 300,
      y: 300,
      width: 160,
      height: 160,
      rotation: 0,
      shapeType,
      fillColor: 'rgba(56, 189, 248, 0.4)',
      borderColor: '#ffffff',
      borderWidth: 2,
    };
    onChange([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateSelectedLayer = (fields: Partial<LayerItem>) => {
    if (!selectedLayerId) return;
    onChange(
      layers.map((l) => (l.id === selectedLayerId ? { ...l, ...fields } : l))
    );
  };

  const handleDelete = (id: string) => {
    const updated = layers.filter((l) => l.id !== id);
    onChange(updated);
    if (selectedLayerId === id) {
      setSelectedLayerId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleDuplicate = (layer: LayerItem) => {
    const clone: LayerItem = {
      ...layer,
      id: `layer_${Date.now()}`,
      name: `${layer.name} (Copy)`,
      x: layer.x + 20,
      y: layer.y + 20,
    };
    onChange([...layers, clone]);
    setSelectedLayerId(clone.id);
  };

  const moveLayer = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= layers.length) return;
    const copy = [...layers];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with Quick Add Buttons */}
      <div className="p-3 border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            Compositing & Graphic Layers
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleAddText}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl liquid-button text-xs font-semibold text-zinc-200 hover:text-white"
          >
            <Type className="w-3.5 h-3.5 text-sky-400" />
            Add Text
          </button>
          <button
            onClick={() => handleAddShape('rectangle')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl liquid-button text-xs font-semibold text-zinc-200 hover:text-white"
          >
            <Square className="w-3.5 h-3.5 text-sky-400" />
            Add Rect
          </button>
          <button
            onClick={() => handleAddShape('circle')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl liquid-button text-xs font-semibold text-zinc-200 hover:text-white"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            Add Circle
          </button>
        </div>
      </div>

      {/* Layer Stack */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Base Layer */}
        <div className="p-2.5 rounded-xl liquid-panel border-sky-500/20 flex items-center justify-between opacity-80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-xs font-semibold text-white">Background Image (Base)</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">LOCKED</span>
        </div>

        {layers.map((layer, idx) => {
          const isSelected = layer.id === selectedLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-sky-500/20 border-2 border-sky-400 shadow-lg'
                  : 'liquid-panel hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSelectedLayer({ visible: !layer.visible });
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-40" />}
                </button>
                <span className="text-xs font-semibold text-zinc-200">{layer.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(idx, -1);
                  }}
                  disabled={idx === 0}
                  className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(idx, 1);
                  }}
                  disabled={idx === layers.length - 1}
                  className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(layer);
                  }}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(layer.id);
                  }}
                  className="p-1 text-zinc-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Layer Inspector Controls */}
      {selectedLayer && (
        <div className="p-3 border-t border-white/10 bg-slate-950/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-300 uppercase tracking-wider">
              {selectedLayer.name} Settings
            </span>
            <span className="font-mono text-zinc-400">{selectedLayer.opacity}%</span>
          </div>

          {/* Opacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Opacity</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedLayer.opacity}
              onChange={(e) => updateSelectedLayer({ opacity: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          {/* Blend Mode */}
          <div className="space-y-1">
            <span className="text-xs text-zinc-400">Blend Mode</span>
            <select
              value={selectedLayer.blendMode}
              onChange={(e) => updateSelectedLayer({ blendMode: e.target.value as BlendMode })}
              className="w-full px-2.5 py-1.5 rounded-xl liquid-panel text-xs text-white outline-none"
            >
              {BLEND_MODES.map((b) => (
                <option key={b.mode} value={b.mode} className="bg-slate-900 text-white">
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* If Text Layer */}
          {selectedLayer.type === 'text' && (
            <div className="space-y-2 pt-1 border-t border-white/10">
              <input
                type="text"
                value={selectedLayer.text || ''}
                onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                placeholder="Enter text..."
                className="w-full px-2.5 py-1.5 rounded-xl liquid-panel text-xs text-white outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-zinc-400">Font Size</span>
                  <input
                    type="range"
                    min="16"
                    max="120"
                    value={selectedLayer.fontSize || 36}
                    onChange={(e) => updateSelectedLayer({ fontSize: parseInt(e.target.value, 10) })}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400">Text Color</span>
                  <input
                    type="color"
                    value={selectedLayer.fontColor || '#ffffff'}
                    onChange={(e) => updateSelectedLayer({ fontColor: e.target.value })}
                    className="w-full h-7 rounded-lg mt-1 cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If Shape Layer */}
          {selectedLayer.type === 'shape' && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <div>
                <span className="text-[11px] text-zinc-400">Fill Color</span>
                <input
                  type="color"
                  value={selectedLayer.fillColor || '#38bdf8'}
                  onChange={(e) => updateSelectedLayer({ fillColor: e.target.value })}
                  className="w-full h-7 rounded-lg mt-1 cursor-pointer bg-transparent border-0"
                />
              </div>
              <div>
                <span className="text-[11px] text-zinc-400">Border Color</span>
                <input
                  type="color"
                  value={selectedLayer.borderColor || '#ffffff'}
                  onChange={(e) => updateSelectedLayer({ borderColor: e.target.value })}
                  className="w-full h-7 rounded-lg mt-1 cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
