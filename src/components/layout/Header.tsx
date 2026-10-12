import React from 'react';
import {
  Folder,
  Sliders,
  Layers,
  Sparkles,
  Download,
  Undo2,
  Redo2,
  History,
  SplitSquareVertical,
  Eye,
  Settings,
  Camera,
  BookOpen,
  Wand2,
  Smartphone,
} from 'lucide-react';

export type WorkspaceId = 'library' | 'edit' | 'ai' | 'layers' | 'presets' | 'export';

interface Props {
  activeWorkspace: WorkspaceId;
  onChangeWorkspace: (id: WorkspaceId) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenHistory: () => void;
  compareMode: 'none' | 'split' | 'hold';
  onToggleSplitCompare: () => void;
  onHoldCompareStart: () => void;
  onHoldCompareEnd: () => void;
  onOpenSettings: () => void;
  onOpenExif: () => void;
  onOpenTutorial: () => void;
  onOpenApkModal: () => void;
  hasPhotoLoaded: boolean;
}

export const Header: React.FC<Props> = ({
  activeWorkspace,
  onChangeWorkspace,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenHistory,
  compareMode,
  onToggleSplitCompare,
  onHoldCompareStart,
  onHoldCompareEnd,
  onOpenSettings,
  onOpenExif,
  onOpenTutorial,
  onOpenApkModal,
  hasPhotoLoaded,
}) => {
  const workspaces: Array<{ id: WorkspaceId; label: string; icon: any }> = [
    { id: 'library', label: 'Library', icon: Folder },
    { id: 'edit', label: 'Edit', icon: Sliders },
    { id: 'ai', label: 'AI Studio', icon: Wand2 },
    { id: 'layers', label: 'Layers', icon: Layers },
    { id: 'presets', label: 'Presets (150+)', icon: Sparkles },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <header className="relative z-30 h-14 border-b border-white/10 liquid-panel-elevated bg-slate-950/80 px-3 flex items-center justify-between gap-2 select-none">
      {/* Brand & Aperture Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-rose-500 p-[1.5px] shadow-lg">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
            <span className="font-extrabold text-xs tracking-tighter bg-gradient-to-r from-sky-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
              L•S
            </span>
          </div>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xs font-black tracking-widest text-white uppercase">
            LUMORA <span className="text-sky-400 font-medium">STUDIO</span>
          </h1>
          <span className="text-[9px] font-mono text-zinc-400 block -mt-0.5">
            PRO PHOTO ENGINE
          </span>
        </div>
      </div>

      {/* 5 Workspace Tabs */}
      <nav className="flex items-center gap-1 p-1 rounded-2xl liquid-panel overflow-x-auto no-scrollbar">
        {workspaces.map(({ id, label, icon: Icon }) => {
          const isActive = activeWorkspace === id;
          return (
            <button
              key={id}
              onClick={() => onChangeWorkspace(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'liquid-button-accent shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Utility Buttons (Undo/Redo, Compare, Settings) */}
      <div className="flex items-center gap-1 shrink-0">
        {hasPhotoLoaded && (
          <>
            {/* Undo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-xl liquid-button text-zinc-300 hover:text-white disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            {/* Redo */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-xl liquid-button text-zinc-300 hover:text-white disabled:opacity-30"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            {/* History stack drawer */}
            <button
              onClick={onOpenHistory}
              title="History timeline"
              className="p-1.5 rounded-xl liquid-button text-zinc-300 hover:text-white"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Split Screen compare toggle */}
            <button
              onClick={onToggleSplitCompare}
              title="Split screen before/after comparison"
              className={`p-1.5 rounded-xl transition-all ${
                compareMode === 'split'
                  ? 'bg-sky-500/30 text-sky-300 border border-sky-400'
                  : 'liquid-button text-zinc-300 hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-4 h-4" />
            </button>

            {/* Hold to view original */}
            <button
              onMouseDown={onHoldCompareStart}
              onMouseUp={onHoldCompareEnd}
              onMouseLeave={onHoldCompareEnd}
              onTouchStart={onHoldCompareStart}
              onTouchEnd={onHoldCompareEnd}
              title="Hold to preview original photo"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl liquid-button text-xs font-medium text-zinc-300 hover:text-white cursor-pointer active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              Hold Original
            </button>

            {/* EXIF metadata inspector */}
            <button
              onClick={onOpenExif}
              title="Camera EXIF metadata"
              className="p-1.5 rounded-xl liquid-button text-zinc-300 hover:text-white"
            >
              <Camera className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Direct APK Download button */}
        <button
          onClick={onOpenApkModal}
          title="Download Lumora Studio Android APK directly"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-indigo-500/20 text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-emerald-400 transition-all text-xs font-bold shadow-sm active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Get APK</span>
        </button>

        {/* Tutorial & Guide Toggle */}
        <button
          onClick={onOpenTutorial}
          title="Interactive Studio Tutorial & Guide"
          className="p-1.5 rounded-xl liquid-button text-sky-300 hover:text-white flex items-center gap-1"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden xl:inline text-xs font-semibold">Guide</span>
        </button>

        {/* Settings Modal Toggle */}
        <button
          onClick={onOpenSettings}
          title="Theme & Preferences"
          className="p-1.5 rounded-xl liquid-button text-zinc-300 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
