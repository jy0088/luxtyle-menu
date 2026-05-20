"use client";
// src/lib/theme/ThemeProvider.tsx
// Luxtyle 三层架构 · Shell 层 — Theme 注入接口
// 职责:按路由解析品牌主题 → 把 token 注入为 CSS 变量(--lx-*),
//      并通过 useTheme() 暴露当前主题与动效级别。
// 注意:本文件是「接口」。色值在 themes.ts(v0 草稿),GPT 审核后只改值、不改此处。

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { usePathname } from 'next/navigation';
import type { BrandTheme, ThemeId, MotionLevel } from './types';
import { themes, resolveThemeId } from './themes';

interface ThemeContextValue {
  themeId: ThemeId;
  theme: BrandTheme;
  motionLevel: MotionLevel;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** 把一个主题摊平成 CSS 变量(--lx-*) */
function toCssVars(t: BrandTheme): Record<string, string> {
  return {
    '--lx-primary': t.primary,
    '--lx-primary-dark': t.primaryDark,
    '--lx-accent': t.accent,
    '--lx-glow': t.glow,
    // menu surface(浅色,重阅读)
    '--lx-menu-bg': t.menuSurface.bg,
    '--lx-menu-surface': t.menuSurface.surface,
    '--lx-menu-surface-soft': t.menuSurface.surfaceSoft,
    '--lx-menu-ink': t.menuSurface.ink,
    '--lx-menu-ink-muted': t.menuSurface.inkMuted,
    '--lx-menu-border': t.menuSurface.border,
    // hero surface(深色,重冲击)
    '--lx-hero-bg': t.heroSurface.bg,
    '--lx-hero-surface': t.heroSurface.surface,
    '--lx-hero-surface-soft': t.heroSurface.surfaceSoft,
    '--lx-hero-ink': t.heroSurface.ink,
    '--lx-hero-ink-muted': t.heroSurface.inkMuted,
    '--lx-hero-border': t.heroSurface.border,
    // gradient + shadow
    '--lx-gradient-splash': t.gradient.splash,
    '--lx-gradient-hero': t.gradient.hero,
    '--lx-shadow-card': t.shadow.card,
    '--lx-shadow-glow': t.shadow.glow,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const themeId: ThemeId = resolveThemeId(pathname);
  const theme = themes[themeId];

  // 动效级别:跟随系统 prefers-reduced-motion(供 Transition 层后续接入)
  const [motionLevel, setMotionLevel] = useState<MotionLevel>('full');
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setMotionLevel(mq.matches ? 'reduced' : 'full');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, theme, motionLevel }),
    [themeId, theme, motionLevel],
  );

  // display:contents —— 包裹层不产生盒子,零布局影响,CSS 变量仍向下继承
  const style = useMemo<CSSProperties>(
    () => ({ display: 'contents', ...toCssVars(theme) } as CSSProperties),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={themeId} style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** 读取当前主题。必须在 <ThemeProvider> 内调用。 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() 必须在 <ThemeProvider> 内使用');
  }
  return ctx;
}
