/**
 * AI Inpainting, Object Removal, and Generative Insertion Engine
 * Supports both online inference and offline local patch reconstruction.
 */

export interface InpaintResult {
  imageUrl: string;
  isOnline: boolean;
  message?: string;
}

export class AiInpaintingEngine {
  /**
   * Checks backend AI status
   */
  public static async checkStatus(): Promise<{
    online: boolean;
    provider: string;
    configured: boolean;
  }> {
    try {
      const res = await fetch('/api/ai/status');
      if (!res.ok) throw new Error('Status error');
      return await res.json();
    } catch {
      return {
        online: false,
        provider: 'Offline Local Engine',
        configured: false,
      };
    }
  }

  /**
   * Inpaints an image by removing masked objects (online with fallback to offline)
   */
  public static async removeObject(
    sourceImg: HTMLImageElement | HTMLCanvasElement,
    maskCanvas: HTMLCanvasElement,
    prompt: string = '',
    forceOffline: boolean = false
  ): Promise<InpaintResult> {
    const w = ('naturalWidth' in sourceImg) ? sourceImg.naturalWidth : sourceImg.width;
    const h = ('naturalHeight' in sourceImg) ? sourceImg.naturalHeight : sourceImg.height;

    // Convert source to base64
    const workCanvas = document.createElement('canvas');
    workCanvas.width = w;
    workCanvas.height = h;
    const workCtx = workCanvas.getContext('2d');
    if (!workCtx) throw new Error('Canvas context unavailable');
    workCtx.drawImage(sourceImg, 0, 0, w, h);
    const sourceBase64 = workCanvas.toDataURL('image/jpeg', 0.92);

    // If online mode allowed, try remote endpoint
    if (!forceOffline) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const response = await fetch('/api/ai/inpaint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: sourceBase64,
            prompt,
            mode: 'remove',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            return {
              imageUrl: data.imageUrl,
              isOnline: true,
              message: 'Object seamlessly removed via AI Inpainting.',
            };
          }
        }
      } catch (err) {
        console.warn('Online inpainting unavailable, falling back to local patch reconstruction:', err);
      }
    }

    // Local offline patch inpainting
    const localResultUrl = this.localTeleaInpainting(sourceImg, maskCanvas, w, h);
    return {
      imageUrl: localResultUrl,
      isOnline: false,
      message: 'Object removed via local patch synthesis engine.',
    };
  }

  /**
   * Local patch-based reconstruction algorithm (works 100% offline)
   */
  public static localTeleaInpainting(
    sourceImg: HTMLImageElement | HTMLCanvasElement,
    maskCanvas: HTMLCanvasElement,
    w: number,
    h: number
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '';

    ctx.drawImage(sourceImg, 0, 0, w, h);
    const srcData = ctx.getImageData(0, 0, w, h);
    const s = srcData.data;

    // Read mask data
    const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!mCtx) return '';
    const maskData = mCtx.getImageData(0, 0, w, h).data;

    // Multi-pass patch synthesis from surrounding boundary pixels
    const passes = 3;
    const radius = 8;

    for (let pass = 0; pass < passes; pass++) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const maskAlpha = maskData[idx + 3];

          // If pixel is marked for removal
          if (maskAlpha > 30) {
            let totalWeight = 0;
            let sumR = 0;
            let sumG = 0;
            let sumB = 0;

            // Search surrounding window for valid natural pixels
            for (let dy = -radius; dy <= radius; dy += 2) {
              const ny = y + dy;
              if (ny < 0 || ny >= h) continue;

              for (let dx = -radius; dx <= radius; dx += 2) {
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;

                const nIdx = (ny * w + nx) * 4;
                const nMaskAlpha = maskData[nIdx + 3];

                // If neighbor is outside mask or partially reconstructed
                if (nMaskAlpha <= 30 || pass > 0) {
                  const dist = Math.hypot(dx, dy);
                  const weight = 1 / (1 + dist);

                  sumR += s[nIdx] * weight;
                  sumG += s[nIdx + 1] * weight;
                  sumB += s[nIdx + 2] * weight;
                  totalWeight += weight;
                }
              }
            }

            if (totalWeight > 0) {
              s[idx] = Math.round(sumR / totalWeight);
              s[idx + 1] = Math.round(sumG / totalWeight);
              s[idx + 2] = Math.round(sumB / totalWeight);
            }
          }
        }
      }
    }

    ctx.putImageData(srcData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  /**
   * Generates a new image or background using text prompt
   */
  public static async generateImage(
    prompt: string,
    style: string = 'cinematic',
    aspectRatio: string = '1:1'
  ): Promise<string> {
    const res = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style, aspectRatio }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate image');
    }

    const data = await res.json();
    return data.imageUrl;
  }
}
