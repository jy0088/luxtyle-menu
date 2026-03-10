"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BROTHS, MENU_CATEGORIES, SAUCE_CATEGORIES, ALLERGEN_COLOR, type MenuItem, type Allergen } from "./menuData";

// ── Color tokens ──────────────────────────────────────────
const C = {
  bg:       "#FDFAF5",       // warm white
  bgCard:   "#FFFFFF",
  bgSoft:   "#FFF4E6",
  gold:     "#C8912A",       // sand gold
  goldLight:"#F5D98A",
  goldPale: "#FFF1CC",
  red:      "#B91C1C",       // deep crimson
  redLight: "#FEE2E2",
  ink:      "#1C1410",       // near-black warm
  inkMid:   "#6B5B4E",
  inkLight: "#A89880",
  border:   "#E8D9C4",
  borderStrong: "#C8A878",
};

type Phase = "splash" | "step1" | "step2" | "step3" | "menu";

// ── Onboarding steps ──────────────────────────────────────
const STEPS = [
  {
    step: 1,
    emoji: "🍲",
    zh: "第一步：选汤底",
    en: "Step 1: Pick Your Broth",
    desc_zh: "我们有5款精心熬制的汤底，从经典草本骨汤到泰式冬阴功，每一款都是我们的招牌。进入菜单后点击「汤品」选择你的专属汤底。",
    desc_en: "Choose from 5 signature broths — Classic Herbal Beef Bone, Tomato, Tom Yum, Dry Spicy Mix, or Clear Nourishing Broth.",
    tip_zh: "💡 不确定选什么？推荐经典草本骨汤！",
    tip_en: "💡 Can't decide? Try our Classic Herbal Beef Bone Broth!",
  },
  {
    step: 2,
    emoji: "⚖️",
    zh: "第二步：自选食材，按重称价",
    en: "Step 2: Build Your Bowl — Priced by Weight",
    desc_zh: "在我们的自助台自由挑选食材。所有食材均按克重计价，夹多少付多少，公平透明。参考份量：每样食材约 100–200g 是一人份的理想选择。",
    desc_en: "Head to our self-serve station and pick exactly what you want. All items are priced by weight — you only pay for what you take.",
    tip_zh: "💡 建议每碗选 4–6 种食材，搭配 1 种主食，口感最佳！",
    tip_en: "💡 We recommend 4–6 ingredients + 1 staple for the perfect bowl.",
  },
  {
    step: 3,
    emoji: "🌶️",
    zh: "第三步：选配料，端碗开吃！",
    en: "Step 3: Add Condiments & Enjoy!",
    desc_zh: "调料台完全免费！芝麻酱、腐乳酱、葱花、辣椒油……随意搭配，调出属于你的专属风味。我们建议先尝原汤，再慢慢添加调料。",
    desc_en: "Our condiment station is completely FREE. Mix sesame paste, fermented tofu, chili oil, and fresh herbs to craft your perfect flavor profile.",
    tip_zh: "💡 调料台不限量，随时可以再去添加！",
    tip_en: "💡 Condiments are unlimited — go back as many times as you like!",
  },
];

export default function YGFPage() {
  const [phase, setPhase] = useState<Phase>("splash");
  const [stepIdx, setStepIdx] = useState(0); // 0–2

  // Skip splash if already seen this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ygf_onboarded") === "1") setPhase("menu");
    } catch {}
  }, []);

  function finishOnboarding() {
    try { sessionStorage.setItem("ygf_onboarded", "1"); } catch {}
    setPhase("menu");
  }

  if (phase === "splash")  return <Splash onEnter={() => setPhase("step1")} />;
  if (phase === "step1" || phase === "step2" || phase === "step3") {
    return (
      <StepGuide
        stepIdx={stepIdx}
        onNext={() => {
          if (stepIdx < 2) { setStepIdx(s => s + 1); }
          else finishOnboarding();
        }}
        onSkip={finishOnboarding}
      />
    );
  }
  return <MainMenu />;
}

// ══════════════════════════════════════════════════════════
// SPLASH
// ══════════════════════════════════════════════════════════
function Splash({ onEnter }: { onEnter: () => void }) {
  return (
    <div onClick={onEnter} style={{
      minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      position: "relative", overflow: "hidden", cursor: "pointer",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      {/* Full-bleed phoenix image */}
      <img src="/ygf-phoenix.webp" alt="YGF Malatang"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />

      {/* Top gradient overlay for text legibility */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%",
        background: "linear-gradient(180deg, rgba(60,10,0,0.75) 0%, transparent 100%)", pointerEvents: "none" }} />

      {/* Bottom gradient overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(0deg, rgba(30,5,0,0.92) 0%, rgba(30,5,0,0.6) 60%, transparent 100%)", pointerEvents: "none" }} />

      {/* Top brand text */}
      <div style={{ position: "absolute", top: 52, left: 0, right: 0, textAlign: "center", zIndex: 2 }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "rgba(245,217,138,0.9)", textTransform: "uppercase" }}>杨国福麻辣烫</div>
      </div>

      {/* Bottom content */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 28px 52px", textAlign: "center" }}>
        <h1 style={{ fontSize: 44, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: -1,
          textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>YGF Malatang</h1>
        <div style={{ fontSize: 14, color: C.goldLight, letterSpacing: 3, marginBottom: 20 }}>San Diego</div>

        <div style={{ background: "rgba(200,145,42,0.18)", border: "1px solid rgba(200,145,42,0.4)",
          borderRadius: 14, padding: "12px 20px", marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.9 }}>
            🎉 开业酬宾 · Grand Opening Specials<br />
            <span style={{ fontSize: 12, color: C.goldLight }}>全日赠送开业饮品 · Mon–Fri 第二碗半价</span>
          </div>
        </div>

        <button onClick={onEnter}
          style={{ width: "100%", padding: "20px 0", borderRadius: 60,
            background: `linear-gradient(135deg, ${C.gold}, #A87020)`,
            border: "3px solid rgba(245,217,138,0.5)",
            cursor: "pointer", fontSize: 18, fontWeight: 800, color: "#fff",
            letterSpacing: 1, boxShadow: "0 8px 32px rgba(200,145,42,0.45)",
            fontFamily: "'Noto Sans SC', sans-serif" }}>
          点击进入菜单 · Enter Menu
        </button>
        <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Tap anywhere to continue</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// STEP GUIDE
// ══════════════════════════════════════════════════════════
function StepGuide({ stepIdx, onNext, onSkip }: { stepIdx: number; onNext: () => void; onSkip: () => void }) {
  const s = STEPS[stepIdx];
  const isLast = stepIdx === 2;

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      background: C.bg, fontFamily: "'Noto Sans SC','PingFang SC',sans-serif",
      display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: i === stepIdx ? 28 : 8, height: 8, borderRadius: 4,
              background: i <= stepIdx ? C.gold : C.border, transition: "all 0.3s" }} />
          ))}
        </div>
        <button onClick={onSkip} style={{ background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: C.inkLight, padding: "4px 8px" }}>跳过 Skip</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 24px 24px", gap: 24 }}>
        {/* Emoji + step number */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.goldPale}, ${C.goldLight})`,
            border: `3px solid ${C.gold}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
            {s.emoji}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
            STEP {s.step} / 3
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: C.ink, margin: "0 0 6px", lineHeight: 1.3 }}>{s.zh}</h2>
          <div style={{ fontSize: 14, color: C.inkMid, fontWeight: 600 }}>{s.en}</div>
        </div>

        {/* Description */}
        <div style={{ background: C.bgCard, borderRadius: 18, padding: "22px 20px",
          border: `2px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.9, margin: "0 0 16px" }}>{s.desc_zh}</p>
          <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{s.desc_en}</p>
        </div>

        {/* Tip */}
        <div style={{ background: C.goldPale, borderRadius: 14, padding: "16px 18px",
          border: `1px solid ${C.goldLight}` }}>
          <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, lineHeight: 1.8 }}>{s.tip_zh}</div>
          <div style={{ fontSize: 12, color: C.inkMid, marginTop: 4 }}>{s.tip_en}</div>
        </div>
      </div>

      {/* Next button */}
      <div style={{ padding: "0 24px 48px" }}>
        <button onClick={onNext}
          style={{ width: "100%", padding: "20px 0", borderRadius: 60,
            background: isLast ? `linear-gradient(135deg, ${C.red}, #991B1B)` : `linear-gradient(135deg, ${C.gold}, #A87020)`,
            border: "none", cursor: "pointer", fontSize: 18, fontWeight: 800, color: "#fff",
            letterSpacing: 0.5, boxShadow: isLast ? "0 6px 24px rgba(185,28,28,0.35)" : "0 6px 24px rgba(200,145,42,0.35)",
            fontFamily: "'Noto Sans SC', sans-serif" }}>
          {isLast ? "进入菜单 · Enter Menu 🍜" : `下一步 Next →`}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN MENU
// ══════════════════════════════════════════════════════════
function MainMenu() {
  const [activeSection, setActiveSection] = useState<"broth" | "items" | "sauce">("broth");
  const [itemCat, setItemCat] = useState("meat");
  const [sauceCat, setSauceCat] = useState(0);
  const [enlargedItem, setEnlargedItem] = useState<MenuItem | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pressStart(item: MenuItem) {
    pressTimer.current = setTimeout(() => setEnlargedItem(item), 500);
  }
  function pressEnd() { if (pressTimer.current) clearTimeout(pressTimer.current); }

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      background: C.bg, fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", color: C.ink }}>

      {/* ── Store header ─────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, #3d1200, #6b2500)`, padding: "20px 20px 0", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.goldLight, letterSpacing: 4, textTransform: "uppercase" }}>杨国福麻辣烫 · San Diego</div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: "6px 0 0",
          background: `linear-gradient(135deg, ${C.goldLight}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          YGF Malatang
        </h1>

        {/* Special offer banner — tappable */}
        <div style={{ margin: "14px -20px 0", background: C.gold, padding: "12px 20px",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🎉</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>开业酬宾 · Grand Opening Specials</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
              全日赠饮品 &nbsp;·&nbsp; Mon–Fri 第二碗五折 · 2nd Bowl 50% Off
            </div>
          </div>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, marginLeft: "auto" }}>›</span>
        </div>
      </div>

      {/* ── Allergy bar — FIXED, always visible ──────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100,
        background: "#7C1D1D", padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "2px solid #9B2222" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>过敏源提示 · Allergen Notice</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, lineHeight: 1.5 }}>
            含：鱼 · 贝 · 大豆 · 麸质 · 芝麻 · 蛋 · 乳 · 花生 &nbsp;|&nbsp; Contains: Fish · Shellfish · Soy · Wheat · Sesame · Egg · Milk · Peanuts
          </div>
        </div>
      </div>

      {/* ── Section nav ──────────────────────────────── */}
      <div style={{ display: "flex", padding: "14px 16px", gap: 10, background: C.bg,
        borderBottom: `2px solid ${C.border}` }}>
        {([
          { id: "broth", zh: "汤品介绍", en: "Broths",      emoji: "🍲" },
          { id: "items", zh: "菜品介绍", en: "Ingredients", emoji: "🥬" },
          { id: "sauce", zh: "调料介绍", en: "Condiments",  emoji: "🥣" },
        ] as const).map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)}
            style={{ flex: 1, padding: "12px 4px", borderRadius: 14, border: `2px solid ${activeSection === sec.id ? C.gold : C.border}`,
              background: activeSection === sec.id ? C.goldPale : C.bgCard,
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              boxShadow: activeSection === sec.id ? `0 2px 12px rgba(200,145,42,0.2)` : "none",
              transition: "all 0.2s" }}>
            <span style={{ fontSize: 22 }}>{sec.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: activeSection === sec.id ? C.gold : C.inkMid }}>{sec.zh}</span>
            <span style={{ fontSize: 10, color: C.inkLight }}>{sec.en}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION: 汤品介绍
      ═══════════════════════════════════════════════ */}
      {activeSection === "broth" && (
        <div style={{ padding: "20px 16px 48px", display: "flex", flexDirection: "column", gap: 14 }}>
          {BROTHS.map(broth => (
            <Link key={broth.id} href={`/menu/ygf/broth/${broth.id}`}
              style={{ textDecoration: "none", display: "flex", background: C.bgCard,
                borderRadius: 18, overflow: "hidden", border: `2px solid ${C.border}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)", minHeight: 120 }}>

              {/* Left: image */}
              <div style={{ width: 120, flexShrink: 0, background: broth.color, overflow: "hidden", position: "relative" }}>
                {broth.img
                  ? <img src={broth.img} alt={broth.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🍲</div>
                }
                {/* Badge over image */}
                <div style={{ position: "absolute", bottom: 6, left: 6,
                  background: C.gold, color: "#fff", fontSize: 9, fontWeight: 800,
                  padding: "2px 7px", borderRadius: 5 }}>{broth.badge}</div>
              </div>

              {/* Right: info */}
              <div style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{broth.zh}</div>
                  <div style={{ fontSize: 11, color: C.inkLight, marginTop: 3 }}>{broth.en}</div>
                  <div style={{ fontSize: 13, color: C.inkMid, marginTop: 8, lineHeight: 1.6 }}>{broth.tagline}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: C.inkMid }}>{"🌶".repeat(broth.spicyLevel) || "🍃"} {broth.spicy}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>查看搭配 ›</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          SECTION: 菜品介绍
      ═══════════════════════════════════════════════ */}
      {activeSection === "items" && (
        <div style={{ paddingBottom: 48 }}>
          {/* Category pills */}
          <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "14px 16px", scrollbarWidth: "none" }}>
            {MENU_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setItemCat(cat.id)}
                style={{ flexShrink: 0, padding: "10px 18px", borderRadius: 50,
                  border: `2px solid ${itemCat === cat.id ? C.red : C.border}`,
                  background: itemCat === cat.id ? C.red : C.bgCard,
                  color: itemCat === cat.id ? "#fff" : C.inkMid,
                  fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: itemCat === cat.id ? "0 2px 10px rgba(185,28,28,0.25)" : "none" }}>
                {cat.emoji} {cat.zh}
              </button>
            ))}
          </div>

          {/* 2-col grid — large tiles */}
          <div style={{ padding: "4px 16px", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {MENU_CATEGORIES.find(c => c.id === itemCat)?.items.map(item => (
              <div key={item.id}
                onMouseDown={() => pressStart(item)} onMouseUp={pressEnd}
                onTouchStart={() => pressStart(item)} onTouchEnd={pressEnd}
                style={{ background: C.bgCard, borderRadius: 16, overflow: "hidden",
                  border: `2px solid ${C.border}`, cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)", userSelect: "none", position: "relative" }}>
                {item.isNew && (
                  <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2,
                    background: C.red, color: "#fff", fontSize: 10, fontWeight: 800,
                    padding: "3px 8px", borderRadius: 6 }}>NEW</div>
                )}
                {/* Image — square */}
                <div style={{ aspectRatio: "1", background: "#F5EFE6", overflow: "hidden" }}>
                  {item.img
                    ? <img src={item.img} alt={item.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: C.border }}>🍽</div>
                  }
                </div>
                {/* Info */}
                <div style={{ padding: "12px 12px 14px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{item.zh}</div>
                  <div style={{ fontSize: 11, color: C.inkLight, marginTop: 3, lineHeight: 1.4 }}>{item.en}</div>
                  {item.allergens?.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                      {item.allergens.map(a => <AllergenTag key={a} a={a} />)}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 10, color: "#16A34A", fontWeight: 700 }}>✓ 无主要过敏源</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: C.inkLight, padding: "14px 0" }}>
            长按图片查看详情 · Long press for details
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          SECTION: 调料介绍
      ═══════════════════════════════════════════════ */}
      {activeSection === "sauce" && (
        <div style={{ paddingBottom: 48 }}>
          <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "14px 16px", scrollbarWidth: "none" }}>
            {SAUCE_CATEGORIES.map((cat, i) => (
              <button key={i} onClick={() => setSauceCat(i)}
                style={{ flexShrink: 0, padding: "10px 18px", borderRadius: 50,
                  border: `2px solid ${sauceCat === i ? C.red : C.border}`,
                  background: sauceCat === i ? C.red : C.bgCard,
                  color: sauceCat === i ? "#fff" : C.inkMid,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: sauceCat === i ? "0 2px 10px rgba(185,28,28,0.25)" : "none" }}>
                {cat.zh}
              </button>
            ))}
          </div>
          <div style={{ padding: "4px 16px", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {SAUCE_CATEGORIES[sauceCat].items.map((s, i) => (
              <div key={i} style={{ background: C.bgCard, borderRadius: 16, overflow: "hidden",
                border: `2px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ aspectRatio: "1", background: "#F5EFE6", overflow: "hidden" }}>
                  {s.img
                    ? <img src={s.img} alt={s.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: C.border }}>🥄</div>
                  }
                </div>
                <div style={{ padding: "12px 12px 14px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{s.zh}</div>
                  <div style={{ fontSize: 11, color: C.inkLight, marginTop: 3 }}>{s.en}</div>
                  {s.allergens?.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                      {s.allergens.map(a => <AllergenTag key={a} a={a} />)}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 10, color: "#16A34A", fontWeight: 700 }}>✓ 无主要过敏源</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ margin: "8px 16px 0", background: C.goldPale, borderRadius: 14,
            padding: "14px 16px", border: `1px solid ${C.goldLight}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>🥣 调料台完全免费，不限量！</div>
            <div style={{ fontSize: 11, color: C.inkMid, marginTop: 4 }}>Condiment station is FREE and unlimited for all guests.</div>
          </div>
        </div>
      )}

      {/* Long-press modal */}
      {enlargedItem && (
        <div onClick={() => setEnlargedItem(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.bgCard, borderRadius: 24, overflow: "hidden",
            width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={e => e.stopPropagation()}>
            {enlargedItem.img && (
              <img src={enlargedItem.img} alt={enlargedItem.zh}
                style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
            )}
            <div style={{ padding: "22px 22px 28px" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.ink }}>{enlargedItem.zh}</div>
              <div style={{ fontSize: 14, color: C.inkMid, marginTop: 4 }}>{enlargedItem.en}</div>
              {enlargedItem.allergens?.length ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, color: C.red, marginBottom: 10, fontWeight: 800 }}>⚠️ 过敏源 Allergens</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {enlargedItem.allergens.map(a => <AllergenTag key={a} a={a} large />)}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16, fontSize: 14, color: "#16A34A", fontWeight: 700 }}>✅ 无主要过敏源 · No major allergens</div>
              )}
              <button onClick={() => setEnlargedItem(null)}
                style={{ marginTop: 22, width: "100%", padding: "18px", background: C.ink,
                  border: "none", borderRadius: 60, color: "#fff", fontSize: 16, cursor: "pointer", fontWeight: 700,
                  fontFamily: "'Noto Sans SC', sans-serif" }}>
                关闭 Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AllergenTag({ a, large }: { a: Allergen; large?: boolean }) {
  const color = ALLERGEN_COLOR[a] ?? "#888";
  return (
    <span style={{ fontSize: large ? 13 : 10, padding: large ? "5px 12px" : "3px 7px", borderRadius: 20,
      background: color + "18", color, fontWeight: 700, border: `1.5px solid ${color}50`,
      letterSpacing: 0.3 }}>
      {a}
    </span>
  );
}
