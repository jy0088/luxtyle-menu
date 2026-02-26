git add .
git commit -m "feat: dark homepage + YGF full rebuild + swipe-to-close"
git push'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const Y = {
  orange: '#D95F1A', orangeLight: '#F07030', orangeBg: '#FFF4ED',
  orangeDark: '#B34A10', cream: '#FAF5EE', text: '#1A1A1A',
  sub: '#666', faint: '#aaa', white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.55)', gold: '#C9A060',
};

// ── Splash ─────────────────────────────────────────────
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
      <img src="/ygf-cover.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* Dark overlay for text readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)' }} />
      {/* Brand text only - no logo */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: 3, textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}>
          杨国福
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: 6, marginTop: 8, textTransform: 'uppercase', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
          Malatang
        </div>
        <div style={{ marginTop: 24, width: 40, height: 2, background: 'rgba(255,255,255,0.5)', borderRadius: 999 }} />
        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>
          San Diego #1
        </div>
      </div>
    </div>
  );
}

// ── HOW TO EAT: 3-step horizontal swiper ──────────────
const STEPS = [
  {
    num: '01', title: 'Build Your Bowl', cn: '自选食材',
    desc: 'Grab a bowl and tongs. Fill it with fresh vegetables, noodles, meats, seafood — anything you love. It all gets cooked together.',
    icon: '🥣',
    items: ['🥬 Vegetables', '🥩 Meats', '🦐 Seafood', '🍜 Noodles', '🟡 Fish Balls'],
  },
  {
    num: '02', title: 'Weigh & Choose Broth', cn: '称重选汤底',
    desc: "We'll weigh your bowl at the counter and cook everything in your chosen broth. Pick from 4 styles.",
    icon: '⚖️',
    items: ['🦴 Beef Bone Broth', '🍅 Tomato Broth', '🍋 Tom Yum Broth', '🌶 Dry Spicy Mix'],
    price: '$14.99 / lb',
  },
  {
    num: '03', title: 'Customize Your Flavor', cn: '自助调味',
    desc: 'After cooking, head to our self-service sauce bar. Mix your own perfect flavor combination.',
    icon: '🧂',
    items: ['Garlic · Green Onion', 'Sesame Sauce · Soy', 'Oyster Sauce · Vinegar', 'Peppercorn Oil · Chili'],
  },
];

function HowToEat({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const startX = useRef<number | null>(null);

  const next = () => { if (step < 2) setStep(s => s + 1); else onDone(); };
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const s = STEPS[step];
  return (
    <div style={{ height: '100dvh', background: '#0D0D0D', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}
      onTouchStart={e => { startX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (!startX.current) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (dx < -40) next(); else if (dx > 40) prev();
        startX.current = null;
      }}
    >
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '20px 0 0' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 999, background: i === step ? Y.orange : '#333', transition: 'all 0.25s' }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 28px' }}>
        {/* Step number */}
        <div style={{ fontSize: 11, fontWeight: 700, color: Y.orange, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
          STEP {s.num} · HOW TO EAT
        </div>

        {/* Big icon */}
        <div style={{ fontSize: 64, marginBottom: 20 }}>{s.icon}</div>

        {/* Title */}
        <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>{s.title}</div>
        <div style={{ fontSize: 16, color: Y.orange, marginTop: 6, fontWeight: 600 }}>{s.cn}</div>

        {/* Description */}
        <div style={{ fontSize: 14, color: '#888', lineHeight: 1.7, textAlign: 'center', marginTop: 16, maxWidth: 300 }}>{s.desc}</div>

        {/* Price callout for step 2 */}
        {s.price && (
          <div style={{ marginTop: 20, background: Y.orange, borderRadius: 14, padding: '10px 24px', fontSize: 20, fontWeight: 900, color: '#fff' }}>
            {s.price}
          </div>
        )}

        {/* Items */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          {s.items.map((item, i) => (
            <span key={i} style={{ fontSize: 12, background: '#1a1a1a', border: '1px solid #333', color: '#ccc', padding: '5px 12px', borderRadius: 999 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Bottom buttons */}
      <div style={{ padding: '0 24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={prev} disabled={step === 0}
          style={{ background: step === 0 ? 'transparent' : '#1a1a1a', color: step === 0 ? 'transparent' : '#666', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          ← Back
        </button>
        <button onClick={next}
          style={{ background: Y.orange, color: '#fff', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 20px ${Y.orange}66` }}>
          {step < 2 ? "Next →" : "Let's Eat! 🍲"}
        </button>
      </div>
    </div>
  );
}

// ── MENU: Overview + Detail pages ─────────────────────
type MenuView = 'overview' | 'broths' | 'sauces' | 'items' | 'promo';

const OVERVIEW_CARDS = [
  { id: 'broths' as MenuView, icon: '🍲', title: 'Broth Selection', cn: '汤底选择', desc: '4 signature styles', color: '#D95F1A', glow: 'rgba(217,95,26,0.3)' },
  { id: 'sauces' as MenuView, icon: '🥫', title: 'Sauce Bar', cn: '酱料搭配', desc: 'Self-service · Free', color: '#D97706', glow: 'rgba(217,119,6,0.3)' },
  { id: 'items' as MenuView, icon: '🥬', title: 'Ingredients', cn: '菜品一览', desc: 'Fresh daily selection', color: '#16A34A', glow: 'rgba(22,163,74,0.3)' },
  { id: 'promo' as MenuView, icon: '🎉', title: 'Promotions', cn: '当季活动', desc: 'Current deals', color: '#7C3AED', glow: 'rgba(124,58,237,0.3)' },
];

const BROTHS = [
  {
    name: 'Classic Herbal\nBeef Bone Broth', cn: '经典草本骨汤', img: '/ygf-broth-beef.png',
    badge: '经典原创', tag: 'Signature', spicy: '🌶 Mild · 🌶🌶 Medium · 🌶🌶🌶 Flaming',
    extra: '+$2.99 / bowl',
    desc: 'Slow-cooked beef bones with aromatic herbs. Rich, savory, deeply nourishing. The original YGF classic — choose your spice level.',
    color: '#D95F1A',
  },
  {
    name: 'Sweet & Sour\nTomato Broth', cn: '酸甜番茄汤', img: '/ygf-broth-tomato.png',
    badge: '招牌推荐', tag: '100% Vegan',
    spicy: '🟢 Non-Spicy',
    desc: 'Refreshing tangy broth bursting with natural tomato sweetness. Light, fruity, 100% vegan. Perfect for those who prefer no heat.',
    color: '#DC2626',
  },
  {
    name: 'Tom Yum Broth', cn: '酸辣冬阴功汤', img: '/ygf-broth-tomyum.png',
    badge: '新品上市', tag: 'NEW',
    spicy: '🌶 Hot & Sour',
    desc: 'Inspired by Thai Tom Yum — bold lemongrass, galangal, and chili. A refreshing hot & sour twist on classic malatang.',
    color: '#D97706',
  },
  {
    name: 'Grind Pleasant\nSpicy Dry Mix', cn: '石磨醇香麻辣拌', img: '/ygf-broth-drymix.png',
    badge: '酱汁浓郁', tag: 'No Soup',
    spicy: '🌶 Mild Spicy',
    desc: 'No broth, all flavor. Stone-ground Sichuan spices coat every ingredient in a rich aromatic sauce. For the true spice lover.',
    color: '#7C3AED',
  },
];

function BrothDetail({ broth, onBack }: { broth: typeof BROTHS[0]; onBack: () => void }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: Y.cream }}>
      {/* Image hero */}
      <div style={{ position: 'relative', height: 260, flexShrink: 0 }}>
        <img src={broth.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%)' }} />
        <button onClick={onBack} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>←</button>
        {broth.tag && <span style={{ position: 'absolute', top: 16, right: 16, background: Y.orange, color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 999 }}>{broth.tag}</span>}
        {broth.badge && <span style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(201,160,96,0.92)', color: '#3a2800', fontSize: 13, fontWeight: 800, padding: '6px 14px', borderRadius: 999 }}>{broth.badge}</span>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 22px 32px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: Y.orange, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Broth · 汤底</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: Y.text, lineHeight: 1.2, whiteSpace: 'pre-line' }}>{broth.name}</div>
        <div style={{ fontSize: 16, color: Y.sub, marginTop: 6 }}>{broth.cn}</div>
        <div style={{ marginTop: 12, fontSize: 13, color: broth.color, fontWeight: 700 }}>{broth.spicy}</div>
        {broth.extra && <div style={{ marginTop: 8, display: 'inline-block', background: Y.orange, color: '#fff', fontSize: 13, fontWeight: 800, padding: '5px 14px', borderRadius: 999 }}>{broth.extra}</div>}
        <p style={{ fontSize: 14, color: Y.sub, lineHeight: 1.8, marginTop: 18, padding: '16px', background: '#fff', borderRadius: 16 }}>{broth.desc}</p>
      </div>
    </div>
  );
}

function BrothsView() {
  const [selected, setSelected] = useState<number | null>(null);
  if (selected !== null) return <BrothDetail broth={BROTHS[selected]} onBack={() => setSelected(null)} />;
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
      <div style={{ fontSize: 13, color: Y.sub, marginBottom: 16, lineHeight: 1.6 }}>
        Choose your favorite broth — we cook your ingredients right in it. Swipe each card for details.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {BROTHS.map((b, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'stretch', border: '1px solid #eee' }}>
            <img src={b.img} alt="" style={{ width: 120, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, padding: '14px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: Y.text, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: Y.sub, marginTop: 2 }}>{b.cn}</div>
                </div>
                {b.badge && <span style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 999, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8 }}>{b.badge}</span>}
              </div>
              <div style={{ fontSize: 11, color: b.color, fontWeight: 600, marginTop: 8 }}>{b.spicy}</div>
              {b.extra && <div style={{ fontSize: 11, color: Y.orange, fontWeight: 700, marginTop: 4 }}>{b.extra}</div>}
              <div style={{ fontSize: 11, color: Y.faint, marginTop: 6 }}>Tap for details →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SaucesView() {
  const cols = [
    { title: 'Aromatics 香辛料', items: ['Garlic 大蒜', 'Green Onion 葱', 'Cilantro 香菜', 'Chili Pepper 辣椒'] },
    { title: 'Seasonings 基础调料', items: ['Salt 盐', 'Sugar 糖', 'Sesame Sauce 芝麻酱', 'Sesame Oil 芝麻油', 'Peppercorn Oil 花椒油'] },
    { title: 'Sauces 复合酱料', items: ['Satay Sauce 沙茶酱', 'Hoisin Sauce 海鲜酱', 'Oyster Sauce 蚝油', 'Vinegar 醋', 'Soy Sauce 酱油'] },
  ];
  const pairings = [
    { broth: 'Beef Bone Broth', sauce: 'Sesame Sauce + Garlic + Green Onion', icon: '🦴' },
    { broth: 'Tomato Broth', sauce: 'Sugar + Vinegar + Cilantro', icon: '🍅' },
    { broth: 'Tom Yum Broth', sauce: 'Chili + Lime + Green Onion', icon: '🍋' },
    { broth: 'Dry Spicy Mix', sauce: 'Sesame Oil + Garlic + Soy Sauce', icon: '🌶' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
      <div style={{ background: Y.orange, borderRadius: 16, padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>🎁</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Free Self-Service Sauce Bar</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Included with every order · 免费随餐提供</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: Y.text, marginBottom: 12 }}>All Available Condiments</div>
      {cols.map((col, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: Y.orange, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>{col.title}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {col.items.map((item, j) => (
              <span key={j} style={{ fontSize: 12, background: Y.orangeBg, color: Y.orangeDark, padding: '4px 10px', borderRadius: 999, fontWeight: 500 }}>{item}</span>
            ))}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 13, fontWeight: 800, color: Y.text, margin: '18px 0 12px' }}>Chef's Pairing Suggestions 搭配推荐</div>
      {pairings.map((p, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: 22 }}>{p.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: Y.text }}>{p.broth}</div>
            <div style={{ fontSize: 11, color: Y.sub, marginTop: 2 }}>+ {p.sauce}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IngredientsView() {
  const cats = [
    { icon: '🥬', label: 'Vegetables', cn: '蔬菜类', color: '#16A34A', items: ['Napa Cabbage 白菜', 'Spinach 菠菜', 'Lotus Root 藕', 'Corn 玉米', 'Mushroom 香菇', 'Enoki 金针菇', 'Bean Sprouts 豆芽', 'Tofu 豆腐', 'Broccoli 西兰花', 'Potato 土豆'] },
    { icon: '🥩', label: 'Meats', cn: '肉类', color: '#DC2626', items: ['Beef Slices 牛肉', 'Pork Belly 五花肉', 'Lamb 羊肉', 'Chicken 鸡肉'] },
    { icon: '🦐', label: 'Seafood', cn: '海鲜类', color: '#0369A1', items: ['Shrimp 虾', 'Fish Tofu 鱼豆腐', 'Crab Stick 蟹棒', 'Fish Cake 鱼饼', 'Clam 蛤蜊'] },
    { icon: '🍜', label: 'Noodles & Starch', cn: '主食类', color: '#D97706', items: ['Glass Noodles 粉丝', 'Sweet Potato Noodles 红薯粉', 'Rice Cake 年糕', 'Ramen 拉面', 'Udon 乌冬面'] },
    { icon: '🟡', label: 'Balls & Skewers', cn: '丸子串类', color: '#7C3AED', items: ['Fish Balls 鱼丸', 'Beef Balls 牛肉丸', 'Shrimp Balls 虾丸', 'Mixed Balls 什锦丸', 'Spam 午餐肉'] },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', marginBottom: 16, border: `1px solid #eee` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: Y.sub }}>All ingredients priced at</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: Y.orange }}>$14.99<span style={{ fontSize: 13, fontWeight: 500 }}>/lb</span></div>
        </div>
        <div style={{ fontSize: 11, color: Y.faint, marginTop: 4 }}>* Selection varies daily. Ask staff for today's items.</div>
      </div>
      {cats.map((cat, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{cat.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: Y.text }}>{cat.label}</span>
            <span style={{ fontSize: 11, color: Y.faint }}>{cat.cn}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cat.items.map((item, j) => (
              <span key={j} style={{ fontSize: 12, background: `${cat.color}12`, color: cat.color, border: `1px solid ${cat.color}30`, padding: '3px 10px', borderRadius: 999, fontWeight: 500 }}>{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PromoView() {
  const promos = [
    { icon: '🕐', title: 'Lunch Special', tag: 'Mon–Fri · 11am–3pm', color: Y.orange, deal: '10% OFF', desc: 'Dine-in only. Cannot be combined.', cn: '周一至周五 上午11点–下午3点 堂食享9折' },
    { icon: '👥', title: 'Group Deal', tag: '4+ Guests', color: '#D97706', deal: 'Free Drink', desc: '1 complimentary drink per table of 4+.', cn: '4人及以上同桌用餐，赠送1杯饮料' },
    { icon: '⭐', title: 'First Visit', tag: 'New Customers', color: '#7C3AED', deal: 'Free Topping', desc: 'Show this menu on your first visit.', cn: '首次到店顾客，出示此菜单获赠配料' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
      <div style={{ fontSize: 13, color: Y.sub, marginBottom: 18, lineHeight: 1.6 }}>
        Current promotions and seasonal specials. Ask staff for more details!
      </div>
      {promos.map((p, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <div style={{ background: p.color, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{p.title}</span>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 999 }}>{p.tag}</span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: Y.text }}>{p.deal}</div>
            <div style={{ fontSize: 13, color: Y.sub, marginTop: 4 }}>{p.desc}</div>
            <div style={{ fontSize: 11, color: Y.faint, marginTop: 6 }}>{p.cn}</div>
          </div>
        </div>
      ))}
      <div style={{ background: Y.orangeBg, borderRadius: 16, padding: '16px', border: `2px dashed ${Y.orange}`, textAlign: 'center' }}>
        <div style={{ fontSize: 18 }}>📢</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: Y.orange, marginTop: 6 }}>More Promotions Coming Soon</div>
        <div style={{ fontSize: 11, color: Y.faint, marginTop: 4 }}>Ask our staff for today's specials · 询问员工今日特价</div>
      </div>
    </div>
  );
}

function MenuOverview({ onSelect }: { onSelect: (v: MenuView) => void }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
      {/* Price banner */}
      <div style={{ background: `linear-gradient(135deg, ${Y.orangeDark}, ${Y.orange})`, borderRadius: 18, padding: '18px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: `0 4px 20px ${Y.orange}44` }}>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Ingredients by weight</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>称重计价 · 自助选菜</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1 }}>$14.99</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>per pound</div>
        </div>
      </div>

      {/* 4 category cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {OVERVIEW_CARDS.map(card => (
          <div key={card.id} onClick={() => onSelect(card.id)}
            style={{ background: '#fff', borderRadius: 18, padding: '18px 14px', cursor: 'pointer', border: `1px solid ${card.color}22`, boxShadow: `0 2px 12px ${card.glow}, 0 1px 4px rgba(0,0,0,0.06)`, position: 'relative', overflow: 'hidden' }}>
            {/* Color accent top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '18px 18px 0 0' }} />
            <div style={{ fontSize: 32, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: Y.text, lineHeight: 1.3 }}>{card.title}</div>
            <div style={{ fontSize: 12, color: card.color, fontWeight: 600, marginTop: 2 }}>{card.cn}</div>
            <div style={{ fontSize: 11, color: Y.faint, marginTop: 6 }}>{card.desc}</div>
            <div style={{ marginTop: 12, fontSize: 12, color: card.color, fontWeight: 700 }}>Explore →</div>
          </div>
        ))}
      </div>

      {/* Quick broth preview */}
      <div style={{ marginTop: 18, fontSize: 12, fontWeight: 800, color: Y.sub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Broth Preview</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {BROTHS.map((b, i) => (
          <div key={i} onClick={() => onSelect('broths')} style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src={b.img} alt="" style={{ width: '100%', height: 70, objectFit: 'cover' }} />
            <div style={{ background: '#fff', padding: '6px 8px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: Y.text, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{b.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MainMenu() {
  const [view, setView] = useState<MenuView>('overview');

  const titles: Record<MenuView, { t: string; cn: string }> = {
    overview: { t: 'Menu', cn: '菜单' },
    broths: { t: 'Broth Selection', cn: '汤底选择' },
    sauces: { t: 'Sauce Bar', cn: '酱料吧' },
    items: { t: 'Ingredients', cn: '菜品一览' },
    promo: { t: 'Promotions', cn: '当季活动' },
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: Y.cream, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      {/* Header */}
      <div style={{ background: Y.orange, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, boxShadow: '0 2px 10px rgba(217,95,26,0.3)' }}>
        {view !== 'overview' && (
          <button onClick={() => setView('overview')} style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%', width: 34, height: 34, color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
        )}
        <img src="/ygf-logo.png" alt="YGF" style={{ height: 36, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{titles[view].t}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{titles[view].cn}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'overview' && <MenuOverview onSelect={setView} />}
        {view === 'broths' && <BrothsView />}
        {view === 'sauces' && <SaucesView />}
        {view === 'items' && <IngredientsView />}
        {view === 'promo' && <PromoView />}
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────
type Phase = 'splash' | 'howto' | 'menu';

export default function YGFPage() {
  const [phase, setPhase] = useState<Phase>('splash');
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={() => setPhase('howto')} />}
      {phase === 'howto' && <HowToEat onDone={() => setPhase('menu')} />}
      {phase === 'menu' && <MainMenu />}
    </>
  );
}
