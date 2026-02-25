'use client';

import { useState, useEffect, useRef } from 'react';

// ── Brand ──────────────────────────────────────────────
const T = {
  bg: '#FFFBF7',
  text: '#1A1A2E',
  sub: '#888',
  faint: '#bbb',
};

const FLAVORS = [
  {
    id: 'black-tea',
    name: 'Black Tea', cn: '红茶',
    desc: 'Smooth Assam black tea base with a hint of caramel. Rich, earthy, and subtly sweet.',
    price: 6.99,
    color: '#C2773A',
    colorLight: '#F5E6D3',
    colorDark: '#8B4513',
    emoji: '🍵',
    tags: ['Classic', 'Earthy', 'Mild Caffeine'],
  },
  {
    id: 'blueberry',
    name: 'Blueberry', cn: '蓝莓',
    desc: 'Bright, fruity blueberry swirled into creamy gelato. Tangy, sweet, and refreshingly vibrant.',
    price: 6.99,
    color: '#4A4E8A',
    colorLight: '#E8E9F5',
    colorDark: '#2D3066',
    emoji: '🫐',
    tags: ['Fruity', 'Tangy', 'Antioxidant Rich'],
  },
  {
    id: 'pistachio',
    name: 'Pistachio', cn: '开心果',
    desc: 'Italian-style pistachio gelato made with real roasted pistachios. Nutty, buttery, and indulgent.',
    price: 7.49,
    color: '#7A9E5F',
    colorLight: '#E8F2E0',
    colorDark: '#4A6B30',
    emoji: '🌿',
    tags: ['Nutty', 'Premium', 'Signature'],
  },
  {
    id: 'dark-choc',
    name: 'Dark Chocolate', cn: '黑巧克力',
    desc: '72% dark cacao gelato. Intense, bittersweet, and deeply satisfying for true chocolate lovers.',
    price: 6.99,
    color: '#3D2314',
    colorLight: '#F0E6E0',
    colorDark: '#1A0A05',
    emoji: '🍫',
    tags: ['Intense', 'Bittersweet', 'Vegan-Friendly'],
  },
];

const TOPPINGS = {
  sauces: [
    { name: 'Strawberry Sauce', cn: '草莓酱', price: 0.75, emoji: '🍓' },
    { name: 'Caramel Drizzle', cn: '焦糖酱', price: 0.75, emoji: '🍮' },
    { name: 'Dark Chocolate Fudge', cn: '黑巧克力酱', price: 0.75, emoji: '🍫' },
    { name: 'Honey', cn: '蜂蜜', price: 0.50, emoji: '🍯' },
    { name: 'Mango Coulis', cn: '芒果汁', price: 0.75, emoji: '🥭' },
  ],
  dry: [
    { name: 'Rainbow Sprinkles', cn: '彩虹糖针', price: 0.50, emoji: '🌈' },
    { name: 'Crushed Oreo', cn: '奥利奥碎', price: 0.75, emoji: '🖤' },
    { name: 'Toasted Coconut', cn: '烤椰丝', price: 0.50, emoji: '🥥' },
    { name: 'Granola', cn: '燕麦脆', price: 0.75, emoji: '🌾' },
    { name: 'Mochi Bits', cn: '麻糬粒', price: 1.00, emoji: '⬜' },
    { name: 'Crushed Pistachios', cn: '开心果碎', price: 1.00, emoji: '💚' },
  ],
};

// ── Floating bubbles CSS ───────────────────────────────
const BUBBLE_CSS = `
@keyframes floatUp {
  0% { transform: translateY(110vh) scale(0.4); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.5; }
  100% { transform: translateY(-20vh) scale(1.1); opacity: 0; }
}
@keyframes wobble {
  0%, 100% { border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }
  25% { border-radius: 45% 55% 40% 60% / 60% 45% 55% 40%; }
  50% { border-radius: 55% 45% 60% 40% / 40% 55% 45% 60%; }
  75% { border-radius: 40% 60% 45% 55% / 55% 40% 60% 45%; }
}
@keyframes splashIn {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
  80% { transform: scale(0.96) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
`;

// ── Bubble splash screen ───────────────────────────────
const BUBBLE_COLORS = [
  '#C2773A', '#F5E6D3', '#4A4E8A', '#E8E9F5',
  '#7A9E5F', '#E8F2E0', '#3D2314', '#F0E6E0',
  '#FFD6E7', '#C8F0E0', '#FFF3B0', '#D4E8FF',
  '#FFB7C5', '#B5EAD7', '#FFDAC1', '#C7CEEA',
];

function Bubble({ color, size, left, delay, duration }: { color: string; size: number; left: number; delay: number; duration: number }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '-20%',
      left: `${left}%`,
      width: size,
      height: size,
      background: color,
      opacity: 0,
      animation: `floatUp ${duration}s ${delay}s ease-in-out forwards, wobble ${duration * 0.6}s ${delay}s ease-in-out infinite`,
    }} />
  );
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'bubbles' | 'logo' | 'exit'>('bubbles');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 800);
    const t2 = setTimeout(() => setPhase('exit'), 2600);
    const t3 = setTimeout(onDone, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  // Generate deterministic bubbles
  const bubbles = Array.from({ length: 22 }, (_, i) => ({
    color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
    size: 40 + (i * 17 % 70),
    left: (i * 23 + 5) % 95,
    delay: (i * 0.15) % 1.5,
    duration: 2.5 + (i * 0.3 % 1.5),
  }));

  return (
    <>
      <style>{BUBBLE_CSS}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#FFFBF7',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: phase === 'exit' ? 'opacity 0.6s, transform 0.6s' : 'none',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.05)' : 'scale(1)',
      }}>
        {/* Floating bubbles */}
        {bubbles.map((b, i) => <Bubble key={i} {...b} />)}

        {/* Logo — appears after bubbles start */}
        {phase !== 'bubbles' && (
          <div style={{
            position: 'relative', zIndex: 2, textAlign: 'center',
            animation: 'splashIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}>
            {/* Big logo text */}
            <div style={{
              fontSize: 72, fontWeight: 900, letterSpacing: -2,
              background: 'linear-gradient(135deg, #C2773A 0%, #4A4E8A 50%, #7A9E5F 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 2s linear infinite',
              fontFamily: '"Georgia", serif',
            }}>
              tomo
            </div>
            <div style={{
              fontSize: 13, color: '#888', letterSpacing: 4,
              textTransform: 'uppercase', fontWeight: 600, marginTop: -4,
            }}>
              Artisan Gelato
            </div>
            {/* Floating emoji ring */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 20, fontSize: 22, animation: 'fadeSlideUp 0.4s 0.2s both' }}>
              {['🍵', '🫐', '🌿', '🍫'].map((e, i) => (
                <span key={i} style={{ animation: `pulse 1.5s ${i * 0.15}s ease-in-out infinite` }}>{e}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Flavor detail modal ────────────────────────────────
function FlavorModal({ flavor, onClose }: { flavor: typeof FLAVORS[0]; onClose: () => void }) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  return (
    <>
      <style>{BUBBLE_CSS}</style>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        onClick={onClose}
      >
        <div
          style={{
            background: '#fff', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 480,
            height: '88dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            transform: `translateY(${dragY}px)`, transition: dragY === 0 ? 'transform 0.3s' : 'none',
            animation: 'fadeSlideUp 0.35s cubic-bezier(0.34,1.2,0.64,1)',
          }}
          onClick={e => e.stopPropagation()}
          onTouchStart={e => { startY.current = e.touches[0].clientY; }}
          onTouchMove={e => { if (startY.current) { const dy = e.touches[0].clientY - startY.current; if (dy > 0) setDragY(dy); } }}
          onTouchEnd={() => { if (dragY > 80) onClose(); setDragY(0); startY.current = null; }}
        >
          {/* Color hero */}
          <div style={{ background: flavor.colorLight, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
            {/* Decorative blobs */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: flavor.color, opacity: 0.15, borderRadius: '60% 40% 55% 45%' }} />
            <div style={{ position: 'absolute', bottom: -10, left: -10, width: 80, height: 80, background: flavor.color, opacity: 0.12, borderRadius: '45% 55% 40% 60%' }} />
            {/* Drag handle */}
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, background: 'rgba(0,0,0,0.15)', borderRadius: 999 }} />
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', marginTop: 6, fontSize: 9, color: 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap', paddingTop: 8 }}>下滑关闭</div>
            {/* Close */}
            <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>✕</button>
            {/* Big emoji */}
            <div style={{ fontSize: 72, animation: 'pulse 2s ease-in-out infinite' }}>{flavor.emoji}</div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 40px' }}>
            {/* Name + price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>{flavor.name}</div>
                <div style={{ fontSize: 15, color: flavor.color, fontWeight: 700, marginTop: 3 }}>{flavor.cn}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: flavor.color }}>${flavor.price.toFixed(2)}</div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {flavor.tags.map((tag, i) => (
                <span key={i} style={{ fontSize: 11, background: flavor.colorLight, color: flavor.colorDark, padding: '4px 12px', borderRadius: 999, fontWeight: 700 }}>{tag}</span>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginTop: 16, background: flavor.colorLight, borderRadius: 18, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: flavor.color, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>About this flavor</div>
              <p style={{ fontSize: 14, color: '#444', lineHeight: 1.8, margin: 0 }}>{flavor.desc}</p>
            </div>

            {/* Add toppings hint */}
            <div style={{ marginTop: 16, background: '#FFF8F0', borderRadius: 16, padding: '14px 16px', border: '1px dashed #FBBF7A', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>✨</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#C2773A' }}>Add a Topping!</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>Scroll down to customize · 加配料更好吃</div>
              </div>
            </div>

            <div style={{ height: 16 }} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main page ──────────────────────────────────────────
export default function TomoPage() {
  const [splashDone, setSplashDone] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState<typeof FLAVORS[0] | null>(null);

  return (
    <>
      <style>{BUBBLE_CSS}</style>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      {selectedFlavor && <FlavorModal flavor={selectedFlavor} onClose={() => setSelectedFlavor(null)} />}

      <div style={{
        minHeight: '100dvh', background: T.bg,
        fontFamily: '"Georgia", "Times New Roman", serif',
      }}>

        {/* Header */}
        <div style={{ padding: '28px 24px 0', textAlign: 'center' }}>
          <div style={{
            fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1,
            background: 'linear-gradient(135deg, #C2773A 0%, #4A4E8A 50%, #7A9E5F 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 4s linear infinite',
          }}>
            tomo
          </div>
          <div style={{ fontSize: 11, color: '#bbb', letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600, marginTop: 2, fontFamily: 'system-ui, sans-serif' }}>
            Artisan Gelato
          </div>
        </div>

        {/* Tagline */}
        <div style={{ textAlign: 'center', padding: '14px 32px 0', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>Small batch · Handcrafted daily · San Diego</div>
        </div>

        {/* ── FLAVORS ── */}
        <div style={{ padding: '28px 20px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
            Today's Flavors
          </div>

          {/* 2×2 bubble grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {FLAVORS.map((flavor, i) => (
              <div
                key={flavor.id}
                onClick={() => setSelectedFlavor(flavor)}
                style={{
                  background: flavor.colorLight,
                  borderRadius: 28,
                  padding: '22px 16px 18px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 4px 20px ${flavor.color}22`,
                  border: `1.5px solid ${flavor.color}18`,
                  animation: `fadeSlideUp 0.5s ${0.05 * i + 0.1}s both`,
                  minHeight: 160,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                {/* Decorative blob background */}
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 90, height: 90,
                  background: flavor.color, opacity: 0.12,
                  animation: `wobble 4s ${i * 0.7}s ease-in-out infinite`,
                }} />
                <div style={{
                  position: 'absolute', bottom: -15, left: -15,
                  width: 60, height: 60,
                  background: flavor.color, opacity: 0.08,
                  animation: `wobble 5s ${i * 0.5 + 1}s ease-in-out infinite`,
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 42, marginBottom: 8, animation: `pulse 2.5s ${i * 0.3}s ease-in-out infinite` }}>{flavor.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: flavor.colorDark, lineHeight: 1.2 }}>{flavor.name}</div>
                  <div style={{ fontSize: 11, color: flavor.color, marginTop: 2, fontFamily: 'system-ui,sans-serif', fontWeight: 600 }}>{flavor.cn}</div>
                </div>

                {/* Price pill */}
                <div style={{
                  position: 'relative', zIndex: 1,
                  marginTop: 12, background: flavor.color,
                  color: '#fff', fontSize: 13, fontWeight: 800,
                  padding: '5px 14px', borderRadius: 999,
                  fontFamily: 'system-ui, sans-serif',
                }}>
                  ${flavor.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOPPINGS ── */}
        <div style={{ padding: '32px 20px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
            Make it yours
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#ccc', fontFamily: 'system-ui,sans-serif', marginBottom: 20 }}>Toppings & Drizzles</div>

          {/* Sauces */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ height: 1, flex: 1, background: '#eee' }} />
              <div style={{ fontSize: 11, color: '#ccc', fontFamily: 'system-ui,sans-serif', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Sauces 酱料</div>
              <div style={{ height: 1, flex: 1, background: '#eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TOPPINGS.sauces.map((t, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0e8e0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{t.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'system-ui,sans-serif' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#bbb', fontFamily: 'system-ui,sans-serif' }}>{t.cn}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#C2773A', fontFamily: 'system-ui,sans-serif' }}>+${t.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dry toppings */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ height: 1, flex: 1, background: '#eee' }} />
              <div style={{ fontSize: 11, color: '#ccc', fontFamily: 'system-ui,sans-serif', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Dry Toppings 干料</div>
              <div style={{ height: 1, flex: 1, background: '#eee' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TOPPINGS.dry.map((t, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0e8e0' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: 'system-ui,sans-serif', lineHeight: 1.3 }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: '#bbb', fontFamily: 'system-ui,sans-serif', marginTop: 1 }}>{t.cn}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#C2773A', marginTop: 8, fontFamily: 'system-ui,sans-serif' }}>+${t.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon strip */}
        <div style={{ margin: '8px 20px 0', background: 'linear-gradient(135deg, #E8E9F5, #F5E6D3)', borderRadius: 20, padding: '18px 20px', border: '1.5px dashed #C2773A44' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#C2773A', fontFamily: 'system-ui,sans-serif' }}>🌸 More flavors coming soon</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 4, fontFamily: 'system-ui,sans-serif', lineHeight: 1.6 }}>
            Shaved ice · Snow jelly · Diamond ice · Yogurt series<br />
            <span style={{ fontSize: 10 }}>雪泥 · 刨冰 · 钻石冰 · 优格</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '28px 20px 48px', fontFamily: 'system-ui,sans-serif' }}>
          <div style={{ fontSize: 11, color: '#ddd' }}>7315 Clairemont Mesa Blvd, San Diego, CA</div>
          <div style={{ fontSize: 10, color: '#e8e8e8', marginTop: 4 }}>© 2026 Luxtyle Creations Inc.</div>
        </div>
      </div>
    </>
  );
}
