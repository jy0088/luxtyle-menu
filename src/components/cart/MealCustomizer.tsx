'use client';

import { useState } from 'react';
import {
  useCart, CartLine, SweetLevel, SWEET_LEVELS, DEFAULT_SWEET,
} from './CartContext';
import { MenuItem, freeDrinkOptions, mealAddOns } from '@/app/menu/beiyuan/menuData';

const C = {
  brand: '#0D4A2E', text: '#1a1a1a', sub: '#6B6055', faint: '#7F7466',
  muted: '#F0EDE8', border: '#E8E4DE', orange: '#EA580C',
  // 与菜单页一致的暖调浅字,保证对比度
};

/**
 * 加点托盘 —— 与饮品加料同构:默认收起只占一行,展开后逐项加减份数。
 * 套餐(MealSetCustomizer)和单品(PlainItemAdder)共用。
 */
function AddOnTray({ picked, bump }: {
  picked: Record<number, number>;
  bump: (i: number, d: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const chosen = mealAddOns.map((a, i) => ({ a, q: picked[i] ?? 0 })).filter(x => x.q > 0);
  const count = chosen.reduce((s, x) => s + x.q, 0);
  const sum = chosen.reduce((s, x) => s + x.a.price * x.q, 0);

  return (
    <div className="lx-tray" data-open={open ? '1' : '0'} style={{ marginTop: 18 }}>
      <button className="lx-tray-head" onClick={() => setOpen(o => !o)}>
        <span style={{ minWidth: 0 }}>
          <span className="lx-tray-title">加点 ADD-ONS</span>
          <span className="lx-tray-sum" style={{ display: 'block' }}>
            {count === 0
              ? `${mealAddOns.length} 种可选 · tap to choose`
              : <>已选 {count} 份 · <b>+${sum.toFixed(2)}</b></>}
          </span>
        </span>
        <span className="lx-chev">▼</span>
      </button>
      <div className="lx-tray-body"><div><div className="lx-tray-inner">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {mealAddOns.map((a, i) => {
            const q = picked[i] ?? 0;
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6,
                padding: '8px 9px 8px 11px', borderRadius: 12,
                border: q > 0 ? `1.5px solid ${C.brand}` : `1.5px solid ${C.border}`,
                background: q > 0 ? '#F0FDF4' : '#fff',
              }}>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text, display: 'block', lineHeight: 1.2 }}>
                    {a.nameCn}
                  </span>
                  <span style={{ fontSize: 9.5, color: C.sub, display: 'block', lineHeight: 1.25, marginTop: 1 }}>
                    {a.nameEn}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.brand, display: 'block', marginTop: 3 }}>
                    +${a.price.toFixed(2)}
                  </span>
                </span>
                {q === 0 ? (
                  <button className="lx-add" onClick={() => bump(i, 1)} aria-label={`加 ${a.nameCn}`}>+</button>
                ) : (
                  <span className="lx-step">
                    <button onClick={() => bump(i, -1)} aria-label="减少">−</button>
                    <span>{q}</span>
                    <button onClick={() => bump(i, 1)} aria-label="增加">+</button>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div></div></div>
    </div>
  );
}

/** 份数增减的共用逻辑 */
function useAddOnPicks() {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const bump = (i: number, d: number) => setPicked(p => {
    const q = Math.max(0, Math.min(9, (p[i] ?? 0) + d));
    const next = { ...p };
    if (q === 0) delete next[i]; else next[i] = q;
    return next;
  });
  const chosen = mealAddOns
    .map((a, i) => ({ nameCn: a.nameCn, nameEn: a.nameEn, price: a.price, qty: picked[i] ?? 0 }))
    .filter(x => x.qty > 0);
  const sum = chosen.reduce((s, x) => s + x.price * x.qty, 0);
  return { picked, bump, chosen, sum };
}

function QtyBox({ qty, setQty }: { qty: number; setQty: (f: (q: number) => number) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      border: `1px solid ${C.border}`, borderRadius: 12, padding: '6px 10px',
    }}>
      <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
        width: 40, height: 40, borderRadius: 10, border: 'none', background: C.muted,
        fontSize: 20, cursor: 'pointer', color: C.text,
      }}>−</button>
      <span style={{ fontSize: 17, fontWeight: 800, minWidth: 24, textAlign: 'center' }}>{qty}</span>
      <button onClick={() => setQty(q => q + 1)} style={{
        width: 40, height: 40, borderRadius: 10, border: 'none', background: C.muted,
        fontSize: 20, cursor: 'pointer', color: C.text,
      }}>+</button>
    </div>
  );
}

const refNote = (
  <div style={{ fontSize: 10.5, color: C.faint, textAlign: 'center', marginTop: 8 }}>
    清单仅供整理点单,落单请向店员出示 · List for ordering reference only
  </div>
);

/** 套餐定制:选一杯赠饮(可调甜度)+ 可选加购 + 数量 */
export function MealSetCustomizer({ item, onAdded }: { item: MenuItem; onAdded: () => void }) {
  const { addLine } = useCart();
  const [qty, setQty] = useState(1);
  const [drinkIdx, setDrinkIdx] = useState(0);
  const [drinkSweet, setDrinkSweet] = useState<SweetLevel>(DEFAULT_SWEET);
  const { picked, bump, chosen, sum } = useAddOnPicks();

  const drinkUpcharge = freeDrinkOptions[drinkIdx].price;
  const unit = item.price + drinkUpcharge + sum;

  const handleAdd = () => {
    const d = freeDrinkOptions[drinkIdx];
    const line: Omit<CartLine, 'uid'> = {
      kind: 'mealset',
      itemId: item.id,
      nameCn: item.nameCn,
      nameEn: item.nameEn,
      basePrice: item.price,
      qty,
      freeDrink: { nameCn: d.nameCn, nameEn: d.nameEn, sweet: drinkSweet, price: d.price },
      addOns: chosen,
    };
    addLine(line);
    onAdded();
  };

  return (
    <div style={{ marginTop: 4 }}>
      {/* 赠饮选择 */}
      <div style={{ marginTop: 8 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: 0.6,
          textTransform: 'uppercase', marginBottom: 8,
        }}>🎁 附赠饮品 · 选一杯 Free Drink<span style={{ fontSize: 10, fontWeight: 600, color: C.sub, marginLeft: 4 }}>(部分需加价)</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {freeDrinkOptions.map((d, i) => {
            const on = i === drinkIdx;
            return (
              <button key={i} onClick={() => setDrinkIdx(i)} style={{
                padding: '9px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                border: on ? `1.5px solid ${C.orange}` : `1.5px solid ${C.border}`,
                background: on ? '#FFF7ED' : '#fff',
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>
                  {on ? '✓ ' : ''}{d.nameCn}
                </div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 1 }}>{d.nameEn}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: d.price > 0 ? C.orange : '#16a34a', marginTop: 3 }}>
                  {d.price > 0 ? `+$${d.price.toFixed(2)}` : '免费 Free'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 赠饮甜度 */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: 0.6,
          textTransform: 'uppercase', marginBottom: 8,
        }}>赠饮甜度 Drink Sweetness</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SWEET_LEVELS.map(s => {
            const on = s === drinkSweet;
            return (
              <button key={s} onClick={() => setDrinkSweet(s)} style={{
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
                fontWeight: 700,
                border: on ? `1.5px solid ${C.brand}` : `1.5px solid ${C.border}`,
                background: on ? C.brand : '#fff', color: on ? '#fff' : C.text,
              }}>{s}</button>
            );
          })}
        </div>
      </div>

      {/* 加点 */}
      <AddOnTray picked={picked} bump={bump} />

      {/* 数量 + 加入 */}
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
        <QtyBox qty={qty} setQty={setQty} />
        <button onClick={handleAdd} style={{
          flex: 1, height: 52, borderRadius: 14, border: 'none', background: C.brand,
          color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
        }}>
          加入清单 · ${(unit * qty).toFixed(2)}
        </button>
      </div>
      {refNote}
    </div>
  );
}

/**
 * 普通餐食 / 小食:数量 + 加入清单
 * showAddOns=true 时,加点做成可勾选(与饮品加料同构),不再只是分类底部的一段说明文字
 */
export function PlainItemAdder({ item, showAddOns, onAdded }:
  { item: MenuItem; showAddOns?: boolean; onAdded: () => void }) {
  const { addLine } = useCart();
  const [qty, setQty] = useState(1);
  const [variantIdx, setVariantIdx] = useState(0);
  const { picked, bump, chosen, sum } = useAddOnPicks();

  const hasVariants = !!item.variants && item.variants.length > 0;
  const unit = item.price + (showAddOns ? sum : 0);

  const handleAdd = () => {
    addLine({
      kind: 'plain',
      itemId: item.id,
      nameCn: item.nameCn,
      nameEn: item.nameEn,
      basePrice: item.price,
      qty,
      variant: hasVariants ? item.variants![variantIdx] : null,
      addOns: showAddOns ? chosen : [],
    });
    onAdded();
  };

  return (
    <div style={{ marginTop: 20 }}>
      {/* 形态二选一(如整根/切片),不影响价格 */}
      {hasVariants && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: 0.6,
            textTransform: 'uppercase', marginBottom: 8,
          }}>形态 Form</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {item.variants!.map((v, i) => {
              const on = i === variantIdx;
              return (
                <button key={i} onClick={() => setVariantIdx(i)} style={{
                  padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
                  fontWeight: 700,
                  border: on ? `1.5px solid ${C.brand}` : `1.5px solid ${C.border}`,
                  background: on ? C.brand : '#fff', color: on ? '#fff' : C.text,
                }}>
                  {v.label} {v.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {showAddOns && <AddOnTray picked={picked} bump={bump} />}

      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <QtyBox qty={qty} setQty={setQty} />
        <button onClick={handleAdd} style={{
          flex: 1, height: 52, borderRadius: 14, border: 'none', background: C.brand,
          color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
        }}>
          加入清单 · ${(unit * qty).toFixed(2)}
        </button>
      </div>
      {refNote}
    </div>
  );
}
