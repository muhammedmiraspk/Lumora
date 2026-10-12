import { HistogramData } from '../types/editor';

/**
 * Computes 256-bin histogram for red, green, blue, and luma
 * with clipping detection and channel statistics.
 */
export function calculateHistogram(imageData: ImageData): HistogramData {
  const red = new Array(256).fill(0);
  const green = new Array(256).fill(0);
  const blue = new Array(256).fill(0);
  const luma = new Array(256).fill(0);

  const data = imageData.data;
  const len = data.length;

  let shadowClipCount = 0;
  let highlightClipCount = 0;
  let totalPixels = 0;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumLuma = 0;

  let maxR = 0;
  let maxG = 0;
  let maxB = 0;

  // Stride-based sampling for 60fps real-time updates
  const step = len > 800000 ? 32 : len > 200000 ? 16 : 4;

  for (let i = 0; i < len; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);

    red[r]++;
    green[g]++;
    blue[b]++;
    luma[y]++;

    sumR += r;
    sumG += g;
    sumB += b;
    sumLuma += y;

    if (r > maxR) maxR = r;
    if (g > maxG) maxG = g;
    if (b > maxB) maxB = b;

    totalPixels++;
    if (r <= 2 && g <= 2 && b <= 2) shadowClipCount++;
    if (r >= 253 && g >= 253 && b >= 253) highlightClipCount++;
  }

  // Find max peak across all bins for normalization
  const maxCount = Math.max(
    Math.max(...red),
    Math.max(...green),
    Math.max(...blue),
    Math.max(...luma),
    1
  );

  const normRed = new Array(256);
  const normGreen = new Array(256);
  const normBlue = new Array(256);
  const normLuma = new Array(256);

  for (let i = 0; i < 256; i++) {
    normRed[i] = (red[i] / maxCount) * 100;
    normGreen[i] = (green[i] / maxCount) * 100;
    normBlue[i] = (blue[i] / maxCount) * 100;
    normLuma[i] = (luma[i] / maxCount) * 100;
  }

  const shadowPercent = totalPixels > 0 ? (shadowClipCount / totalPixels) * 100 : 0;
  const highlightPercent = totalPixels > 0 ? (highlightClipCount / totalPixels) * 100 : 0;

  return {
    red: normRed,
    green: normGreen,
    blue: normBlue,
    luma: normLuma,
    clippedShadows: shadowPercent > 0.5,
    clippedHighlights: highlightPercent > 0.5,
    shadowClipPercent: parseFloat(shadowPercent.toFixed(1)),
    highlightClipPercent: parseFloat(highlightPercent.toFixed(1)),
    meanR: totalPixels > 0 ? Math.round(sumR / totalPixels) : 128,
    meanG: totalPixels > 0 ? Math.round(sumG / totalPixels) : 128,
    meanB: totalPixels > 0 ? Math.round(sumB / totalPixels) : 128,
    meanLuma: totalPixels > 0 ? Math.round(sumLuma / totalPixels) : 128,
    maxR,
    maxG,
    maxB,
  };
}
