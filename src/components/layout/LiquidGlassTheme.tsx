import React, { useEffect } from 'react';
import { LiquidThemeId } from '../../types/editor';
import { LIQUID_THEMES } from '../../constants/themes';

interface Props {
  currentTheme: LiquidThemeId;
  accentIntensity: number; // 50 to 150
}

export const LiquidGlassTheme: React.FC<Props> = ({ currentTheme, accentIntensity }) => {
  const theme = LIQUID_THEMES[currentTheme] || LIQUID_THEMES.obsidian;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', theme.bgBase);
    root.style.setProperty('--theme-panel', theme.panelBg);
    root.style.setProperty('--theme-border', theme.panelBorder);
    root.style.setProperty('--theme-glow', theme.panelGlow);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-accent-hover', theme.accentHover);
    root.style.setProperty('--theme-accent-text', theme.accentText);
  }, [theme, accentIntensity]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-all duration-700 opacity-90"
      style={{
        background: theme.ambientGradient,
      }}
    />
  );
};
