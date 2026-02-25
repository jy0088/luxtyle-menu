'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ── Brand Colors ───────────────────────────────────────
const Y = {
  orange: '#D95F1A',
  orangeLight: '#F07030',
  orangeBg: '#FFF4ED',
  orangeDark: '#B34A10',
  cream: '#FAF0E6',
  text: '#1A1A1A',
  sub: '#666',
  faint: '#aaa',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.5)',
  spicyRed: '#E53E3E',
  greenSafe: '#2D7D46',
};

// ── Splash Screen ──────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'show' | 'exit'>('show');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 2000);
    const t2 = setTimeout(onDone, 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.5s',
      transform: phase === 'exit' ? 'translateY(-100%)' : 'translateY(0)',
      opacity: phase === 'exit' ? 0 : 1,
    }}>
      <img src="/ygf-cover.jpg" alt="YGF" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* Logo centered */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        <img src="/ygf-logo.png" alt="Yangguofu" style={{ width: 140, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))' }} />
        <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: 3, fontWeight: 600, textTransform: 'uppercase' }}>
          Malatang
        </div>
      </div>
    </div>
  );
}

// ── Slide data ─────────────────────────────────────────
const SLIDES = [
  { id: 'welcome' },
  { id: 'step1' },
  { id: 'step2' },
  { id: 'step3' },
  { id: 'broth-beef' },
  { id: 'broth-tomato' },
  { id: 'broth-tomyum' },
  { id: 'broth-drymix' },
  { id: 'ingredients' },
  { id: 'price' },
  { id: 'promo' },
];

// ── Spicy indicators ───────────────────────────────────
function SpicyDots({ level }: { level: 0 | 1 | 2 | 3 }) {
  const labels = ['NON-SPICY / 不辣', 'MILD SPICY / 微辣 🌶', 'MEDIUM SPICY / 中辣 🌶🌶', 'FLAMING SPICY / 大辣 🌶🌶🌶'];
  const colors = [Y.greenSafe, Y.orange, Y.orangeLight, Y.spicyRed];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: colors[level], letterSpacing: 0.5 }}>
        {labels[level]}
      </span>
    </div>
  );
}

// ── Individual Slides ──────────────────────────────────

function WelcomeSlide() {
  return (
    <div style={{ width: '100%', height: '100%', background: Y.orange, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative', overflow: 'hidden' }}>
      {/* Background pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.08, fontSize: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>🍲</div>
      <img src="/ygf-logo.png" alt="YGF" style={{ width: 120, marginBottom: 24, filter: 'brightness(10)' }} />
      <div style={{ fontSize: 28, fontWeight: 900, color: Y.white, textAlign: 'center', lineHeight: 1.2 }}>
        Yang Guo Fu
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: 4, letterSpacing: 2 }}>
        麻辣烫
      </div>
      <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.7, maxWidth: 280 }}>
        Authentic Chinese Malatang<br />Fresh · Customizable · Flavorful
      </div>
      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
        <span>Swipe to explore</span>
        <span style={{ fontSize: 16 }}>→</span>
      </div>
    </div>
  );
}

function Step1Slide() {
  return (
    <div style={{ width: '100%', height: '100%', background: Y.cream, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: Y.orange, padding: '20px 24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.2)', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 800, color: Y.white, letterSpacing: 1, marginBottom: 8 }}>
          STEP 01 · 第一步
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: Y.white, lineHeight: 1.2 }}>Build Your Bowl</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>自选食材</div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        <p style={{ fontSize: 14, color: Y.sub, lineHeight: 1.7, marginBottom: 20 }}>
          Grab a bowl and tongs, then fill it with everything you love — fresh veggies, noodles, meat, seafood, and more. Everything you pick will be cooked together in one bowl.
        </p>
        {/* Ingredient categories */}
        {[
          { icon: '🥬', label: 'Vegetables', sub: '蔬菜类', items: 'Leafy greens, Mushrooms, Lotus root, Corn, Tofu...' },
          { icon: '🥩', label: 'Meats', sub: '肉类', items: 'Beef slices, Pork, Lamb, Chicken...' },
          { icon: '🦐', label: 'Seafood', sub: '海鲜类', items: 'Shrimp, Fish tofu, Crab sticks, Clams...' },
          { icon: '🍜', label: 'Noodles & Starch', sub: '主食类', items: 'Glass noodles, Ramen, Rice cake, Sweet potato noodles...' },
          { icon: '🟡', label: 'Balls & Skewers', sub: '丸子串类', items: 'Fish balls, Meatballs, Shrimp paste...' },
        ].map((cat, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, background: Y.white, borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{cat.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: Y.text }}>{cat.label} <span style={{ fontWeight: 400, color: Y.faint }}>{cat.sub}</span></div>
              <div style={{ fontSize: 11, color: Y.faint, marginTop: 2, lineHeight: 1.5 }}>{cat.items}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2Slide() {
  return (
    <div style={{ width: '100%', height: '100%', background: Y.cream, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: Y.orange, padding: '20px 24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.2)', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 800, color: Y.white, letterSpacing: 1, marginBottom: 8 }}>
          STEP 02 · 第二步
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: Y.white, lineHeight: 1.2 }}>Weigh & Choose Broth</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>称重 · 选汤底</div>
      </div>
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        {/* Price callout */}
        <div style={{ background: Y.orange, borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Ingredients price</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Weighed at counter</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: Y.white }}>$14.99<span style={{ fontSize: 14, fontWeight: 600 }}>/lb</span></div>
        </div>
        <p style={{ fontSize: 14, color: Y.sub, lineHeight: 1.7, marginBottom: 16 }}>
          We'll weigh your ingredients, then cook them in your chosen broth. Choose from 4 broth styles — swipe to see each one in detail.
        </p>
        {/* 4 broths quick overview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { name: 'Classic Herbal\nBeef Bone Broth', cn: '经典草本骨汤', spicy: 1, extra: '+$2.99/bowl', badge: '经典原创', img: '/ygf-broth-beef.png' },
            { name: 'Sweet & Sour\nTomato Broth', cn: '酸甜番茄汤', spicy: 0, badge: '招牌推荐', img: '/ygf-broth-tomato.png' },
            { name: 'Tom Yum\nBroth', cn: '酸辣冬阴功汤', spicy: 1, badge: '新品上市', img: '/ygf-broth-tomyum.png' },
            { name: 'Spicy Dry Mix', cn: '石磨醇香麻辣拌', spicy: 1, badge: '(No Soup)', img: '/ygf-broth-drymix.png' },
          ].map((b, i) => (
            <div key={i} style={{ background: Y.white, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <img src={b.img} alt={b.name} style={{ width: '100%', height: 70, objectFit: 'cover' }} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: Y.text, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{b.name}</div>
                <div style={{ fontSize: 9, color: Y.faint }}>{b.cn}</div>
                {b.extra && <div style={{ fontSize: 9, color: Y.orange, fontWeight: 700, marginTop: 2 }}>{b.extra}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Slide() {
  const sauces = [
    ['Garlic', 'Green Onion', 'Cilantro', 'Chili Pepper'],
    ['Salt', 'Sugar', 'Sesame Sauce', 'Sesame Oil', 'Peppercorn Oil'],
    ['Satay Sauce', 'Hoisin Sauce', 'Oyster Sauce', 'Vinegar', 'Soy Sauce'],
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: Y.cream, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: Y.orange, padding: '20px 24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.2)', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 800, color: Y.white, letterSpacing: 1, marginBottom: 8 }}>
          STEP 03 · 第三步
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: Y.white, lineHeight: 1.2 }}>Customize Your Flavor</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>自助调味</div>
      </div>
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        <p style={{ fontSize: 14, color: Y.sub, lineHeight: 1.7, marginBottom: 20 }}>
          After it's cooked, head to the <strong style={{ color: Y.orange }}>Self-Service Bar</strong> to add your own sauces, aromatics, and seasonings. Make it yours.
        </p>
        <div style={{ fontSize: 11, fontWeight: 800, color: Y.faint, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Available Condiments</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {sauces.map((col, ci) => (
            <div key={ci} style={{ background: Y.white, borderRadius: 12, padding: '10px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {col.map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: Y.text, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{s}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, background: Y.orangeBg, borderRadius: 12, padding: '12px 14px', fontSize: 12, color: Y.orange, fontWeight: 600, textAlign: 'center' }}>
          🎉 Free self-service sauce bar included with every order!
        </div>
      </div>
    </div>
  );
}

function BrothSlide({ broth }: {
  broth: {
    nameEn: string; nameCn: string; img: string;
    spicy: 0 | 1 | 2 | 3; desc: string; badge?: string;
    extra?: string; tag?: string;
  }
}) {
  return (
    <div style={{ width: '100%', height: '100%', background: Y.cream, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Full-width broth image */}
      <div style={{ position: 'relative', flexShrink: 0, height: '45%' }}>
        <img src={broth.img} alt={broth.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)' }} />
        {broth.badge && (
          <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(201,168,76,0.95)', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 800, color: '#3a2800', backdropFilter: 'blur(4px)' }}>
            {broth.badge}
          </div>
        )}
        {broth.tag && (
          <div style={{ position: 'absolute', top: 14, left: 14, background: Y.orange, borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 800, color: Y.white }}>
            {broth.tag}
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: Y.orange, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Broth Selection · 汤底选择</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: Y.text, lineHeight: 1.2 }}>{broth.nameEn}</div>
        <div style={{ fontSize: 15, color: Y.sub, marginTop: 3 }}>{broth.nameCn}</div>
        <SpicyDots level={broth.spicy} />
        {broth.extra && (
          <div style={{ marginTop: 8, display: 'inline-block', background: Y.orange, color: Y.white, fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 999 }}>
            {broth.extra}
          </div>
        )}
        <p style={{ fontSize: 13, color: Y.sub, lineHeight: 1.7, marginTop: 14 }}>{broth.desc}</p>
      </div>
    </div>
  );
}

function IngredientsSlide() {
  const categories = [
    { icon: '🥬', label: 'Vegetables', cn: '蔬菜', items: ['Napa Cabbage', 'Spinach', 'Lotus Root', 'Corn', 'Mushrooms', 'Enoki', 'Bean Sprouts', 'Tofu'] },
    { icon: '🥩', label: 'Meats', cn: '肉类', items: ['Beef Slices', 'Pork Belly', 'Lamb', 'Chicken'] },
    { icon: '🦐', label: 'Seafood', cn: '海鲜', items: ['Shrimp', 'Fish Tofu', 'Crab Sticks', 'Fish Cake'] },
    { icon: '🍜', label: 'Noodles', cn: '主食', items: ['Glass Noodles', 'Sweet Potato Noodles', 'Rice Cake', 'Ramen'] },
    { icon: '🟡', label: 'Balls', cn: '丸子', items: ['Fish Balls', 'Beef Balls', 'Shrimp Balls', 'Mixed Balls'] },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: Y.cream, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: Y.orange, padding: '20px 24px 16px', flexShrink: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: Y.white }}>Ingredient Buffet</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>自选食材区 · $14.99 / lb</div>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {categories.map((cat, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: Y.text }}>{cat.label}</span>
              <span style={{ fontSize: 11, color: Y.faint }}>{cat.cn}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {cat.items.map((item, j) => (
                <span key={j} style={{ fontSize: 11, background: Y.white, border: `1px solid #eee`, borderRadius: 999, padding: '3px 10px', color: Y.text, fontWeight: 500 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 8, fontSize: 10, color: Y.faint, textAlign: 'center' }}>
          * Menu items may vary. Ask staff for today's selection.
        </div>
      </div>
    </div>
  );
}

function PriceSlide() {
  return (
    <div style={{ width: '100%', height: '100%', background: Y.orange, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Pricing</div>
      {/* Main price */}
      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 24, padding: '24px 36px', textAlign: 'center', marginBottom: 20, width: '100%' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Ingredients (by weight)</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: Y.white, lineHeight: 1 }}>$14.99</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>per pound · 每磅</div>
      </div>
      {/* Add-ons */}
      {[
        { label: 'Classic Herbal Beef Bone Broth', cn: '经典草本骨汤', price: '+$2.99/bowl' },
        { label: 'Sweet & Sour Tomato Broth', cn: '酸甜番茄汤', price: 'Included' },
        { label: 'Tom Yum Broth', cn: '酸辣冬阴功汤', price: 'Included' },
        { label: 'Spicy Dry Mix', cn: '麻辣拌 (无汤)', price: 'Included' },
      ].map((item, i) => (
        <div key={i} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: Y.white }}>{item.label}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{item.cn}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: item.price === 'Included' ? '#90EE90' : Y.white }}>{item.price}</div>
        </div>
      ))}
      <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
        Self-service sauce bar included · Tax not included
      </div>
    </div>
  );
}

function PromoSlide() {
  return (
    <div style={{ width: '100%', height: '100%', background: Y.cream, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${Y.orangeDark}, ${Y.orange})`, padding: '20px 24px 16px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 100, opacity: 0.1 }}>🎉</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Current Promotion · 当前活动</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: Y.white }}>Special Offers</div>
      </div>
      {/* Promo cards */}
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {/* Lunch special */}
        <div style={{ background: Y.white, borderRadius: 18, overflow: 'hidden', marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ background: Y.orange, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: Y.white }}>🕐 Lunch Special</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Mon – Fri · 11am – 3pm</div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: Y.text }}>10% OFF</div>
            <div style={{ fontSize: 12, color: Y.sub, marginTop: 4 }}>Dine-in only. Cannot be combined with other offers.</div>
            <div style={{ marginTop: 8, fontSize: 11, color: Y.faint }}>周一至周五 上午11点–下午3点 堂食享9折</div>
          </div>
        </div>

        {/* Group deal */}
        <div style={{ background: Y.white, borderRadius: 18, overflow: 'hidden', marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ background: '#D97706', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: Y.white }}>👥 Group Deal</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>4+ guests</div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: Y.text }}>Free Drinks</div>
            <div style={{ fontSize: 12, color: Y.sub, marginTop: 4 }}>4 guests or more get 1 complimentary drink per table.</div>
            <div style={{ marginTop: 8, fontSize: 11, color: Y.faint }}>4人及以上同桌用餐，赠送1杯饮料</div>
          </div>
        </div>

        {/* Promo template placeholder */}
        <div style={{ background: Y.orangeBg, borderRadius: 18, padding: '16px', border: `2px dashed ${Y.orange}`, textAlign: 'center' }}>
          <div style={{ fontSize: 20 }}>📢</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: Y.orange, marginTop: 6 }}>More Promotions Coming Soon</div>
          <div style={{ fontSize: 11, color: Y.faint, marginTop: 4 }}>Ask our staff for today's specials!</div>
        </div>
      </div>
    </div>
  );
}

// ── Broth data ─────────────────────────────────────────
const BROTHS = [
  {
    id: 'broth-beef',
    nameEn: 'Classic Herbal Beef Bone Broth',
    nameCn: '经典草本骨汤',
    img: '/ygf-broth-beef.png',
    spicy: 1 as const,
    badge: '经典原创',
    extra: '+$2.99 / per bowl',
    tag: 'Signature',
    desc: 'Our signature broth made from slow-cooked beef bones with aromatic herbs. Rich, savory, and deeply nourishing — the classic choice. Available in Mild, Medium, and Flaming Spicy.',
  },
  {
    id: 'broth-tomato',
    nameEn: 'Sweet & Sour Tomato Broth',
    nameCn: '酸甜番茄汤',
    img: '/ygf-broth-tomato.png',
    spicy: 0 as const,
    badge: '招牌推荐',
    tag: '100% Vegan',
    desc: 'A refreshing, tangy broth bursting with natural tomato sweetness. Non-spicy and 100% vegan — perfect for those who prefer a lighter, fruity flavor profile.',
  },
  {
    id: 'broth-tomyum',
    nameEn: 'Tom Yum Broth',
    nameCn: '酸辣冬阴功汤',
    img: '/ygf-broth-tomyum.png',
    spicy: 1 as const,
    badge: '新品上市',
    tag: 'NEW',
    desc: 'Inspired by the classic Thai Tom Yum soup — aromatic lemongrass, galangal, and chili create a bold hot & sour flavor. A refreshing twist on traditional malatang.',
  },
  {
    id: 'broth-drymix',
    nameEn: 'Grind Pleasant Spicy Dry Mix',
    nameCn: '石磨醇香麻辣拌',
    img: '/ygf-broth-drymix.png',
    spicy: 1 as const,
    badge: '酱汁浓郁',
    tag: 'No Soup',
    desc: 'No broth, all flavor. Stone-ground Sichuan spices coat every ingredient in a rich, aromatic sauce. Intensely savory, numbing, and satisfying — for spice lovers.',
  },
];

// ── Main slide renderer ────────────────────────────────
function SlideContent({ id }: { id: string }) {
  const broth = BROTHS.find(b => b.id === id);
  if (broth) return <BrothSlide broth={broth} />;
  switch (id) {
    case 'welcome': return <WelcomeSlide />;
    case 'step1': return <Step1Slide />;
    case 'step2': return <Step2Slide />;
    case 'step3': return <Step3Slide />;
    case 'ingredients': return <IngredientsSlide />;
    case 'price': return <PriceSlide />;
    case 'promo': return <PromoSlide />;
    default: return null;
  }
}

// ── Progress dots ──────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6,
          height: 6, borderRadius: 999,
          background: i === current ? Y.orange : '#ddd',
          transition: 'all 0.25s',
        }} />
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function YGFPage() {
  const [splashDone, setSplashDone] = useState(false);
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((idx: number) => {
    if (idx >= 0 && idx < SLIDES.length) setCurrent(idx);
  }, []);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) dx < 0 ? goTo(current + 1) : goTo(current - 1);
    startX.current = null;
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, goTo]);

  return (
    <div style={{ height: '100dvh', background: Y.cream, display: 'flex', flexDirection: 'column', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', overflow: 'hidden', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      {/* Top bar */}
      <div style={{ background: Y.white, borderBottom: '1px solid #f0e8e0', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <img src="/ygf-logo.png" alt="YGF" style={{ height: 32 }} />
        <div style={{ fontSize: 11, color: Y.faint, fontWeight: 600 }}>{current + 1} / {SLIDES.length}</div>
      </div>

      {/* Slide area */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <SlideContent id={SLIDES[current].id} />
      </div>

      {/* Bottom nav */}
      <div style={{ background: Y.white, borderTop: '1px solid #f0e8e0', padding: '6px 16px 10px', flexShrink: 0 }}>
        <ProgressDots total={SLIDES.length} current={current} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            style={{ background: current === 0 ? '#f5f5f5' : Y.orangeBg, color: current === 0 ? Y.faint : Y.orange, border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: current === 0 ? 'default' : 'pointer' }}
          >
            ← Prev
          </button>
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === SLIDES.length - 1}
            style={{ background: current === SLIDES.length - 1 ? '#f5f5f5' : Y.orange, color: current === SLIDES.length - 1 ? Y.faint : Y.white, border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: current === SLIDES.length - 1 ? 'default' : 'pointer' }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
