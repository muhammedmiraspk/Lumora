export type LiquidThemeId = 'obsidian' | 'burgundy' | 'crystal' | 'sapphire' | 'emerald';

export interface LiquidTheme {
  id: LiquidThemeId;
  name: string;
  subtitle: string;
  bgBase: string;
  panelBg: string;
  panelBorder: string;
  panelGlow: string;
  accent: string;
  accentHover: string;
  accentText: string;
  badgeBg: string;
  ambientGradient: string;
}

export interface CurvePoint {
  x: number; // 0 to 255
  y: number; // 0 to 255
}

export interface ColorWheelVal {
  hue: number;        // 0 to 360
  saturation: number; // 0 to 100
  luminance: number;  // -100 to 100
}

export interface HslChannel {
  hue: number;        // -100 to 100
  saturation: number; // -100 to 100
  luminance: number;  // -100 to 100
}

export type HslColorKey = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'magenta';

export interface BasicAdjustments {
  exposure: number;       // -5.0 to +5.0
  brightness: number;     // -100 to +100
  contrast: number;       // -100 to +100
  highlights: number;     // -100 to +100
  shadows: number;        // -100 to +100
  whites: number;         // -100 to +100
  blacks: number;         // -100 to +100
  temperature: number;    // -100 (cool) to +100 (warm)
  tint: number;           // -100 (green) to +100 (magenta)
  vibrance: number;       // -100 to +100
  saturation: number;     // -100 to +100
}

export interface ToneAndDetail {
  clarity: number;        // -100 to +100
  dehaze: number;         // -100 to +100
  texture: number;        // -100 to +100
  sharpening: number;     // 0 to 100
  sharpenRadius: number;  // 0.5 to 3.0
  noiseReduction: number; // 0 to 100
  colorNoiseReduction: number; // 0 to 100
  vignette: number;       // -100 to +100
  vignetteFeather: number;// 0 to 100
  grain: number;          // 0 to 100
  grainRoughness: number; // 0 to 100
  bloom: number;          // 0 to 100
  bloomRadius: number;    // 1 to 20
  chromaticAberration: number; // 0 to 100
  halation: number;       // 0 to 100
  blur: number;           // 0 to 50
  blurType: 'none' | 'gaussian' | 'radial' | 'tilt-shift';
}

export interface GeometrySettings {
  cropAspect: 'original' | 'free' | '1:1' | '4:5' | '3:4' | '9:16' | '16:9';
  rotation: number;        // -180 to 180
  straighten: number;      // -45 to 45
  flipH: boolean;
  flipV: boolean;
  cropRect?: { x: number; y: number; width: number; height: number }; // normalized 0-1
}

export type MaskType = 'brush' | 'linear_gradient' | 'radial_gradient' | 'color_range' | 'luma_range' | 'subject' | 'sky';

export interface MaskAdjustments {
  exposure: number;
  contrast: number;
  temperature: number;
  saturation: number;
  clarity: number;
  sharpness: number;
  blur: number;
}

export interface MaskItem {
  id: string;
  name: string;
  type: MaskType;
  enabled: boolean;
  inverted: boolean;
  feather: number;       // 0 to 100
  opacity: number;       // 0 to 100
  adjustments: MaskAdjustments;
  // Brush specific
  brushStrokes?: Array<{
    x: number;
    y: number;
    radius: number;
    isEraser?: boolean;
  }>;
  // Linear gradient specific
  linearStart?: { x: number; y: number }; // normalized 0-1
  linearEnd?: { x: number; y: number };
  // Radial gradient specific
  radialCenter?: { x: number; y: number };
  radialRadiusX?: number;
  radialRadiusY?: number;
  // Color/Luma range specific
  targetColor?: { r: number; g: number; b: number };
  colorTolerance?: number; // 0 to 100
  lumaRange?: [number, number]; // [min, max] 0 to 255
}

export type BlendMode =
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'color-dodge'
  | 'luminosity';

export type LayerType = 'image' | 'text' | 'shape' | 'adjustment';

export interface LayerItem {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number; // 0 to 100
  blendMode: BlendMode;
  x: number; // canvas pixel or normalized
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  // Text layer
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  letterSpacing?: number;
  textShadow?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  // Shape layer
  shapeType?: 'rectangle' | 'circle' | 'line' | 'star' | 'badge';
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  // Image layer
  imageUrl?: string;
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  description: string;
  isFavorite?: boolean;
  values: {
    basic: Partial<BasicAdjustments>;
    toneDetail: Partial<ToneAndDetail>;
    curves?: {
      rgb?: CurvePoint[];
      red?: CurvePoint[];
      green?: CurvePoint[];
      blue?: CurvePoint[];
    };
    colorGrading?: {
      shadows?: ColorWheelVal;
      midtones?: ColorWheelVal;
      highlights?: ColorWheelVal;
      global?: ColorWheelVal;
      blending?: number;
      balance?: number;
    };
    hsl?: Partial<Record<HslColorKey, Partial<HslChannel>>>;
  };
}

export interface EditState {
  basic: BasicAdjustments;
  toneDetail: ToneAndDetail;
  geometry: GeometrySettings;
  curves: {
    rgb: CurvePoint[];
    red: CurvePoint[];
    green: CurvePoint[];
    blue: CurvePoint[];
  };
  hsl: Record<HslColorKey, HslChannel>;
  colorGrading: {
    shadows: ColorWheelVal;
    midtones: ColorWheelVal;
    highlights: ColorWheelVal;
    global: ColorWheelVal;
    blending: number; // 0 to 100
    balance: number;  // -100 to 100
  };
  masks: MaskItem[];
  layers: LayerItem[];
  activePresetId?: string;
  presetIntensity: number; // 0 to 150%
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  thumbnailUrl: string;
  originalImageBlobUrl: string;
  originalWidth: number;
  originalHeight: number;
  album: string;
  state: EditState;
  exif?: ExifData;
}

export interface ExifData {
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: string;
  fNumber?: string;
  exposureTime?: string;
  iso?: string;
  dateTime?: string;
  dimensions?: string;
  colorSpace?: string;
}

export interface HistogramData {
  red: number[];
  green: number[];
  blue: number[];
  luma: number[];
  clippedShadows: boolean;
  clippedHighlights: boolean;
  shadowClipPercent: number;
  highlightClipPercent: number;
  meanR: number;
  meanG: number;
  meanB: number;
  meanLuma: number;
  maxR: number;
  maxG: number;
  maxB: number;
}
