"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BROTHS, MENU_CATEGORIES, SAUCE_CATEGORIES, ALLERGEN_COLOR, PRICING, type MenuItem, type Allergen } from "./menuData";
import AppShell from "@/components/shell/AppShell";
import PsstWidget from "@/components/ygf/PsstWidget";
import { DRINK_PICKS, SNACK_PICKS, resolvePick } from "./picksData";

// 杨国福 WhatsApp 频道
const YGF_CHANNEL = "https://whatsapp.com/channel/0029VbDtDTY9RZAO8pD1k33z";

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
  inkLight: "#8A7B66",
  border:   "#E8D9C4",
  borderStrong: "#C8A878",
};

const YGF_CSS = `
/* 横向手风琴 —— 选中的汤底撑开,其余收成彩条 */
.ygf-acc{ display:flex; gap:7px; height:248px }
.ygf-bar{
  position:relative; overflow:hidden; cursor:pointer; padding:0;
  border:2px solid rgba(0,0,0,.06); border-radius:14px;
  transition: flex-grow .3s cubic-bezier(.22,1,.36,1),
              flex-basis .3s cubic-bezier(.22,1,.36,1),
              box-shadow .25s ease, border-color .25s ease;
}
.ygf-bar[data-on="0"]{ flex:0 0 50px; box-shadow:none }
.ygf-bar[data-on="1"]{ flex:1 1 auto; box-shadow:0 4px 16px rgba(0,0,0,.18); border-color:rgba(0,0,0,.14) }
.ygf-bar-vert{
  position:absolute; inset:0; display:grid; place-items:center;
  writing-mode:vertical-rl; text-orientation:mixed;
  font-size:15px; font-weight:800; color:#fff; letter-spacing:3px;
  text-shadow:0 1px 4px rgba(0,0,0,.45);
  transition:opacity .2s ease;
}
.ygf-bar[data-on="1"] .ygf-bar-vert{ opacity:0; pointer-events:none }
.ygf-bar-wide{
  position:absolute; left:0; right:0; bottom:0; padding:13px 14px;
  background:linear-gradient(to top, rgba(0,0,0,.72), transparent);
  text-align:left; opacity:0; transition:opacity .25s ease .08s;
}
.ygf-bar[data-on="1"] .ygf-bar-wide{ opacity:1 }

/* 详情随选中切换 */
@keyframes ygf-panel-in{ from{ opacity:0; transform:translateY(10px) } to{ opacity:1; transform:none } }
.ygf-panel{ animation:ygf-panel-in .26s cubic-bezier(.22,1,.36,1) both }

/* 按下反馈 */
.ygf-root button, .ygf-root a[data-press], .ygf-root [data-press]{
  -webkit-tap-highlight-color:transparent;
  transition:transform .06s ease-out, filter .06s ease-out;
}
.ygf-root button:active, .ygf-root a[data-press]:active, .ygf-root [data-press]:active{
  transform:scale(.955); filter:brightness(.90);
}
@media (prefers-reduced-motion: reduce){
  .ygf-bar, .ygf-bar-vert, .ygf-bar-wide, .ygf-panel{ transition:none; animation:none }
  .ygf-root button, .ygf-root [data-press]{ transition:none }
  .ygf-root button:active, .ygf-root [data-press]:active{ transform:none; filter:none }
}
`;

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
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      background: `linear-gradient(170deg, #1a0800 0%, #3d1200 40%, #6b2500 70%, #C8912A 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
      padding: "60px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>

      {/* Background decorative rings */}
      {[300, 220, 150].map((size, i) => (
        <div key={i} style={{ position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: size, height: size, borderRadius: "50%",
          border: `1px solid rgba(200,145,42,${0.1 + i * 0.08})`, pointerEvents: "none" }} />
      ))}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
        {/* Phoenix placeholder — swap src when image is ready */}
        <div style={{ width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, #ff9a3c, #c0392b, #6b0f0f)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 60px rgba(200,145,42,0.5), 0 0 120px rgba(200,145,42,0.2)",
          marginBottom: 32, overflow: "hidden" }}>
          {/* Replace this img tag src with actual phoenix image path */}
          <img src="/ygf-phoenix.webp" alt="YGF Phoenix"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          {/* Fallback emoji shown when image missing */}
          <span style={{ fontSize: 80, position: "absolute" }}>🔥</span>
        </div>

        <div style={{ fontSize: 11, letterSpacing: 6, color: C.goldLight, textTransform: "uppercase", marginBottom: 12 }}>杨国福麻辣烫</div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: -1,
          textShadow: "0 2px 20px rgba(200,145,42,0.6)" }}>YGF Malatang</h1>
        <div style={{ fontSize: 15, color: C.goldLight, letterSpacing: 2 }}>San Diego</div>

        <div style={{ marginTop: 28, padding: "12px 24px", background: "rgba(200,145,42,0.15)",
          borderRadius: 12, border: "1px solid rgba(200,145,42,0.3)" }}>
          <div style={{ fontSize: 13, color: C.goldLight, lineHeight: 1.8 }}>
            🥤 Lunch Special · 午餐特惠<br />
            11:30 AM – 3:00 PM · Free drink with purchase<br />
            购麻辣烫送饮料 · Dine-in only 仅限堂食
          </div>
        </div>
      </div>

      <button onClick={onEnter}
        style={{ width: "100%", maxWidth: 320, padding: "20px 0", borderRadius: 60,
          background: `linear-gradient(135deg, ${C.gold}, #E8A835)`,
          border: "none", cursor: "pointer", fontSize: 18, fontWeight: 800, color: "#fff",
          letterSpacing: 1, boxShadow: "0 8px 32px rgba(200,145,42,0.5)",
          fontFamily: "'Noto Sans SC', sans-serif" }}>
        点击进入菜单 &nbsp;·&nbsp; Enter Menu
      </button>
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
  const [activeSection, setActiveSection] = useState<"broth" | "items" | "sauce" | "picks">("broth");
  const [pickTab, setPickTab] = useState<"drinks" | "snacks">("drinks");
  const [brothIdx, setBrothIdx] = useState(0);
  const [itemCat, setItemCat] = useState("meat");
  const [sauceCat, setSauceCat] = useState(0);
  const [enlargedItem, setEnlargedItem] = useState<MenuItem | null>(null);

  // 小福有话说 —— 进菜单后延时弹出,当天只弹一次
  const [psst, setPsst] = useState(false);
  useEffect(() => {
    const today = new Date().toDateString();
    try {
      if (localStorage.getItem("ygf_psst") === today) return;
    } catch { return; }
    const t = setTimeout(() => {
      setPsst(true);
      try { localStorage.setItem("ygf_psst", today); } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
    <style>{YGF_CSS}</style>
    <div className="ygf-root">
    <AppShell
      nav={
        <>
      {/* Allergen bar (rendered inside sticky header) */}
      <div style={{
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
          { id: "broth", zh: "汤品", en: "Broths",      emoji: "🍲", hot: false },
          { id: "items", zh: "菜品", en: "Ingredients", emoji: "🥬", hot: false },
          { id: "sauce", zh: "调料", en: "Condiments",  emoji: "🥣", hot: false },
          { id: "picks", zh: "店长推荐", en: "Picks",   emoji: "🧋", hot: true  },
        ] as const).map(sec => {
          const on = activeSection === sec.id;
          return (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)}
            style={{ flex: sec.hot ? 1.25 : 1, padding: "11px 2px", borderRadius: 14,
              border: `2px solid ${on ? C.gold : (sec.hot ? C.goldLight : C.border)}`,
              background: on ? C.goldPale : (sec.hot ? "#FFFBF0" : C.bgCard),
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              boxShadow: on ? `0 2px 12px rgba(200,145,42,0.2)` : "none",
              transition: "all 0.2s" }}>
            <span style={{ fontSize: 20 }}>{sec.emoji}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap",
              color: on ? C.gold : (sec.hot ? C.gold : C.inkMid) }}>{sec.zh}</span>
            <span style={{ fontSize: 9.5, color: C.inkLight }}>{sec.en}</span>
          </button>
        );})}
      </div>
        </>
      }
    >
      <div style={{ fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", color: C.ink }}>
        {/* Special offer banner — tappable */}
        <div style={{ background: C.gold, padding: "12px 20px",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🥤</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Lunch Special · 午餐特惠</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
              11:30 AM – 3:00 PM &nbsp;·&nbsp; Free drink with purchase 购麻辣烫送饮料 · Dine-in only 仅限堂食
            </div>
          </div>
        </div>

      {/* ═══════════════════════════════════════════════
          SECTION: 汤品介绍
      ═══════════════════════════════════════════════ */}
      {activeSection === "broth" && (
        <div style={{ padding: "20px 16px 48px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 称重定价 —— 先让顾客知道怎么算钱 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            background: C.bgCard, border: `2px solid ${C.borderStrong}`, borderRadius: 14, padding: "12px 16px" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{PRICING.buildYourOwnEn}</div>
              <div style={{ fontSize: 11, color: C.inkLight, marginTop: 2 }}>{PRICING.buildYourOwnZh} · 汤底另见下方</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.red, whiteSpace: "nowrap" }}>{PRICING.perLbLabel}</div>
          </div>

          {/* 手风琴选择条 —— 五款一屏看完,点哪款哪款撑开 */}
          <div className="ygf-acc">
            {BROTHS.map((b, i) => {
              const on = i === brothIdx;
              return (
                <button key={b.id} className="ygf-bar" data-on={on ? "1" : "0"}
                  onClick={() => setBrothIdx(i)} aria-label={b.zh}
                  style={{ background: b.color }}>
                  {b.img && (
                    <img src={b.img} alt="" aria-hidden="true"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                        objectFit: "cover", opacity: on ? 1 : 0.34, transition: "opacity .28s ease" }}
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                  )}
                  <span className="ygf-bar-vert">{b.zh}</span>
                  <span className="ygf-bar-wide">
                    <span style={{ display: "block", fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{b.zh}</span>
                    <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.86)", marginTop: 3, lineHeight: 1.3 }}>{b.en}</span>
                  </span>
                  <span style={{ position: "absolute", top: 8, left: 8, background: C.gold, color: "#fff",
                    fontSize: 9.5, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                    opacity: on ? 1 : 0, transition: "opacity .2s ease", whiteSpace: "nowrap" }}>{b.badge}</span>
                </button>
              );
            })}
          </div>

          {/* 选中汤底的详情 —— 全宽,读得清 */}
          {(() => {
            const b = BROTHS[brothIdx];
            return (
              <div key={b.id} className="ygf-panel"
                style={{ background: C.bgCard, borderRadius: 18, border: `2px solid ${C.border}`,
                  padding: "16px 16px 14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{b.zh}</div>
                <div style={{ fontSize: 12, color: C.inkLight, marginTop: 3 }}>{b.en}</div>
                <div style={{ fontSize: 13.5, color: C.inkMid, marginTop: 9, lineHeight: 1.55 }}>{b.taglineEn}</div>
                <div style={{ fontSize: 12.5, color: C.inkLight, marginTop: 3, lineHeight: 1.55 }}>{b.tagline}</div>

                {/* 辣度 —— 每档单独一行 */}
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  {b.spicyLevels.length === 0
                    ? <span style={{ fontSize: 12.5, color: C.inkMid }}>🍃 {b.spicy}</span>
                    : b.spicyLevels.map(lv => (
                        <span key={lv.en} style={{ fontSize: 12.5, color: C.inkMid, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ minWidth: 88 }}>{lv.en} {lv.zh}</span>
                          <span style={{ letterSpacing: -1 }}>{"🌶".repeat(lv.chilies)}</span>
                        </span>
                      ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 10 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap",
                    color: b.surcharge ? "#fff" : C.inkMid,
                    background: b.surcharge ? C.red : "transparent",
                    border: b.surcharge ? "none" : `1px solid ${C.border}`,
                    borderRadius: 8, padding: "5px 11px" }}>
                    {b.surcharge ? `+$${b.surcharge.toFixed(2)} / bowl` : "Included 免费"}
                  </span>
                  <Link href={`/menu/ygf/broth/${b.id}`} data-press
                    style={{ textDecoration: "none", background: C.red, color: "#fff",
                      fontSize: 13, fontWeight: 800, borderRadius: 10, padding: "9px 16px", whiteSpace: "nowrap" }}>
                    查看搭配 Combos ›
                  </Link>
                </div>
              </div>
            );
          })()}
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
                onClick={() => setEnlargedItem(item)}
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
            点击查看过敏源与详情 · Tap any item for allergens & details
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

      {/* ═══════════════════════════════════════════════
          SECTION: 店长推荐 —— 北苑饮品 / 小吃加点
      ═══════════════════════════════════════════════ */}
      {activeSection === "picks" && (
        <div style={{ padding: "18px 16px 48px" }}>

          {/* 说明:这些来自隔壁北苑,同一柜台 */}
          <div style={{ background: C.bgSoft, border: `2px solid ${C.goldLight}`, borderRadius: 16,
            padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.ink }}>
              Manager&apos;s Picks <span style={{ color: C.gold }}>店长推荐</span>
            </div>
            <div style={{ fontSize: 12, color: C.inkMid, marginTop: 5, lineHeight: 1.65 }}>
              Already configured — just show the counter. From Bei Yuan next door, same register.
            </div>
            <div style={{ fontSize: 11.5, color: C.inkLight, marginTop: 3, lineHeight: 1.6 }}>
              都已经配好了，到柜台照着点就行。出自隔壁北苑南家，同一个收银台。
            </div>
          </div>

          {/* 饮品 / 小吃 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {([
              { id: "drinks", zh: "饮品", en: "Drinks", emoji: "🧋", n: DRINK_PICKS.length },
              { id: "snacks", zh: "小吃", en: "Snacks", emoji: "🍗", n: SNACK_PICKS.length },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setPickTab(t.id)}
                style={{ flex: 1, padding: "11px 4px", borderRadius: 12,
                  border: `2px solid ${pickTab === t.id ? C.red : C.border}`,
                  background: pickTab === t.id ? C.red : C.bgCard,
                  color: pickTab === t.id ? "#fff" : C.inkMid,
                  fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                {t.emoji} {t.zh} <span style={{ fontSize: 11, opacity: 0.75 }}>{t.en} · {t.n}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(pickTab === "drinks" ? DRINK_PICKS : SNACK_PICKS).map(raw => {
              const p = resolvePick(raw);
              return (
                <div key={p.key} style={{ display: "flex", background: C.bgCard, borderRadius: 16,
                  overflow: "hidden", border: `2px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ width: 104, minWidth: 104, background: "#F5EFE6", overflow: "hidden" }}>
                    {p.img
                      ? <img src={p.img} alt={p.nameEn} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                      : <div style={{ width: "100%", height: "100%", minHeight: 104, display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 32, color: C.border }}>
                          {pickTab === "drinks" ? "🧋" : "🍽"}
                        </div>}
                  </div>
                  <div style={{ flex: 1, padding: "13px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>{p.nameEn}</div>
                    <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>{p.nameCn}</div>
                    {p.mods.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
                        {p.mods.map(m => (
                          <span key={m} style={{ fontSize: 10.5, fontWeight: 700, color: C.gold,
                            background: C.goldPale, border: `1px solid ${C.goldLight}`,
                            borderRadius: 6, padding: "2px 7px" }}>{m}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 9, fontSize: 19, fontWeight: 900, color: C.red }}>
                      ${p.total.toFixed(2)}
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.inkLight, marginLeft: 4 }}>+Tax</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 18, background: C.goldPale, borderRadius: 14,
            padding: "14px 16px", border: `1px solid ${C.goldLight}`, textAlign: "center" }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.gold }}>Order at the counter</div>
            <div style={{ fontSize: 11.5, color: C.inkMid, marginTop: 3 }}>
              到柜台加点即可 · 和麻辣烫一起上
            </div>
          </div>

          <div style={{ marginTop: 12, textAlign: "center", fontSize: 10.5, color: C.inkLight, lineHeight: 1.6 }}>
            图片仅供参考、以实物为准<br />Pictures are for reference only
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
    </AppShell>
    </div>

    <PsstWidget open={psst} onClose={() => setPsst(false)} channelUrl={YGF_CHANNEL} />
    </>
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
