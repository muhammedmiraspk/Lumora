import React from 'react';
import { LiquidThemeId } from '../../types/editor';
import { LIQUID_THEMES } from '../../constants/themes';
import { X, Palette, Cpu, Zap, Check, Trash2, Smartphone, Download, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: LiquidThemeId;
  onSelectTheme: (themeId: LiquidThemeId) => void;
  accentIntensity: number;
  onUpdateAccentIntensity: (val: number) => void;
  budgetMode: boolean;
  onToggleBudgetMode: (enabled: boolean) => void;
  reducedMotion: boolean;
  onToggleReducedMotion: (enabled: boolean) => void;
  onClearStorage: () => void;
  onOpenApkModal?: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  accentIntensity,
  onUpdateAccentIntensity,
  budgetMode,
  onToggleBudgetMode,
  reducedMotion,
  onToggleReducedMotion,
  onClearStorage,
  onOpenApkModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl liquid-panel-elevated bg-slate-950/95 border border-white/15 p-5 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Studio Preferences & Themes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl liquid-button text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Liquid Glass Themes */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Liquid Glass Themes (5 Signature Looks)
          </span>

          <div className="space-y-2">
            {Object.values(LIQUID_THEMES).map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-white/10 border-2 border-sky-400 shadow-xl'
                      : 'liquid-panel hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{theme.name}</h4>
                      <p className="text-[11px] text-zinc-400">{theme.subtitle}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Accent Intensity */}
        <div className="space-y-1 p-3 rounded-2xl liquid-panel">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-300 font-medium">Accent Glow Intensity</span>
            <span className="font-mono text-sky-400 font-bold">{accentIntensity}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={accentIntensity}
            onChange={(e) => onUpdateAccentIntensity(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Budget Device / Poco C31 Optimization Mode */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="p-3 rounded-2xl liquid-panel flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Budget Device Mode (Poco C31 / Low RAM)
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Disables heavy backdrop blur filters and uses proxy canvas downsampling during interactive slider scrubs for smooth 60fps performance on budget phones.
              </p>
            </div>
            <input
              type="checkbox"
              checked={budgetMode}
              onChange={(e) => onToggleBudgetMode(e.target.checked)}
              className="w-5 h-5 mt-1 accent-sky-500 rounded"
            />
          </div>

          <div className="p-3 rounded-2xl liquid-panel flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Reduced Motion
              </span>
              <p className="text-[11px] text-zinc-400">
                Minimizes UI animations and transitions for instant responsiveness.
              </p>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => onToggleReducedMotion(e.target.checked)}
              className="w-5 h-5 mt-1 accent-sky-500 rounded"
            />
          </div>
        </div>

        {/* Android Native APK Package */}
        <div className="p-3.5 rounded-2xl liquid-panel bg-gradient-to-r from-emerald-950/40 to-sky-950/40 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Download Android APK
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              v2.4.0 APK
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Direct standalone APK file download for Poco C31, Xiaomi, Samsung, and Android 7.0+. Zero tracking, no Google Play login required.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {onOpenApkModal ? (
              <button
                onClick={onOpenApkModal}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK (66.8 MB Desktop)</span>
              </button>
            ) : (
              <a
                href="/download/lumora-studio.apk"
                target="_blank"
                rel="noopener noreferrer"
                download="LumoraStudio-v2.4.0.apk"
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK (66.8 MB Desktop)</span>
              </a>
            )}
            <a
              href="/download/lumora-studio.apk"
              target="_blank"
              rel="noopener noreferrer"
              download="LumoraStudio-v2.4.0.apk"
              className="py-2 px-3 rounded-xl liquid-button text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1"
              title="Open direct download link in new tab"
            >
              <ExternalLink className="w-3 h-3 text-sky-400" />
              <span>New Tab</span>
            </a>
          </div>
        </div>

        {/* Local Storage & Cache Cleaner */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-zinc-300">Storage & Cache</h4>
            <p className="text-[10px] text-zinc-500">100% private offline storage in your browser</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Clear temporary project cache? Your saved photos remain safe.')) {
                onClearStorage();
              }
            }}
            className="px-3 py-1.5 rounded-xl liquid-button text-xs text-rose-300 hover:text-white flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};
