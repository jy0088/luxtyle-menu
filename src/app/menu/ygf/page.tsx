"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { BROTHS, MENU_CATEGORIES, SAUCE_CATEGORIES, ALLERGEN_COLOR, type MenuItem, type Allergen } from "./menuData";

const TABS = [
  { id: "broth",  zh: "🍲 汤底", en: "Broth" },
  { id: "items",  zh: "📋 菜品", en: "Ingredients" },
  { id: "sauce",  zh: "🥣 调料", en: "Condiments" },
];

export default function YGFMenuPage() {
  const [activeTab, setActiveTab] = useState("broth");
  const [brothIdx, setBrothIdx] = useState(0);
  const [itemCat, setItemCat] = useState("meat");
  const [sauceCat, setSauceCat] = useState(0);
  const [enlargedItem, setEnlargedItem] = useState<MenuItem | null>(null);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);

  function pressStart(item: MenuItem) {
    pressTimer.current = setTimeout(() => setEnlargedItem(item), 500);
  }
  function pressEnd() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  // Tab swipe
  function onTabSwipeStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTabSwipeEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (dx > 60 && idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
    if (dx < -60 && idx > 0) setActiveTab(TABS[idx - 1].id);
  }

  // Broth carousel swipe
  const brothSwipeX = useRef(0);
  function onBrothSwipeStart(e: React.TouchEvent) { brothSwipeX.current = e.touches[0].clientX; }
  function onBrothSwipeEnd(e: React.TouchEvent) {
    const dx = brothSwipeX.current - e.changedTouches[0].clientX;
    if (dx > 50 && brothIdx < BROTHS.length - 1) setBrothIdx(i => i + 1);
    if (dx < -50 && brothIdx > 0) setBrothIdx(i => i - 1);
  }

  const broth = BROTHS[brothIdx];

  return (
    <div style={{ fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", background: "#0d0d0d", color: "#f0ede6", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>

      {/* ── HEADER ──────────────────────────────────── */}
      <div style={{ background: "linear-gradient(180deg,#1a0800 0%,#0d0d0d 100%)", padding: "28px 20px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#c0392b", textTransform: "uppercase" }}>杨国福麻辣烫 · San Diego</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: "8px 0 4px", letterSpacing: -1,
          background: "linear-gradient(135deg,#f5c842,#e67e22)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          YGF Malatang
        </h1>
        <p style={{ fontSize: 13, color: "#666", margin: 0, letterSpacing: 1 }}>Pick Your Broth · Build Your Bowl</p>
      </div>

      {/* ── PROMO BANNER ────────────────────────────── */}
      <div style={{ background: "linear-gradient(90deg,#7b0d0d,#c0392b)", padding: "14px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 8, textAlign: "center" }}>🎉 开业酬宾 Grand Opening Specials</div>
        <div style={{ fontSize: 12, color: "#ffd0d0", lineHeight: 2, textAlign: "center" }}>
          🍹 全日赠送开业饮品 &nbsp;·&nbsp; Complimentary Drink for All Guests<br />
          🍜 周一至周五 每桌第二碗半价 &nbsp;|&nbsp; Mon–Fri: 2nd Bowl 50% Off
        </div>
      </div>

      {/* ── FIXED TAB BAR ───────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#111", borderBottom: "2px solid #1e1e1e", display: "flex" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: "14px 0", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
              color: activeTab === tab.id ? "#f5c842" : "#555",
              borderBottom: activeTab === tab.id ? "3px solid #f5c842" : "3px solid transparent",
              transition: "all 0.2s" }}>
            {tab.zh}
          </button>
        ))}
      </div>

      {/* ── CONTENT AREA ────────────────────────────── */}
      <div onTouchStart={onTabSwipeStart} onTouchEnd={onTabSwipeEnd}>

        {/* ════════ TAB: 汤底 ════════ */}
        {activeTab === "broth" && (
          <div style={{ padding: "20px 16px 40px" }}>

            {/* Carousel */}
            <div onTouchStart={onBrothSwipeStart} onTouchEnd={onBrothSwipeEnd}>
              <Link href={`/menu/ygf/broth/${broth.id}`} style={{ textDecoration: "none", display: "block",
                background: "#1a1a1a", borderRadius: 20, overflow: "hidden",
                border: `2px solid ${broth.color}60`, boxShadow: `0 8px 32px ${broth.color}30` }}>

                {/* Left text / Right image split */}
                <div style={{ display: "flex", minHeight: 180 }}>
                  {/* Left: text */}
                  <div style={{ flex: 1, padding: "22px 18px", background: `linear-gradient(135deg,${broth.color}dd,${broth.color}88)`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: 10, background: "#f5c842", color: "#000", borderRadius: 4, padding: "3px 8px", fontWeight: 800 }}>{broth.badge}</span>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 10, lineHeight: 1.2 }}>{broth.zh}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{broth.en}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 12 }}>
                        {"🌶".repeat(broth.spicyLevel) || "🍃"}&nbsp;{broth.spicy}
                      </div>
                      <div style={{ fontSize: 11, color: "#f5c842", marginTop: 8, fontWeight: 600 }}>查看推荐搭配 →</div>
                    </div>
                  </div>
                  {/* Right: image */}
                  <div style={{ width: 140, flexShrink: 0, overflow: "hidden", background: broth.color }}>
                    {broth.img
                      ? <img src={broth.img} alt={broth.zh} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🍲</div>
                    }
                  </div>
                </div>

                {/* Tagline strip */}
                <div style={{ padding: "12px 18px", background: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{broth.tagline}</div>
                </div>
              </Link>

              {/* Dots + nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 16 }}>
                <button onClick={() => setBrothIdx(i => Math.max(0, i - 1))}
                  style={{ background: "none", border: "none", color: brothIdx > 0 ? "#f5c842" : "#2a2a2a", fontSize: 28, cursor: "pointer", lineHeight: 1 }}>‹</button>
                <div style={{ display: "flex", gap: 6 }}>
                  {BROTHS.map((_, i) => (
                    <button key={i} onClick={() => setBrothIdx(i)}
                      style={{ width: i === brothIdx ? 22 : 7, height: 7, borderRadius: 4, background: i === brothIdx ? "#f5c842" : "#2a2a2a", border: "none", cursor: "pointer", padding: 0, transition: "all 0.25s" }} />
                  ))}
                </div>
                <button onClick={() => setBrothIdx(i => Math.min(BROTHS.length - 1, i + 1))}
                  style={{ background: "none", border: "none", color: brothIdx < BROTHS.length - 1 ? "#f5c842" : "#2a2a2a", fontSize: 28, cursor: "pointer", lineHeight: 1 }}>›</button>
              </div>
              <div style={{ textAlign: "center", fontSize: 11, color: "#444", marginTop: 4 }}>← 左右滑动切换汤底 →</div>
            </div>

            {/* All broths list below */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 12, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>ALL BROTHS · 全部汤底</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {BROTHS.map((b, i) => (
                  <Link key={b.id} href={`/menu/ygf/broth/${b.id}`}
                    style={{ display: "flex", alignItems: "center", gap: 14, background: i === brothIdx ? "#1e1e1e" : "#141414",
                      borderRadius: 14, padding: "14px 16px", textDecoration: "none",
                      border: i === brothIdx ? `1px solid ${b.color}80` : "1px solid #1e1e1e" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: b.color, flexShrink: 0 }}>
                      {b.img
                        ? <img src={b.img} alt={b.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🍲</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#f0ede6" }}>{b.zh}</div>
                      <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{b.en}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, background: "#1a1a1a", color: "#f5c842", borderRadius: 4, padding: "2px 8px" }}>{b.badge}</span>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{"🌶".repeat(b.spicyLevel) || "🍃"}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Growth module */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 12, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>CONNECT · 互动专区</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { href: "/menu/ygf/review", icon: "⭐", label: "Google Review", sub: "帮我们写一条评价，非常感谢！", color: "#f5c842" },
                  { href: "/menu/ygf/share",  icon: "📸", label: "Instagram Share", sub: "Tag us @jy00884973 · #YGFSD", color: "#E1306C" },
                  { href: "/menu/ygf/vip",    icon: "💬", label: "WhatsApp VIP", sub: "早鸟优惠 · 新品抢先知", color: "#25D366" },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    style={{ display: "flex", alignItems: "center", gap: 14, background: "#141414", borderRadius: 14, padding: "14px 16px", textDecoration: "none", border: "1px solid #1e1e1e" }}>
                    <span style={{ fontSize: 26, flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <span style={{ color: "#333", fontSize: 20 }}>›</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ TAB: 菜品 ════════ */}
        {activeTab === "items" && (
          <div style={{ paddingBottom: 40 }}>
            {/* Category tabs */}
            <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "14px 16px", scrollbarWidth: "none" }}>
              {MENU_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setItemCat(cat.id)}
                  style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: itemCat === cat.id ? "#c0392b" : "#1e1e1e",
                    color: itemCat === cat.id ? "#fff" : "#777" }}>
                  {cat.emoji} {cat.zh}
                </button>
              ))}
            </div>
            {/* 2-col grid */}
            <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {MENU_CATEGORIES.find(c => c.id === itemCat)?.items.map(item => (
                <div key={item.id}
                  onMouseDown={() => pressStart(item)} onMouseUp={pressEnd}
                  onTouchStart={() => pressStart(item)} onTouchEnd={pressEnd}
                  style={{ background: "#1a1a1a", borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative", userSelect: "none" }}>
                  {item.isNew && (
                    <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2, background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>NEW</div>
                  )}
                  <div style={{ aspectRatio: "1", background: "#111" }}>
                    {item.img
                      ? <img src={item.img} alt={item.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#2a2a2a" }}>🍽</div>}
                  </div>
                  <div style={{ padding: "10px 10px 12px" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f0ede6" }}>{item.zh}</div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>{item.en}</div>
                    {item.allergens?.length ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
                        {item.allergens.map(a => <AllergenTag key={a} a={a} />)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#383838", marginTop: 14 }}>长按图片查看详情 · Long press to enlarge</div>
          </div>
        )}

        {/* ════════ TAB: 调料 ════════ */}
        {activeTab === "sauce" && (
          <div style={{ paddingBottom: 40 }}>
            <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "14px 16px", scrollbarWidth: "none" }}>
              {SAUCE_CATEGORIES.map((cat, i) => (
                <button key={i} onClick={() => setSauceCat(i)}
                  style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: sauceCat === i ? "#c0392b" : "#1e1e1e",
                    color: sauceCat === i ? "#fff" : "#777" }}>
                  {SAUCE_CATEGORIES[i].zh}
                </button>
              ))}
            </div>
            <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {SAUCE_CATEGORIES[sauceCat].items.map((s, i) => (
                <div key={i} style={{ background: "#1a1a1a", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ aspectRatio: "1", background: "#111" }}>
                    {s.img
                      ? <img src={s.img} alt={s.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#2a2a2a" }}>🥄</div>}
                  </div>
                  <div style={{ padding: "10px 10px 12px" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f0ede6" }}>{s.zh}</div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>{s.en}</div>
                    {s.allergens?.length ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
                        {s.allergens.map(a => <AllergenTag key={a} a={a} />)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Allergy footer */}
      <div style={{ margin: "0 16px 40px", background: "#111", borderRadius: 14, padding: "14px 16px", border: "1px solid #1e1e1e" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#f5c842", marginBottom: 6 }}>⚠️ ALLERGY NOTICE 过敏源提示</div>
        <p style={{ fontSize: 11, color: "#555", lineHeight: 1.7, margin: 0 }}>
          Contains or may contact: Fish · Shellfish · Soy · Wheat/Gluten · Sesame · Egg · Milk · Peanuts<br />
          如有过敏，请点餐前告知工作人员。
        </p>
      </div>

      {/* Long-press modal */}
      {enlargedItem && (
        <div onClick={() => setEnlargedItem(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 22, overflow: "hidden", width: "100%", maxWidth: 380 }}
            onClick={e => e.stopPropagation()}>
            {enlargedItem.img && (
              <img src={enlargedItem.img} alt={enlargedItem.zh} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
            )}
            <div style={{ padding: "22px 22px 28px" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#f0ede6" }}>{enlargedItem.zh}</div>
              <div style={{ fontSize: 14, color: "#777", marginTop: 4 }}>{enlargedItem.en}</div>
              {enlargedItem.allergens?.length ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: "#f5c842", marginBottom: 10, fontWeight: 700 }}>⚠️ 过敏源 Allergens</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {enlargedItem.allergens.map(a => <AllergenTag key={a} a={a} large />)}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16, fontSize: 13, color: "#4caf50" }}>✅ 无主要过敏源 No major allergens</div>
              )}
              <button onClick={() => setEnlargedItem(null)}
                style={{ marginTop: 22, width: "100%", padding: "16px", background: "#252525", border: "1px solid #333", borderRadius: 14, color: "#ccc", fontSize: 15, cursor: "pointer", fontWeight: 600 }}>
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
    <span style={{ fontSize: large ? 13 : 10, padding: large ? "4px 12px" : "2px 6px", borderRadius: 6,
      background: color + "25", color, fontWeight: 700, border: `1px solid ${color}40` }}>
      {a}
    </span>
  );
}
