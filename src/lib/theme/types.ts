// src/lib/theme/types.ts
// Luxtyle 三层架构 · Theme 层 — 类型定义
// 接口在此固定;具体色值见 themes.ts(v0 草稿,待 GPT 审核固化 v1)。

/** 三个品牌 */
export type BrandId = 'ygf' | 'beiyuan' | 'tomo';

/** 主题 id = 三品牌 + portal(三品牌入口主页) */
export type ThemeId = BrandId | 'portal';

/** 表面模式:menu = 浅色重阅读 / hero = 深色重冲击(YGF 双层视觉的两面) */
export type SurfaceMode = 'menu' | 'hero';

/** 动效级别:跟随系统 prefers-reduced-motion */
export type MotionLevel = 'full' | 'reduced';

/** 单个表面的色彩集 */
export interface Surface {
  bg: string;
  surface: string;
  surfaceSoft: string;
  ink: string;
  inkMuted: string;
  border: string;
}

/** 单个主题的完整 token 集 */
export interface BrandTheme {
  id: ThemeId;
  name: string;
  /** 品牌主色,跨表面一致 */
  primary: string;
  primaryDark: string;
  accent: string;
  glow: string;
  /** 双表面:YGF 双层视觉的载体(menu = 浅,hero = 深) */
  menuSurface: Surface;
  heroSurface: Surface;
  gradient: { splash: string; hero: string };
  shadow: { card: string; glow: string };
}
