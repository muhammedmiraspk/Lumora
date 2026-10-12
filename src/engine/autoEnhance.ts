import { BasicAdjustments } from '../types/editor';

/**
 * Calculates intelligent auto-enhancements based on image histogram and dynamic range
 */
export function calculateAutoEnhance(imageData: ImageData): Partial<BasicAdjustments> {
  const data = imageData.data;
  const len = data.length;
  let sumLuma = 0;
  let count = 0;
  const lumaHistogram = new Array(256).fill(0);

  // Sample every 8th pixel
  for (let i = 0; i < len; i += 32) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    sumLuma += luma;
    lumaHistogram[luma]++;
    count++;
  }

  if (count === 0) return {};

  const avgLuma = sumLuma / count;

  // Cumulative distribution for percentile extraction
  let cumulative = 0;
  let p5 = 0;
  let p95 = 255;

  for (let i = 0; i < 256; i++) {
    cumulative += lumaHistogram[i];
    if (cumulative >= count * 0.05 && p5 === 0) p5 = i;
    if (cumulative >= count * 0.95 && p95 === 255) p95 = i;
  }

  // Desired average luma is ~125
  const exposureDelta = ((125 - avgLuma) / 125) * 0.8;
  const dynamicRange = p95 - p5;

  let contrastBoost = 0;
  if (dynamicRange < 140) {
    contrastBoost = 25; // boost flat images
  } else if (dynamicRange > 220) {
    contrastBoost = -10; // soften ultra harsh images
  }

  // Highlight recovery if top end is bunched
  let highlights = 0;
  if (p95 > 240) highlights = -25;

  // Shadow boost if bottom end is crushed
  let shadows = 0;
  if (p5 < 15) shadows = 30;
  else if (p5 < 30) shadows = 18;

  return {
    exposure: parseFloat(Math.max(-2, Math.min(2, exposureDelta)).toFixed(2)),
    contrast: Math.round(contrastBoost),
    highlights,
    shadows,
    whites: 10,
    blacks: -10,
    vibrance: 15,
    saturation: 4,
  };
}

/**
 * Calculates neutral point white balance correction from sampled pixel RGB
 */
export function calculateNeutralWhiteBalance(r: number, g: number, b: number): {
  temperature: number;
  tint: number;
} {
  // If sampled pixel is warm (R > B), we need negative temperature
  // If sampled pixel is blue (B > R), we need positive temperature
  // If sampled pixel is green (G > avg), we need positive tint (magenta)
  // If sampled pixel is magenta (avg > G), we need negative tint (green)
  const avg = (r + g + b) / 3;
  if (avg < 5) return { temperature: 0, tint: 0 };

  const rRatio = r / avg;
  const bRatio = b / avg;
  const gRatio = g / avg;

  // R > B means warm sample -> cool down
  const tempDiff = (bRatio - rRatio) * 60;
  // G > (R+B)/2 means greenish -> add magenta (+ tint)
  const tintDiff = (((rRatio + bRatio) / 2) - gRatio) * 60;

  return {
    temperature: Math.max(-100, Math.min(100, Math.round(tempDiff))),
    tint: Math.max(-100, Math.min(100, Math.round(tintDiff))),
  };
}
