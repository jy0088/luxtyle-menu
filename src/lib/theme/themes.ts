// src/lib/theme/themes.ts
// Luxtyle Theme Token — v1(GPT 审定)
// 品牌气质定盘:
//   YGF      = 火焰 / 熬汤 / 沙金(双层视觉:暖白菜单 + 深色火焰 Hero)
//   Bei Yuan = 东方茶空间 / 玉 / 温润 / 夜茶
//   Tomo     = 冰晶 / 极光 / 半透明 / 冷凝实验室
// 规则:只改 token 值,不改结构。types.ts / ThemeProvider 接口保持不变。

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

  // ── YGF Malatang:火焰 / 熬汤 / 沙金(双层视觉) ──
  ygf: {
    id: 'ygf',
    name: 'YGF Malatang',
    primary: '#C8912A', // 香沙金(签名色)
    primaryDark: '#B91C1C', // 朱红
    accent: '#FF5A1F', // 火焰橙
    glow: '#FF7A00',
    menuSurface: {
      // 暖白 —— 主菜单 Body,重阅读
      bg: '#FDFAF5',
      surface: '#FFFFFF',
      surfaceSoft: '#FFF4E6',
      ink: '#1C1410',
      inkMuted: '#6B5B4E',
      border: '#E8D9C4',
    },
    heroSurface: {
      // 深色火焰 —— Splash / Hero / 强销售(GPT v1 微调)
      bg: '#1A0E08',
      surface: '#33180D',
      surfaceSoft: '#47200F',
      ink: '#FFF1DD',
      inkMuted: '#C8A878',
      border: 'rgba(255,255,255,0.08)',
    },
    gradient: {
      splash: 'linear-gradient(170deg, #1A0800 0%, #3D1200 40%, #6B2500 70%, #C8912A 100%)',
      hero: 'linear-gradient(160deg, #140A05 0%, #4A1808 45%, #8A3A0A 100%)',
    },
    shadow: {
      card: '0 6px 24px rgba(0,0,0,0.10)',
      glow: '0 0 32px rgba(255,122,0,0.35)',
    },
  },

  // ── Bei Yuan:东方茶空间 / 玉 / 温润 / 夜茶 ──
  beiyuan: {
    id: 'beiyuan',
    name: 'Bei Yuan Tea & Boba',
    primary: '#1F7A4D', // 玉绿
    primaryDark: '#0E3D2A', // 深玉绿
    accent: '#7BAE8D', // 温润玉色(GPT v1:替换原金色)
    glow: 'rgba(123,174,141,0.28)', // 温润柔光(GPT v1:替换原 neon 绿)
    menuSurface: {
      // 浅色阅读面 —— GPT v1 本轮未单独定值,沿用现值,可后续微调
      bg: '#FBFAF5',
      surface: '#FFFFFF',
      surfaceSoft: '#F3F6F1',
      ink: '#1C2A1F',
      inkMuted: '#5F6B5E',
      border: '#E5E7E0',
    },
    heroSurface: {
      // 夜茶深绿(GPT v1)
      bg: '#10261D',
      surface: '#183428',
      surfaceSoft: '#214536',
      ink: '#EEF6F1',
      inkMuted: '#A8BCAF',
      border: 'rgba(255,255,255,0.10)',
    },
    gradient: {
      splash: 'linear-gradient(170deg, #0D1F18 0%, #183428 45%, #2B5A46 100%)',
      hero: 'linear-gradient(170deg, #0D1F18 0%, #183428 45%, #2B5A46 100%)',
    },
    shadow: {
      card: '0 6px 24px rgba(0,0,0,0.08)',
      glow: '0 0 32px rgba(123,174,141,0.28)', // 同步为温润柔光
    },
  },

  // ── Tomo Gelato:冰晶 / 极光 / 半透明 / 冷凝实验室 ──
  tomo: {
    id: 'tomo',
    name: 'Tomo Gelato',
    primary: '#6FD6FF', // 冰晶蓝(GPT v1)
    primaryDark: '#2B6F8E',
    accent: '#B8F0FF', // 极光浅蓝
    glow: 'rgba(111,214,255,0.45)',
    menuSurface: {
      // 浅色阅读面 —— GPT v1 本轮未单独定值,沿用现值,可后续微调
      bg: '#FFFBF7',
      surface: '#FFFFFF',
      surfaceSoft: '#F4F8FA',
      ink: '#1A1A2E',
      inkMuted: '#888888',
      border: '#ECECEC',
    },
    heroSurface: {
      // 冷凝实验室深蓝(GPT v1)
      bg: '#081A24',
      surface: '#102938',
      surfaceSoft: '#16384C',
      ink: '#F0FBFF',
      inkMuted: '#A7D3E3',
      border: 'rgba(255,255,255,0.10)',
    },
    gradient: {
      splash: 'linear-gradient(170deg, #081A24 0%, #12384D 50%, #6FD6FF 100%)',
      hero: 'linear-gradient(170deg, #081A24 0%, #12384D 50%, #6FD6FF 100%)',
    },
    shadow: {
      card: '0 6px 24px rgba(0,0,0,0.06)',
      glow: '0 0 32px rgba(111,214,255,0.45)', // 同步为冰晶蓝
    },
  },
};

// Tomo 四口味色 —— 待确认实际口味后,以独立 export 加入(不改 BrandTheme 结构)。
// GPT 草案:vanilla / strawberry / matcha / mango;与当前菜单口味不一致,待 Kevin 确认。

/** 根据当前路由解析主题 id */
export function resolveThemeId(pathname: string | null): ThemeId {
  if (!pathname) return 'portal';
  if (pathname.startsWith('/menu/ygf')) return 'ygf';
  if (pathname.startsWith('/menu/beiyuan')) return 'beiyuan';
  if (pathname.startsWith('/menu/tomo')) return 'tomo';
  return 'portal';
}
