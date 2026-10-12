import { ColorWheelVal, HslChannel, HslColorKey } from '../types/editor';

// Center hues for 8 color channels
const CHANNEL_HUES: Record<HslColorKey, number> = {
  red: 0,
  orange: 30,
  yellow: 60,
  green: 120,
  cyan: 180,
  blue: 240,
  purple: 280,
  magenta: 320,
};

/**
 * Converts RGB [0..255] to HSL [0..360, 0..1, 0..1]
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return [h, s, l];
}

/**
 * Converts HSL [0..360, 0..1, 0..1] to RGB [0..255]
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hNorm = h / 360;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Applies HSL mixer adjustments to a single RGB pixel
 */
export function applyHslMixer(
  r: number,
  g: number,
  b: number,
  hslSettings: Record<HslColorKey, HslChannel>
): [number, number, number] {
  let [h, s, l] = rgbToHsl(r, g, b);

  // If pixel has no saturation, hue adjustments don't apply
  if (s < 0.01) return [r, g, b];

  let totalDeltaH = 0;
  let totalDeltaS = 0;
  let totalDeltaL = 0;

  for (const [key, centerHue] of Object.entries(CHANNEL_HUES) as [HslColorKey, number][]) {
    const adj = hslSettings[key];
    if (!adj || (adj.hue === 0 && adj.saturation === 0 && adj.luminance === 0)) continue;

    // Calculate angular distance
    let diff = Math.abs(h - centerHue);
    if (diff > 180) diff = 360 - diff;

    // Gaussian bell falloff around target hue (window size ~ 40 deg)
    if (diff < 45) {
      const weight = Math.cos((diff / 45) * (Math.PI / 2));
      totalDeltaH += (adj.hue * 0.4) * weight;
      totalDeltaS += (adj.saturation / 100) * weight;
      totalDeltaL += (adj.luminance / 100) * weight;
    }
  }

  h = (h + totalDeltaH + 360) % 360;
  s = Math.max(0, Math.min(1, s + totalDeltaS));
  l = Math.max(0, Math.min(1, l + totalDeltaL));

  return hslToRgb(h, s, l);
}

/**
 * Applies 3-way color grading (Shadows, Midtones, Highlights, Global) to an RGB pixel
 */
export function apply3WayColorGrading(
  r: number,
  g: number,
  b: number,
  grading: {
    shadows: ColorWheelVal;
    midtones: ColorWheelVal;
    highlights: ColorWheelVal;
    global: ColorWheelVal;
    blending: number; // 0 to 100
    balance: number;  // -100 to 100
  }
): [number, number, number] {
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; // 0 to 1

  // Balance shifts the midtone pivot point
  const balanceFactor = (grading.balance / 100) * 0.25; // -0.25 to +0.25
  const midLuma = Math.max(0.01, Math.min(0.99, 0.5 + balanceFactor));

  // Calculate weights
  let shadowWeight = Math.max(0, 1 - (luma / midLuma));
  let highlightWeight = Math.max(0, (luma - midLuma) / (1 - midLuma));
  let midtoneWeight = Math.max(0, 1 - Math.abs(luma - midLuma) * 2);

  // Apply blending power curve
  const blendPow = 0.5 + (grading.blending / 100);
  shadowWeight = Math.pow(shadowWeight, blendPow);
  highlightWeight = Math.pow(highlightWeight, blendPow);
  midtoneWeight = Math.pow(midtoneWeight, blendPow);

  let deltaR = 0;
  let deltaG = 0;
  let deltaB = 0;

  const addWheelColor = (wheel: ColorWheelVal, weight: number) => {
    if (wheel.saturation <= 0 && wheel.luminance === 0) return;
    const [wr, wg, wb] = hslToRgb(wheel.hue, wheel.saturation / 100, 0.5);
    const tintR = (wr - 128) * (wheel.saturation / 100) * weight * 0.6;
    const tintG = (wg - 128) * (wheel.saturation / 100) * weight * 0.6;
    const tintB = (wb - 128) * (wheel.saturation / 100) * weight * 0.6;
    const lumaShift = (wheel.luminance / 100) * 35 * weight;

    deltaR += tintR + lumaShift;
    deltaG += tintG + lumaShift;
    deltaB += tintB + lumaShift;
  };

  addWheelColor(grading.shadows, shadowWeight);
  addWheelColor(grading.midtones, midtoneWeight);
  addWheelColor(grading.highlights, highlightWeight);
  addWheelColor(grading.global, 1.0);

  const outR = Math.min(255, Math.max(0, r + deltaR));
  const outG = Math.min(255, Math.max(0, g + deltaG));
  const outB = Math.min(255, Math.max(0, b + deltaB));

  return [outR, outG, outB];
}
