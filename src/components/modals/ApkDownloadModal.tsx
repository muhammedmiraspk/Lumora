import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Zap,
  Info,
  QrCode,
  Loader2,
  AlertCircle,
  RefreshCw,
  Monitor,
  Laptop,
} from 'lucide-react';
import {
  downloadApkWithStream,
  DownloadProgress,
} from '../../utils/apkDownloader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [isStreamingMode, setIsStreamingMode] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    state: 'idle',
    percent: 0,
    receivedBytes: 0,
    totalBytes: 70018466,
    statusMessage: '',
  });

  // Listen for PWA install prompt for Desktop users
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const directApkUrl = `${currentOrigin}/download/lumora-studio.apk`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directApkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInstallDesktop = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      // If prompt not available, set desktop info notice state
      setDownloadProgress({
        state: 'idle',
        percent: 0,
        receivedBytes: 0,
        totalBytes: 70018466,
        statusMessage: 'To install on Desktop: Click the Install App icon in your Chrome/Edge browser address bar.',
      });
    }
  };

  const handleStartStream = async () => {
    setIsStreamingMode(true);
    try {
      await downloadApkWithStream(
        (progress) => {
          setDownloadProgress(progress);
        },
        '/download/lumora-studio.apk',
        'LumoraStudio-v2.4.0.apk'
      );
    } catch (err: any) {
      setDownloadProgress({
        state: 'error',
        percent: 0,
        receivedBytes: 0,
        totalBytes: 70018466,
        statusMessage: 'Stream interrupted',
        errorMessage: err?.message || 'Download was interrupted. Please use the Direct Link.',
      });
    }
  };

  const isStreaming =
    downloadProgress.state === 'starting' ||
    downloadProgress.state === 'downloading' ||
    downloadProgress.state === 'saving';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto liquid-panel-elevated bg-slate-950/95 border border-sky-500/30 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col gap-5 no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-600 p-[2px] shadow-lg shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-wide">
                  Direct APK & Desktop Download
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  v2.4.0 PRO
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Official Lumora Studio Universal Package (66.8 MB Desktop-Grade APK)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Direct Download Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900/80 to-indigo-950/70 border border-sky-400/30 p-4 sm:p-5 flex flex-col gap-3.5 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300">
                Direct Package Ready (Resumable • Desktop/Mobile)
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              66.8 MB • Android 7.0+ / DeX / WSA / Chromebook
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Download <strong className="text-white">LumoraStudio-v2.4.0.apk</strong> directly. Built with desktop-scale responsive layout for tablets, Chromebooks, Samsung DeX, Windows Subsystem for Android (WSA), and budget phones like <strong className="text-sky-300">Poco C31</strong>, Xiaomi, and Samsung.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            {/* Primary Native Download Button: Real HTML anchor ensures immediate download without popup blockers */}
            <a
              href="/download/lumora-studio.apk"
              download="LumoraStudio-v2.4.0.apk"
              className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2.5 transition-all transform active:scale-98 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/25"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>Download APK (66.8 MB)</span>
            </a>

            {/* Direct Link */}
            <a
              href={directApkUrl}
              download="LumoraStudio-v2.4.0.apk"
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all shrink-0"
              title="Direct APK Download link"
            >
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span>Direct Link</span>
            </a>

            <button
              onClick={() => setShowQr(!showQr)}
              className="py-3 px-4 rounded-2xl liquid-button text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-2 shrink-0"
              title="Scan with phone camera"
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>{showQr ? 'Hide QR' : 'Phone QR'}</span>
            </button>
          </div>

          {/* Desktop App (PWA) Option Card */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-400/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
                <Laptop className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>Using a PC or Desktop?</span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.2 rounded font-mono">Desktop Size</span>
                </div>
                <div className="text-[11px] text-zinc-300">
                  Install Lumora Studio as a standalone Desktop App on Windows, Mac, or Chromebook.
                </div>
              </div>
            </div>
            <button
              onClick={handleInstallDesktop}
              className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs whitespace-nowrap shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isInstalled ? 'Installed' : 'Install Desktop'}</span>
            </button>
          </div>

          {/* Resume Capability Callout */}
          <div className="p-3 rounded-xl bg-sky-950/50 border border-sky-400/30 flex items-start gap-2.5 text-xs text-sky-200">
            <RefreshCw className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Full Resume Support: </span>
              If your download pauses or network disconnects in Chrome, tap <strong>Resume</strong> in your notification drawer to continue seamlessly from where it stopped.
            </div>
          </div>

          {/* Secondary In-Browser Stream Mode Button */}
          <div className="pt-1 flex items-center justify-between text-xs text-zinc-400">
            <span>Prefer in-browser progress bar?</span>
            <button
              onClick={handleStartStream}
              disabled={isStreaming}
              className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 flex items-center gap-1 disabled:opacity-50"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Streaming ({downloadProgress.percent}%)</span>
                </>
              ) : (
                <span>Stream with Progress Bar &rarr;</span>
              )}
            </button>
          </div>

          {/* Interactive Live Progress Bar (when streaming mode is active) */}
          {isStreamingMode && (
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-sky-400/40 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                  {isStreaming && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />}
                  {downloadProgress.statusMessage || 'Preparing stream...'}
                </span>
                <span className="font-mono text-zinc-400 font-bold">
                  {downloadProgress.percent}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-[1px]">
                <div
                  className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${Math.max(5, downloadProgress.percent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Transferred: {(downloadProgress.receivedBytes / (1024 * 1024)).toFixed(1)} MB</span>
                <span>Total: {(downloadProgress.totalBytes / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
            </div>
          )}

          {/* Completion state banner */}
          {downloadProgress.state === 'complete' && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs font-medium flex items-start gap-2.5 animate-fade-in shadow-lg">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-white">APK Download Ready!</div>
                <div>{downloadProgress.statusMessage}</div>
                <div className="text-[11px] text-emerald-300/90 pt-1">
                  Locate <code className="font-mono text-white bg-emerald-900/50 px-1 py-0.5 rounded">LumoraStudio-v2.4.0.apk</code> in your browser downloads or phone file manager and tap to install.
                </div>
              </div>
            </div>
          )}

          {/* Error alert */}
          {downloadProgress.state === 'error' && (
            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-400/40 text-amber-200 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-white">Notice</div>
                <div>{downloadProgress.errorMessage || 'Browser stream interrupted.'}</div>
                <div className="text-[11px] text-amber-300">
                  Please tap <strong>"Download APK"</strong> or copy the link below into your browser address bar.
                </div>
              </div>
            </div>
          )}

          {/* Direct Link Copy Bar */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <input
              type="text"
              readOnly
              value={directApkUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] font-mono text-zinc-300 select-all focus:outline-none focus:border-sky-500"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopyLink}
              className={`py-2 px-3.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code expansion */}
        {showQr && (
          <div className="p-4 rounded-2xl bg-white text-slate-900 flex flex-col items-center gap-3 animate-fade-in shadow-xl">
            <div className="text-center">
              <div className="font-bold text-sm">Scan with Phone Camera</div>
              <div className="text-xs text-zinc-600">
                Point your phone camera to download directly onto your Android device
              </div>
            </div>
            <div className="p-2 bg-white rounded-xl shadow border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(directApkUrl)}`}
                alt="Direct APK Download QR Code"
                className="w-44 h-44 rounded-lg"
              />
            </div>
            <div className="text-[11px] text-zinc-500 font-mono text-center truncate max-w-sm">
              {directApkUrl}
            </div>
          </div>
        )}

        {/* Device & Architecture Compatibility */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-zinc-400 font-mono uppercase">Target OS</div>
            <div className="text-xs font-bold text-white mt-0.5">Android 7.0 – 15</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-zinc-400 font-mono uppercase">Architectures</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">ARM64 & ARMv7</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-zinc-400 font-mono uppercase">Screen Scale</div>
            <div className="text-xs font-bold text-sky-400 mt-0.5">Desktop & Mobile</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-zinc-400 font-mono uppercase">Offline Mode</div>
            <div className="text-xs font-bold text-indigo-300 mt-0.5">100% Standalone</div>
          </div>
        </div>

        {/* Installation guide for Android */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-zinc-300">
          <div className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Info className="w-4 h-4 text-sky-400" />
            <span>How to install on Android (Poco, Xiaomi, Samsung, OnePlus):</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-300 text-[11px] leading-relaxed">
            <li>
              Tap <strong className="text-white">Download APK</strong> above or open the direct link in Chrome.
            </li>
            <li>
              When prompted with <em>"File might be harmful"</em>, tap <strong className="text-emerald-400">Download anyway</strong>.
            </li>
            <li>
              Once completed, tap <strong>Open</strong> in Chrome or find <code className="text-sky-300 bg-black/40 px-1 py-0.5 rounded">LumoraStudio-v2.4.0.apk</code> in your phone's <strong>Downloads</strong> folder.
            </li>
            <li>
              If prompted, allow <em>"Install unknown apps"</em> from your browser or file manager.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
