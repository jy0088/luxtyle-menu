'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  allCategories, toppings, freeDrinkOptions,
  MenuCategory, MenuItem, MenuSubCategory, StoreId,
} from './menuData';
import AppShell from '@/components/shell/AppShell';
import ImageZoomOverlay from '@/components/ImageZoomOverlay';
import { CartProvider } from '@/components/cart/CartContext';
import CartBar from '@/components/cart/CartBar';
import WhatsAppButton from '@/components/WhatsAppButton';
import QilinWidget from '@/components/beiyuan/QilinWidget';
import DrinkCustomizer from '@/components/cart/DrinkCustomizer';
import { MealSetCustomizer, PlainItemAdder } from '@/components/cart/MealCustomizer';
import type { Customization } from './menuData';

// 本月特价 —— 「🏷 Specials」按钮打开的列表。清空数组即下架。
const monthlySpecials = {
  month: 'September 2026',
  specials: [
    { nameEn: 'Spicy Beef Wide Noodle Soup', nameCn: '香辣牛肉板面', price: 14.98, was: 17.98, note: 'New item 新品' },
  ] as Array<{ nameEn: string; nameCn: string; price: number; was?: number; note?: string }>,
  picks: [] as Array<{ nameEn: string; nameCn: string; price: number }>,
};
const hasSpecials = monthlySpecials.specials.length > 0 || monthlySpecials.picks.length > 0;

// 临时活动海报 —— active:true 时,进店弹的是海报而不是 Monthly Specials 弹窗。
// 活动结束把 active 改成 false 即可恢复原弹窗,其余不用动。
const PROMO = {
  active: true,
  img: '/promo/banmian-4x5.webp',
  alt: 'Spicy Beef Wide Noodle Soup 香辣牛肉板面',
  // 不自动关闭;顾客读完自己关
};

// 门店 —— 首页用 ?store=clairemont / ?store=miramesa 带进来,记在 localStorage
const STORES: Record<StoreId, { name: string; addr: string }> = {
  clairemont: { name: 'Clairemont Mesa', addr: '7315 Clairemont Mesa Blvd, San Diego, CA' },
  miramesa: { name: 'Mira Mesa', addr: '9003 Mira Mesa Blvd, San Diego, CA' },
};
function isStore(v: unknown): v is StoreId {
  return v === 'clairemont' || v === 'miramesa';
}
/** 按门店过滤:没标 at 的一律保留 */
function forStore<T extends { at?: StoreId }>(list: T[], store: StoreId): T[] {
  return list.filter(x => !x.at || x.at === store);
}
function categoryForStore(cat: MenuCategory | null | undefined, store: StoreId) {
  if (!cat) return cat ?? null;
  const out: MenuCategory = { ...cat };
  if (out.items) out.items = forStore(out.items, store);
  if (out.subcategories) out.subcategories = forStore(out.subcategories, store);
  return out;
}

// 北苑 WhatsApp 频道 —— 小麒麟挂件跳转目标
const BY_CHANNEL = 'https://whatsapp.com/channel/0029VbDcqctLtOjDUnCzoe2c';

// 全局样式 —— 分类转场 + 按下反馈。内联样式写不了 :active,必须走 CSS。
const BY_CSS = `
@keyframes by-in-l { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
@keyframes by-in-r { from { opacity:0; transform:translateX(-20px) } to { opacity:1; transform:none } }
@keyframes by-sheet-up { from { transform:translateY(24px); opacity:0 } to { transform:none; opacity:1 } }
.by-swap-l { animation: by-in-l .24s cubic-bezier(.22,.9,.3,1) both; }
.by-swap-r { animation: by-in-r .24s cubic-bezier(.22,.9,.3,1) both; }
.by-sheet  { animation: by-sheet-up .26s cubic-bezier(.22,1,.36,1) both; }
/* CHIP —— 选中的标签真实变宽,相邻标签跟着让位 */
.by-chip{
  flex-shrink:0; border:none; cursor:pointer; border-radius:999px;
  font-weight:700; white-space:nowrap;
  transition: padding .26s cubic-bezier(.22,1,.36,1),
              font-size .26s cubic-bezier(.22,1,.36,1),
              background-color .2s ease, color .2s ease, box-shadow .2s ease;
}
.by-chip[data-on="0"]{ padding:8px 16px; font-size:13px }
.by-chip[data-on="1"]{ padding:9px 21px; font-size:14.5px }
.by-subchip{
  flex-shrink:0; cursor:pointer; border-radius:14px; text-align:left;
  transition: padding .26s cubic-bezier(.22,1,.36,1),
              min-width .26s cubic-bezier(.22,1,.36,1),
              background-color .2s ease, border-color .2s ease, box-shadow .2s ease;
}
.by-subchip[data-on="0"]{ padding:12px 16px; min-width:112px }
.by-subchip[data-on="1"]{ padding:13px 20px; min-width:134px }
@media (prefers-reduced-motion: reduce){
  .by-chip, .by-subchip{ transition:background-color .2s ease, color .2s ease }
}

/* 按下反馈 —— 手指按下去屏幕要有回应 */
.by-root button, .by-root [data-press] {
  -webkit-tap-highlight-color: transparent;
  transition: transform .06s ease-out, filter .06s ease-out;
}
.by-root button:active, .by-root [data-press]:active {
  transform: scale(.955); filter: brightness(.90);
}
@media (prefers-reduced-motion: reduce) {
  .by-swap-l, .by-swap-r, .by-sheet { animation: none; }
  .by-root button, .by-root [data-press] { transition: none; }
  .by-root button:active, .by-root [data-press]:active { transform: none; filter: none; }
}
`;

const C = {
  bg: '#F5F2EC', card: '#FFFFFF', cardImg: '#EBEBEB', muted: '#F0EDE8',
  border: '#E8E4DE', text: '#1a1a1a', sub: '#6B6055', faint: '#7F7466',
  accent: '#B45309', accentBg: '#FEF3C7', orange: '#EA580C',
  green: '#16A34A', greenBg: '#F0FDF4', blue: '#2563EB',
  overlay: 'rgba(0,0,0,0.45)',
  brand: '#0D4A2E', brandDark: '#092E1C',
  gold: '#C9A84C', goldLight: '#F0D98A',
};

type TabGroup = { id: string; nameCn: string; nameEn: string };
type TabSection = {
  label: string; labelEn: string;
  color: string; colorBg: string; colorBgActive: string; colorText: string;
  tabs: TabGroup[];
};

const ALL_TAB_IDS: string[] = [];   // 下方 TAB_SECTIONS 建好后填充,用于判断切换方向

const TAB_SECTIONS: TabSection[] = [
  {
    label: '冷饮', labelEn: 'Cold Drinks',
    color: '#0369A1', colorBg: '#E0F2FE', colorBgActive: '#0369A1', colorText: '#075985',
    tabs: [
      { id: 'C-A', nameCn: '冰调味茶', nameEn: 'Iced Tea' },
      { id: 'C-B', nameCn: '冰调味奶茶', nameEn: 'Iced Milk Tea' },
      { id: 'R-A', nameCn: '臻选原叶茶', nameEn: 'Reserve Tea' },
      { id: 'C-C', nameCn: '经典特调冰饮', nameEn: 'Special Iced Drink' },
      { id: 'C-D', nameCn: '经典特制冰品', nameEn: 'Special Iced' },
    ],
  },
  {
    label: '热饮', labelEn: 'Hot Drinks',
    color: '#166534', colorBg: '#DCFCE7', colorBgActive: '#166534', colorText: '#14532D',
    tabs: [
      { id: 'H-A', nameCn: '热传统/调味茶', nameEn: 'Hot Tea' },
      { id: 'H-B', nameCn: '热调味奶茶', nameEn: 'Hot Milk Tea' },
      { id: 'H-C', nameCn: '经典特调热饮', nameEn: 'Special Hot Drink' },
    ],
  },
  {
    label: '套餐', labelEn: 'Meal Sets',
    color: '#EA580C', colorBg: '#FFF7ED', colorBgActive: '#EA580C', colorText: '#9A3412',
    tabs: [
      { id: 'M-A', nameCn: '精制套餐组合', nameEn: 'Meal Set' },
      { id: 'FREE-DRINK', nameCn: '套餐附赠饮料', nameEn: 'Free Drink' },
    ],
  },
  {
    label: '餐食', labelEn: 'Food',
    color: '#D97706', colorBg: '#FEF9C3', colorBgActive: '#D97706', colorText: '#92400E',
    tabs: [
      { id: 'M-B', nameCn: '精制主餐单碟', nameEn: 'Entree' },
      { id: 'M-C', nameCn: '精致主食面点', nameEn: 'Noodles' },
      { id: 'S-A', nameCn: '精致茶点', nameEn: 'Snacks' },
      { id: 'S-B', nameCn: '精致甜点', nameEn: 'Dessert' },
    ],
  },
  {
    label: '其他', labelEn: 'Add-ons',
    color: '#7C3AED', colorBg: '#EDE9FE', colorBgActive: '#7C3AED', colorText: '#4C1D95',
    tabs: [
      { id: 'T', nameCn: '饮料配料', nameEn: 'Topping' },
    ],
  },
];

ALL_TAB_IDS.push(...TAB_SECTIONS.flatMap(s => s.tabs.map(t => t.id)));

// ── Price (with +Tax) ──────────────────────────────────
function Price({ value, size = 18, color = C.accent, prefix = '', tax = true }: {
  value: number; size?: number; color?: string; prefix?: string; tax?: boolean;
}) {
  return (
    <span style={{ fontWeight: 900, color, fontSize: size, whiteSpace: 'nowrap', letterSpacing: -0.3 }}>
      {prefix}${value.toFixed(2)}
      {tax && (
        <span style={{ fontSize: Math.max(9, Math.round(size * 0.40)), fontWeight: 600, color: C.faint, marginLeft: 3 }}>
          +Tax
        </span>
      )}
    </span>
  );
}

// ── Splash Screen ──────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'show' | 'drip' | 'done'>('show');

  useEffect(() => {
    // 本次会话已看过就直接跳过 —— 不让回访顾客每次都等 2.5 秒
    try {
      if (sessionStorage.getItem('by_splashed') === '1') { setPhase('done'); onDone(); return; }
      sessionStorage.setItem('by_splashed', '1');
    } catch {}
    const t1 = setTimeout(() => setPhase('drip'), 1800);
    const t2 = setTimeout(() => { setPhase('done'); onDone(); }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  if (phase === 'done') return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: C.brand,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: phase === 'drip' ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.4s' : 'none',
      transform: phase === 'drip' ? 'translateY(-100%)' : 'translateY(0)',
      opacity: phase === 'drip' ? 0 : 1,
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img
          src="/beiyuan-cover.png"
          alt="cover"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1 }}
        />
      </div>
    </div>
  );
}

// ── Tea Base Badges ────────────────────────────────────
function TeaBaseBadge({ bases, oolongUpcharge }: { bases: string[]; oolongUpcharge?: boolean }) {
  const map: Record<string, string> = { B: 'Black Tea', G: 'Green Tea', O: 'Oolong' };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 3, marginTop: 4 }}>
      {bases.map(b => (
        <span key={b} style={{ fontSize: 10, background: C.accentBg, color: C.accent, padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
          {map[b]}{b === 'O' && oolongUpcharge ? ' +$0.5' : ''}
        </span>
      ))}
    </div>
  );
}

function CustomChips({ cat }: { cat: MenuCategory }) {
  const c = cat.customization;
  if (!c) return null;
  const chips: { label: string; bg: string; color: string }[] = [];
  if (c.sweetness) chips.push({ label: 'Adjustable Sweetness', bg: '#FEF9C3', color: '#854D0E' });
  if (c.ice) chips.push({ label: 'Adjustable Ice', bg: '#E0F2FE', color: '#0369A1' });
  if (c.iceFixed) chips.push({ label: 'Fixed Ice', bg: '#F3F4F6', color: '#6B7280' });
  if (c.topping) chips.push({ label: 'Add Toppings', bg: '#F3E8FF', color: '#6D28D9' });
  if (c.size === 'S+L') chips.push({ label: 'S / L · Large +$1', bg: '#FFF7ED', color: '#C2410C' });
  if (c.teaBase) chips.push({ label: 'Choose Tea Base', bg: '#DCFCE7', color: '#15803D' });
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, padding: '8px 0 4px' }}>
      {chips.map(ch => (
        <span key={ch.label} style={{ fontSize: 10, background: ch.bg, color: ch.color, padding: '3px 9px', borderRadius: 999, fontWeight: 600 }}>
          {ch.label}
        </span>
      ))}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 50,
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  background: C.overlay, backdropFilter: 'blur(4px)',
};

const sheetStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '24px 24px 0 0',
  width: '100%',
  maxWidth: 480,
  maxHeight: '92dvh',
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden',
};

function ItemCard({ item, isMeal, oolongUpcharge, custom, catId }: { item: MenuItem; isMeal?: boolean; oolongUpcharge?: boolean; custom?: Customization; catId?: string }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const emoji = isMeal ? '🍱' : '🍵';
  const imgBg = isMeal ? '#FFF7ED' : C.cardImg;
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ y: number; t: number } | null>(null);
  const [dragY, setDragY] = useState(0);   // 手指原始位移;渲染时打 0.55 阻尼

  // 只有内容已滚到顶部时才允许下拉关闭,否则滚动会被误判成关闭
  const atTop = () => (scrollRef.current?.scrollTop ?? 0) <= 0;
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStart.current = atTop() ? { y: e.touches[0].clientY, t: Date.now() } : null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStart.current) return;
    if (!atTop()) { dragStart.current = null; setDragY(0); return; }
    const dy = e.touches[0].clientY - dragStart.current.y;
    setDragY(dy > 0 ? dy : 0);
  };
  const handleTouchEnd = () => {
    const st = dragStart.current;
    dragStart.current = null;
    if (st) {
      const v = dragY / Math.max(Date.now() - st.t, 1);   // px/ms
      // 拖够远,或者快速下甩 —— 两者都要明确意图,避免误关
      if (dragY > 130 || (dragY > 60 && v > 0.6)) setOpen(false);
    }
    setDragY(0);
  };

  return (
    <>
      {/* Horizontal row card */}
      <div
        style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center' }}
        onClick={() => setOpen(true)}
      >
        {/* Left image block — square thumbnail */}
        <div style={{ width: 130, minWidth: 130, height: 130, background: imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 30, overflow: 'hidden' }}>
          {item.img
            ? <img src={item.img} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ opacity: 0.35 }}>{emoji}</span>
          }
          {item.seasonal && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 8, fontWeight: 700, background: '#16A34A', color: '#fff', padding: '1px 5px', borderRadius: 999 }}>Seasonal</span>}
          {item.largeOnly && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, fontWeight: 700, background: '#D97706', color: '#fff', padding: '1px 5px', borderRadius: 999 }}>L Only</span>}
        </div>
        {/* Right info block */}
        <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 17.5, fontWeight: 800, color: C.text, lineHeight: 1.22, letterSpacing: -0.2 }}>{item.nameEn}</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.sub, marginTop: 3 }}>{item.nameCn}</div>
          {item.note && <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{item.note}</div>}
          {item.teaBases && <TeaBaseBadge bases={item.teaBases} oolongUpcharge={oolongUpcharge} />}
          {item.caffeineF && <span style={{ fontSize: 10, color: '#1D4ED8', marginTop: 3, display: 'block' }}>☆ Caffeine Free</span>}
          {isMeal && (
            <div style={{ marginTop: 5, fontSize: 10, color: '#15803D', background: '#F0FDF4', padding: '2px 8px', borderRadius: 999, display: 'inline-block', alignSelf: 'flex-start' }}>
              + Free Drink Included
            </div>
          )}
          <div style={{ marginTop: 9 }}>
            <Price value={item.price} size={21} color={C.brand} tax={false} />
            {item.priceL && <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sub, marginLeft: 7 }}>/ L ${item.priceL.toFixed(2)}</span>}
          </div>
        </div>
      </div>

      {open && (
        <div style={overlayStyle} onClick={() => setOpen(false)}>
          <div
            ref={sheetRef}
            className={dragY === 0 ? 'by-sheet' : undefined}
            style={{ ...sheetStyle, transform: `translateY(${(dragY * 0.55).toFixed(1)}px)`, transition: dragY === 0 ? 'transform .28s cubic-bezier(.22,1,.36,1)' : 'none' }}
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag handle */}
            <div style={{ padding: '12px 0 0', flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 999, margin: '0 auto' }} />
              <div style={{ textAlign: 'center', fontSize: 10, color: '#ccc', marginTop: 4 }}>Swipe down to close</div>
            </div>
            {/* Hero image — full width, tall */}
            <div style={{ width: '100%', aspectRatio: '4 / 3', background: imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, flexShrink: 0, position: 'relative', marginTop: 12, overflow: 'hidden' }}>
              {item.img
                ? <img src={item.img} alt={item.nameEn} draggable={false} onContextMenu={e => e.preventDefault()} onClick={() => item.img && setZoom(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', WebkitTouchCallout: 'none' }} />
                : <span style={{ opacity: 0.25 }}>{emoji}</span>
              }
              {item.img && <span style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, fontWeight: 700, background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '4px 9px', borderRadius: 999, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>🔍 点图放大</span>}
              {item.seasonal && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, background: '#16A34A', color: '#fff', padding: '4px 10px', borderRadius: 999 }}>🌿 Seasonal</span>}
              {item.largeOnly && <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, background: '#D97706', color: '#fff', padding: '4px 10px', borderRadius: 999 }}>Large Only</span>}
              {item.caffeineF && <span style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 11, fontWeight: 700, background: '#DBEAFE', color: '#1D4ED8', padding: '4px 10px', borderRadius: 999 }}>☆ Caffeine Free</span>}
              {/* Close button */}
              <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 12, right: item.seasonal ? 100 : 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            {/* Image reference disclaimer */}
            {item.img && (
              <div style={{ flexShrink: 0, padding: '8px 22px 0', fontSize: 10.5, color: C.faint, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>📷</span><span>图片仅供参考,以实物为准 · Images for reference only</span>
              </div>
            )}
            {/* Scrollable content */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 32px' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.text, lineHeight: 1.18, letterSpacing: -0.4 }}>{item.nameEn}</div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.sub, marginTop: 5 }}>{item.nameCn}</div>
              {item.note && <div style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>{item.note}</div>}
              {item.teaBases && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Tea Base · 茶底</div>
                  <TeaBaseBadge bases={item.teaBases} oolongUpcharge={oolongUpcharge} />
                </div>
              )}
              <div style={{ marginTop: 18 }}>
                <Price value={item.price} size={34} color={C.brand} />
                {item.priceL && <span style={{ fontSize: 16, fontWeight: 600, color: C.sub, marginLeft: 10 }}>/ Large ${item.priceL.toFixed(2)}</span>}
              </div>
              {/* Customization selectors → add to list */}
              {(() => {
                const isSnack = catId === 'S-A' || catId === 'S-B';
                const isPlainMeal = catId === 'M-B' || catId === 'M-C';
                if (isMeal) {
                  return <MealSetCustomizer item={item} onAdded={() => setOpen(false)} />;
                }
                if (isSnack || isPlainMeal) {
                  // 加点与饮品加料同构:在单品详情里勾选,不再挂在分类底部
                  const withAddOns = catId === 'M-B' || catId === 'M-C' || catId === 'S-A';
                  return <PlainItemAdder item={item} showAddOns={withAddOns} onAdded={() => setOpen(false)} />;
                }
                // 饮品:有 customization 配置即出选择器
                if (custom) {
                  return (
                    <DrinkCustomizer
                      item={item}
                      custom={custom}
                      oolongUpcharge={!!oolongUpcharge}
                      onAdded={() => setOpen(false)}
                    />
                  );
                }
                return <PlainItemAdder item={item} onAdded={() => setOpen(false)} />;
              })()}
              {/* Spacer for safe area */}
              <div style={{ height: 20 }} />
            </div>
          </div>
        </div>
      )}
      {zoom && item.img && (
        <ImageZoomOverlay src={item.img} alt={item.nameEn} onClose={() => setZoom(false)} />
      )}
    </>
  );
}

function SubCard({ sub, custom, catId }: { sub: MenuSubCategory; custom?: Customization; catId?: string }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const oolongUpcharge = catId === 'C-A' || catId === 'C-B';
  const close = () => { setOpen(false); setSelIdx(null); };

  // 下拉关闭 —— 与单品弹层同一套手势(内容滚到顶才生效,拖够远或快速下甩才关)
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ y: number; t: number } | null>(null);
  const [dragY, setDragY] = useState(0);
  const atTop = () => (scrollRef.current?.scrollTop ?? 0) <= 0;
  const onTStart = (e: React.TouchEvent) => {
    dragStart.current = atTop() ? { y: e.touches[0].clientY, t: Date.now() } : null;
  };
  const onTMove = (e: React.TouchEvent) => {
    if (!dragStart.current) return;
    if (!atTop()) { dragStart.current = null; setDragY(0); return; }
    const dy = e.touches[0].clientY - dragStart.current.y;
    setDragY(dy > 0 ? dy : 0);
  };
  const onTEnd = () => {
    const st = dragStart.current;
    dragStart.current = null;
    if (st) {
      const v = dragY / Math.max(Date.now() - st.t, 1);
      if (dragY > 130 || (dragY > 60 && v > 0.6)) close();
    }
    setDragY(0);
  };
  return (
    <>
      {/* Horizontal series card — square thumbnail */}
      <div
        style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center' }}
        onClick={() => setOpen(true)}
      >
        <div style={{ width: 130, minWidth: 130, height: 130, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 30, overflow: 'hidden' }}>
          {sub.img
            ? <img src={sub.img} alt={sub.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ opacity: 0.35 }}>✨</span>
          }
          {sub.note && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 8, fontWeight: 700, background: '#D97706', color: '#fff', padding: '1px 5px', borderRadius: 999 }}>{sub.note}</span>}
        </div>
        <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 17.5, fontWeight: 800, color: C.text, lineHeight: 1.22, letterSpacing: -0.2 }}>{sub.nameEn}</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.sub, marginTop: 3 }}>{sub.nameCn}</div>
          <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>{sub.items.length} flavors · tap to choose</div>
          <div style={{ marginTop: 9 }}><Price value={sub.price} size={21} color={C.brand} tax={false} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14, color: C.faint, fontSize: 18 }}>›</div>
      </div>

      {open && (
        <div style={overlayStyle} onClick={close}>
          <div
            className={dragY === 0 ? 'by-sheet' : undefined}
            style={{ ...sheetStyle, transform: `translateY(${(dragY * 0.55).toFixed(1)}px)`, transition: dragY === 0 ? 'transform .28s cubic-bezier(.22,1,.36,1)' : 'none' }}
            onClick={e => e.stopPropagation()}
            onTouchStart={onTStart}
            onTouchMove={onTMove}
            onTouchEnd={onTEnd}
          >
            {/* Drag handle */}
            <div style={{ padding: '12px 0 0', flexShrink: 0 }}>
              <div style={{ width: 44, height: 5, background: '#DCD6CC', borderRadius: 999, margin: '0 auto' }} />
              <div style={{ textAlign: 'center', fontSize: 10, color: C.faint, marginTop: 5 }}>Swipe down to close</div>
            </div>
            {/* Series hero image — full landscape 4:3 */}
            <div style={{ width: '100%', aspectRatio: '4 / 3', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, flexShrink: 0, position: 'relative', marginTop: 12, overflow: 'hidden' }}>
              {sub.img
                ? <img src={sub.img} alt={sub.nameEn} draggable={false} onContextMenu={e => e.preventDefault()} onClick={() => sub.img && setZoom(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', WebkitTouchCallout: 'none' }} />
                : <span style={{ opacity: 0.25 }}>✨</span>
              }
              {sub.img && <span style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, fontWeight: 700, background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '4px 9px', borderRadius: 999, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>🔍 点图放大</span>}
              {sub.note && <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, background: '#D97706', color: '#fff', padding: '4px 10px', borderRadius: 999 }}>{sub.note}</span>}
              <button onClick={close} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            {/* Image reference disclaimer */}
            {sub.img && (
              <div style={{ flexShrink: 0, padding: '8px 22px 0', fontSize: 10.5, color: C.faint, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>📷</span><span>图片仅供参考,以实物为准 · Images for reference only</span>
              </div>
            )}
            {/* Scrollable content */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 32px' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.text, lineHeight: 1.18, letterSpacing: -0.4 }}>{sub.nameEn}</div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.sub, marginTop: 5 }}>{sub.nameCn}</div>
              <div style={{ margin: '16px 0 20px' }}><Price value={sub.price} size={34} color={C.brand} /></div>
              {selIdx === null ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.faint, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 12 }}>
                    选口味 Choose Flavor · {sub.items.length}
                  </div>
                  {/* Flavor cards — tap to select & customize */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sub.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setSelIdx(i)}
                        style={{ background: C.muted, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1.5px solid ${C.border}`, cursor: 'pointer', textAlign: 'left', width: '100%' }}
                      >
                        <span style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.3, display: 'block' }}>{item.nameEn}</span>
                          <span style={{ fontSize: 13, color: C.sub, marginTop: 3, display: 'block' }}>{item.nameCn}</span>
                          {item.note && <span style={{ fontSize: 11, color: C.faint, marginTop: 4, display: 'block' }}>{item.note}</span>}
                        </span>
                        <span style={{ flexShrink: 0, marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.seasonal && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#16A34A', color: '#fff', padding: '4px 10px', borderRadius: 999 }}>Seasonal</span>
                          )}
                          <span style={{ color: C.brand, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>›</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelIdx(null)}
                    style={{ background: 'none', border: 'none', color: C.brand, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 12 }}
                  >‹ 换口味 Change flavor</button>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1.2 }}>{sub.items[selIdx].nameEn}</div>
                  <div style={{ fontSize: 14, color: C.sub, marginTop: 3 }}>{sub.items[selIdx].nameCn}</div>
                  {(() => {
                    const f = sub.items[selIdx];
                    const flavorItem: MenuItem = {
                      id: `${sub.id}-${String(selIdx + 1).padStart(2, '0')}`,
                      nameEn: f.nameEn, nameCn: f.nameCn, price: sub.price,
                      note: f.note, seasonal: f.seasonal,
                    };
                    return custom
                      ? <DrinkCustomizer item={flavorItem} custom={custom} oolongUpcharge={oolongUpcharge} onAdded={close} />
                      : <PlainItemAdder item={flavorItem} onAdded={close} />;
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {zoom && sub.img && (
        <ImageZoomOverlay src={sub.img} alt={sub.nameEn} onClose={() => setZoom(false)} />
      )}
    </>
  );
}

function CategorySection({ cat }: { cat: MenuCategory }) {
  const isMeal = cat.id === 'M-A';
  const oolongUpcharge = cat.id === 'C-A' || cat.id === 'C-B';
  return (
    <div style={{ padding: '4px 16px 16px' }}>
      <CustomChips cat={cat} />
      {/* Single column list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {cat.type === 'items' && cat.items?.map(item => (
          <ItemCard key={item.id} item={item} isMeal={isMeal} oolongUpcharge={oolongUpcharge} custom={item.customization ?? cat.customization} catId={cat.id} />
        ))}
        {cat.type === 'subcategories' && cat.subcategories?.map(sub => <SubCard key={sub.id} sub={sub} custom={cat.customization} catId={cat.id} />)}
      </div>
    </div>
  );
}

function FreeDrinkSection() {
  return (
    <div style={{ padding: '16px 16px 32px' }}>
      <div style={{ background: '#FFF7ED', borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '1px solid #FED7AA' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#EA580C' }}>🎁 Free Drink with Every Meal Set</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 6, lineHeight: 1.7 }}>
          Every meal set includes one drink — select from the options below. Premium drinks carry a small upcharge.
        </div>
        <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
          所有套餐均含一杯饮料，从以下选项中选择；部分饮品需小额加价。
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {freeDrinkOptions.map((d, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 14px', border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{d.nameEn}</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{d.nameCn}</div>
            <div style={{ marginTop: 8, fontSize: 11, background: d.price > 0 ? '#FEF3C7' : '#FFF7ED', color: d.price > 0 ? '#B45309' : '#EA580C', padding: '3px 8px', borderRadius: 999, display: 'inline-block', fontWeight: 600 }}>
              {d.price > 0 ? `+$${d.price.toFixed(2)}` : 'Included 免费'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToppingSection() {
  return (
    <div style={{ padding: '4px 16px 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {toppings.map(t => (
          <div key={t.id} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.nameEn}</div>
              <div style={{ fontSize: 11, color: C.sub }}>{t.nameCn}</div>
            </div>
            <Price value={t.price} size={14} prefix="+" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoPopup({ onClose }: { onClose: () => void }) {
  // 不自动关闭 —— 顾客读完自己关(✕ / 点遮罩 / Esc)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.overlay, backdropFilter: 'blur(6px)', padding: '16px 12px' }}
      onClick={onClose}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 520, maxHeight: '100%', overflowY: 'auto', borderRadius: 20, background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PROMO.img} alt={PROMO.alt} style={{ display: 'block', width: '100%' }} />
        <button onClick={onClose} aria-label="Close 关闭" style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 19, lineHeight: 1, cursor: 'pointer' }}>×</button>
        <div style={{ padding: '13px 16px 15px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.brand }}>Order at the counter</div>
          <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>到柜台点单即可</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.faint, marginTop: 9, lineHeight: 1.5 }}>
            图片仅供参考、以实物为准<br />Pictures are for reference only
          </div>
          <button onClick={onClose} style={{ width: '100%', marginTop: 11, background: C.brand, color: C.gold, border: 'none', borderRadius: 14, padding: '12px 0', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
            Got it 知道了
          </button>
        </div>
      </div>
    </div>
  );
}

function MonthlyPopup({ onClose }: { onClose: () => void }) {
  const empty = !hasSpecials;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.overlay, backdropFilter: 'blur(6px)', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 360, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${C.brand} 0%,${C.brandDark} 100%)`, padding: '24px 24px 20px' }}>
          <div style={{ fontSize: 11, color: C.goldLight, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Bei Yuan Tea &amp; Boba</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.gold, marginTop: 4 }}>Monthly Specials</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{monthlySpecials.month}</div>
        </div>
        <div style={{ padding: 20 }}>
          {empty && (
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <div style={{ fontSize: 30 }}>🍵</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginTop: 8 }}>Specials Coming Soon</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>本月特价整理中,敬请期待</div>
            </div>
          )}
          {monthlySpecials.specials.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.faint, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 8 }}>🏷 This Month&apos;s Specials</div>
              {monthlySpecials.specials.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.accentBg, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.nameEn}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{s.nameCn}</div>
                    {s.note && <div style={{ fontSize: 10, color: C.faint }}>{s.note}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    {s.was && <s style={{ fontSize: 12, color: C.faint, fontWeight: 700 }}>${s.was.toFixed(2)}</s>}
                    <Price value={s.price} size={18} />
                  </div>
                </div>
              ))}
            </>
          )}
          {monthlySpecials.picks.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.faint, textTransform: 'uppercase' as const, letterSpacing: 0.8, margin: '12px 0 8px' }}>⭐ Manager&apos;s Picks</div>
              {monthlySpecials.picks.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF7ED', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.nameEn}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{p.nameCn}</div>
                  </div>
                  <Price value={p.price} size={18} color={C.orange} />
                </div>
              ))}
            </>
          )}
          <button onClick={onClose} style={{ width: '100%', background: C.brand, color: C.gold, border: 'none', borderRadius: 16, padding: '14px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
            View Full Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BeiYuanPage() {
  const [activeTab, setActiveTab] = useState('C-A');
  const [swapDir, setSwapDir] = useState(1);   // 1 = 向左推进,-1 = 向右回退
  const [showPopup, setShowPopup] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [showQilin, setShowQilin] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // 小麒麟挂件 —— 不与海报弹窗叠着出,等前一个关掉再接力;当天只出一次。
  // 网址加 ?qilin=1 可强制弹出,方便店内测试(不写入记录)。
  const qilinArmed = useRef(false);   // 只排一次队
  const autoFlow = useRef(false);     // 当前弹窗是不是进店自动弹的那一个
  const armQilin = (delay: number) => {
    if (qilinArmed.current) return;
    qilinArmed.current = true;
    let force = false;
    try { force = new URLSearchParams(window.location.search).get('qilin') === '1'; } catch {}
    const today = new Date().toDateString();
    if (!force) {
      try { if (localStorage.getItem('by_qilin') === today) return; } catch { return; }
    }
    setTimeout(() => {
      setShowQilin(true);
      if (!force) { try { localStorage.setItem('by_qilin', today); } catch {} }
    }, delay);
  };

  // 门店:优先读 ?store=,否则读上次记住的,默认 Clairemont
  const [store, setStore] = useState<StoreId>('clairemont');
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('store');
      if (isStore(q)) { setStore(q); localStorage.setItem('by_store', q); return; }
      const saved = localStorage.getItem('by_store');
      if (isStore(saved)) setStore(saved);
    } catch {}
  }, []);

  // 启动页结束后弹窗:活动期弹海报,否则弹 Monthly Specials
  const handleSplashDone = () => {
    setSplashDone(true);
    if (PROMO.active) { autoFlow.current = true; setTimeout(() => setShowPromo(true), 300); }
    else if (hasSpecials) { autoFlow.current = true; setTimeout(() => setShowPopup(true), 300); }
    else armQilin(1200);   // 没有任何弹窗时,进店 1.2 秒后直接出挂件
  };

  // 自动弹窗被关掉 → 隔一会儿接力出挂件;手动点开的 Specials 不触发
  const closeAutoPopup = (hide: () => void) => {
    hide();
    if (autoFlow.current) { autoFlow.current = false; armQilin(2500); }
  };

  // 切分类:记录方向,内容按方向做一次横向淡入
  const goTab = (id: string) => {
    if (id === activeTab) return;
    setSwapDir(ALL_TAB_IDS.indexOf(id) >= ALL_TAB_IDS.indexOf(activeTab) ? 1 : -1);
    setActiveTab(id);
  };

  useEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab]);

  const rawCategory = (activeTab === 'T' || activeTab === 'FREE-DRINK') ? null : allCategories.find(c => c.id === activeTab);
  const activeCategory = useMemo(() => categoryForStore(rawCategory, store), [rawCategory, store]);
  const activeSection = TAB_SECTIONS.find(s => s.tabs.some(t => t.id === activeTab));
  const activeSectionIndex = TAB_SECTIONS.findIndex(s => s.tabs.some(t => t.id === activeTab));

  // Swipe to change section
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const handleSwipeStart = (e: React.TouchEvent) => {
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStart.current.x;
    const dy = e.changedTouches[0].clientY - swipeStart.current.y;
    swipeStart.current = null;
    // 方向锁:只在「明确横向」时切换分类 —— 横向位移须够大、且明显大于纵向,
    // 否则视为纵向滚动/斜滑,不切换,避免跑偏到别的子菜单
    const HORIZONTAL_MIN = 70;
    if (Math.abs(dx) < HORIZONTAL_MIN) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.6) return;
    if (dx < 0 && activeSectionIndex < TAB_SECTIONS.length - 1) {
      goTab(TAB_SECTIONS[activeSectionIndex + 1].tabs[0].id);
    } else if (dx > 0 && activeSectionIndex > 0) {
      goTab(TAB_SECTIONS[activeSectionIndex - 1].tabs[0].id);
    }
  };

  return (
    <CartProvider>
      <style>{BY_CSS}</style>
      <div className="by-root">
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      {showPromo && <PromoPopup onClose={() => closeAutoPopup(() => setShowPromo(false))} />}
      {showPopup && <MonthlyPopup onClose={() => closeAutoPopup(() => setShowPopup(false))} />}
      <QilinWidget open={showQilin} onClose={() => setShowQilin(false)} channelUrl={BY_CHANNEL} />
      <CartBar />
      <WhatsAppButton />

      <AppShell
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: 'rgba(255,255,255,0.14)', color: C.goldLight,
              borderRadius: 999, padding: '5px 10px', fontSize: 10.5, fontWeight: 800,
              whiteSpace: 'nowrap',
            }}>
              📍 {STORES[store].name}
            </span>
            <button onClick={() => setShowPopup(true)} style={{
              background: C.gold, color: C.brand, border: 'none',
              borderRadius: 999, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              🏷 Specials
            </button>
          </div>
        }
        nav={
          <>

        {/* Section group pills — swipeable */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 8px', overflowX: 'auto', scrollbarWidth: 'none' as const, WebkitOverflowScrolling: 'touch' as const }}>
          {TAB_SECTIONS.map(section => {
            const isActive = section.tabs.some(t => t.id === activeTab);
            return (
              <button
                key={section.label}
                onClick={() => goTab(section.tabs[0].id)}
                className="by-chip"
                data-on={isActive ? '1' : '0'}
                style={{
                  background: isActive ? section.colorBgActive : 'rgba(255,255,255,0.12)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  boxShadow: isActive ? `0 3px 12px ${section.color}66` : 'none',
                }}
              >
                {section.labelEn}
              </button>
            );
          })}
        </div>

        {/* Sub-tab cards */}
        {activeSection && (
          <div
            ref={tabsRef}
            style={{ display: 'flex', gap: 8, padding: '0 16px 14px', overflowX: 'auto', scrollbarWidth: 'none' as const }}
          >
            {activeSection.tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => goTab(tab.id)}
                  className="by-subchip"
                  data-on={isActive ? '1' : '0'}
                  style={{
                    border: isActive ? `2px solid ${activeSection.color}` : '2px solid rgba(255,255,255,0.15)',
                    background: isActive ? activeSection.colorBg : 'rgba(255,255,255,0.08)',
                    boxShadow: isActive ? `0 3px 12px ${activeSection.color}44` : 'none',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: isActive ? activeSection.color : 'rgba(255,255,255,0.85)', lineHeight: 1.2 }}>{tab.nameEn}</div>
                  <div style={{ fontSize: 10, color: isActive ? activeSection.colorText : 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: 600 }}>{tab.nameCn}</div>
                </button>
              );
            })}
          </div>
        )}
        </>
      }
      >

      {/* Category Title */}
      {activeCategory && (
        <div style={{ padding: '16px 16px 0', borderLeft: activeSection ? `4px solid ${activeSection.color}` : 'none', paddingLeft: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{activeCategory.nameEn}</div>
          <div style={{ fontSize: 14, color: C.sub, marginTop: 2 }}>{activeCategory.nameCn}</div>
        </div>
      )}
      {activeTab === 'T' && (
        <div style={{ padding: '16px 16px 0', borderLeft: '4px solid #7C3AED', paddingLeft: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>Drink Toppings</div>
          <div style={{ fontSize: 14, color: C.sub, marginTop: 2 }}>饮料配料</div>
        </div>
      )}
      {activeTab === 'FREE-DRINK' && (
        <div style={{ padding: '16px 16px 0', borderLeft: '4px solid #EA580C', paddingLeft: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>Free Drink Options</div>
          <div style={{ fontSize: 14, color: C.sub, marginTop: 2 }}>套餐附赠饮料选项</div>
        </div>
      )}

      <div onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
        <div key={activeTab} className={swapDir >= 0 ? 'by-swap-l' : 'by-swap-r'}>
          {activeCategory && <CategorySection cat={activeCategory} />}
          {activeTab === 'T' && <ToppingSection />}
          {activeTab === 'FREE-DRINK' && <FreeDrinkSection />}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 16px 40px' }}>
        <div style={{ fontSize: 11, color: C.faint }}>Prices do not include tax · 价格不含税</div>
        <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>{STORES[store].name} · {STORES[store].addr}</div>
        <div style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>© 2026 Luxtyle Creations Inc.</div>
      </div>
    </AppShell>
      </div>
    </CartProvider>
  );
}
