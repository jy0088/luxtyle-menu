"use client";
// src/components/shell/AppShell.tsx
// Luxtyle 三层架构 · Shell 层 — AppShell 容器
// 包在每个品牌「菜单正文」外层:统一 Header + 内容区 + (BottomNav 槽位,下一块填)。
// 不包 splash / onboarding —— 那些是无壳的纯入口层。
// 背景 / 文字走 --lx-menu-* token。

import { type ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell({
  children,
  action,
  nav,
  showBack,
  onBack,
}: {
  children: ReactNode;
  /** Header 右侧操作位 */
  action?: ReactNode;
  /** Header 下方的品牌菜单导航(各品牌自管理) */
  nav?: ReactNode;
  /** 子页显示返回键 */
  showBack?: boolean;
  onBack?: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--lx-menu-bg)',
        color: 'var(--lx-menu-ink)',
      }}
    >
      <Header action={action} nav={nav} showBack={showBack} onBack={onBack} />
      <main style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>{children}</main>
      <BottomNav />
    </div>
  );
}
