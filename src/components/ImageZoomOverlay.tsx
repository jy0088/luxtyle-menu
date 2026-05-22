'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 全屏图片放大层 — 北苑 / YGF 数字菜单共用
 * 交互:点详情图打开 → 双指捏合缩放、单指拖动平移、双击放大/复位、未放大时下滑关闭。
 * 退出:✕ / 点黑色背景 / 下滑 / 手机返回键 —— 统一走 history.back() → popstate,
 *      只关闭放大层、不退出详情页;一次返回直接退出。
 * 每次打开复位 1×、锁 body 滚动。
 */

type Props = { src: string; alt: string; onClose: () => void };

type Gesture =
  | { mode: 'pinch'; startDist: number; startScale: number }
  | { mode: 'pan'; baseX: number; baseY: number; sx: number; sy: number }
  | { mode: 'dismiss'; sy: number };

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DISMISS_THRESHOLD = 110;

export default function ImageZoomOverlay({ src, alt, onClose }: Props) {
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });
  const [dismiss, setDismiss] = useState(0);
  const [gesturing, setGesturing] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const tap = useRef<{ time: number; x: number; y: number; moved: boolean } | null>(null);
  const lastTap = useRef(0);
  const closedByPop = useRef(false);

  // ── 历史栈拦截 + 锁背景滚动 ──────────────────────────
  useEffect(() => {
    window.history.pushState({ byImageZoom: true }, '');
    const onPop = () => { closedByPop.current = true; onClose(); };
    window.addEventListener('popstate', onPop);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('popstate', onPop);
      document.body.style.overflow = prevOverflow;
      // 非返回键关闭(如父组件卸载)时,补一次 back() 清掉 pushState,避免历史脏记录
      if (!closedByPop.current) window.history.back();
    };
  }, [onClose]);

  // 所有退出口统一funnel:back() → popstate → onClose
  const requestClose = () => window.history.back();

  // 平移边界:放大后图片不能拖出画面
  const clampPan = (scale: number, x: number, y: number) => {
    const el = imgRef.current;
    if (!el) return { x, y };
    const maxX = (el.clientWidth * (scale - 1)) / 2;
    const maxY = (el.clientHeight * (scale - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const dist = (ts: React.TouchList) =>
    Math.hypot(ts[0].clientX - ts[1].clientX, ts[0].clientY - ts[1].clientY);

  const onTouchStart = (e: React.TouchEvent) => {
    const ts = e.touches;
    setGesturing(true);
    if (ts.length === 2) {
      gesture.current = { mode: 'pinch', startDist: dist(ts), startScale: t.scale };
      tap.current = null;
    } else if (ts.length === 1) {
      if (t.scale > 1.01) {
        gesture.current = { mode: 'pan', baseX: t.x, baseY: t.y, sx: ts[0].clientX, sy: ts[0].clientY };
      } else {
        gesture.current = { mode: 'dismiss', sy: ts[0].clientY };
      }
      tap.current = { time: Date.now(), x: ts[0].clientX, y: ts[0].clientY, moved: false };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const ts = e.touches;
    const g = gesture.current;
    if (!g) return;
    if (tap.current && ts.length === 1) {
      if (Math.hypot(ts[0].clientX - tap.current.x, ts[0].clientY - tap.current.y) > 10) {
        tap.current.moved = true;
      }
    }
    if (g.mode === 'pinch' && ts.length === 2) {
      const scale = Math.max(1, Math.min(MAX_SCALE, g.startScale * (dist(ts) / g.startDist)));
      const { x, y } = clampPan(scale, t.x, t.y);
      setT({ scale, x, y });
    } else if (g.mode === 'pan' && ts.length === 1) {
      const { x, y } = clampPan(
        t.scale,
        g.baseX + (ts[0].clientX - g.sx),
        g.baseY + (ts[0].clientY - g.sy),
      );
      setT(p => ({ ...p, x, y }));
    } else if (g.mode === 'dismiss' && ts.length === 1) {
      const dy = ts[0].clientY - g.sy;
      if (dy > 0) setDismiss(dy);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const g = gesture.current;
    // 双击检测:短促、未移动的单指点击
    if (tap.current && !tap.current.moved && Date.now() - tap.current.time < 250) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setT(p => (p.scale > 1.01 ? { scale: 1, x: 0, y: 0 } : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 }));
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
    if (g?.mode === 'dismiss') {
      if (dismiss > DISMISS_THRESHOLD) { requestClose(); return; }
      setDismiss(0);
    }
    if (g?.mode === 'pinch' && t.scale < 1.08) {
      setT({ scale: 1, x: 0, y: 0 });
    }
    if (e.touches.length === 0) {
      gesture.current = null;
      tap.current = null;
      setGesturing(false);
    }
  };

  const backdropOpacity = Math.max(0.45, 0.92 - dismiss / 600);

  return (
    <div
      onClick={requestClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: `rgba(0,0,0,${backdropOpacity})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', touchAction: 'none',
        WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
      }}
    >
      {/* 顶部操作提示 */}
      <div style={{
        position: 'absolute', top: 'calc(12px + env(safe-area-inset-top))', left: 0, right: 0,
        textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.55)',
        pointerEvents: 'none',
      }}>
        双指缩放 · 双击放大 · 下滑或 ✕ 关闭
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={(e) => { e.stopPropagation(); requestClose(); }}
        aria-label="Close"
        style={{
          position: 'absolute', top: 'calc(10px + env(safe-area-inset-top))', right: 14,
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', fontSize: 18, cursor: 'pointer', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>

      {/* 图片 */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          maxWidth: '100vw', maxHeight: '100dvh', objectFit: 'contain', display: 'block',
          transform: `translate(${t.x}px, ${t.y + dismiss}px) scale(${t.scale})`,
          transition: gesturing ? 'none' : 'transform 0.25s ease',
          willChange: 'transform',
        }}
      />

      {/* 免责声明 — 中英双语,不拦截手势 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 20px calc(14px + env(safe-area-inset-bottom))',
        textAlign: 'center', pointerEvents: 'none',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
      }}>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.88)' }}>
          图片仅供参考,请以实物为准
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
          Images are for reference only and may differ from the actual product.
        </div>
      </div>
    </div>
  );
}
