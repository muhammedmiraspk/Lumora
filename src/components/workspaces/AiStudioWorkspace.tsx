import React, { useState, useEffect, useRef } from 'react';
import { EditState, LayerItem } from '../../types/editor';
import { AiSegmentationEngine } from '../../engine/aiSegmentation';
import { AiInpaintingEngine, InpaintResult } from '../../engine/aiInpainting';
import { CREATIVE_ASSETS, CREATIVE_CATEGORIES, CreativeAsset } from '../../constants/aiAssets';
import {
  Sparkles,
  Scissors,
  Eraser,
  PlusCircle,
  Image as ImageIcon,
  Wand2,
  Library,
  ShieldCheck,
  Wifi,
  WifiOff,
  Download,
  Layers,
  Undo2,
  Check,
  AlertCircle,
  Loader2,
  Search,
  Eye,
  Sliders,
  Sun,
  Palette,
} from 'lucide-react';

interface Props {
  sourceImage: HTMLImageElement | null;
  editState: EditState;
  onUpdateEditState: (state: EditState) => void;
  onAddLayer: (layer: LayerItem) => void;
  onSetNewBaseImage: (url: string, title?: string) => void;
}

type AiTab = 'cutout' | 'inpaint' | 'insert' | 'generate' | 'advanced' | 'assets';

export const AiStudioWorkspace: React.FC<Props> = ({
  sourceImage,
  editState,
  onUpdateEditState,
  onAddLayer,
  onSetNewBaseImage,
}) => {
  const [activeTab, setActiveTab] = useState<AiTab>('cutout');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [forceOffline, setForceOffline] = useState<boolean>(false);
  const [aiProvider, setAiProvider] = useState<string>('Google Gemini Studio AI');
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [userConsented, setUserConsented] = useState<boolean>(() => {
    return localStorage.getItem('lumora_ai_privacy_consent') === 'true';
  });

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Background Remover & Replace state
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [bgPreviewMode, setBgPreviewMode] = useState<'checker' | 'black' | 'white' | 'studio'>('checker');
  const [maskFeather, setMaskFeather] = useState<number>(3);
  const [maskTolerance, setMaskTolerance] = useState<number>(35);
  const [bgBlur, setBgBlur] = useState<number>(0);
  const [bgBrightness, setBgBrightness] = useState<number>(0);
  const [selectedBgUrl, setSelectedBgUrl] = useState<string | null>(null);

  // Object Removal state
  const [inpaintBrushSize, setInpaintBrushSize] = useState<number>(30);
  const inpaintCanvasRef = useRef<HTMLCanvasElement>(null);
  const [inpaintResultUrl, setInpaintResultUrl] = useState<string | null>(null);
  const [isDrawingMask, setIsDrawingMask] = useState<boolean>(false);

  // Object Insertion state
  const [insertPrompt, setInsertPrompt] = useState<string>('');

  // Text to Image state
  const [genPrompt, setGenPrompt] = useState<string>('');
  const [genStyle, setGenStyle] = useState<string>('cinematic');
  const [genAspectRatio, setGenAspectRatio] = useState<string>('1:1');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // Asset Library state
  const [assetCategory, setAssetCategory] = useState<string>('all');
  const [assetSearch, setAssetSearch] = useState<string>('');

  // Check backend AI status on mount
  useEffect(() => {
    AiInpaintingEngine.checkStatus().then((status) => {
      setIsOnline(status.online);
      setAiProvider(status.provider);
    });
  }, []);

  // Background Removal Handler
  const handleRemoveBackground = async () => {
    if (!sourceImage) return;
    setIsLoading(true);
    setLoadingMessage('Extracting main subject with edge refinement...');
    setErrorMessage(null);

    try {
      const res = await AiSegmentationEngine.removeBackground(sourceImage, {
        feather: maskFeather,
        tolerance: maskTolerance,
      });
      setCutoutUrl(res.cutoutUrl);
      setSuccessMessage('Subject extracted successfully with transparent alpha channel.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Background removal failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add Cutout as Layer
  const handleAddCutoutLayer = () => {
    if (!cutoutUrl || !sourceImage) return;
    const newLayer: LayerItem = {
      id: `layer_cutout_${Date.now()}`,
      name: 'AI Subject Cutout',
      type: 'image',
      visible: true,
      opacity: 100,
      blendMode: 'source-over',
      x: sourceImage.naturalWidth / 2,
      y: sourceImage.naturalHeight / 2,
      width: sourceImage.naturalWidth,
      height: sourceImage.naturalHeight,
      rotation: 0,
      imageUrl: cutoutUrl,
    };
    onAddLayer(newLayer);
    setSuccessMessage('Subject cutout added as an independent layer.');
  };

  // Replace Background with Selected Image
  const handleApplyReplacementBackground = () => {
    if (!sourceImage || !selectedBgUrl) return;

    // Background layer
    const bgLayer: LayerItem = {
      id: `layer_bg_${Date.now()}`,
      name: 'Replacement Background',
      type: 'image',
      visible: true,
      opacity: 100,
      blendMode: 'source-over',
      x: sourceImage.naturalWidth / 2,
      y: sourceImage.naturalHeight / 2,
      width: sourceImage.naturalWidth,
      height: sourceImage.naturalHeight,
      rotation: 0,
      imageUrl: selectedBgUrl,
    };

    onAddLayer(bgLayer);

    // If cutout exists, add it on top
    if (cutoutUrl) {
      const fgLayer: LayerItem = {
        id: `layer_fg_${Date.now() + 1}`,
        name: 'Foreground Subject',
        type: 'image',
        visible: true,
        opacity: 100,
        blendMode: 'source-over',
        x: sourceImage.naturalWidth / 2,
        y: sourceImage.naturalHeight / 2,
        width: sourceImage.naturalWidth,
        height: sourceImage.naturalHeight,
        rotation: 0,
        imageUrl: cutoutUrl,
      };
      onAddLayer(fgLayer);
    }

    setSuccessMessage('Environment composited into separate editable layers.');
  };

  // Initialize Inpainting Canvas
  useEffect(() => {
    if (activeTab === 'inpaint' && sourceImage && inpaintCanvasRef.current) {
      const canvas = inpaintCanvasRef.current;
      canvas.width = Math.min(600, sourceImage.naturalWidth);
      canvas.height = Math.round((sourceImage.naturalHeight / sourceImage.naturalWidth) * canvas.width);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeTab, sourceImage]);

  // Paint Mask on Inpaint Canvas
  const handleInpaintDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMask || !inpaintCanvasRef.current) return;
    const canvas = inpaintCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'; // Ruby red removal mask
    ctx.beginPath();
    ctx.arc(x, y, inpaintBrushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Clear Inpaint Mask
  const handleClearInpaintMask = () => {
    if (!inpaintCanvasRef.current) return;
    const ctx = inpaintCanvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, inpaintCanvasRef.current.width, inpaintCanvasRef.current.height);
    }
    setInpaintResultUrl(null);
  };

  // Execute Object Removal (Inpaint)
  const handleExecuteRemoval = async () => {
    if (!sourceImage || !inpaintCanvasRef.current) return;

    if (isOnline && !forceOffline && !userConsented) {
      setShowConsentModal(true);
      return;
    }

    setIsLoading(true);
    setLoadingMessage(forceOffline ? 'Synthesizing background via local patch reconstruction...' : 'Reconstructing background via AI Inpainting...');
    setErrorMessage(null);

    try {
      const res: InpaintResult = await AiInpaintingEngine.removeObject(
        sourceImage,
        inpaintCanvasRef.current,
        'Remove unwanted marked objects and reconstruct seamless background texture',
        forceOffline || !isOnline
      );
      setInpaintResultUrl(res.imageUrl);
      setSuccessMessage(res.message || 'Object removed successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Object removal failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply Inpainted Image as Base
  const handleApplyInpaintedBase = () => {
    if (!inpaintResultUrl) return;
    onSetNewBaseImage(inpaintResultUrl, 'AI Cleaned Base');
    setInpaintResultUrl(null);
    handleClearInpaintMask();
    setSuccessMessage('Cleaned photo applied to project canvas.');
  };

  // Generate Image from Prompt
  const handleGenerateImage = async () => {
    if (!genPrompt.trim()) return;

    if (!userConsented && isOnline) {
      setShowConsentModal(true);
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Generating creative asset via AI Studio...');
    setErrorMessage(null);

    try {
      const url = await AiInpaintingEngine.generateImage(genPrompt, genStyle, genAspectRatio);
      setGeneratedImages((prev) => [url, ...prev]);
      setSuccessMessage('AI image generated successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'AI Generation failed. Check API key configuration or try offline tools.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add Asset as Layer
  const handleAddAssetAsLayer = (asset: CreativeAsset) => {
    if (!sourceImage) return;
    const newLayer: LayerItem = {
      id: `layer_asset_${Date.now()}`,
      name: asset.title,
      type: 'image',
      visible: true,
      opacity: asset.defaultOpacity,
      blendMode: asset.defaultBlendMode,
      x: sourceImage.naturalWidth / 2,
      y: sourceImage.naturalHeight / 2,
      width: sourceImage.naturalWidth,
      height: sourceImage.naturalHeight,
      rotation: 0,
      imageUrl: asset.assetUrl,
    };
    onAddLayer(newLayer);
    setSuccessMessage(`"${asset.title}" added to layer stack.`);
  };

  // Filtered Assets
  const filteredAssets = CREATIVE_ASSETS.filter((a) => {
    if (assetCategory !== 'all' && a.category !== assetCategory) return false;
    if (assetSearch.trim()) {
      const q = assetSearch.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Top Header: Online/Offline Mode & Privacy Consent Status */}
      <div className="p-3 border-b border-white/10 space-y-2 bg-slate-950/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                !forceOffline && isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {!forceOffline && isOnline ? 'Online AI Studio' : 'Offline Local AI'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Online / Offline Toggle */}
            <button
              onClick={() => setForceOffline(!forceOffline)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                forceOffline
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {forceOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              {forceOffline ? 'Offline Mode' : 'Online Inference'}
            </button>

            {/* Privacy Shield Button */}
            <button
              onClick={() => setShowConsentModal(true)}
              title="Privacy & Upload Consent"
              className="p-1 rounded-lg liquid-button text-zinc-400 hover:text-white"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Feature Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl liquid-panel overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'cutout', label: 'Cutout & Replace', icon: Scissors },
              { id: 'inpaint', label: 'Object Removal', icon: Eraser },
              { id: 'insert', label: 'Add with AI', icon: PlusCircle },
              { id: 'generate', label: 'Text to Image', icon: ImageIcon },
              { id: 'advanced', label: 'Smart Retouch', icon: Wand2 },
              { id: 'assets', label: 'Asset Library', icon: Library },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'liquid-button-accent shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Notifications */}
      {errorMessage && (
        <div className="mx-3 mt-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1 text-[11px]">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-zinc-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mx-3 mt-2 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="flex-1 text-[11px]">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-zinc-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ================= TAB 1: CUTOUT & REPLACE ================= */}
        {activeTab === 'cutout' && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl liquid-panel space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Subject Detection & Cutout
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Extract the main subject with hair and edge preservation
                  </p>
                </div>
                <button
                  onClick={handleRemoveBackground}
                  disabled={isLoading || !sourceImage}
                  className="px-3 py-1.5 rounded-xl liquid-button-accent text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5" />}
                  Extract Subject
                </button>
              </div>

              {/* Edge Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Edge Feather</span>
                    <span className="font-mono text-zinc-300">{maskFeather}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={maskFeather}
                    onChange={(e) => setMaskFeather(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Sensitivity</span>
                    <span className="font-mono text-zinc-300">{maskTolerance}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={maskTolerance}
                    onChange={(e) => setMaskTolerance(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Cutout Preview Box */}
            {cutoutUrl && (
              <div className="space-y-3 p-3 rounded-2xl liquid-panel">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-300 uppercase tracking-wider">
                    Transparent Cutout Preview
                  </span>
                  {/* Background Preview Backdrop Switcher */}
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'checker', label: 'Grid' },
                        { id: 'black', label: 'Black' },
                        { id: 'white', label: 'White' },
                        { id: 'studio', label: 'Studio' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setBgPreviewMode(m.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          bgPreviewMode === m.id
                            ? 'bg-sky-500 text-white'
                            : 'liquid-button text-zinc-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`relative w-full h-44 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 ${
                    bgPreviewMode === 'checker'
                      ? 'bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px] bg-zinc-900'
                      : bgPreviewMode === 'black'
                      ? 'bg-black'
                      : bgPreviewMode === 'white'
                      ? 'bg-white'
                      : 'bg-gradient-to-tr from-slate-800 to-slate-900'
                  }`}
                >
                  <img
                    src={cutoutUrl}
                    alt="Subject Cutout"
                    className="max-h-full max-w-full object-contain drop-shadow-xl"
                  />
                </div>

                {/* Cutout Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleAddCutoutLayer}
                    className="py-2 rounded-xl liquid-button text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    Place as Layer
                  </button>
                  <a
                    href={cutoutUrl}
                    download="LUMORA_SUBJECT_CUTOUT.png"
                    className="py-2 rounded-xl liquid-button-accent text-xs font-bold text-center flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Cutout PNG
                  </a>
                </div>
              </div>
            )}

            {/* Background Replacement Section */}
            <div className="p-3 rounded-2xl liquid-panel space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                Background Replacement Studio
              </h3>

              {/* Preset Backdrops Grid */}
              <div className="grid grid-cols-3 gap-2">
                {CREATIVE_ASSETS.filter((a) => a.category === 'backgrounds').map((bg) => (
                  <div
                    key={bg.id}
                    onClick={() => setSelectedBgUrl(bg.assetUrl)}
                    className={`group relative rounded-xl overflow-hidden aspect-video cursor-pointer transition-all ${
                      selectedBgUrl === bg.assetUrl
                        ? 'ring-2 ring-sky-400 scale-105 shadow-lg'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={bg.thumbnailUrl} alt={bg.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate px-1 rounded bg-black/60 backdrop-blur-xs">
                      {bg.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Apply Background Button */}
              {selectedBgUrl && (
                <button
                  onClick={handleApplyReplacementBackground}
                  className="w-full py-2.5 rounded-xl liquid-button-accent text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Check className="w-3.5 h-3.5" />
                  Composite New Background onto Project
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: OBJECT REMOVAL (INPAINT) ================= */}
        {activeTab === 'inpaint' && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl liquid-panel space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Object Removal & Clean
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Brush over wires, people, logos, or blemishes to remove them
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearInpaintMask}
                    className="p-1.5 rounded-lg liquid-button text-zinc-400 hover:text-white text-xs"
                    title="Clear Mask"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Brush Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Eraser Brush Radius</span>
                  <span className="font-mono text-zinc-300">{inpaintBrushSize}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="80"
                  value={inpaintBrushSize}
                  onChange={(e) => setInpaintBrushSize(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              {/* Painting Work Area */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
                {sourceImage && (
                  <img
                    src={sourceImage.src}
                    alt="Source"
                    className="max-h-56 max-w-full object-contain pointer-events-none"
                  />
                )}
                <canvas
                  ref={inpaintCanvasRef}
                  onMouseDown={() => setIsDrawingMask(true)}
                  onMouseUp={() => setIsDrawingMask(false)}
                  onMouseLeave={() => setIsDrawingMask(false)}
                  onMouseMove={handleInpaintDraw}
                  onTouchStart={() => setIsDrawingMask(true)}
                  onTouchEnd={() => setIsDrawingMask(false)}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />
              </div>
              <p className="text-[10px] text-zinc-500 font-mono text-center">
                Paint over unwanted regions with red mask, then click Remove Object
              </p>

              {/* Remove Action */}
              <button
                onClick={handleExecuteRemoval}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl liquid-button-accent text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eraser className="w-3.5 h-3.5" />}
                {isLoading ? loadingMessage : 'Remove Marked Objects'}
              </button>
            </div>

            {/* Inpainted Comparison Result */}
            {inpaintResultUrl && (
              <div className="p-3 rounded-2xl liquid-panel space-y-3">
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">
                  Reconstructed Clean Preview
                </span>
                <div className="relative rounded-xl overflow-hidden max-h-56 border border-white/10">
                  <img src={inpaintResultUrl} alt="Inpainted Result" className="w-full h-full object-contain" />
                </div>
                <button
                  onClick={handleApplyInpaintedBase}
                  className="w-full py-2.5 rounded-xl liquid-button-accent text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Clean Image to Canvas
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ADD OBJECTS WITH AI ================= */}
        {activeTab === 'insert' && (
          <div className="p-3 rounded-2xl liquid-panel space-y-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Generative Object Insertion
              </h3>
              <p className="text-[11px] text-zinc-400">
                Describe an element to seamlessly generate and blend into your photo
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-zinc-300 font-medium">Prompt Description</span>
              <input
                type="text"
                placeholder='e.g., "Add a vintage leather armchair", "Place a vase of flowers on table"'
                value={insertPrompt}
                onChange={(e) => setInsertPrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl liquid-panel text-xs text-white placeholder-zinc-500 outline-none focus:border-sky-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-300">Quick Inspiration Prompts:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Add retro black sunglasses to subject',
                  'Place a warm steaming cup of coffee',
                  'Add golden sunset lens flare through window',
                  'Add a bouquet of vibrant red roses',
                ].map((txt) => (
                  <button
                    key={txt}
                    onClick={() => setInsertPrompt(txt)}
                    className="px-2 py-1 rounded-lg text-[10px] liquid-button text-zinc-300 hover:text-white"
                  >
                    + {txt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isLoading || !insertPrompt.trim()}
              className="w-full py-2.5 rounded-xl liquid-button-accent text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
              Generate & Insert Object
            </button>
          </div>
        )}

        {/* ================= TAB 4: TEXT TO IMAGE ================= */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl liquid-panel space-y-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Text-to-Image Asset Creator
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Generate studio backdrops, textures, and custom creative elements
                </p>
              </div>

              {/* Prompt Input */}
              <textarea
                rows={3}
                placeholder="Describe your scene or background with vivid details..."
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                className="w-full p-3 rounded-xl liquid-panel text-xs text-white placeholder-zinc-500 outline-none focus:border-sky-400 resize-none"
              />

              {/* Style Selector */}
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Visual Style</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'cinematic', label: 'Cinematic' },
                      { id: 'editorial', label: 'Editorial' },
                      { id: 'product', label: 'Product 3D' },
                      { id: 'minimal', label: 'Minimal Studio' },
                      { id: 'nature', label: 'Nature Scenic' },
                      { id: 'fantasy', label: 'Fantasy Dream' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setGenStyle(st.id)}
                      className={`p-2 rounded-xl text-[11px] font-semibold transition-all ${
                        genStyle === st.id
                          ? 'liquid-button-accent shadow-sm'
                          : 'liquid-button text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Aspect Ratio</span>
                <div className="flex items-center gap-1.5">
                  {['1:1', '16:9', '9:16', '4:5'].map((asp) => (
                    <button
                      key={asp}
                      onClick={() => setGenAspectRatio(asp)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all ${
                        genAspectRatio === asp
                          ? 'bg-sky-500 text-white'
                          : 'liquid-button text-zinc-400 hover:text-white'
                      }`}
                    >
                      {asp}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={isLoading || !genPrompt.trim()}
                className="w-full py-2.5 rounded-xl liquid-button-accent text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Image Asset
              </button>
            </div>

            {/* Generated Gallery */}
            {generatedImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block px-1">
                  Generated Assets ({generatedImages.length})
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {generatedImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl overflow-hidden liquid-panel aspect-square shadow-lg"
                    >
                      <img src={url} alt="Generated" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                        <button
                          onClick={() => {
                            if (!sourceImage) return;
                            onAddLayer({
                              id: `layer_gen_${Date.now()}`,
                              name: 'AI Generated Asset',
                              type: 'image',
                              visible: true,
                              opacity: 100,
                              blendMode: 'source-over',
                              x: sourceImage.naturalWidth / 2,
                              y: sourceImage.naturalHeight / 2,
                              width: sourceImage.naturalWidth,
                              height: sourceImage.naturalHeight,
                              rotation: 0,
                              imageUrl: url,
                            });
                            setSuccessMessage('Asset added to layer stack.');
                          }}
                          className="p-2 rounded-xl liquid-button-accent text-xs font-bold"
                          title="Place as Layer"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSetNewBaseImage(url, 'AI Canvas')}
                          className="p-2 rounded-xl liquid-button text-xs font-bold text-white"
                          title="Open as Canvas Base"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: ADVANCED AI TOOLS ================= */}
        {activeTab === 'advanced' && (
          <div className="space-y-3">
            {[
              {
                id: 'sky',
                title: 'AI Sky Replacement',
                desc: 'Replace flat overexposed skies with dramatic sunset, astro milky way, or aurora borealis.',
                action: () => {
                  const skyAsset = CREATIVE_ASSETS.find((a) => a.category === 'skies');
                  if (skyAsset) handleAddAssetAsLayer(skyAsset);
                },
              },
              {
                id: 'blur',
                title: 'Portrait Background Depth Blur',
                desc: 'Simulate f/1.4 prime lens depth-of-field bokeh while keeping subject in sharp focus.',
                action: () => {
                  onUpdateEditState({
                    ...editState,
                    toneDetail: {
                      ...editState.toneDetail,
                      blur: 18,
                      blurType: 'radial',
                    },
                  });
                  setSuccessMessage('Portrait depth-of-field blur applied to background.');
                },
              },
              {
                id: 'restore',
                title: 'Old Photo Restoration & Scratch Fix',
                desc: 'Intelligently restores faded vintage prints, cleans dust scratches, and restores micro-contrast.',
                action: () => {
                  onUpdateEditState({
                    ...editState,
                    basic: {
                      ...editState.basic,
                      contrast: 25,
                    },
                    toneDetail: {
                      ...editState.toneDetail,
                      clarity: 20,
                      dehaze: 15,
                      noiseReduction: 30,
                      sharpening: 35,
                    },
                  });
                  setSuccessMessage('Photo restoration algorithms applied.');
                },
              },
              {
                id: 'colorize',
                title: 'B&W Photo Colorization',
                desc: 'Applies authentic vintage colorization to black and white historical photographs.',
                action: () => {
                  onUpdateEditState({
                    ...editState,
                    basic: {
                      ...editState.basic,
                      saturation: 30,
                      vibrance: 25,
                      temperature: 8,
                    },
                  });
                  setSuccessMessage('Colorization baseline applied.');
                },
              },
            ].map((tool) => (
              <div
                key={tool.id}
                className="p-3.5 rounded-2xl liquid-panel flex items-start justify-between gap-3 hover:border-white/20 transition-all"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">{tool.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{tool.desc}</p>
                </div>
                <button
                  onClick={tool.action}
                  className="px-3 py-1.5 rounded-xl liquid-button-accent text-xs font-bold whitespace-nowrap shrink-0 shadow-md"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 6: CREATIVE ASSET LIBRARY ================= */}
        {activeTab === 'assets' && (
          <div className="space-y-3">
            {/* Search & Categories */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search light leaks, skies, lens flares..."
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl liquid-panel text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {CREATIVE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setAssetCategory(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                      assetCategory === c.id
                        ? 'liquid-button-accent shadow-sm'
                        : 'liquid-button text-zinc-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleAddAssetAsLayer(asset)}
                  className="group relative rounded-2xl overflow-hidden liquid-panel cursor-pointer hover:border-sky-400 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/70 text-sky-300 backdrop-blur-xs uppercase">
                      {asset.defaultBlendMode}
                    </span>
                  </div>
                  <div className="p-2">
                    <h5 className="text-xs font-bold text-white truncate">{asset.title}</h5>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{asset.description}</p>
                    <span className="text-[10px] font-bold text-sky-400 mt-1 inline-flex items-center gap-1">
                      <PlusCircle className="w-3 h-3" /> Add Layer
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Privacy Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl liquid-panel-elevated bg-slate-950/95 border border-white/15 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                AI Privacy & Security Assurance
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Lumora Studio is privacy-first. Core editing features and presets always work 100% offline on your device without an internet connection.
            </p>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2 text-[11px] text-zinc-400">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Only the selected photo or inpainting crop is transmitted over encrypted HTTPS.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Photos are never stored permanently, never made public, and never used to train models.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>You can switch to Offline Mode at any time using the toggle at the top of the AI Studio.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setForceOffline(true);
                  setShowConsentModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl liquid-button text-xs font-semibold text-zinc-300"
              >
                Use Offline Only
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('lumora_ai_privacy_consent', 'true');
                  setUserConsented(true);
                  setShowConsentModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl liquid-button-accent text-xs font-bold"
              >
                Accept & Enable Online AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
