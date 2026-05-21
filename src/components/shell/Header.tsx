"use client";
// src/components/shell/Header.tsx
// Luxtyle 三层架构 · Shell 层 — 统一 Header
// 吸顶 + 滚动感知(玻璃态,滚动时加阴影)+ slot 化(action 操作位 / nav 菜单导航槽 / 返回键)。
// 品牌信息从 useTheme() 取;颜色全走 --lx-* token。

import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface BrandInfo {
  logo: string;
  primary: string;   // 主显示名(英文为主)
  secondary: string; // 副行(中文 / 描述)
}

// 各品牌 Header 显示信息。primary 主、secondary 副。logo 路径在接入对应品牌时补全。
const BRAND_INFO: Record<string, BrandInfo> = {
  beiyuan: { logo: '/beiyuan-logo.png', primary: 'Bei Yuan Tea & Boba', secondary: '北苑南家' },
  ygf: { logo: '', primary: 'YGF Malatang', secondary: '杨国福麻辣烫' },
  tomo: { logo: '', primary: 'tomo', secondary: 'Artisan Gelato' },
  portal: { logo: '', primary: 'Luxtyle', secondary: '' },
};

export default function Header({
  action,
  nav,
  showBack = false,
  onBack,
}: {
  /** Header 右侧操作位 */
  action?: ReactNode;
  /** Header 下方的品牌菜单导航(各品牌自管理) */
  nav?: ReactNode;
  /** 子页显示返回键 */
  showBack?: boolean;
  onBack?: () => void;
}) {
  const { themeId } = useTheme();
  const brand = BRAND_INFO[themeId] ?? BRAND_INFO.portal;

  // 滚动感知:页面下滚时给 Header 加阴影,把它从内容上"抬起来"
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        paddingTop: 'env(safe-area-inset-top)',
        background: 'color-mix(in srgb, var(--lx-hero-surface) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--lx-hero-border)',
        boxShadow: scrolled ? 'var(--lx-shadow-card)' : 'none',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* 品牌行 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '12px 16px 10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="返回"
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid var(--lx-hero-border)',
                background: 'transparent',
                color: 'var(--lx-hero-ink)',
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              ←
            </button>
          )}
          {brand.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt=""
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid var(--lx-accent)',
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                lineHeight: 1.15,
                color: 'var(--lx-accent)',
              }}
            >
              {brand.primary}
            </div>
            {brand.secondary && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  marginTop: 1,
                  color: 'var(--lx-hero-ink-muted)',
                }}
              >
                {brand.secondary}
              </div>
            )}
          </div>
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>

      {/* 品牌菜单导航槽 —— 各品牌 Body 层注入(BY 是分类 pills,Tomo 无) */}
      {nav}
    </header>
  );
}
