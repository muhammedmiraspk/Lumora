import { LiquidTheme, LiquidThemeId } from '../types/editor';

export const LIQUID_THEMES: Record<LiquidThemeId, LiquidTheme> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Black',
    subtitle: 'Deep Obsidian & Cyan Electric Glow',
    bgBase: '#05070a',
    panelBg: 'rgba(12, 17, 26, 0.75)',
    panelBorder: 'rgba(56, 189, 248, 0.16)',
    panelGlow: 'rgba(14, 165, 233, 0.22)',
    accent: '#0284c7', // Sky cyan
    accentHover: '#38bdf8',
    accentText: '#ffffff',
    badgeBg: 'rgba(14, 165, 233, 0.18)',
    ambientGradient: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.15), transparent 70%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(99, 102, 241, 0.12), transparent 70%)',
  },
  burgundy: {
    id: 'burgundy',
    name: 'Burgundy Glass',
    subtitle: 'Luxurious Wine, Dark Cherry & Champagne',
    bgBase: '#120409',
    panelBg: 'rgba(32, 9, 17, 0.78)',
    panelBorder: 'rgba(244, 63, 94, 0.22)',
    panelGlow: 'rgba(225, 29, 72, 0.25)',
    accent: '#e11d48', // Rose crimson
    accentHover: '#fb7185',
    accentText: '#ffffff',
    badgeBg: 'rgba(225, 29, 72, 0.2)',
    ambientGradient: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(225, 29, 72, 0.18), transparent 70%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(245, 158, 11, 0.12), transparent 70%)',
  },
  crystal: {
    id: 'crystal',
    name: 'Pure Crystal',
    subtitle: 'Ultra-Clear Refraction & Frosted Silver',
    bgBase: '#0c0f14',
    panelBg: 'rgba(24, 30, 42, 0.65)',
    panelBorder: 'rgba(255, 255, 255, 0.24)',
    panelGlow: 'rgba(255, 255, 255, 0.18)',
    accent: '#94a3b8', // Silver chrome
    accentHover: '#e2e8f0',
    accentText: '#0f172a',
    badgeBg: 'rgba(255, 255, 255, 0.14)',
    ambientGradient: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 255, 255, 0.12), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(203, 213, 225, 0.08), transparent 70%)',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Midnight Sapphire',
    subtitle: 'Deep Navy & Cinematic Icy Blue',
    bgBase: '#040b17',
    panelBg: 'rgba(10, 22, 44, 0.78)',
    panelBorder: 'rgba(96, 165, 250, 0.22)',
    panelGlow: 'rgba(59, 130, 246, 0.26)',
    accent: '#2563eb', // Sapphire Blue
    accentHover: '#60a5fa',
    accentText: '#ffffff',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    ambientGradient: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.20), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(37, 99, 235, 0.15), transparent 70%)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Aurora',
    subtitle: 'Atmospheric Forest Teal & Mint Radiance',
    bgBase: '#03120d',
    panelBg: 'rgba(8, 30, 22, 0.78)',
    panelBorder: 'rgba(52, 211, 153, 0.22)',
    panelGlow: 'rgba(16, 185, 129, 0.26)',
    accent: '#059669', // Emerald Teal
    accentHover: '#34d399',
    accentText: '#ffffff',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    ambientGradient: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.22), transparent 70%), radial-gradient(ellipse 60% 40% at 20% 90%, rgba(20, 184, 166, 0.16), transparent 70%)',
  },
};
