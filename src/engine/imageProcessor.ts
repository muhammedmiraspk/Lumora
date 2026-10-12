import {
  EditState,
  MaskItem,
  LayerItem,
} from '../types/editor';
import { buildCurveLut } from './curvesSpline';
import { applyHslMixer, apply3WayColorGrading } from './colorGrading';

export interface RenderOptions {
  isProxy?: boolean;      // Lower resolution preview for fast interactive scrubbing
  maxDimension?: number;  // If set, constrain canvas size
  showOriginal?: boolean; // If true, render unedited original
  activeMaskId?: string;  // If set, can draw mask overlay ruby red
  showMaskOverlay?: boolean;
}

/**
 * Main Image Processing Engine for Lumora Studio
 */
export class ImageProcessor {
  /**
   * Renders the complete edit pipeline onto a target canvas
   */
  public static render(
    sourceImg: HTMLImageElement | HTMLCanvasElement,
    targetCanvas: HTMLCanvasElement,
    state: EditState,
    options: RenderOptions = {}
  ): void {
    const { isProxy = false, showOriginal = false, maxDimension, showMaskOverlay = false, activeMaskId } = options;

    const naturalWidth = ('naturalWidth' in sourceImg) ? sourceImg.naturalWidth : sourceImg.width;
    const naturalHeight = ('naturalHeight' in sourceImg) ? sourceImg.naturalHeight : sourceImg.height;

    if (!naturalWidth || !naturalHeight) return;

    // Calculate dimensions
    let destW = naturalWidth;
    let destH = naturalHeight;

    const limit = maxDimension || (isProxy ? 1080 : 3840);
    if (destW > limit || destH > limit) {
      const ratio = Math.min(limit / destW, limit / destH);
      destW = Math.round(destW * ratio);
      destH = Math.round(destH * ratio);
    }

    // Geometry Crop & Rotation setup
    const geo = state.geometry;
    let cropX = 0;
    let cropY = 0;
    let cropW = destW;
    let cropH = destH;

    if (geo.cropRect && !showOriginal) {
      cropX = Math.round(geo.cropRect.x * destW);
      cropY = Math.round(geo.cropRect.y * destH);
      cropW = Math.round(geo.cropRect.width * destW);
      cropH = Math.round(geo.cropRect.height * destH);
    }

    targetCanvas.width = cropW;
    targetCanvas.height = cropH;

    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Fast-path: Original comparison requested
    if (showOriginal) {
      ctx.drawImage(sourceImg, 0, 0, targetCanvas.width, targetCanvas.height);
      return;
    }

    // Temporary work canvas for geometry and base drawing
    const workCanvas = document.createElement('canvas');
    workCanvas.width = destW;
    workCanvas.height = destH;
    const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
    if (!workCtx) return;

    // Apply rotation & flip
    workCtx.save();
    workCtx.translate(destW / 2, destH / 2);

    const totalAngle = (geo.rotation + geo.straighten) * (Math.PI / 180);
    workCtx.rotate(totalAngle);

    const scaleX = geo.flipH ? -1 : 1;
    const scaleY = geo.flipV ? -1 : 1;
    workCtx.scale(scaleX, scaleY);

    workCtx.drawImage(sourceImg, -destW / 2, -destH / 2, destW, destH);
    workCtx.restore();

    // Now extract pixel data for adjustments
    const imgData = workCtx.getImageData(cropX, cropY, cropW, cropH);
    const data = imgData.data;
    const totalPixels = cropW * cropH;

    // 1. Precalculate Curves LUTs
    const masterLut = buildCurveLut(state.curves.rgb);
    const redLut = buildCurveLut(state.curves.red);
    const greenLut = buildCurveLut(state.curves.green);
    const blueLut = buildCurveLut(state.curves.blue);

    // 2. Precalculate Tone adjustments
    const basic = state.basic;
    const intensity = (state.presetIntensity ?? 100) / 100;

    // Exposure scaling factor (EV: 2^exposure)
    const expVal = basic.exposure * intensity;
    const expFactor = Math.pow(2, expVal);

    // Contrast scaling
    const contrastVal = (basic.contrast * intensity) / 100;
    const contrastFactor = (1.315 * (contrastVal + 1)) / (1.315 - contrastVal);

    // Highlights & Shadows
    const hlAmount = (basic.highlights * intensity) / 100;
    const shAmount = (basic.shadows * intensity) / 100;
    const whitesAmount = (basic.whites * intensity) / 100;
    const blacksAmount = (basic.blacks * intensity) / 100;

    // Temperature & Tint (Kelvin / Tint offsets)
    const tempK = (basic.temperature * intensity);
    const tintK = (basic.tint * intensity);
    const tempR = tempK > 0 ? 1 + (tempK / 100) * 0.22 : 1;
    const tempB = tempK < 0 ? 1 + (-tempK / 100) * 0.25 : 1;
    const tintG = tintK < 0 ? 1 + (-tintK / 100) * 0.18 : 1;
    const tintM_R = tintK > 0 ? (tintK / 100) * 0.12 : 0;
    const tintM_B = tintK > 0 ? (tintK / 100) * 0.12 : 0;

    // Vibrance and Saturation
    const vibAmount = (basic.vibrance * intensity) / 100;
    const satAmount = (basic.saturation * intensity) / 100;

    // 3. Build fast pixel-by-pixel color transformation
    const hasHsl = Object.values(state.hsl).some(
      (h) => h.hue !== 0 || h.saturation !== 0 || h.luminance !== 0
    );
    const grading = state.colorGrading;
    const hasGrading =
      grading.shadows.saturation > 0 ||
      grading.shadows.luminance !== 0 ||
      grading.midtones.saturation > 0 ||
      grading.midtones.luminance !== 0 ||
      grading.highlights.saturation > 0 ||
      grading.highlights.luminance !== 0 ||
      grading.global.saturation > 0 ||
      grading.global.luminance !== 0;

    for (let i = 0; i < totalPixels * 4; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // A. White Balance
      r = Math.min(255, Math.max(0, r * tempR + tintM_R * 255));
      g = Math.min(255, Math.max(0, g * tintG));
      b = Math.min(255, Math.max(0, b * tempB + tintM_B * 255));

      // B. Exposure & Brightness
      if (expVal !== 0 || basic.brightness !== 0) {
        const brightAdd = (basic.brightness * intensity) * 0.7;
        r = Math.min(255, Math.max(0, r * expFactor + brightAdd));
        g = Math.min(255, Math.max(0, g * expFactor + brightAdd));
        b = Math.min(255, Math.max(0, b * expFactor + brightAdd));
      }

      // C. Highlights, Shadows, Whites, Blacks
      let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const lumaNorm = luma / 255;

      if (hlAmount !== 0 || shAmount !== 0 || whitesAmount !== 0 || blacksAmount !== 0) {
        // Highlights target top 50%
        if (hlAmount !== 0 && lumaNorm > 0.45) {
          const w = (lumaNorm - 0.45) / 0.55;
          const shift = hlAmount * 50 * w;
          r = Math.min(255, Math.max(0, r + shift));
          g = Math.min(255, Math.max(0, g + shift));
          b = Math.min(255, Math.max(0, b + shift));
        }

        // Shadows target bottom 50%
        if (shAmount !== 0 && lumaNorm < 0.55) {
          const w = (0.55 - lumaNorm) / 0.55;
          const shift = shAmount * 50 * w;
          r = Math.min(255, Math.max(0, r + shift));
          g = Math.min(255, Math.max(0, g + shift));
          b = Math.min(255, Math.max(0, b + shift));
        }

        // Whites target top 25%
        if (whitesAmount !== 0 && lumaNorm > 0.7) {
          const w = (lumaNorm - 0.7) / 0.3;
          const shift = whitesAmount * 40 * w;
          r = Math.min(255, Math.max(0, r + shift));
          g = Math.min(255, Math.max(0, g + shift));
          b = Math.min(255, Math.max(0, b + shift));
        }

        // Blacks target bottom 25%
        if (blacksAmount !== 0 && lumaNorm < 0.3) {
          const w = (0.3 - lumaNorm) / 0.3;
          const shift = blacksAmount * 40 * w;
          r = Math.min(255, Math.max(0, r + shift));
          g = Math.min(255, Math.max(0, g + shift));
          b = Math.min(255, Math.max(0, b + shift));
        }
      }

      // D. Contrast S-Curve
      if (contrastVal !== 0) {
        r = Math.min(255, Math.max(0, (r - 128) * contrastFactor + 128));
        g = Math.min(255, Math.max(0, (g - 128) * contrastFactor + 128));
        b = Math.min(255, Math.max(0, (b - 128) * contrastFactor + 128));
      }

      // E. Curves LUTs
      r = redLut[masterLut[Math.round(r)]];
      g = greenLut[masterLut[Math.round(g)]];
      b = blueLut[masterLut[Math.round(b)]];

      // F. Vibrance & Saturation
      if (satAmount !== 0 || vibAmount !== 0) {
        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = (maxC - minC) / (maxC || 1);

        // Vibrance affects less saturated pixels more strongly
        const vibFactor = 1 + vibAmount * (1 - sat * 0.7);
        const totalSat = (1 + satAmount) * vibFactor;

        r = Math.min(255, Math.max(0, luma + (r - luma) * totalSat));
        g = Math.min(255, Math.max(0, luma + (g - luma) * totalSat));
        b = Math.min(255, Math.max(0, luma + (b - luma) * totalSat));
      }

      // G. HSL Mixer
      if (hasHsl) {
        [r, g, b] = applyHslMixer(r, g, b, state.hsl);
      }

      // H. 3-Way Color Grading
      if (hasGrading) {
        [r, g, b] = apply3WayColorGrading(r, g, b, grading);
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    // Write back adjusted pixels
    ctx.putImageData(imgData, 0, 0);

    // 4. Tone and Detail Effects (Clarity, Vignette, Grain, Bloom, Chromatic Aberration)
    const td = state.toneDetail;

    // A. Clarity / Dehaze simulation (contrast unsharp overlay)
    if (td.clarity !== 0 || td.dehaze !== 0) {
      const effectCtx = targetCanvas.getContext('2d');
      if (effectCtx) {
        effectCtx.save();
        if (td.dehaze > 0) {
          effectCtx.fillStyle = `rgba(0, 0, 0, ${(td.dehaze / 100) * 0.15})`;
          effectCtx.fillRect(0, 0, cropW, cropH);
        } else if (td.dehaze < 0) {
          effectCtx.fillStyle = `rgba(255, 255, 255, ${(-td.dehaze / 100) * 0.15})`;
          effectCtx.fillRect(0, 0, cropW, cropH);
        }
        effectCtx.restore();
      }
    }

    // B. Vignette
    if (td.vignette !== 0) {
      ctx.save();
      const centerX = cropW / 2;
      const centerY = cropH / 2;
      const radius = Math.sqrt(centerX * centerX + centerY * centerY);
      const featherNorm = (td.vignetteFeather || 50) / 100;
      const innerRadius = radius * (0.3 + (1 - featherNorm) * 0.4);

      const vigGrad = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius);
      if (td.vignette < 0) {
        // Dark vignette
        const alpha = (-td.vignette / 100) * 0.85;
        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);
      } else {
        // White vignette
        const alpha = (td.vignette / 100) * 0.75;
        vigGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vigGrad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
      }
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, cropW, cropH);
      ctx.restore();
    }

    // C. Film Grain
    if (td.grain > 0) {
      this.applyFilmGrain(ctx, cropW, cropH, td.grain, td.grainRoughness || 50);
    }

    // D. Bloom / Halation
    if (td.bloom > 0 || td.halation > 0) {
      this.applyBloom(ctx, targetCanvas, cropW, cropH, td.bloom, td.halation);
    }

    // E. Chromatic Aberration
    if (td.chromaticAberration > 0) {
      this.applyChromaticAberration(ctx, cropW, cropH, td.chromaticAberration);
    }

    // 5. Apply Masks (Local adjustments & overlays)
    if (state.masks && state.masks.length > 0) {
      this.applyMasks(ctx, state.masks, cropW, cropH, showMaskOverlay, activeMaskId);
    }

    // 6. Apply Layers (Graphics, Text, Overlays)
    if (state.layers && state.layers.length > 0) {
      this.applyLayers(ctx, state.layers, cropW, cropH);
    }
  }

  /**
   * Fast organic film grain synthesizer
   */
  private static applyFilmGrain(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    amount: number,
    roughness: number
  ): void {
    const grainCanvas = document.createElement('canvas');
    // For performance, generate grain on a tile and repeat
    const tileSize = 256;
    grainCanvas.width = tileSize;
    grainCanvas.height = tileSize;
    const gCtx = grainCanvas.getContext('2d');
    if (!gCtx) return;

    const gData = gCtx.createImageData(tileSize, tileSize);
    const d = gData.data;
    const len = d.length;
    const roughCoeff = roughness / 100;

    for (let i = 0; i < len; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * (0.4 + roughCoeff * 0.6);
      d[i] = noise > 0 ? 255 : 0;
      d[i + 1] = noise > 0 ? 255 : 0;
      d[i + 2] = noise > 0 ? 255 : 0;
      d[i + 3] = Math.abs(noise);
    }
    gCtx.putImageData(gData, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = (amount / 100) * 0.45;
    const pat = ctx.createPattern(grainCanvas, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  /**
   * Bloom and halation glow generator
   */
  private static applyBloom(
    ctx: CanvasRenderingContext2D,
    mainCanvas: HTMLCanvasElement,
    w: number,
    h: number,
    bloomAmount: number,
    halationAmount: number
  ): void {
    if (bloomAmount <= 0 && halationAmount <= 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    if (bloomAmount > 0) {
      ctx.globalAlpha = (bloomAmount / 100) * 0.35;
      ctx.filter = `blur(${Math.max(6, Math.round(w * 0.02))}px)`;
      ctx.drawImage(mainCanvas, 0, 0);
    }

    if (halationAmount > 0) {
      // Reddish halation around specular edges
      ctx.globalCompositeOperation = 'color-dodge';
      ctx.globalAlpha = (halationAmount / 100) * 0.3;
      ctx.filter = `blur(${Math.max(4, Math.round(w * 0.012))}px) sepia(100%) hue-rotate(320deg)`;
      ctx.drawImage(mainCanvas, 0, 0);
    }

    ctx.restore();
  }

  /**
   * Real optical chromatic aberration / RGB 3D split
   */
  private static applyChromaticAberration(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    intensity: number
  ): void {
    const shift = Math.max(1, Math.round((intensity / 100) * 10));
    const srcData = ctx.getImageData(0, 0, w, h);
    const destData = ctx.createImageData(w, h);
    const s = srcData.data;
    const d = destData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;

        // Shift red left, blue right
        const rx = Math.max(0, x - shift);
        const bx = Math.min(w - 1, x + shift);

        const rIdx = (y * w + rx) * 4;
        const bIdx = (y * w + bx) * 4;

        d[idx] = s[rIdx];         // R shifted
        d[idx + 1] = s[idx + 1];  // G center
        d[idx + 2] = s[bIdx + 2]; // B shifted
        d[idx + 3] = s[idx + 3];  // A
      }
    }
    ctx.putImageData(destData, 0, 0);
  }

  /**
   * Applies local masks and optional ruby-red mask overlay preview
   */
  private static applyMasks(
    ctx: CanvasRenderingContext2D,
    masks: MaskItem[],
    w: number,
    h: number,
    showOverlay: boolean,
    activeMaskId?: string
  ): void {
    masks.forEach((mask) => {
      if (!mask.enabled) return;

      // Check if mask overlay preview is active for this mask
      if (showOverlay && activeMaskId === mask.id) {
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // Ruby red overlay

        if (mask.type === 'linear_gradient' && mask.linearStart && mask.linearEnd) {
          const x1 = mask.linearStart.x * w;
          const y1 = mask.linearStart.y * h;
          const x2 = mask.linearEnd.x * w;
          const y2 = mask.linearEnd.y * h;
          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        } else if (mask.type === 'radial_gradient' && mask.radialCenter) {
          const cx = mask.radialCenter.x * w;
          const cy = mask.radialCenter.y * h;
          const rx = (mask.radialRadiusX || 0.3) * w;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        } else if (mask.type === 'brush' && mask.brushStrokes) {
          ctx.beginPath();
          mask.brushStrokes.forEach((st) => {
            ctx.arc(st.x * w, st.y * h, st.radius, 0, Math.PI * 2);
          });
          ctx.fill();
        } else if (mask.type === 'subject') {
          // Central focused ellipse heuristic
          const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.35);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        } else if (mask.type === 'sky') {
          // Top sky gradient
          const grad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h * 0.45);
        }
        ctx.restore();
      }

      // Apply actual mask adjustments if present
      const adj = mask.adjustments;
      if (adj.exposure !== 0 || adj.temperature !== 0 || adj.contrast !== 0 || adj.saturation !== 0) {
        ctx.save();
        if (adj.exposure > 0) {
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = `rgba(255, 255, 255, ${(adj.exposure / 5) * 0.25})`;
          ctx.fillRect(0, 0, w, h);
        } else if (adj.exposure < 0) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = `rgba(0, 0, 0, ${(-adj.exposure / 5) * 0.25})`;
          ctx.fillRect(0, 0, w, h);
        }

        if (adj.temperature !== 0) {
          ctx.globalCompositeOperation = 'overlay';
          if (adj.temperature > 0) {
            ctx.fillStyle = `rgba(255, 140, 40, ${(adj.temperature / 100) * 0.25})`;
          } else {
            ctx.fillStyle = `rgba(40, 140, 255, ${(-adj.temperature / 100) * 0.25})`;
          }
          ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();
      }
    });
  }

  /**
   * Applies Photoshop-style composited layers (Text, Shapes, Graphics)
   */
  private static applyLayers(
    ctx: CanvasRenderingContext2D,
    layers: LayerItem[],
    w: number,
    h: number
  ): void {
    layers.forEach((layer) => {
      if (!layer.visible || layer.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositeOperation = layer.blendMode || 'source-over';

      const lx = layer.x;
      const ly = layer.y;

      ctx.translate(lx, ly);
      if (layer.rotation) {
        ctx.rotate((layer.rotation * Math.PI) / 180);
      }

      if (layer.type === 'text' && layer.text) {
        ctx.font = `${layer.fontSize || 36}px ${layer.fontFamily || 'Plus Jakarta Sans'}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (layer.textShadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
        }

        if (layer.strokeWidth && layer.strokeColor) {
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = layer.strokeWidth;
          ctx.strokeText(layer.text, 0, 0);
        }

        ctx.fillStyle = layer.fontColor || '#ffffff';
        ctx.fillText(layer.text, 0, 0);
      } else if (layer.type === 'shape') {
        const sw = layer.width || 120;
        const sh = layer.height || 120;

        ctx.fillStyle = layer.fillColor || 'rgba(56, 189, 248, 0.8)';
        if (layer.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, sw / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
        }

        if (layer.borderWidth && layer.borderColor) {
          ctx.strokeStyle = layer.borderColor;
          ctx.lineWidth = layer.borderWidth;
          if (layer.shapeType === 'circle') {
            ctx.stroke();
          } else {
            ctx.strokeRect(-sw / 2, -sh / 2, sw, sh);
          }
        }
      }

      ctx.restore();
    });
  }
}
