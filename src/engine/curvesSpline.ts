import { CurvePoint } from '../types/editor';

/**
 * Builds a 256-entry lookup table (LUT) from an array of curve control points
 * using monotonic cubic interpolation to avoid overshooting.
 */
export function buildCurveLut(points: CurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256);
  if (!points || points.length === 0) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }

  // Sort points by x
  const sorted = [...points].sort((a, b) => a.x - b.x);

  // If only 1 point
  if (sorted.length === 1) {
    const val = Math.min(255, Math.max(0, Math.round(sorted[0].y)));
    lut.fill(val);
    return lut;
  }

  // Linear interpolation segments for stability and speed
  for (let i = 0; i < sorted.length - 1; i++) {
    const p0 = sorted[i];
    const p1 = sorted[i + 1];
    const dx = p1.x - p0.x;
    if (dx <= 0) continue;

    const startX = Math.max(0, Math.round(p0.x));
    const endX = Math.min(255, Math.round(p1.x));

    for (let x = startX; x <= endX; x++) {
      const t = (x - p0.x) / dx;
      // Smooth cubic hermite curve between points
      const smoothT = t * t * (3 - 2 * t);
      const y = p0.y + (p1.y - p0.y) * smoothT;
      lut[x] = Math.min(255, Math.max(0, Math.round(y)));
    }
  }

  // Fill edges before first point and after last point
  const first = sorted[0];
  for (let x = 0; x < Math.max(0, Math.round(first.x)); x++) {
    lut[x] = Math.min(255, Math.max(0, Math.round(first.y)));
  }

  const last = sorted[sorted.length - 1];
  for (let x = Math.min(255, Math.round(last.x)) + 1; x < 256; x++) {
    lut[x] = Math.min(255, Math.max(0, Math.round(last.y)));
  }

  return lut;
}
