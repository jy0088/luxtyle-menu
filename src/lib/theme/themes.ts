// src/lib/theme/themes.ts
// Luxtyle Theme Token — v0 草稿
// ⚠️ 本文件的色值为 v0 草稿(Claude 按现有代码 + v2 决策给出)。
// ⚠️ 待 GPT 审核品牌气质后固化为 v1。结构(types.ts)已稳定 —— 改值不改结构。
// 标 ⚠️ 的字段为草稿/待定,需 GPT 重点审。

import type { BrandTheme, ThemeId } from './types';

export const themes: Record<ThemeId, BrandTheme> = {
  // ── Portal:三品牌入口主页(深色中性) ──
  portal: {
    id: 'portal',
    name: 'Luxtyle',
    primary: '#E8E2D5',
    primaryDark: '#A89880',
    accent: '#C8912A',
    glow: '#C8912A',
    menuSurface: {
      bg: '#0A0A0A',
      surface: '#141414',
      surfaceSoft: '#1E1E1E',
      ink: '#F5F2EC',
      inkMuted: '#8A8A8A',
      border: 'rgba(255,255,255,0.10)',
    },
    heroSurface: {
      bg: '#0A0A0A',
      surface: '#141414',
      surfaceSoft: '#1E1E1E',
      ink: '#F5F2EC',
      inkMuted: '#8A8A8A',
      border: 'rgba(255,255,255,0.10)',
    },
    gradient: {
      splash: 'radial-gradient(circle at 50% 30%, #1E1E1E 0%, #0A0A0A 70%)',
      hero: 'radial-gradient(circle at 50% 30%, #1E1E1E 0%, #0A0A0A 70%)',
    },
    shadow: {
      card: '0 8px 32px rgba(0,0,0,0.40)',
      glow: '0 0 40px rgba(200,145,42,0.25)',
    },
  },

  // ── YGF Malatang:火焰橙红 + 暖白沙金(双层视觉) ──
  ygf: {
    id: 'ygf',
    name: 'YGF Malatang',
    primary: '#C8912A', // 香沙金(签名色)
    primaryDark: '#B91C1C', // 朱红
    accent: '#FF5A1F', // 火焰橙
    glow: '#FF7A00',
    menuSurface: {
      // 暖白 —— 主菜单 Body,重阅读(沿用现有代码)
      bg: '#FDFAF5',
      surface: '#FFFFFF',
      surfaceSoft: '#FFF4E6',
      ink: '#1C1410',
      inkMuted: '#6B5B4E',
      border: '#E8D9C4',
    },
    heroSurface: {
      // 深色火焰 —— Splash / Hero / 强销售  ⚠️ surface 以下为草稿
      bg: '#1A0E08',
      surface: '#2A170C',
      surfaceSoft: '#3A1F0E',
      ink: '#FFF1DD',
      inkMuted: '#C8A878',
      border: 'rgba(255,255,255,0.08)',
    },
    gradient: {
      splash: 'linear-gradient(170deg, #1A0800 0%, #3D1200 40%, #6B2500 70%, #C8912A 100%)',
      hero: 'linear-gradient(160deg, #1A0E08 0%, #6B2500 100%)', // ⚠️ 草稿
    },
    shadow: {
      card: '0 6px 24px rgba(0,0,0,0.10)',
      glow: '0 0 32px rgba(255,122,0,0.35)',
    },
  },

  // ── Bei Yuan:茶 · 玉绿  ⚠️ accent / heroSurface / 部分浅色值为草稿 ──
  beiyuan: {
    id: 'beiyuan',
    name: 'Bei Yuan Tea & Boba',
    primary: '#1F7A4D', // 玉绿
    primaryDark: '#0E3D2A', // ⚠️ 深玉绿,草稿
    accent: '#C8912A', // ⚠️ 草稿(待 GPT 定)
    glow: '#4ADE80',
    menuSurface: {
      // ⚠️ 多为草稿
      bg: '#FBFAF5',
      surface: '#FFFFFF',
      surfaceSoft: '#F3F6F1',
      ink: '#1C2A1F',
      inkMuted: '#5F6B5E',
      border: '#E5E7E0',
    },
    heroSurface: {
      // ⚠️ 全部待 GPT 定方向
      bg: '#0E3D2A',
      surface: '#15512F',
      surfaceSoft: '#1C633B',
      ink: '#EAF5EE',
      inkMuted: '#9DBCA8',
      border: 'rgba(255,255,255,0.10)',
    },
    gradient: {
      // ⚠️ 草稿
      splash: 'linear-gradient(170deg, #0E3D2A 0%, #1F7A4D 100%)',
      hero: 'linear-gradient(160deg, #0E3D2A 0%, #1F7A4D 100%)',
    },
    shadow: {
      card: '0 6px 24px rgba(0,0,0,0.08)',
      glow: '0 0 32px rgba(74,222,128,0.30)',
    },
  },

  // ── Tomo Gelato:冰 · 蓝白  ⚠️ 大量草稿值,待 GPT 定 ──
  tomo: {
    id: 'tomo',
    name: 'Tomo Gelato',
    primary: '#3FA9D6', // ⚠️ 冰蓝,草稿
    primaryDark: '#2A7BA0', // ⚠️ 草稿
    accent: '#C2773A', // ⚠️ 草稿(沿用现有 logo 暖棕)
    glow: '#9BDBF2', // ⚠️ 草稿
    menuSurface: {
      // Mochi 白 —— 部分沿用现有代码
      bg: '#FFFBF7',
      surface: '#FFFFFF',
      surfaceSoft: '#F4F8FA',
      ink: '#1A1A2E',
      inkMuted: '#888888',
      border: '#ECECEC',
    },
    heroSurface: {
      // ⚠️ 全部待 GPT 定方向
      bg: '#0E2A38',
      surface: '#143A4D',
      surfaceSoft: '#1C4C63',
      ink: '#EAF6FB',
      inkMuted: '#9CC2D2',
      border: 'rgba(255,255,255,0.10)',
    },
    gradient: {
      // ⚠️ 草稿
      splash: 'linear-gradient(170deg, #0E2A38 0%, #3FA9D6 100%)',
      hero: 'linear-gradient(160deg, #0E2A38 0%, #3FA9D6 100%)',
    },
    shadow: {
      card: '0 6px 24px rgba(0,0,0,0.06)',
      glow: '0 0 32px rgba(155,219,242,0.40)',
    },
  },
};

/** 根据当前路由解析主题 id */
export function resolveThemeId(pathname: string | null): ThemeId {
  if (!pathname) return 'portal';
  if (pathname.startsWith('/menu/ygf')) return 'ygf';
  if (pathname.startsWith('/menu/beiyuan')) return 'beiyuan';
  if (pathname.startsWith('/menu/tomo')) return 'tomo';
  return 'portal';
}
