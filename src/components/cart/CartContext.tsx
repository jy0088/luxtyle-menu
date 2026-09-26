'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';

/**
 * 北苑数字菜单 — 购物车 /「我的清单」
 * 仅前端记录顾客选择,不发单、不付款。供顾客整理点单、出示给服务员。
 * 状态存 localStorage,刷新/误关不丢。
 */

export type SweetLevel = '原糖' | '75%' | '50%' | '25%' | '无糖';
export type IceLevel = '正常冰' | '少冰' | '去冰';
export type TeaBaseLabel = '红茶' | '绿茶' | '乌龙';
export type SizeLabel = 'S' | 'L' | '单一';

export const SWEET_LEVELS: SweetLevel[] = ['原糖', '75%', '50%', '25%', '无糖'];
export const ICE_LEVELS: IceLevel[] = ['正常冰', '少冰', '去冰'];
export const DEFAULT_SWEET: SweetLevel = '原糖';
export const DEFAULT_ICE: IceLevel = '正常冰';

/** qty 省略按 1 计 —— 兼容本次改造前存进 localStorage 的旧清单 */
export type CartTopping = { id: string; nameCn: string; nameEn: string; price: number; qty?: number };
export type CartAddOn = { nameCn: string; nameEn: string; price: number; qty?: number };

/** 行类型:饮品 / 套餐 / 普通餐食小食 */
export type CartLine = {
  uid: string;            // 唯一行 ID
  kind: 'drink' | 'mealset' | 'plain';
  itemId: string;
  nameCn: string;
  nameEn: string;
  basePrice: number;      // 菜品基础价
  qty: number;
  // drink / mealset 专用
  size?: SizeLabel;
  sizeUpcharge?: number;  // L 杯加价
  teaBase?: TeaBaseLabel;
  teaBaseUpcharge?: number; // 乌龙加价
  sweet?: SweetLevel;
  ice?: IceLevel | '固定' | null;
  toppings?: CartTopping[];
  // mealset 专用
  freeDrink?: { nameCn: string; nameEn: string; sweet: SweetLevel; price?: number } | null;
  addOns?: CartAddOn[];
  // drink 专用:奶基底(臻选原叶茶)
  milkBase?: { label: string; labelEn: string; price: number } | null;
  // plain 专用:形态二选一(整根/切片),不影响价格
  variant?: { label: string; labelEn: string } | null;
};

/** 单行单价 = 基础 + 杯型 + 茶底 + 加料合计 + 套餐加购合计 */
export function lineUnitPrice(l: CartLine): number {
  let p = l.basePrice;
  p += l.sizeUpcharge ?? 0;
  p += l.teaBaseUpcharge ?? 0;
  if (l.toppings) p += l.toppings.reduce((s, t) => s + t.price * (t.qty ?? 1), 0);
  if (l.addOns) p += l.addOns.reduce((s, a) => s + a.price * (a.qty ?? 1), 0);
  if (l.milkBase) p += l.milkBase.price;
  if (l.freeDrink) p += l.freeDrink.price ?? 0;
  return p;
}
export function lineSubtotal(l: CartLine): number {
  return lineUnitPrice(l) * l.qty;
}

type CartCtx = {
  lines: CartLine[];
  count: number;          // 总杯/份数
  total: number;          // 合计(未税)
  bump: number;           // 每次加入 +1 —— 供购物车按钮做一次弹跳
  addLine: (l: Omit<CartLine, 'uid'>) => void;
  setQty: (uid: string, qty: number) => void;
  removeLine: (uid: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = 'by-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  // 懒初始化:首帧服务端为空,客户端挂载后从 localStorage 水合
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  // 加入清单的确认反馈 —— 顾客点完要知道"确实加进去了"
  const [toast, setToast] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 客户端水合(只跑一次):用 requestAnimationFrame 把 setState 移出 effect 同步段
  useEffect(() => {
    let raw: string | null = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch { /* ignore */ }
    const id = requestAnimationFrame(() => {
      if (raw) {
        try { setLines(JSON.parse(raw)); } catch { /* corrupt cache */ }
      }
      setLoaded(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // 保存(载入完成后才写,避免覆盖)
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* quota */ }
  }, [lines, loaded]);

  const addLine = useCallback((l: Omit<CartLine, 'uid'>) => {
    setToast(`${l.nameCn} ×${l.qty}`);
    setBump(b => b + 1);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
    setLines(prev => {
      // 同品同定制 → 数量合并
      const sig = (x: Omit<CartLine, 'uid' | 'qty'>) => JSON.stringify({ ...x, qty: undefined });
      const idx = prev.findIndex(p => sig(p) === sig(l));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + l.qty };
        return next;
      }
      return [...prev, { ...l, uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }];
    });
  }, []);

  const setQty = useCallback((uid: string, qty: number) => {
    setLines(prev =>
      qty <= 0 ? prev.filter(p => p.uid !== uid)
               : prev.map(p => (p.uid === uid ? { ...p, qty } : p)),
    );
  }, []);

  const removeLine = useCallback((uid: string) => {
    setLines(prev => prev.filter(p => p.uid !== uid));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + lineSubtotal(l), 0);

  return (
    <Ctx.Provider value={{ lines, count, total, bump, addLine, setQty, removeLine, clear }}>
      <style>{CART_UI_CSS}</style>
      {children}
      {toast && (
        <>
          <div className="cart-toast" role="status" aria-live="polite">
            <span className="cart-toast-check">✓</span>
            <span>已加入 Added<b>{toast}</b></span>
          </div>
        </>
      )}
    </Ctx.Provider>
  );
}

/**
 * 加料 / 加点的共用外观 —— 托盘(Card Tray)+ 展开收起(Expand)+ 份数步进器。
 * 放在 Provider 里:两个定制面板都在 CartProvider 内,只注入一次。
 */
const CART_UI_CSS = `
/* 托盘:比卡片更"凹"一层,主组件位置不动,内容向下展开 */
.lx-tray{
  border-radius:16px; background:#EFEBE4;
  border:1px solid #E2DCD2; overflow:hidden;
  box-shadow:inset 0 1px 3px rgba(60,50,40,.07);
}
.lx-tray-head{
  width:100%; display:flex; align-items:center; gap:10px;
  padding:13px 15px; background:none; border:none; cursor:pointer;
  text-align:left; font:inherit; color:inherit;
}
.lx-tray-title{ font-size:12.5px; font-weight:800; color:#4A4238; letter-spacing:.3px }
.lx-tray-sum{ font-size:11.5px; font-weight:700; color:#7F7466; margin-top:2px }
.lx-tray-sum b{ color:#0D4A2E }
.lx-chev{
  margin-left:auto; flex-shrink:0; width:22px; height:22px;
  display:grid; place-items:center; color:#7F7466; font-size:12px;
  transition:transform .26s cubic-bezier(.22,1,.36,1);
}
.lx-tray[data-open="1"] .lx-chev{ transform:rotate(180deg) }
/* 高度跟着内容走 */
.lx-tray-body{
  display:grid; grid-template-rows:0fr;
  transition:grid-template-rows .28s cubic-bezier(.22,1,.36,1);
}
.lx-tray[data-open="1"] .lx-tray-body{ grid-template-rows:1fr }
.lx-tray-body > div{ overflow:hidden }
.lx-tray-inner{
  padding:2px 13px 14px;
  opacity:0; transition:opacity .2s ease .06s;
}
.lx-tray[data-open="1"] .lx-tray-inner{ opacity:1 }

/* 份数步进器 —— 加两份米饭、两份波霸 */
.lx-step{ display:flex; align-items:center; gap:2px; flex-shrink:0 }
.lx-step button{
  width:30px; height:30px; border-radius:9px; border:none; cursor:pointer;
  background:#0D4A2E; color:#fff; font-size:17px; line-height:1;
  display:grid; place-items:center; padding:0;
}
.lx-step span{
  min-width:24px; text-align:center;
  font-size:14px; font-weight:800; color:#1a1a1a;
}
.lx-add{
  width:30px; height:30px; border-radius:9px; flex-shrink:0;
  border:1.5px solid #CFC7BA; background:#fff; color:#4A4238;
  font-size:18px; line-height:1; cursor:pointer; display:grid; place-items:center; padding:0;
}
@media (prefers-reduced-motion: reduce){
  .lx-chev, .lx-tray-body, .lx-tray-inner{ transition:none }
}

@keyframes cart-toast-in {
  0%   { opacity:0; transform:translate(-50%, 14px) scale(.94) }
  100% { opacity:1; transform:translate(-50%, 0) scale(1) }
}
.cart-toast{
  position:fixed; left:50%; z-index:80;
  bottom:calc(140px + env(safe-area-inset-bottom));
  display:flex; align-items:center; gap:9px;
  padding:11px 18px 11px 14px; border-radius:999px;
  background:#0D4A2E; color:#fff;
  font-size:13.5px; font-weight:700; white-space:nowrap;
  box-shadow:0 8px 26px rgba(13,74,46,.38);
  animation:cart-toast-in .22s cubic-bezier(.22,1.2,.4,1) both;
  pointer-events:none;
}
.cart-toast b{ font-weight:800; margin-left:7px; color:#F0D98A }
.cart-toast-check{
  display:grid; place-items:center; flex-shrink:0;
  width:20px; height:20px; border-radius:50%;
  background:#C9A84C; color:#0D4A2E; font-size:12px; font-weight:900;
}
@media (prefers-reduced-motion: reduce){ .cart-toast{ animation:none } }
`;

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
}
