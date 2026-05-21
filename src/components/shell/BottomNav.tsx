"use client";
// src/components/shell/BottomNav.tsx
// Luxtyle 三层架构 · Shell 层 — 底部固定导航栏
// 四格:首页 / 菜单 / 优惠 / 分享。玻璃态,token 驱动,含底部安全区。
// 优惠页(后续阶段)与三品牌共用分享页尚未建 —— 暂以「即将上线」提示占位。
// 仅在 AppShell 内(即菜单页)渲染;splash / onboarding 阶段天然不显示。

import { useState, type SVGProps } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type TabId = 'home' | 'menu' | 'promo' | 'share';

const iconBase: SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function TabIcon({ id }: { id: TabId }) {
  if (id === 'home')
    return (
      <svg {...iconBase}>
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6 10.5V20h12v-9.5" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  if (id === 'menu')
    return (
      <svg {...iconBase}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    );
  if (id === 'promo')
    return (
      <svg {...iconBase}>
        <path d="M3.5 12.5V5.5a2 2 0 0 1 2-2h7l8.5 8.5a2 2 0 0 1 0 2.8l-5.7 5.7a2 2 0 0 1-2.8 0z" />
        <circle cx="8" cy="8" r="1.6" />
      </svg>
    );
  return (
    <svg {...iconBase}>
      <circle cx="6.5" cy="12" r="2.6" />
      <circle cx="17.5" cy="6" r="2.6" />
      <circle cx="17.5" cy="18" r="2.6" />
      <path d="M9 10.7l6.2-3.4M9 13.3l6.2 3.4" />
    </svg>
  );
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: '首页' },
  { id: 'menu', label: '菜单' },
  { id: 'promo', label: '优惠' },
  { id: 'share', label: '分享' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  // BottomNav 仅在菜单页内渲染,故当前高亮恒为「菜单」
  const activeId: TabId = pathname === '/' ? 'home' : 'menu';

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function handleTab(id: TabId) {
    if (id === 'home') {
      router.push('/');
    } else if (id === 'menu') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'promo') {
      // 优惠页为后续阶段交付
      flash('优惠页即将上线 · Coming soon');
    } else if (id === 'share') {
      // YGF 已有分享页;BY / Tomo 的共用分享页待建
      if (pathname.startsWith('/menu/ygf')) router.push('/menu/ygf/share');
      else flash('分享页即将上线 · Coming soon');
    }
  }

  return (
    <>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(76px + env(safe-area-inset-bottom))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 45,
            background: 'rgba(20,20,20,0.92)',
            color: '#fff',
            fontSize: 12.5,
            fontWeight: 600,
            padding: '9px 18px',
            borderRadius: 999,
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'color-mix(in srgb, var(--lx-hero-surface) 92%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--lx-hero-border)',
        }}
      >
        <div style={{ display: 'flex', maxWidth: 640, margin: '0 auto' }}>
          {TABS.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: '8px 4px 7px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'var(--lx-accent)' : 'var(--lx-hero-ink-muted)',
                  transition: 'color 0.15s',
                }}
              >
                <TabIcon id={tab.id} />
                <span style={{ fontSize: 10.5, fontWeight: isActive ? 800 : 600, letterSpacing: 0.3 }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
