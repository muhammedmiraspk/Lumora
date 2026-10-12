/**
 * Robust APK and Desktop App downloader for browser, mobile Chrome, and iframe environments.
 * Supports:
 * - Native resumable browser downloads (Android Chrome, Samsung Internet, Firefox, Safari)
 * - In-browser streaming chunk download with progress reporting
 * - Direct anchor downloads immune to iframe popup blocking
 */

export interface DownloadProgress {
  state: 'idle' | 'starting' | 'downloading' | 'saving' | 'complete' | 'error';
  percent: number;
  receivedBytes: number;
  totalBytes: number;
  statusMessage: string;
  errorMessage?: string;
}

export type DownloadProgressCallback = (progress: DownloadProgress) => void;

/**
 * Triggers native browser download.
 * Uses a native anchor tag without target="_blank" so mobile browsers and iframes
 * do not block it with popup blockers. Since the server responds with Content-Disposition: attachment,
 * the current page remains active while the browser / Android Download Manager saves the file.
 */
export function triggerDirectDownload(
  apkUrl: string = '/download/lumora-studio.apk',
  fileName: string = 'LumoraStudio-v2.4.0.apk'
): boolean {
  try {
    const anchor = document.createElement('a');
    anchor.href = apkUrl;
    anchor.download = fileName;
    anchor.setAttribute('download', fileName);
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      if (document.body.contains(anchor)) {
        document.body.removeChild(anchor);
      }
    }, 1500);
    return true;
  } catch (err) {
    console.warn('Native anchor click fallback to location assign:', err);
    try {
      window.location.href = apkUrl;
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * In-browser streamed download with progress tracking.
 * Reads chunk by chunk and builds a Blob in memory.
 */
export async function downloadApkWithStream(
  onProgress?: DownloadProgressCallback,
  apkUrl: string = '/download/lumora-studio.apk',
  fileName: string = 'LumoraStudio-v2.4.0.apk'
): Promise<boolean> {
  const notify = (p: Partial<DownloadProgress>) => {
    if (onProgress) {
      onProgress({
        state: 'idle',
        percent: 0,
        receivedBytes: 0,
        totalBytes: 70018466,
        statusMessage: '',
        ...p,
      });
    }
  };

  notify({ state: 'starting', percent: 5, statusMessage: 'Connecting to download server...' });

  // 1. Try File System Access API (showSaveFilePicker) if supported (e.g. Chrome Desktop)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      notify({ state: 'starting', percent: 10, statusMessage: 'Select destination folder...' });
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Android APK Package',
            accept: {
              'application/vnd.android.package-archive': ['.apk'],
            },
          },
        ],
      });

      const response = await fetch(apkUrl);

      if (response.ok) {
        const contentLength = +(response.headers.get('Content-Length') || 70018466);
        const reader = response.body?.getReader();
        const writable = await fileHandle.createWritable();

        if (reader && writable) {
          let received = 0;
          notify({
            state: 'downloading',
            percent: 15,
            receivedBytes: 0,
            totalBytes: contentLength,
            statusMessage: 'Streaming APK directly to disk...',
          });

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writable.write(value);
            received += value.length;
            const pct = Math.min(99, Math.round((received / contentLength) * 100));
            notify({
              state: 'downloading',
              percent: pct,
              receivedBytes: received,
              totalBytes: contentLength,
              statusMessage: `Saving: ${(received / (1024 * 1024)).toFixed(1)} MB / ${(contentLength / (1024 * 1024)).toFixed(1)} MB`,
            });
          }

          await writable.close();
          notify({
            state: 'complete',
            percent: 100,
            receivedBytes: received,
            totalBytes: contentLength,
            statusMessage: `Saved ${fileName} directly to your device!`,
          });
          return true;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        notify({ state: 'idle', percent: 0, statusMessage: 'Download cancelled by user.' });
        return false;
      }
      console.warn('showSaveFilePicker notice, continuing to browser download:', err?.message || err);
    }
  }

  // 2. Streamed fetch into in-memory Blob with automatic direct download fallback
  try {
    notify({
      state: 'downloading',
      percent: 10,
      receivedBytes: 0,
      totalBytes: 70018466,
      statusMessage: 'Downloading APK package (66.8 MB)...',
    });

    const response = await fetch(apkUrl);

    if (!response.ok) {
      console.warn(`Stream returned status ${response.status}, switching to native browser download.`);
      triggerDirectDownload(apkUrl, fileName);
      notify({
        state: 'complete',
        percent: 100,
        receivedBytes: 70018466,
        totalBytes: 70018466,
        statusMessage: 'Download initiated in browser downloads.',
      });
      return true;
    }

    const contentLength = +(response.headers.get('Content-Length') || 70018466);
    const reader = response.body?.getReader();

    if (!reader) {
      const blob = await response.blob();
      saveBlobDirectly(blob, fileName);
      notify({
        state: 'complete',
        percent: 100,
        receivedBytes: blob.size,
        totalBytes: blob.size,
        statusMessage: `Download complete! Check your Downloads folder.`,
      });
      return true;
    }

    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      const pct = Math.min(98, Math.round((received / contentLength) * 100));
      notify({
        state: 'downloading',
        percent: pct,
        receivedBytes: received,
        totalBytes: contentLength,
        statusMessage: `Downloading: ${(received / (1024 * 1024)).toFixed(1)} MB / ${(contentLength / (1024 * 1024)).toFixed(1)} MB (${pct}%)`,
      });
    }

    notify({
      state: 'saving',
      percent: 99,
      receivedBytes: received,
      totalBytes: contentLength,
      statusMessage: 'Finalizing APK and saving to disk...',
    });

    const fullBlob = new Blob(chunks as unknown as BlobPart[], {
      type: 'application/vnd.android.package-archive',
    });
    saveBlobDirectly(fullBlob, fileName);

    notify({
      state: 'complete',
      percent: 100,
      receivedBytes: received,
      totalBytes: contentLength,
      statusMessage: `Downloaded ${fileName}! Check your browser Downloads.`,
    });
    return true;
  } catch (err: any) {
    console.warn('Stream notice, falling back to direct browser download:', err?.message || err);
    triggerDirectDownload(apkUrl, fileName);
    notify({
      state: 'complete',
      percent: 100,
      receivedBytes: 70018466,
      totalBytes: 70018466,
      statusMessage: 'Download opened in your browser.',
    });
    return true;
  }
}

/**
 * Compatibility alias
 */
export const downloadApkFile = downloadApkWithStream;

function saveBlobDirectly(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    if (document.body.contains(anchor)) {
      document.body.removeChild(anchor);
    }
    URL.revokeObjectURL(blobUrl);
  }, 2500);
}
