'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

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

export type CartTopping = { id: string; nameCn: string; nameEn: string; price: number };

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
  freeDrink?: { nameCn: string; nameEn: string; sweet: SweetLevel } | null;
  addOns?: { nameCn: string; nameEn: string; price: number }[];
};

/** 单行单价 = 基础 + 杯型 + 茶底 + 加料合计 + 套餐加购合计 */
export function lineUnitPrice(l: CartLine): number {
  let p = l.basePrice;
  p += l.sizeUpcharge ?? 0;
  p += l.teaBaseUpcharge ?? 0;
  if (l.toppings) p += l.toppings.reduce((s, t) => s + t.price, 0);
  if (l.addOns) p += l.addOns.reduce((s, a) => s + a.price, 0);
  return p;
}
export function lineSubtotal(l: CartLine): number {
  return lineUnitPrice(l) * l.qty;
}

type CartCtx = {
  lines: CartLine[];
  count: number;          // 总杯/份数
  total: number;          // 合计(未税)
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
    <Ctx.Provider value={{ lines, count, total, addLine, setQty, removeLine, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
}
