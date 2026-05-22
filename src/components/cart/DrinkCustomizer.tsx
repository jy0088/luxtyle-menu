'use client';

import { useState, useMemo } from 'react';
import {
  useCart, CartLine, CartTopping,
  SweetLevel, IceLevel, TeaBaseLabel, SizeLabel,
  SWEET_LEVELS, ICE_LEVELS, DEFAULT_SWEET, DEFAULT_ICE,
} from './CartContext';
import { MenuItem, Customization, toppings, TeaBase } from '@/app/menu/beiyuan/menuData';

const C = {
  brand: '#0D4A2E', text: '#1a1a1a', sub: '#888', faint: '#bbb',
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
  label: string; options: T[]; value: T;
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

  const [size, setSize] = useState<SizeLabel>(item.largeOnly ? 'L' : (hasSize ? 'S' : '单一'));
  const [teaBase, setTeaBase] = useState<TeaBase>(item.teaBases?.[0] ?? 'B');
  const [sweet, setSweet] = useState<SweetLevel>(DEFAULT_SWEET);
  const [ice, setIce] = useState<IceLevel>(DEFAULT_ICE);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [qty, setQty] = useState(1);

  const toggleTopping = (id: string) =>
    setPicked(p => ({ ...p, [id]: !p[id] }));

  const sizeUpcharge = hasSize && size === 'L' ? SIZE_L_UPCHARGE : 0;
  const teaBaseUpcharge = hasTeaBase && oolongUpcharge && teaBase === 'O' ? OOLONG_UPCHARGE : 0;
  const pickedToppings: CartTopping[] = useMemo(
    () => toppings.filter(t => picked[t.id]).map(t => ({
      id: t.id, nameCn: t.nameCn, nameEn: t.nameEn, price: t.price,
    })),
    [picked],
  );

  const unit = item.price + sizeUpcharge + teaBaseUpcharge
    + pickedToppings.reduce((s, t) => s + t.price, 0);

  const handleAdd = () => {
    const line: Omit<CartLine, 'uid'> = {
      kind: 'drink',
      itemId: item.id,
      nameCn: item.nameCn,
      nameEn: item.nameEn,
      basePrice: item.price,
      qty,
      size: hasSize ? size : '单一',
      sizeUpcharge,
      teaBase: hasTeaBase ? TEA_BASE_LABEL[teaBase] : undefined,
      teaBaseUpcharge,
      sweet: hasSweet ? sweet : undefined,
      ice: hasIce ? ice : (iceFixed ? '固定' : null),
      toppings: hasTopping ? pickedToppings : [],
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
      {/* 加料 */}
      {hasTopping && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: 0.6,
            textTransform: 'uppercase', marginBottom: 8,
          }}>加料 Toppings · 可多选 Multiple</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {toppings.map(t => {
              const on = !!picked[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTopping(t.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    border: on ? `1.5px solid ${C.brand}` : `1.5px solid ${C.border}`,
                    background: on ? '#F0FDF4' : '#fff',
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text, display: 'block' }}>
                      {on ? '✓ ' : ''}{t.nameCn}
                    </span>
                    <span style={{ fontSize: 10, color: C.sub, display: 'block', marginTop: 1 }}>
                      {t.nameEn}
                    </span>
                  </span>
                  <span style={{ fontSize: 11, color: C.sub, flexShrink: 0, marginLeft: 6 }}>
                    +${t.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
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
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: C.muted, fontSize: 18, cursor: 'pointer', color: C.text,
            }}
          >−</button>
          <span style={{ fontSize: 16, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>
            {qty}
          </span>
          <button
            onClick={() => setQty(q => q + 1)}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: C.muted, fontSize: 18, cursor: 'pointer', color: C.text,
            }}
          >+</button>
        </div>
        <button
          onClick={handleAdd}
          style={{
            flex: 1, height: 50, borderRadius: 14, border: 'none',
            background: C.brand, color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          加入清单 · ${(unit * qty).toFixed(2)}
        </button>
      </div>
      <div style={{ fontSize: 10.5, color: C.faint, textAlign: 'center', marginTop: 8 }}>
        清单仅供整理点单,落单请向店员出示 · List for ordering reference only
      </div>
    </div>
  );
}
