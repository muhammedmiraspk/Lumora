import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Layers,
  Activity,
  Palette,
  Disc3,
  Download,
  Folder,
  Eye,
  Crop,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Pipette,
  BookOpen,
} from 'lucide-react';
import { WorkspaceId } from '../layout/Header';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToWorkspace?: (ws: WorkspaceId) => void;
}

interface TutorialStep {
  title: string;
  category: string;
  icon: any;
  accentColor: string;
  badge: string;
  description: string;
  highlights: Array<{ title: string; desc: string }>;
  proTip: string;
  workspaceTarget?: WorkspaceId;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Lumora Studio',
    category: 'GETTING STARTED',
    icon: Sparkles,
    accentColor: '#38bdf8',
    badge: 'PRO ECOSYSTEM',
    description:
      'Lumora Studio brings desktop-grade RAW and photo editing directly to your mobile phone and desktop. Completely free, privacy-first, and fully functional offline without subscriptions, watermarks, or account logins.',
    highlights: [
      {
        title: '5 Liquid Glass Themes',
        desc: 'Choose from Obsidian Black, Burgundy Glass, Pure Crystal, Midnight Sapphire, and Emerald Aurora.',
      },
      {
        title: 'Budget Device Optimization',
        desc: 'Built-in Poco C31 / Low RAM mode disables heavy blur filters and optimizes proxy rendering for smooth 60 FPS performance.',
      },
      {
        title: 'Nondestructive Engine',
        desc: 'Your original photo is always preserved. Every adjustment, curve, mask, and layer remains completely editable.',
      },
    ],
    proTip: 'You can reopen this tutorial at any time by clicking the Book icon in the top header.',
  },
  {
    title: '6 Dedicated Studios & AI',
    category: 'STUDIO ARCHITECTURE',
    icon: Folder,
    accentColor: '#818cf8',
    badge: 'WORKFLOW',
    description:
      'The ecosystem is structured into six specialized modules accessible from the top navigation bar:',
    highlights: [
      {
        title: '1. Library',
        desc: 'Organize offline projects in IndexedDB, browse curated sample photos, or import files from your device.',
      },
      {
        title: '2. Edit (Develop)',
        desc: 'Darkroom tools: Live Histogram, Basic tone, Curves, HSL mixer, 3-Way color wheels, Detail & Masking.',
      },
      {
        title: '3. AI Studio',
        desc: 'Advanced AI: Subject cutout, background replacement, object removal inpainting, generative insertion, and asset library.',
      },
      {
        title: '4. Layers',
        desc: 'Photoshop-style layer compositing with text typography, shapes, and 11 blend modes.',
      },
      {
        title: '5. Presets',
        desc: '150+ original professional presets across 16+ genres with an adjustable Intensity slider.',
      },
      {
        title: '6. Export',
        desc: 'Full-resolution master rendering (JPEG, PNG, WebP) with social media presets and EXIF preservation.',
      },
    ],
    proTip: 'Tap between workspaces freely without losing your current progress.',
  },
  {
    title: 'Live RGB & Luminance Histogram',
    category: 'COLOR SCIENCE',
    icon: Activity,
    accentColor: '#22c55e',
    badge: 'REAL-TIME ANALYSIS',
    description:
      'The live histogram visualizes your photo’s exact 256-bin color distribution and updates in real-time as you tweak sliders, curves, and presets.',
    highlights: [
      {
        title: 'Real-Time Dynamic Update',
        desc: 'Calculates the composite color distribution of your edited photo at 60 FPS.',
      },
      {
        title: 'Channel View Switching',
        desc: 'Toggle between composite RGB, individual Red (R), Green (G), Blue (B), and Luminance (Y) graphs.',
      },
      {
        title: 'Clipping Warning Badges',
        desc: 'Shadows clipping badge warns when blacks are crushed (< 2), while Highlights badge alerts when bright details blow out (> 253).',
      },
      {
        title: 'Interactive Tonal Inspector',
        desc: 'Hover over the histogram canvas to inspect exact tonal levels (0–255) and channel percentages.',
      },
    ],
    proTip: 'Keep your histogram bell-shaped without bunching at the far left or far right edges for optimal dynamic range.',
    workspaceTarget: 'edit',
  },
  {
    title: 'Basic Tone & White Balance',
    category: 'DEVELOP MODULE',
    icon: Sliders,
    accentColor: '#f59e0b',
    badge: 'CORE ADJUSTMENTS',
    description:
      'Master exposure, contrast, dynamic range recovery, and color temperature with professional fidelity.',
    highlights: [
      {
        title: 'Exposure & Dynamic Range',
        desc: 'Calibrated EV exposure slider with separate recovery controls for Highlights, Shadows, Whites, and Blacks.',
      },
      {
        title: '1-Tap Auto Tone',
        desc: 'Statistical percentile analysis automatically detects optimal exposure, contrast, and shadow recovery.',
      },
      {
        title: 'Neutral White Balance Pipette',
        desc: 'Click the WB Picker button and tap any neutral white or gray pixel on your photo to automatically calibrate Kelvin Temperature and Tint.',
      },
      {
        title: 'Vibrance vs. Saturation',
        desc: 'Vibrance smartly boosts muted tones while protecting skin tone saturation from clipping.',
      },
    ],
    proTip: 'Use Shadows (+15 to +30) and Highlights (-20 to -35) to instantly unlock hidden dynamic range.',
    workspaceTarget: 'edit',
  },
  {
    title: 'RGB & Multi-Channel Curves',
    category: 'TONAL CONTROL',
    icon: Activity,
    accentColor: '#38bdf8',
    badge: 'SPLINE PRECISION',
    description:
      'Sculpt light and shadow using mathematical Hermite spline curves for Master RGB, Red, Green, and Blue channels.',
    highlights: [
      {
        title: 'Interactive Point Control',
        desc: 'Click anywhere on the curve grid to drop control points. Drag points to shape smooth tonal transitions.',
      },
      {
        title: 'Classic S-Curve',
        desc: 'Lift the top half (highlights) and dip the bottom half (shadows) for cinematic contrast.',
      },
      {
        title: 'Faded Matte Black Look',
        desc: 'Drag the bottom-left point slightly upward along the Y-axis to give blacks an analog film matte finish.',
      },
      {
        title: 'Color Crossover Grading',
        desc: 'Adjust Red, Green, or Blue channels independently to introduce subtle complementary cross-process tones.',
      },
    ],
    proTip: 'Tap the channel reset button anytime to restore a flat 45-degree diagonal curve.',
    workspaceTarget: 'edit',
  },
  {
    title: '8-Channel HSL & 3-Way Color Wheels',
    category: 'COLOR GRADING',
    icon: Disc3,
    accentColor: '#ec4899',
    badge: 'CINEMATIC GRADE',
    description:
      'Separate colors surgically with the 8-Channel HSL mixer and Hollywood-style 3-Way color wheels.',
    highlights: [
      {
        title: '8 Color Channel Swatches',
        desc: 'Select Red, Orange, Yellow, Green, Cyan, Blue, Purple, or Magenta to shift Hue, Saturation, and Luminance.',
      },
      {
        title: 'Skin Tone Mastery',
        desc: 'Select the Orange swatch and boost Luminance (+10) to make portrait skin look luminous and radiant.',
      },
      {
        title: '3-Way Color Wheels',
        desc: 'Drag the 2D chromatic puck in Shadows (e.g. towards cyan/teal) and Highlights (towards warm amber) for iconic film looks.',
      },
      {
        title: 'Blending & Balance',
        desc: 'Adjust the pivot point and transition sharpness between shadow and highlight color grading.',
      },
    ],
    proTip: 'For the famous Teal & Orange cinematic look, push Shadows into Cyan (hue 195°) and Highlights into Amber (hue 35°).',
    workspaceTarget: 'edit',
  },
  {
    title: 'Precision Masking & Overlays',
    category: 'LOCAL ADJUSTMENTS',
    icon: Crop,
    accentColor: '#f43f5e',
    badge: 'SELECTIVE EDITS',
    description:
      'Isolate areas of your photo to apply selective exposure, temperature, contrast, clarity, and sharpness without modifying the whole image.',
    highlights: [
      {
        title: 'Diverse Mask Types',
        desc: 'Choose from Brush masking, Linear Gradients, Radial Gradients, Subject selection heuristic, Sky selection, Color Range, and Luminance Range.',
      },
      {
        title: 'Ruby-Red Mask Overlay',
        desc: 'Toggle the Overlay button to visualize exactly which pixels are affected by the current mask.',
      },
      {
        title: 'On-Canvas Visual Controls',
        desc: 'Drag linear gradient start/end handles or radial centers directly on the photo.',
      },
      {
        title: 'Invert & Multi-Mask Stack',
        desc: 'Combine multiple independent masks, invert selections, or toggle visibility with one tap.',
      },
    ],
    proTip: 'Use a Linear Gradient from the top down to darken an overexposed sky with -1.5 EV local exposure.',
    workspaceTarget: 'edit',
  },
  {
    title: 'Photoshop-Style Layers',
    category: 'COMPOSITING',
    icon: Layers,
    accentColor: '#a855f7',
    badge: 'GRAPHIC DESIGN',
    description:
      'Add depth and narrative with customizable typography, graphic shapes, and 11 industry-standard blend modes.',
    highlights: [
      {
        title: 'Typography & Graphic Elements',
        desc: 'Add custom text with font sizing, letter colors, stroke outlines, and drop shadows.',
      },
      {
        title: 'Geometric Shapes & Frames',
        desc: 'Place circular vignettes, border frames, and badges with custom fills and borders.',
      },
      {
        title: '11 Blend Modes',
        desc: 'Multiply, Screen, Overlay, Soft Light, Hard Light, Darken, Lighten, Difference, Color Dodge, and Luminosity.',
      },
      {
        title: 'Stack Reordering',
        desc: 'Move layers up or down, duplicate, toggle visibility, and adjust layer opacity.',
      },
    ],
    proTip: 'Set a text or shape layer to Overlay or Soft Light for elegant watermarks or subtle branding.',
    workspaceTarget: 'layers',
  },
  {
    title: '150+ Professional Presets',
    category: 'LOOKS & STYLES',
    icon: Sparkles,
    accentColor: '#38bdf8',
    badge: '100% FREE FOREVER',
    description:
      'Over 150 handcrafted, legally original presets categorized across 16+ photography genres with zero locked filters or subscriptions.',
    highlights: [
      {
        title: 'Comprehensive Genres',
        desc: 'Cinematic Teal & Orange, Dark Cinematic, Moody Portrait, Luxury Editorial, Portra & Tri-X Film Emulations, Golden Hour, Black & White, and more.',
      },
      {
        title: 'Intensity Slider (0–150%)',
        desc: 'Fade any look for subtle elegance or crank it past 100% for bold creative impact.',
      },
      {
        title: '100% Nondestructive',
        desc: 'Applying a preset transfers all settings into your edit sliders, allowing you to fine-tune every parameter afterward.',
      },
      {
        title: 'Import & Export Presets',
        desc: 'Save your own custom looks or share JSON preset files with friends.',
      },
    ],
    proTip: 'Star your favorite presets with the Star icon to filter them instantly in your quick favorites view.',
    workspaceTarget: 'presets',
  },
  {
    title: 'Export Studio & Gestures',
    category: 'DELIVERY & SPEED',
    icon: Download,
    accentColor: '#10b981',
    badge: 'MASTER QUALITY',
    description:
      'Export high-resolution master images to your device with custom quality, aspect ratios, and EXIF metadata preservation.',
    highlights: [
      {
        title: 'Lossless & Modern Formats',
        desc: 'Export JPEG (with 1–100% quality slider), lossless PNG, or modern WebP.',
      },
      {
        title: 'Social Media Templates',
        desc: '1-tap export for Instagram Post (1080x1080), Portrait (1080x1350), Stories/Reels (1080x1920), and 4K UHD (3840px).',
      },
      {
        title: 'Android Share Sheet',
        desc: 'Share directly to Instagram, WhatsApp, or cloud drives using the native device share sheet.',
      },
      {
        title: 'Pinch & Pan Gestures',
        desc: 'Pinch-to-zoom up to 500% on mobile. Double-tap to fit to screen. Hold the canvas or "Hold Original" to preview the unedited photo.',
      },
    ],
    proTip: 'Turn on "Sharpen for Screen" in Export Studio to make your photos look crystal-clear on Retina and OLED displays.',
    workspaceTarget: 'export',
  },
];

export const TutorialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateToWorkspace,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;
  const Icon = step.icon;

  const handleFinish = () => {
    localStorage.setItem('lumora_tutorial_completed', 'true');
    if (step.workspaceTarget && onNavigateToWorkspace) {
      onNavigateToWorkspace(step.workspaceTarget);
    }
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleJumpToWorkspace = () => {
    if (step.workspaceTarget && onNavigateToWorkspace) {
      onNavigateToWorkspace(step.workspaceTarget);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl max-h-[92vh] overflow-hidden rounded-3xl liquid-panel-elevated bg-slate-950/95 border border-white/15 flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${step.accentColor}25`, border: `1px solid ${step.accentColor}50` }}
            >
              <Icon className="w-4 h-4" style={{ color: step.accentColor }} />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase">
                {step.category} • STEP {currentStep + 1} OF {TUTORIAL_STEPS.length}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                {step.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${step.accentColor}20`, color: step.accentColor }}
            >
              {step.badge}
            </span>
            <button
              onClick={() => {
                localStorage.setItem('lumora_tutorial_completed', 'true');
                onClose();
              }}
              className="p-1.5 rounded-xl liquid-button text-zinc-400 hover:text-white"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Main Description */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            {step.description}
          </p>

          {/* Highlight Cards */}
          <div className="space-y-2 pt-1">
            {step.highlights.map((hl, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl liquid-panel border border-white/5 flex items-start gap-3"
              >
                <div
                  className="w-5 h-5 mt-0.5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: `${step.accentColor}30`, color: step.accentColor }}
                >
                  {i + 1}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">{hl.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">{hl.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-400/25 flex items-start gap-2.5 shadow-inner">
            <Zap className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-300 block">
                PRO PHOTOGRAPHY TIP
              </span>
              <p className="text-[11px] text-sky-200 leading-relaxed font-medium">
                {step.proTip}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/80 flex items-center justify-between gap-3">
          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-sky-400'
                    : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl liquid-button text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            {step.workspaceTarget && !isLast && (
              <button
                onClick={handleJumpToWorkspace}
                className="hidden sm:flex px-3 py-2 rounded-xl liquid-button text-xs font-semibold text-sky-300 hover:text-white"
              >
                Try in {step.workspaceTarget.toUpperCase()}
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl liquid-button-accent text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              {isLast ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Start Editing
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
