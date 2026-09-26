'use client';

import { useState, useMemo } from 'react';
import {
  useCart, CartLine, CartTopping,
  SweetLevel, IceLevel, TeaBaseLabel, SizeLabel,
  SWEET_LEVELS, ICE_LEVELS, DEFAULT_SWEET, DEFAULT_ICE,
} from './CartContext';
import { MenuItem, Customization, toppings, TeaBase, milkBaseOptions } from '@/app/menu/beiyuan/menuData';

const C = {
  brand: '#0D4A2E', text: '#1a1a1a', sub: '#6B6055', faint: '#7F7466',
  muted: '#F0EDE8', border: '#E8E4DE', gold: '#C9A84C',
};

const TEA_BASE_LABEL: Record<TeaBase, TeaBaseLabel> = { B: '红茶', G: '绿茶', O: '乌龙' };
const TEA_BASE_EN: Record<TeaBase, string> = { B: 'Black', G: 'Green', O: 'Oolong' };
const SWEET_EN: Record<SweetLevel, string> = {
  '原糖': 'Full Sugar', '75%': '75%', '50%': '50%', '25%': '25%', '无糖': 'No Sugar',
};
const ICE_EN: Record<IceLevel, string> = {
  '正常冰': 'Regular', '少冰': 'Less', '去冰': 'No Ice',
};
const OOLONG_UPCHARGE = 0.5;
const SIZE_L_UPCHARGE = 1.0;

/** 一组胶囊选择器 */
function PillGroup<T extends string>({
  label, options, value, onChange, suffix, display,
}: {
  label: string; options: T[]; value: T | null;
  onChange: (v: T) => void;
  suffix?: Partial<Record<T, string>>;
  display?: Partial<Record<T, string>>;  // 主显示文字(覆盖 opt 本身)
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: 0.6,
        textTransform: 'uppercase', marginBottom: 8,
      }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => {
          const active = opt === value;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
                fontWeight: 700,
                border: active ? `1.5px solid ${C.brand}` : `1.5px solid ${C.border}`,
                background: active ? C.brand : '#fff',
                color: active ? '#fff' : C.text,
              }}
            >
              {display?.[opt] ?? opt}{suffix?.[opt] ? <span style={{
                fontSize: 11, opacity: 0.8, marginLeft: 3,
              }}>{suffix[opt]}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  item: MenuItem;
  custom: Customization;
  oolongUpcharge: boolean;   // C-A / C-B 才对乌龙加价
  onAdded: () => void;       // 加入后回调(关闭详情页等)
};

/**
 * 饮品定制面板 — 杯型 / 茶底 / 甜度 / 冰量 / 加料 / 数量 + 加入清单
 */
export default function DrinkCustomizer({ item, custom, oolongUpcharge, onAdded }: Props) {
  const { addLine } = useCart();

  const hasSize = custom.size === 'S+L';
  const hasTeaBase = !!custom.teaBase && !!item.teaBases?.length;
  const hasSweet = !!custom.sweetness;
  const hasIce = !!custom.ice;
  const iceFixed = !!custom.iceFixed;
  const hasTopping = !!custom.topping;
  const hasMilkBase = !!custom.milkBase;

  const [size, setSize] = useState<SizeLabel>(item.largeOnly ? 'L' : (hasSize ? 'S' : '单一'));
  const [teaBase, setTeaBase] = useState<TeaBase | null>(null); // 不预选,强制客人点
  const [sweet, setSweet] = useState<SweetLevel>(DEFAULT_SWEET);
  const [ice, setIce] = useState<IceLevel>(DEFAULT_ICE);
  const [picked, setPicked] = useState<Record<string, number>>({});   // id → 份数
  const [trayOpen, setTrayOpen] = useState(false);
  const [milkIdx, setMilkIdx] = useState(0); // 默认纯茶(index 0,$0)
  const [qty, setQty] = useState(1);

  const bumpTopping = (id: string, d: number) =>
    setPicked(p => {
      const q = Math.max(0, Math.min(9, (p[id] ?? 0) + d));
      const next = { ...p };
      if (q === 0) delete next[id]; else next[id] = q;
      return next;
    });

  const sizeUpcharge = hasSize && size === 'L' ? SIZE_L_UPCHARGE : 0;
  const teaBaseUpcharge = hasTeaBase && oolongUpcharge && teaBase === 'O' ? OOLONG_UPCHARGE : 0;
  const milkBaseUpcharge = hasMilkBase ? milkBaseOptions[milkIdx].price : 0;
  const pickedToppings: CartTopping[] = useMemo(
    () => toppings.filter(t => (picked[t.id] ?? 0) > 0).map(t => ({
      id: t.id, nameCn: t.nameCn, nameEn: t.nameEn, price: t.price, qty: picked[t.id],
    })),
    [picked],
  );
  const toppingCount = pickedToppings.reduce((s, t) => s + (t.qty ?? 1), 0);
  const toppingSum = pickedToppings.reduce((s, t) => s + t.price * (t.qty ?? 1), 0);

  const unit = item.price + sizeUpcharge + teaBaseUpcharge + milkBaseUpcharge + toppingSum;

  const needsTeaBase = hasTeaBase && teaBase === null; // 必选茶底但还没选

  const handleAdd = () => {
    if (needsTeaBase) return; // 强制先选茶底
    const mb = milkBaseOptions[milkIdx];
    const line: Omit<CartLine, 'uid'> = {
      kind: 'drink',
      itemId: item.id,
      nameCn: item.nameCn,
      nameEn: item.nameEn,
      basePrice: item.price,
      qty,
      size: hasSize ? size : '单一',
      sizeUpcharge,
      teaBase: hasTeaBase && teaBase ? TEA_BASE_LABEL[teaBase] : undefined,
      teaBaseUpcharge,
      sweet: hasSweet ? sweet : undefined,
      ice: hasIce ? ice : (iceFixed ? '固定' : null),
      toppings: hasTopping ? pickedToppings : [],
      milkBase: hasMilkBase ? { label: mb.label, labelEn: mb.labelEn, price: mb.price } : null,
    };
    addLine(line);
    onAdded();
  };

  return (
    <div style={{ marginTop: 4 }}>
      {/* 杯型 */}
      {hasSize && !item.largeOnly && (
        <PillGroup<SizeLabel>
          label="杯型 Size" options={['S', 'L']} value={size} onChange={setSize}
          display={{ S: '小杯 Small', L: '大杯 Large' }}
          suffix={{ L: `+$${SIZE_L_UPCHARGE.toFixed(2)}` }}
        />
      )}
      {/* 茶底 */}
      {hasTeaBase && (
        <PillGroup<TeaBase>
          label="茶底 Tea Base"
          options={item.teaBases as TeaBase[]}
          value={teaBase}
          onChange={setTeaBase}
          display={Object.fromEntries(
            (item.teaBases as TeaBase[]).map(b => [b, `${TEA_BASE_LABEL[b]} ${TEA_BASE_EN[b]}`]),
          ) as Partial<Record<TeaBase, string>>}
          suffix={Object.fromEntries(
            (item.teaBases as TeaBase[])
              .filter(b => oolongUpcharge && b === 'O')
              .map(b => [b, `+$${OOLONG_UPCHARGE.toFixed(2)}`]),
          ) as Partial<Record<TeaBase, string>>}
        />
      )}
      {/* 奶基底 */}
      {hasMilkBase && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: 0.6,
            textTransform: 'uppercase', marginBottom: 8,
          }}>奶基底 Milk Base</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {milkBaseOptions.map((m, i) => {
              const on = i === milkIdx;
              return (
                <button key={i} onClick={() => setMilkIdx(i)} style={{
                  padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
                  fontWeight: 700,
                  border: on ? `1.5px solid ${C.brand}` : `1.5px solid ${C.border}`,
                  background: on ? C.brand : '#fff', color: on ? '#fff' : C.text,
                }}>
                  {m.label} {m.labelEn}
                  {m.price > 0 ? <span style={{ fontSize: 11, opacity: 0.8, marginLeft: 3 }}>+${m.price.toFixed(2)}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* 甜度 */}
      {hasSweet && (
        <PillGroup<SweetLevel>
          label="甜度 Sweetness" options={SWEET_LEVELS} value={sweet} onChange={setSweet}
          display={Object.fromEntries(
            SWEET_LEVELS.map(s => [s, s === '75%' || s === '50%' || s === '25%' ? s : `${s} ${SWEET_EN[s]}`]),
          ) as Partial<Record<SweetLevel, string>>}
        />
      )}
      {/* 冰量 */}
      {hasIce && (
        <PillGroup<IceLevel>
          label="冰量 Ice" options={ICE_LEVELS} value={ice} onChange={setIce}
          display={Object.fromEntries(
            ICE_LEVELS.map(i => [i, `${i} ${ICE_EN[i]}`]),
          ) as Partial<Record<IceLevel, string>>}
        />
      )}
      {iceFixed && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: 0.6,
            textTransform: 'uppercase', marginBottom: 8,
          }}>冰量 Ice</div>
          <span style={{
            fontSize: 12, color: C.sub, background: C.muted,
            padding: '6px 12px', borderRadius: 999,
          }}>此饮品冰量固定 · Fixed</span>
        </div>
      )}
      {/* 加料 —— 托盘式:默认收起只占一行,展开后可逐项加减份数 */}
      {hasTopping && (
        <div className="lx-tray" data-open={trayOpen ? '1' : '0'} style={{ marginTop: 18 }}>
          <button className="lx-tray-head" onClick={() => setTrayOpen(o => !o)}>
            <span style={{ minWidth: 0 }}>
              <span className="lx-tray-title">加料 TOPPINGS</span>
              <span className="lx-tray-sum" style={{ display: 'block' }}>
                {toppingCount === 0
                  ? `${toppings.length} 种可选 · tap to choose`
                  : <>已选 {toppingCount} 份 · <b>+${toppingSum.toFixed(2)}</b></>}
              </span>
            </span>
            <span className="lx-chev">▼</span>
          </button>
          <div className="lx-tray-body"><div><div className="lx-tray-inner">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {toppings.map(t => {
                const q = picked[t.id] ?? 0;
                return (
                  <div key={t.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6,
                    padding: '8px 9px 8px 11px', borderRadius: 12,
                    border: q > 0 ? `1.5px solid ${C.brand}` : `1.5px solid ${C.border}`,
                    background: q > 0 ? '#F0FDF4' : '#fff',
                  }}>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text, display: 'block', lineHeight: 1.2 }}>
                        {t.nameCn}
                      </span>
                      <span style={{ fontSize: 9.5, color: C.sub, display: 'block', lineHeight: 1.25, marginTop: 1 }}>
                        {t.nameEn}
                      </span>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: C.brand, display: 'block', marginTop: 3 }}>
                        +${t.price.toFixed(2)}
                      </span>
                    </span>
                    {q === 0 ? (
                      <button className="lx-add" onClick={() => bumpTopping(t.id, 1)} aria-label={`加 ${t.nameCn}`}>+</button>
                    ) : (
                      <span className="lx-step">
                        <button onClick={() => bumpTopping(t.id, -1)} aria-label="减少">−</button>
                        <span>{q}</span>
                        <button onClick={() => bumpTopping(t.id, 1)} aria-label="增加">+</button>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div></div></div>
        </div>
      )}

      {/* 数量 + 加入清单 */}
      <div style={{
        marginTop: 22, display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          border: `1px solid ${C.border}`, borderRadius: 12, padding: '6px 10px',
        }}>
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            style={{
              width: 40, height: 40, borderRadius: 10, border: 'none',
              background: C.muted, fontSize: 20, cursor: 'pointer', color: C.text,
            }}
          >−</button>
          <span style={{ fontSize: 17, fontWeight: 800, minWidth: 24, textAlign: 'center' }}>
            {qty}
          </span>
          <button
            onClick={() => setQty(q => q + 1)}
            style={{
              width: 40, height: 40, borderRadius: 10, border: 'none',
              background: C.muted, fontSize: 20, cursor: 'pointer', color: C.text,
            }}
          >+</button>
        </div>
        <button
          onClick={handleAdd}
          disabled={needsTeaBase}
          style={{
            flex: 1, height: 52, borderRadius: 14, border: 'none',
            background: needsTeaBase ? C.faint : C.brand, color: '#fff', fontSize: 16, fontWeight: 800,
            cursor: needsTeaBase ? 'not-allowed' : 'pointer',
          }}
        >
          {needsTeaBase ? '请先选茶底 · Select Tea Base' : `加入清单 · $${(unit * qty).toFixed(2)}`}
        </button>
      </div>
      <div style={{ fontSize: 10.5, color: C.faint, textAlign: 'center', marginTop: 8 }}>
        清单仅供整理点单,落单请向店员出示 · List for ordering reference only
      </div>
    </div>
  );
}
