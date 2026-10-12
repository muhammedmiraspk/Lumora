import React, { useState } from 'react';
import { EditState, MaskItem, MaskType, HistogramData } from '../../types/editor';
import { HistogramView } from './HistogramView';
import { BasicPanel } from './BasicPanel';
import { CurvesPanel } from './CurvesPanel';
import { HslPanel } from './HslPanel';
import { ColorGradingPanel } from './ColorGradingPanel';
import { DetailEffectsPanel } from './DetailEffectsPanel';
import { GeometryPanel } from './GeometryPanel';
import { MaskingPanel } from './MaskingPanel';
import {
  SlidersHorizontal,
  Activity,
  Palette,
  Disc3,
  Sparkles,
  Crop,
  Layers,
} from 'lucide-react';

interface Props {
  sourceImage: HTMLImageElement | null;
  editState: EditState;
  liveHistogram: HistogramData | null;
  onChange: (state: EditState) => void;
  onAutoEnhance: () => void;
  isPickingWb: boolean;
  onTogglePickWb: () => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  activeMaskId?: string;
  onSelectMask: (id: string) => void;
  showMaskOverlay: boolean;
  onToggleMaskOverlay: () => void;
}

type EditTab = 'basic' | 'curves' | 'hsl' | 'grading' | 'effects' | 'geometry' | 'masking';

export const EditWorkspace: React.FC<Props> = ({
  sourceImage,
  editState,
  liveHistogram,
  onChange,
  onAutoEnhance,
  isPickingWb,
  onTogglePickWb,
  onScrubStart,
  onScrubEnd,
  activeMaskId,
  onSelectMask,
  showMaskOverlay,
  onToggleMaskOverlay,
}) => {
  const [activeTab, setActiveTab] = useState<EditTab>('basic');

  const tabs: Array<{ id: EditTab; label: string; icon: any }> = [
    { id: 'basic', label: 'Basic', icon: SlidersHorizontal },
    { id: 'curves', label: 'Curves', icon: Activity },
    { id: 'hsl', label: 'HSL', icon: Palette },
    { id: 'grading', label: 'Color Grading', icon: Disc3 },
    { id: 'effects', label: 'Optics & Effects', icon: Sparkles },
    { id: 'geometry', label: 'Crop & Rotate', icon: Crop },
    { id: 'masking', label: 'Masking', icon: Layers },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Section: Live Histogram */}
      <div className="p-3 pb-2 border-b border-white/10">
        <HistogramView liveHistogram={liveHistogram} sourceImage={sourceImage} />
      </div>

      {/* Sub-tab Navigation Bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === id
                ? 'liquid-button-accent shadow-md'
                : 'liquid-button text-zinc-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Scrollable Tool Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'basic' && (
          <BasicPanel
            basic={editState.basic}
            onChange={(b) => onChange({ ...editState, basic: b })}
            onAutoEnhance={onAutoEnhance}
            isPickingWb={isPickingWb}
            onTogglePickWb={onTogglePickWb}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
          />
        )}

        {activeTab === 'curves' && (
          <CurvesPanel
            curves={editState.curves}
            onChange={(c) => onChange({ ...editState, curves: c })}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
          />
        )}

        {activeTab === 'hsl' && (
          <HslPanel
            hsl={editState.hsl}
            onChange={(h) => onChange({ ...editState, hsl: h })}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
          />
        )}

        {activeTab === 'grading' && (
          <ColorGradingPanel
            colorGrading={editState.colorGrading}
            onChange={(g) => onChange({ ...editState, colorGrading: g })}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
          />
        )}

        {activeTab === 'effects' && (
          <DetailEffectsPanel
            toneDetail={editState.toneDetail}
            onChange={(td) => onChange({ ...editState, toneDetail: td })}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
          />
        )}

        {activeTab === 'geometry' && (
          <GeometryPanel
            geometry={editState.geometry}
            onChange={(geo) => onChange({ ...editState, geometry: geo })}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
          />
        )}

        {activeTab === 'masking' && (
          <MaskingPanel
            masks={editState.masks}
            activeMaskId={activeMaskId}
            showOverlay={showMaskOverlay}
            onSelectMask={onSelectMask}
            onToggleOverlay={onToggleMaskOverlay}
            onAddMask={(type: MaskType) => {
              const newMask: MaskItem = {
                id: `mask_${Date.now()}`,
                name: `${type.replace('_', ' ').toUpperCase()} ${editState.masks.length + 1}`,
                type,
                enabled: true,
                inverted: false,
                feather: 50,
                opacity: 100,
                adjustments: {
                  exposure: 0.5,
                  contrast: 0,
                  temperature: 0,
                  saturation: 0,
                  clarity: 0,
                  sharpness: 0,
                  blur: 0,
                },
                linearStart: { x: 0.5, y: 0.2 },
                linearEnd: { x: 0.5, y: 0.8 },
                radialCenter: { x: 0.5, y: 0.5 },
                radialRadiusX: 0.25,
                radialRadiusY: 0.25,
              };
              onChange({
                ...editState,
                masks: [...editState.masks, newMask],
              });
              onSelectMask(newMask.id);
            }}
            onUpdateMask={(m: MaskItem) => {
              onChange({
                ...editState,
                masks: editState.masks.map((item) => (item.id === m.id ? m : item)),
              });
            }}
            onDeleteMask={(id: string) => {
              onChange({
                ...editState,
                masks: editState.masks.filter((item) => item.id !== id),
              });
            }}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
          />
        )}
      </div>
    </div>
  );
};
