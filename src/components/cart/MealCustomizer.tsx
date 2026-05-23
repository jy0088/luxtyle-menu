'use client';

import { useState } from 'react';
import {
  useCart, CartLine, SweetLevel, SWEET_LEVELS, DEFAULT_SWEET,
} from './CartContext';
import { MenuItem, freeDrinkOptions, mealAddOns } from '@/app/menu/beiyuan/menuData';

const C = {
  brand: '#0D4A2E', text: '#1a1a1a', sub: '#888', faint: '#bbb',
  muted: '#F0EDE8', border: '#E8E4DE', orange: '#EA580C',
};

function QtyBox({ qty, setQty }: { qty: number; setQty: (f: (q: number) => number) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      border: `1px solid ${C.border}`, borderRadius: 12, padding: '6px 10px',
    }}>
      <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
        width: 30, height: 30, borderRadius: 8, border: 'none', background: C.muted,
        fontSize: 18, cursor: 'pointer', color: C.text,
      }}>−</button>
      <span style={{ fontSize: 16, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{qty}</span>
      <button onClick={() => setQty(q => q + 1)} style={{
        width: 30, height: 30, borderRadius: 8, border: 'none', background: C.muted,
        fontSize: 18, cursor: 'pointer', color: C.text,
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
  const [addOns, setAddOns] = useState<Record<number, boolean>>({});

  const chosenAddOns = mealAddOns.filter((_, i) => addOns[i]);
  const unit = item.price + chosenAddOns.reduce((s, a) => s + a.price, 0);

  const handleAdd = () => {
    const d = freeDrinkOptions[drinkIdx];
    const line: Omit<CartLine, 'uid'> = {
      kind: 'mealset',
      itemId: item.id,
      nameCn: item.nameCn,
      nameEn: item.nameEn,
      basePrice: item.price,
      qty,
      freeDrink: { nameCn: d.nameCn, nameEn: d.nameEn, sweet: drinkSweet },
      addOns: chosenAddOns.map(a => ({ nameCn: a.nameCn, nameEn: a.nameEn, price: a.price })),
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
        }}>🎁 附赠饮品 · 选一杯 Free Drink</div>
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

      {/* 加购 */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: 0.6,
          textTransform: 'uppercase', marginBottom: 8,
        }}>加购 Add-ons · 可选</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mealAddOns.map((a, i) => {
            const on = !!addOns[i];
            return (
              <button key={i} onClick={() => setAddOns(p => ({ ...p, [i]: !p[i] }))} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                border: on ? `1.5px solid ${C.brand}` : `1.5px solid ${C.border}`,
                background: on ? '#F0FDF4' : '#fff',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {on ? '✓ ' : ''}{a.nameCn}
                  <span style={{ fontSize: 11, fontWeight: 400, color: C.sub, marginLeft: 6 }}>
                    {a.nameEn}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: C.sub }}>+${a.price.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 数量 + 加入 */}
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
        <QtyBox qty={qty} setQty={setQty} />
        <button onClick={handleAdd} style={{
          flex: 1, height: 50, borderRadius: 14, border: 'none', background: C.brand,
          color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
        }}>
          加入清单 · ${(unit * qty).toFixed(2)}
        </button>
      </div>
      {refNote}
    </div>
  );
}

/** 普通餐食 / 小食:仅数量 + 加入清单;有 variants 时多一个形态二选一 */
export function PlainItemAdder({ item, onAdded }: { item: MenuItem; onAdded: () => void }) {
  const { addLine } = useCart();
  const [qty, setQty] = useState(1);
  const [variantIdx, setVariantIdx] = useState(0);

  const hasVariants = !!item.variants && item.variants.length > 0;

  const handleAdd = () => {
    addLine({
      kind: 'plain',
      itemId: item.id,
      nameCn: item.nameCn,
      nameEn: item.nameEn,
      basePrice: item.price,
      qty,
      variant: hasVariants ? item.variants![variantIdx] : null,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <QtyBox qty={qty} setQty={setQty} />
        <button onClick={handleAdd} style={{
          flex: 1, height: 50, borderRadius: 14, border: 'none', background: C.brand,
          color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
        }}>
          加入清单 · ${(item.price * qty).toFixed(2)}
        </button>
      </div>
    </div>
  );
}
