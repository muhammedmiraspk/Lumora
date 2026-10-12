import { EditState, BasicAdjustments, ToneAndDetail, GeometrySettings, HslColorKey, HslChannel, CurvePoint, ColorWheelVal } from '../types/editor';

export const DEFAULT_BASIC: BasicAdjustments = {
  exposure: 0,
  brightness: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
};

export const DEFAULT_TONE_DETAIL: ToneAndDetail = {
  clarity: 0,
  dehaze: 0,
  texture: 0,
  sharpening: 15,
  sharpenRadius: 1.0,
  noiseReduction: 0,
  colorNoiseReduction: 0,
  vignette: 0,
  vignetteFeather: 50,
  grain: 0,
  grainRoughness: 50,
  bloom: 0,
  bloomRadius: 8,
  chromaticAberration: 0,
  halation: 0,
  blur: 0,
  blurType: 'none',
};

export const DEFAULT_GEOMETRY: GeometrySettings = {
  cropAspect: 'original',
  rotation: 0,
  straighten: 0,
  flipH: false,
  flipV: false,
  cropRect: { x: 0, y: 0, width: 1, height: 1 },
};

export const DEFAULT_CURVE: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 255, y: 255 },
];

export const DEFAULT_COLOR_WHEEL: ColorWheelVal = {
  hue: 0,
  saturation: 0,
  luminance: 0,
};

const DEFAULT_HSL_CHANNEL: HslChannel = {
  hue: 0,
  saturation: 0,
  luminance: 0,
};

export const HSL_COLOR_KEYS: HslColorKey[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'cyan',
  'blue',
  'purple',
  'magenta',
];

export const DEFAULT_HSL: Record<HslColorKey, HslChannel> = {
  red: { ...DEFAULT_HSL_CHANNEL },
  orange: { ...DEFAULT_HSL_CHANNEL },
  yellow: { ...DEFAULT_HSL_CHANNEL },
  green: { ...DEFAULT_HSL_CHANNEL },
  cyan: { ...DEFAULT_HSL_CHANNEL },
  blue: { ...DEFAULT_HSL_CHANNEL },
  purple: { ...DEFAULT_HSL_CHANNEL },
  magenta: { ...DEFAULT_HSL_CHANNEL },
};

export function createInitialEditState(): EditState {
  return {
    basic: { ...DEFAULT_BASIC },
    toneDetail: { ...DEFAULT_TONE_DETAIL },
    geometry: { ...DEFAULT_GEOMETRY },
    curves: {
      rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    },
    hsl: JSON.parse(JSON.stringify(DEFAULT_HSL)),
    colorGrading: {
      shadows: { ...DEFAULT_COLOR_WHEEL },
      midtones: { ...DEFAULT_COLOR_WHEEL },
      highlights: { ...DEFAULT_COLOR_WHEEL },
      global: { ...DEFAULT_COLOR_WHEEL },
      blending: 50,
      balance: 0,
    },
    masks: [],
    layers: [],
    presetIntensity: 100,
  };
}
