'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  allCategories, toppings, freeDrinkOptions,
  MenuCategory, MenuItem, MenuSubCategory,
} from './menuData';

const monthlySpecials = {
  month: 'February 2026',
  specials: [
    { nameEn: 'Osmanthus Oolong', nameCn: '桂花乌龙', price: 6.98, note: '原价 $7.98' },
    { nameEn: 'Brown Sugar Sticky Rice Cake', nameCn: '红糖糍粑', price: 7.98, note: '原价 $8.98' },
  ],
  picks: [
    { nameEn: 'Longan Jujube Milk Tea', nameCn: '桂圆红枣奶茶', price: 6.98 },
    { nameEn: 'Spicy Tonkotsu Ramen Set', nameCn: '辣味豚骨拉面套餐', price: 19.95 },
  ],
};

const C = {
  bg: '#F5F2EC', card: '#FFFFFF', cardImg: '#EBEBEB', muted: '#F0EDE8',
  border: '#E8E4DE', text: '#1a1a1a', sub: '#888', faint: '#bbb',
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

const TAB_SECTIONS: TabSection[] = [
  {
    label: '冷饮', labelEn: 'Cold Drinks',
    color: '#0369A1', colorBg: '#E0F2FE', colorBgActive: '#0369A1', colorText: '#075985',
    tabs: [
      { id: 'C-A', nameCn: '冰调味茶', nameEn: 'Iced Tea' },
      { id: 'C-B', nameCn: '冰调味奶茶', nameEn: 'Iced Milk Tea' },
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

// ── Splash Screen ──────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'show' | 'drip' | 'done'>('show');

  useEffect(() => {
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
      {/* Background cover image only */}
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
function TeaBaseBadge({ bases }: { bases: string[] }) {
  const map: Record<string, string> = { B: '红茶', G: '绿茶', O: '乌龙+$0.5' };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 3, marginTop: 4 }}>
      {bases.map(b => (
        <span key={b} style={{ fontSize: 10, background: C.accentBg, color: C.accent, padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
          {map[b]}
        </span>
      ))}
    </div>
  );
}

function CustomChips({ cat }: { cat: MenuCategory }) {
  const c = cat.customization;
  if (!c) return null;
  const chips: { label: string; bg: string; color: string }[] = [];
  if (c.sweetness) chips.push({ label: '甜度可调', bg: '#FEF9C3', color: '#854D0E' });
  if (c.ice) chips.push({ label: '冰量可调', bg: '#E0F2FE', color: '#0369A1' });
  if (c.iceFixed) chips.push({ label: '冰量固定', bg: '#F3F4F6', color: '#6B7280' });
  if (c.topping) chips.push({ label: 'Topping 可加', bg: '#F3E8FF', color: '#6D28D9' });
  if (c.size === 'S+L') chips.push({ label: 'S/L · Large +$1', bg: '#FFF7ED', color: '#C2410C' });
  if (c.teaBase) chips.push({ label: '茶底可选', bg: '#DCFCE7', color: '#15803D' });
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

const cardStyle: React.CSSProperties = {
  background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
  overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
};

const imgBox = (bg: string): React.CSSProperties => ({
  width: '100%', height: 110, background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  position: 'relative', fontSize: 32,
});

const absBadge = (bg: string, color: string, top?: number, bottom?: number, left?: number, right?: number): React.CSSProperties => ({
  position: 'absolute', fontSize: 9, fontWeight: 700, background: bg, color,
  padding: '2px 6px', borderRadius: 999,
  ...(top !== undefined ? { top } : {}),
  ...(bottom !== undefined ? { bottom } : {}),
  ...(left !== undefined ? { left } : {}),
  ...(right !== undefined ? { right } : {}),
});

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 50,
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  background: C.overlay, backdropFilter: 'blur(4px)',
};

const sheetStyle: React.CSSProperties = {
  background: '#fff', borderRadius: '24px 24px 0 0',
  width: '100%', maxWidth: 480,
  padding: '20px 20px 36px', maxHeight: '85vh', overflowY: 'auto',
};

function ItemCard({ item, isMeal }: { item: MenuItem; isMeal?: boolean }) {
  const [open, setOpen] = useState(false);
  const emoji = isMeal ? '🍱' : '🍵';
  const imgBg = isMeal ? '#FFF7ED' : C.cardImg;

  return (
    <>
      {/* Horizontal row card */}
      <div
        style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'stretch' }}
        onClick={() => setOpen(true)}
      >
        {/* Left image block */}
        <div style={{ width: 100, minWidth: 100, background: imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 30 }}>
          <span style={{ opacity: 0.35 }}>{emoji}</span>
          {item.seasonal && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 8, fontWeight: 700, background: '#16A34A', color: '#fff', padding: '1px 5px', borderRadius: 999 }}>Seasonal</span>}
          {item.largeOnly && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, fontWeight: 700, background: '#D97706', color: '#fff', padding: '1px 5px', borderRadius: 999 }}>L Only</span>}
        </div>
        {/* Right info block */}
        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{item.nameEn}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{item.nameCn}</div>
          {item.note && <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{item.note}</div>}
          {item.teaBases && <TeaBaseBadge bases={item.teaBases} />}
          {item.caffeineF && <span style={{ fontSize: 10, color: '#1D4ED8', marginTop: 3, display: 'block' }}>☆ Caffeine Free</span>}
          {isMeal && (
            <div style={{ marginTop: 5, fontSize: 10, color: '#15803D', background: '#F0FDF4', padding: '2px 8px', borderRadius: 999, display: 'inline-block', alignSelf: 'flex-start' }}>
              + Free Drink 含饮料
            </div>
          )}
          <div style={{ fontSize: 16, fontWeight: 800, color: C.accent, marginTop: 6 }}>
            ${item.price.toFixed(2)}
            {item.priceL && <span style={{ fontSize: 12, fontWeight: 400, color: C.faint, marginLeft: 6 }}>/ L ${item.priceL.toFixed(2)}</span>}
          </div>
        </div>
      </div>

      {open && (
        <div style={overlayStyle} onClick={() => setOpen(false)}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 999, margin: '0 auto 16px' }} />
            <div style={{ width: '100%', height: 140, background: imgBg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, marginBottom: 16 }}>
              <span style={{ opacity: 0.4 }}>{emoji}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{item.nameEn}</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{item.nameCn}</div>
            {item.note && <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>{item.note}</div>}
            {item.teaBases && <div style={{ marginTop: 10 }}><div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>茶底选择</div><TeaBaseBadge bases={item.teaBases} /></div>}
            <div style={{ fontSize: 26, fontWeight: 900, color: C.accent, marginTop: 12 }}>
              ${item.price.toFixed(2)}
              {item.priceL && <span style={{ fontSize: 14, fontWeight: 400, color: C.faint, marginLeft: 8 }}>Large: ${item.priceL.toFixed(2)}</span>}
            </div>
            {item.largeOnly && <div style={{ fontSize: 11, color: '#D97706', marginTop: 4 }}>★ Large size only</div>}
            {item.caffeineF && <div style={{ fontSize: 11, color: C.blue, marginTop: 4 }}>☆ Caffeine Free</div>}
            {item.seasonal && <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>🌿 Seasonal item</div>}
            {isMeal && (
              <div style={{ background: '#F0FDF4', borderRadius: 16, padding: 16, marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.green, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 10 }}>Free Drink · 免费饮料选一</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {freeDrinkOptions.map((d, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '8px 10px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{d.nameEn}</div>
                      <div style={{ fontSize: 10, color: C.faint }}>{d.nameCn}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 8 }}>甜度可选 · 默认无冰 · 大杯 +$1</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SubCard({ sub }: { sub: MenuSubCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Horizontal series card */}
      <div
        style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'stretch' }}
        onClick={() => setOpen(true)}
      >
        <div style={{ width: 100, minWidth: 100, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 30 }}>
          <span style={{ opacity: 0.35 }}>✨</span>
          {sub.note && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 8, fontWeight: 700, background: '#D97706', color: '#fff', padding: '1px 5px', borderRadius: 999 }}>{sub.note}</span>}
        </div>
        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{sub.nameEn}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{sub.nameCn}</div>
          <div style={{ fontSize: 10, color: C.faint, marginTop: 4 }}>{sub.items.length} flavors · tap to choose</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.accent, marginTop: 6 }}>${sub.price.toFixed(2)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14, color: C.faint, fontSize: 18 }}>›</div>
      </div>

      {open && (
        <div style={overlayStyle} onClick={() => setOpen(false)}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 999, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{sub.nameEn}</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{sub.nameCn}</div>
            {sub.note && <div style={{ fontSize: 11, color: '#D97706', marginTop: 4 }}>{sub.note}</div>}
            <div style={{ fontSize: 26, fontWeight: 900, color: C.accent, margin: '10px 0 16px' }}>${sub.price.toFixed(2)}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 8 }}>口味选择 Flavors</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {sub.items.map((item, i) => (
                <div key={i} style={{ background: C.muted, borderRadius: 12, padding: '10px 12px', position: 'relative' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{item.nameEn}</div>
                  <div style={{ fontSize: 10, color: C.sub }}>{item.nameCn}</div>
                  {item.seasonal && <span style={absBadge('#16A34A', '#fff', 6, undefined, undefined, 6)}>Seasonal</span>}
                  {item.note && <div style={{ fontSize: 9, color: C.faint, marginTop: 2 }}>{item.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CategorySection({ cat }: { cat: MenuCategory }) {
  const isMeal = cat.id === 'M-A';
  return (
    <div style={{ padding: '4px 16px 16px' }}>
      <CustomChips cat={cat} />
      {/* Single column list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {cat.type === 'items' && cat.items?.map(item => <ItemCard key={item.id} item={item} isMeal={isMeal} />)}
        {cat.type === 'subcategories' && cat.subcategories?.map(sub => <SubCard key={sub.id} sub={sub} />)}
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
            <div style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>+${t.price.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyPopup({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.overlay, backdropFilter: 'blur(6px)', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 360, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${C.brand} 0%,${C.brandDark} 100%)`, padding: '24px 24px 20px' }}>
          <div style={{ fontSize: 11, color: C.goldLight, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>北苑南家</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.gold, marginTop: 4 }}>每月特价 & 店长推荐</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{monthlySpecials.month}</div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.faint, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 8 }}>🏷 本月特价</div>
          {monthlySpecials.specials.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.accentBg, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.nameEn}</div>
                <div style={{ fontSize: 11, color: C.sub }}>{s.nameCn}</div>
                {s.note && <div style={{ fontSize: 10, color: C.faint, textDecoration: 'line-through' }}>{s.note}</div>}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.accent }}>${s.price.toFixed(2)}</div>
            </div>
          ))}
          <div style={{ fontSize: 10, fontWeight: 800, color: C.faint, textTransform: 'uppercase' as const, letterSpacing: 0.8, margin: '12px 0 8px' }}>⭐ 店长推荐</div>
          {monthlySpecials.picks.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF7ED', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.nameEn}</div>
                <div style={{ fontSize: 11, color: C.sub }}>{p.nameCn}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.orange }}>${p.price.toFixed(2)}</div>
            </div>
          ))}
          <button onClick={onClose} style={{ width: '100%', background: C.brand, color: C.gold, border: 'none', borderRadius: 16, padding: '14px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
            查看全部菜单 View Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BeiYuanPage() {
  const [activeTab, setActiveTab] = useState('C-A');
  const [showPopup, setShowPopup] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Show popup after splash
  const handleSplashDone = () => {
    setSplashDone(true);
    setTimeout(() => setShowPopup(true), 300);
  };

  useEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab]);

  const activeCategory = activeTab === 'T' ? null : allCategories.find(c => c.id === activeTab);
  const activeSection = TAB_SECTIONS.find(s => s.tabs.some(t => t.id === activeTab));

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      {showPopup && <MonthlyPopup onClose={() => setShowPopup(false)} />}

      {/* Sticky Header — 深绿金色品牌风格 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: C.brand,
        borderBottom: `1px solid ${C.brandDark}`,
        boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      }}>
        {/* Brand row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/beiyuan-logo.png"
              alt="logo"
              style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${C.gold}` }}
            />
            <div>
              <div style={{ fontSize: 10, color: C.goldLight, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Bei Yuan Tea & Boba</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.gold, marginTop: 0, lineHeight: 1.2 }}>北苑南家</div>
            </div>
          </div>
          <button onClick={() => setShowPopup(true)} style={{
            background: C.gold, color: C.brand, border: 'none',
            borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer',
          }}>
            🏷 本月特价
          </button>
        </div>

        {/* Section group pills */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 8px', overflowX: 'auto', scrollbarWidth: 'none' as const }}>
          {TAB_SECTIONS.map(section => {
            const isActive = section.tabs.some(t => t.id === activeTab);
            return (
              <button
                key={section.label}
                onClick={() => setActiveTab(section.tabs[0].id)}
                style={{
                  flexShrink: 0, border: 'none', cursor: 'pointer', borderRadius: 999,
                  padding: '6px 16px', fontWeight: 700, fontSize: 12,
                  background: isActive ? section.colorBgActive : 'rgba(255,255,255,0.12)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  boxShadow: isActive ? `0 2px 8px ${section.color}66` : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {section.label} · {section.labelEn}
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
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flexShrink: 0,
                    border: isActive ? `2px solid ${activeSection.color}` : '2px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer', borderRadius: 14,
                    padding: '10px 16px', textAlign: 'left' as const,
                    minWidth: 110,
                    background: isActive ? activeSection.colorBg : 'rgba(255,255,255,0.08)',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? `0 2px 8px ${activeSection.color}44` : 'none',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? activeSection.color : 'rgba(255,255,255,0.85)', lineHeight: 1.2 }}>{tab.nameCn}</div>
                  <div style={{ fontSize: 10, color: isActive ? activeSection.colorText : 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: 500 }}>{tab.nameEn}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Title */}
      {activeCategory && (
        <div style={{ padding: '16px 16px 0', borderLeft: activeSection ? `4px solid ${activeSection.color}` : 'none', paddingLeft: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{activeCategory.nameEn}</div>
          <div style={{ fontSize: 12, color: C.sub }}>{activeCategory.nameCn}</div>
        </div>
      )}
      {activeTab === 'T' && (
        <div style={{ padding: '16px 16px 0', borderLeft: '4px solid #7C3AED', paddingLeft: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Drink Toppings</div>
          <div style={{ fontSize: 12, color: C.sub }}>饮料配料</div>
        </div>
      )}

      {activeCategory && <CategorySection cat={activeCategory} />}
      {activeTab === 'T' && <ToppingSection />}

      <div style={{ textAlign: 'center', padding: '24px 16px 40px' }}>
        <div style={{ fontSize: 11, color: C.faint }}>7315 Clairemont Mesa Blvd, San Diego, CA</div>
        <div style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>© 2026 Luxtyle Creations Inc.</div>
      </div>
    </div>
  );
}
