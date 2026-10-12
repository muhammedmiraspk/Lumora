/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  EditState,
  Project,
  LiquidThemeId,
  Preset,
  ExifData,
  HistogramData,
} from './types/editor';
import { createInitialEditState } from './constants/initialState';
import { SAMPLE_PHOTOS, SamplePhoto, createProceduralDemoImage } from './constants/samplePhotos';
import { calculateAutoEnhance } from './engine/autoEnhance';
import { readImageExif } from './engine/exifReader';
import {
  saveProjectToDb,
  getFavoritePresetIds,
  saveFavoritePresetIds,
} from './storage/projectDb';

import { LiquidGlassTheme } from './components/layout/LiquidGlassTheme';
import { Header, WorkspaceId } from './components/layout/Header';
import { EditorCanvas } from './components/canvas/EditorCanvas';
import { EditWorkspace } from './components/workspaces/EditWorkspace';
import { PresetsWorkspace } from './components/workspaces/PresetsWorkspace';
import { LayersWorkspace } from './components/workspaces/LayersWorkspace';
import { ExportWorkspace } from './components/workspaces/ExportWorkspace';
import { LibraryWorkspace } from './components/workspaces/LibraryWorkspace';
import { AiStudioWorkspace } from './components/workspaces/AiStudioWorkspace';
import { HistoryDrawer } from './components/modals/HistoryDrawer';
import { SettingsModal } from './components/modals/SettingsModal';
import { ExifModal } from './components/modals/ExifModal';
import { TutorialModal } from './components/modals/TutorialModal';
import { ApkDownloadModal } from './components/modals/ApkDownloadModal';

export default function App() {
  // Theme & Preferences
  const [theme, setTheme] = useState<LiquidThemeId>(() => {
    return (localStorage.getItem('lumora_theme') as LiquidThemeId) || 'obsidian';
  });
  const [accentIntensity, setAccentIntensity] = useState<number>(() => {
    return parseInt(localStorage.getItem('lumora_accent_intensity') || '100', 10);
  });
  const [budgetMode, setBudgetMode] = useState<boolean>(() => {
    return localStorage.getItem('lumora_budget_mode') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('lumora_reduced_motion') === 'true';
  });

  // Active Workspace
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('edit');

  // Edit State & Project
  const [editState, setEditState] = useState<EditState>(createInitialEditState);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Loaded Source Image
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [exifData, setExifData] = useState<ExifData | undefined>(undefined);

  // History Stack
  const [historyStack, setHistoryStack] = useState<
    Array<{ name: string; timestamp: number; state: EditState }>
  >([
    {
      name: 'Original Image',
      timestamp: Date.now(),
      state: createInitialEditState(),
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Canvas Interactions
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<'none' | 'split' | 'hold'>('none');
  const [isHoldingCompare, setIsHoldingCompare] = useState<boolean>(false);
  const [activeMaskId, setActiveMaskId] = useState<string | undefined>(undefined);
  const [showMaskOverlay, setShowMaskOverlay] = useState<boolean>(false);
  const [isPickingWb, setIsPickingWb] = useState<boolean>(false);
  const [liveHistogram, setLiveHistogram] = useState<HistogramData | null>(null);

  // Presets & Favorites
  const [favorites, setFavorites] = useState<string[]>([]);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExifOpen, setIsExifOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    return localStorage.getItem('lumora_tutorial_completed') !== 'true';
  });

  // Load Favorites from IndexedDB
  useEffect(() => {
    getFavoritePresetIds().then((favs) => setFavorites(favs));
  }, []);

  // Update body classes for theme & budget mode
  useEffect(() => {
    localStorage.setItem('lumora_theme', theme);
    localStorage.setItem('lumora_accent_intensity', accentIntensity.toString());
    localStorage.setItem('lumora_budget_mode', budgetMode.toString());
    localStorage.setItem('lumora_reduced_motion', reducedMotion.toString());

    if (budgetMode) {
      document.body.classList.add('budget-device-mode');
    } else {
      document.body.classList.remove('budget-device-mode');
    }
  }, [theme, accentIntensity, budgetMode, reducedMotion]);

  // Push new history state
  const pushHistory = useCallback(
    (actionName: string, newState: EditState) => {
      setHistoryStack((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [
          ...truncated,
          {
            name: actionName,
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(newState)),
          },
        ];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Jump to specific history index
  const jumpToHistoryStep = (index: number) => {
    if (index >= 0 && index < historyStack.length) {
      setHistoryIndex(index);
      setEditState(JSON.parse(JSON.stringify(historyStack[index].state)));
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      jumpToHistoryStep(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      jumpToHistoryStep(historyIndex + 1);
    }
  };

  // Revert all adjustments
  const handleResetAll = () => {
    const fresh = createInitialEditState();
    setEditState(fresh);
    pushHistory('Reset All Adjustments', fresh);
  };

  // Stable memoized callback for real-time histogram updates
  const handleHistogramUpdate = useCallback((data: HistogramData) => {
    setLiveHistogram(data);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === '\\') {
        // Toggle original compare
        setCompareMode((prev) => (prev === 'split' ? 'none' : 'split'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Load an Image from URL or Blob
  const loadSourceImage = useCallback((url: string, title: string, customExif?: ExifData) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setSourceImage(img);
      setExifData(
        customExif || {
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
          colorSpace: 'sRGB IEC61966-2.1',
          dateTime: new Date().toLocaleDateString(),
        }
      );

      const initialState = createInitialEditState();
      setEditState(initialState);
      setHistoryStack([
        {
          name: `Loaded "${title}"`,
          timestamp: Date.now(),
          state: initialState,
        },
      ]);
      setHistoryIndex(0);

      // Create new project entry
      const newProj: Project = {
        id: `proj_${Date.now()}`,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        thumbnailUrl: url,
        originalImageBlobUrl: url,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
        album: 'Recent',
        state: initialState,
        exif: customExif,
      };
      setCurrentProject(newProj);
      saveProjectToDb(newProj);
    };

    img.onerror = () => {
      // If external image fails due to CORS or offline mode, generate procedural high-res photo!
      const fallbackDataUrl = createProceduralDemoImage('Landscape');
      img.src = fallbackDataUrl;
    };

    img.src = url;
  }, []);

  // Initial Boot: Load first sample photo
  useEffect(() => {
    const firstSample = SAMPLE_PHOTOS[0];
    loadSourceImage(firstSample.url, firstSample.title, firstSample.exif);
  }, [loadSourceImage]);

  // Debounced Autosave project
  const autosaveTimeoutRef = useRef<any>(null);
  useEffect(() => {
    if (!currentProject || !sourceImage) return;

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(() => {
      const updated: Project = {
        ...currentProject,
        state: editState,
        updatedAt: Date.now(),
      };
      saveProjectToDb(updated);
    }, 1500);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [editState, currentProject, sourceImage]);

  // Handle User File Upload
  const handleImportFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    const exif = await readImageExif(file);
    loadSourceImage(url, file.name.replace(/\.[^/.]+$/, ''), exif);
    setActiveWorkspace('edit');
  };

  // Handle Preset Application
  const handleApplyPreset = (preset: Preset) => {
    const updated: EditState = {
      ...editState,
      activePresetId: preset.id,
      basic: {
        ...editState.basic,
        ...preset.values.basic,
      },
      toneDetail: {
        ...editState.toneDetail,
        ...preset.values.toneDetail,
      },
      curves: {
        ...editState.curves,
        ...(preset.values.curves || {}),
      },
      colorGrading: {
        ...editState.colorGrading,
        ...(preset.values.colorGrading || {}),
      },
      hsl: (() => {
        const baseHsl = { ...editState.hsl };
        if (preset.values.hsl) {
          Object.entries(preset.values.hsl).forEach(([key, ch]) => {
            const k = key as keyof typeof baseHsl;
            if (ch && baseHsl[k]) {
              baseHsl[k] = {
                ...baseHsl[k],
                ...ch,
              };
            }
          });
        }
        return baseHsl;
      })(),
    };
    setEditState(updated);
    pushHistory(`Applied Preset: ${preset.name}`, updated);
  };

  // Handle Auto Tone Enhancement
  const handleAutoEnhance = () => {
    if (!sourceImage) return;
    const off = document.createElement('canvas');
    off.width = 300;
    off.height = Math.round((sourceImage.naturalHeight / sourceImage.naturalWidth) * 300) || 200;
    const ctx = off.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(sourceImage, 0, 0, off.width, off.height);
    const imgData = ctx.getImageData(0, 0, off.width, off.height);
    const calculated = calculateAutoEnhance(imgData);

    const updated = {
      ...editState,
      basic: {
        ...editState.basic,
        ...calculated,
      },
    };
    setEditState(updated);
    pushHistory('Auto Tone Enhance', updated);
  };

  // Toggle Favorite Preset
  const handleToggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    saveFavoritePresetIds(newFavs);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Background Liquid Glass Ambient Glow */}
      <LiquidGlassTheme currentTheme={theme} accentIntensity={accentIntensity} />

      {/* Top Header */}
      <Header
        activeWorkspace={activeWorkspace}
        onChangeWorkspace={setActiveWorkspace}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenHistory={() => setIsHistoryOpen(true)}
        compareMode={compareMode}
        onToggleSplitCompare={() =>
          setCompareMode((m) => (m === 'split' ? 'none' : 'split'))
        }
        onHoldCompareStart={() => setIsHoldingCompare(true)}
        onHoldCompareEnd={() => setIsHoldingCompare(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExif={() => setIsExifOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        hasPhotoLoaded={!!sourceImage}
      />

      {/* Main Workspace Body */}
      <main className="relative flex-1 flex flex-col md:flex-row overflow-hidden z-10">
        {/* Center / Left: Interactive Canvas */}
        <div className="flex-1 relative h-[50vh] md:h-full overflow-hidden">
          <EditorCanvas
            sourceImage={sourceImage}
            editState={editState}
            isScrubbing={isScrubbing}
            compareMode={compareMode}
            isHoldingCompare={isHoldingCompare}
            activeMaskId={activeMaskId}
            showMaskOverlay={showMaskOverlay}
            isPickingWb={isPickingWb}
            onHistogramUpdate={handleHistogramUpdate}
            onPickWbDone={(temp, tint) => {
              setIsPickingWb(false);
              const updated = {
                ...editState,
                basic: {
                  ...editState.basic,
                  temperature: temp,
                  tint,
                },
              };
              setEditState(updated);
              pushHistory('White Balance Sampler', updated);
            }}
          />
        </div>

        {/* Right Side: Active Workspace Tool Drawer */}
        <div className="w-full md:w-[380px] lg:w-[420px] h-[50vh] md:h-full liquid-panel border-t md:border-t-0 md:border-l border-white/10 flex flex-col shadow-2xl overflow-hidden shrink-0">
          {activeWorkspace === 'library' && (
            <LibraryWorkspace
              onLoadProject={(proj) => {
                setCurrentProject(proj);
                setEditState(proj.state);
                loadSourceImage(proj.originalImageBlobUrl, proj.title, proj.exif);
                setActiveWorkspace('edit');
              }}
              onLoadSample={(sample) => {
                loadSourceImage(sample.url, sample.title, sample.exif);
                setActiveWorkspace('edit');
              }}
              onImportFile={handleImportFile}
            />
          )}

          {activeWorkspace === 'edit' && (
            <EditWorkspace
              sourceImage={sourceImage}
              editState={editState}
              liveHistogram={liveHistogram}
              onChange={(newState) => setEditState(newState)}
              onAutoEnhance={handleAutoEnhance}
              isPickingWb={isPickingWb}
              onTogglePickWb={() => setIsPickingWb(!isPickingWb)}
              onScrubStart={() => setIsScrubbing(true)}
              onScrubEnd={() => {
                setIsScrubbing(false);
                pushHistory('Adjusted Parameters', editState);
              }}
              activeMaskId={activeMaskId}
              onSelectMask={setActiveMaskId}
              showMaskOverlay={showMaskOverlay}
              onToggleMaskOverlay={() => setShowMaskOverlay(!showMaskOverlay)}
            />
          )}

          {activeWorkspace === 'ai' && (
            <AiStudioWorkspace
              sourceImage={sourceImage}
              editState={editState}
              onUpdateEditState={(st) => {
                setEditState(st);
                pushHistory('AI Tool Adjustment', st);
              }}
              onAddLayer={(layer) => {
                const updated = { ...editState, layers: [...editState.layers, layer] };
                setEditState(updated);
                pushHistory(`Added Layer: ${layer.name}`, updated);
              }}
              onSetNewBaseImage={(url, title) => {
                loadSourceImage(url, title || 'AI Inpainted Base');
              }}
            />
          )}

          {activeWorkspace === 'presets' && (
            <PresetsWorkspace
              editState={editState}
              onApplyPreset={handleApplyPreset}
              onUpdateIntensity={(intensity) =>
                setEditState({ ...editState, presetIntensity: intensity })
              }
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onImportPreset={(p) => handleApplyPreset(p)}
            />
          )}

          {activeWorkspace === 'layers' && (
            <LayersWorkspace
              layers={editState.layers}
              onChange={(layers) => {
                const updated = { ...editState, layers };
                setEditState(updated);
                pushHistory('Updated Layers', updated);
              }}
            />
          )}

          {activeWorkspace === 'export' && (
            <ExportWorkspace
              sourceImage={sourceImage}
              editState={editState}
              onOpenApkModal={() => setIsApkModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyStack={historyStack}
        currentIndex={historyIndex}
        onJumpToStep={jumpToHistoryStep}
        onResetAll={handleResetAll}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        onSelectTheme={setTheme}
        accentIntensity={accentIntensity}
        onUpdateAccentIntensity={setAccentIntensity}
        budgetMode={budgetMode}
        onToggleBudgetMode={setBudgetMode}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={setReducedMotion}
        onClearStorage={() => {
          localStorage.clear();
          location.reload();
        }}
        onOpenApkModal={() => {
          setIsSettingsOpen(false);
          setIsApkModalOpen(true);
        }}
      />

      <ExifModal
        isOpen={isExifOpen}
        onClose={() => setIsExifOpen(false)}
        exif={exifData}
        imageWidth={sourceImage?.naturalWidth}
        imageHeight={sourceImage?.naturalHeight}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateToWorkspace={(ws) => setActiveWorkspace(ws)}
      />

      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
