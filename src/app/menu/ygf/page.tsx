"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { BROTHS, MENU_CATEGORIES, SAUCE_CATEGORIES, ALLERGEN_COLOR, type MenuItem, type Allergen } from "./menuData";

export default function YGFMenuPage() {
  const [brothIdx, setBrothIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState("meat");
  const [activeSauceTab, setActiveSauceTab] = useState(0);
  const [enlargedItem, setEnlargedItem] = useState<MenuItem | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentBroth = BROTHS[brothIdx];

  function handlePressStart(item: MenuItem) {
    pressTimer.current = setTimeout(() => setEnlargedItem(item), 500);
  }
  function handlePressEnd() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  // swipe carousel
  const touchStartX = useRef(0);
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (dx > 50 && brothIdx < BROTHS.length - 1) setBrothIdx(i => i + 1);
    if (dx < -50 && brothIdx > 0) setBrothIdx(i => i - 1);
  }

  return (
    <div style={{ fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", background: "#0d0d0d", color: "#f0ede6", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(180deg,#1a0800 0%,#0d0d0d 100%)", padding: "28px 20px 0", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#c0392b", textTransform: "uppercase" }}>杨国福麻辣烫 · San Diego</div>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: "8px 0 4px", letterSpacing: -1, background: "linear-gradient(135deg,#f5c842,#e67e22)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          YGF Malatang
        </h1>
        <p style={{ fontSize: 13, color: "#888", margin: 0, letterSpacing: 1 }}>Pick Your Broth · Build Your Bowl</p>

        {/* Promo */}
        <div style={{ margin: "16px -20px 0", background: "linear-gradient(90deg,#7b0d0d,#c0392b)", padding: "12px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>🎉 开业酬宾 Grand Opening Specials</div>
          <div style={{ fontSize: 12, color: "#ffc8c8", lineHeight: 1.8 }}>
            🍹 全日赠送开业饮品 · Complimentary Drink for All Guests<br />
            🍜 周一至周五 · 每桌第二碗半价 &nbsp;|&nbsp; Mon–Fri: 2nd Bowl 50% Off
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 1: 汤底选择 CAROUSEL
      ══════════════════════════════════════════════════ */}
      <div style={{ marginTop: 32 }}>
        <SectionHeader emoji="🍲" zh="选择汤底" en="Choose Your Broth" />

        {/* Carousel */}
        <div ref={carouselRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          style={{ padding: "0 16px" }}>

          {/* Broth card: top=text, bottom=image */}
          <Link href={`/menu/ygf/broth/${currentBroth.id}`}
            style={{ display: "block", borderRadius: 18, overflow: "hidden", textDecoration: "none",
              border: "2px solid rgba(245,200,66,0.4)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)", background: currentBroth.color }}>

            {/* Top: text info */}
            <div style={{ padding: "20px 20px 16px", background: "rgba(0,0,0,0.45)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 10, background: "#f5c842", color: "#000", borderRadius: 4, padding: "3px 8px", fontWeight: 800, letterSpacing: 1 }}>
                  {currentBroth.badge}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                  {"🌶".repeat(currentBroth.spicyLevel) || "🍃"} {currentBroth.spicy}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{currentBroth.zh}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>{currentBroth.en}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{currentBroth.tagline}</div>
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {currentBroth.features.map(f => (
                  <span key={f} style={{ fontSize: 10, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", borderRadius: 20, padding: "3px 10px" }}>{f}</span>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: "#f5c842", fontWeight: 600 }}>
                点击查看推荐搭配 →
              </div>
            </div>

            {/* Bottom: image */}
            <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: currentBroth.color }}>
              {currentBroth.img ? (
                <img src={currentBroth.img} alt={currentBroth.zh}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${currentBroth.color},#2a1500)`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🍲</div>
              )}
            </div>
          </Link>

          {/* Dots + arrows */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
            <button onClick={() => setBrothIdx(i => Math.max(0, i-1))}
              style={{ background: "none", border: "none", color: brothIdx > 0 ? "#f5c842" : "#333", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>‹</button>
            <div style={{ display: "flex", gap: 6 }}>
              {BROTHS.map((_, i) => (
                <button key={i} onClick={() => setBrothIdx(i)}
                  style={{ width: i === brothIdx ? 20 : 7, height: 7, borderRadius: 4, background: i === brothIdx ? "#f5c842" : "#333", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
              ))}
            </div>
            <button onClick={() => setBrothIdx(i => Math.min(BROTHS.length-1, i+1))}
              style={{ background: "none", border: "none", color: brothIdx < BROTHS.length-1 ? "#f5c842" : "#333", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>›</button>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 4 }}>← 左右滑动切换汤底 →</div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 2: 调料台
      ══════════════════════════════════════════════════ */}
      <div style={{ marginTop: 36 }}>
        <SectionHeader emoji="🥣" zh="调料台" en="Condiment Station" />
        <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "0 16px 12px", scrollbarWidth: "none" }}>
          {SAUCE_CATEGORIES.map((cat, i) => (
            <button key={i} onClick={() => setActiveSauceTab(i)}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: activeSauceTab === i ? "#c0392b" : "#1e1e1e",
                color: activeSauceTab === i ? "#fff" : "#888" }}>
              {cat.zh}
            </button>
          ))}
        </div>
        <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {SAUCE_CATEGORIES[activeSauceTab].items.map((s, i) => (
            <div key={i} style={{ background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ aspectRatio: "1", background: "#111", overflow: "hidden" }}>
                {s.img ? <img src={s.img} alt={s.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#333" }}>🥄</div>}
              </div>
              <div style={{ padding: "8px 8px 10px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0ede6" }}>{s.zh}</div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{s.en}</div>
                {s.allergens?.length ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 5 }}>
                    {s.allergens.map(a => <AllergenTag key={a} a={a} />)}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 3: 菜品一览 2-col grid
      ══════════════════════════════════════════════════ */}
      <div style={{ marginTop: 36 }}>
        <SectionHeader emoji="📋" zh="菜品一览" en="All Ingredients" />
        <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "0 16px 14px", scrollbarWidth: "none" }}>
          {MENU_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: activeCategory === cat.id ? "#c0392b" : "#1e1e1e",
                color: activeCategory === cat.id ? "#fff" : "#888" }}>
              {cat.emoji} {cat.zh}
            </button>
          ))}
        </div>
        {MENU_CATEGORIES.filter(c => c.id === activeCategory).map(cat => (
          <div key={cat.id} style={{ padding: "0 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {cat.items.map(item => (
                <div key={item.id}
                  onMouseDown={() => handlePressStart(item)}
                  onMouseUp={handlePressEnd}
                  onTouchStart={() => handlePressStart(item)}
                  onTouchEnd={handlePressEnd}
                  style={{ background: "#1a1a1a", borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative", userSelect: "none" }}>
                  {item.isNew && (
                    <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2, background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>NEW</div>
                  )}
                  <div style={{ aspectRatio: "1", background: "#111", overflow: "hidden" }}>
                    {item.img
                      ? <img src={item.img} alt={item.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#2a2a2a" }}>🍽</div>}
                  </div>
                  <div style={{ padding: "10px 10px 12px" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f0ede6" }}>{item.zh}</div>
                    <div style={{ fontSize: 11, color: "#777", marginTop: 3, lineHeight: 1.4 }}>{item.en}</div>
                    {item.allergens?.length ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
                        {item.allergens.map(a => <AllergenTag key={a} a={a} />)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#444", marginTop: 12 }}>长按图片查看详情 · Long press to enlarge</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 4: 互动专区
      ══════════════════════════════════════════════════ */}
      <div style={{ marginTop: 36 }}>
        <SectionHeader emoji="✨" zh="互动专区" en="Connect With Us" />
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { href: "/menu/ygf/review", icon: "⭐", label: "Leave a Google Review", sub: "帮我们写一条评价，非常感谢！", color: "#f5c842" },
            { href: "/menu/ygf/share",  icon: "📸", label: "Share Your Bowl on Instagram", sub: "Tag us and get featured 🔥", color: "#E1306C" },
            { href: "/menu/ygf/vip",    icon: "💬", label: "Join VIP WhatsApp List", sub: "早鸟优惠 · 新品抢先知", color: "#25D366" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "#1a1a1a", borderRadius: 14, padding: "16px", textDecoration: "none", border: "1px solid #2a2a2a" }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>{item.sub}</div>
              </div>
              <span style={{ color: "#444", fontSize: 20 }}>›</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Allergy footer */}
      <div style={{ margin: "28px 16px 40px", background: "#111", borderRadius: 14, padding: "16px", border: "1px solid #1e1e1e" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#f5c842", marginBottom: 8 }}>⚠️ ALLERGY NOTICE 过敏源提示</div>
        <p style={{ fontSize: 11, color: "#666", lineHeight: 1.7, margin: 0 }}>
          Contains or may contact: <strong style={{ color: "#999" }}>Fish · Shellfish · Soy · Wheat/Gluten · Sesame · Egg · Milk · Peanuts</strong>
          <br />Cross-contact may occur. Please inform staff of any allergies.
          <br />如有过敏，请点餐前告知工作人员。
        </p>
      </div>

      {/* Long-press modal */}
      {enlargedItem && (
        <div onClick={() => setEnlargedItem(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 20, overflow: "hidden", width: "100%", maxWidth: 380 }}
            onClick={e => e.stopPropagation()}>
            {enlargedItem.img && (
              <img src={enlargedItem.img} alt={enlargedItem.zh} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
            )}
            <div style={{ padding: "20px 20px 24px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f0ede6" }}>{enlargedItem.zh}</div>
              <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{enlargedItem.en}</div>
              {enlargedItem.allergens?.length ? (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, color: "#f5c842", marginBottom: 8, fontWeight: 700 }}>⚠️ 过敏源 Allergens</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {enlargedItem.allergens.map(a => <AllergenTag key={a} a={a} large />)}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 14, fontSize: 12, color: "#4caf50" }}>✅ 无主要过敏源 No major allergens</div>
              )}
              <button onClick={() => setEnlargedItem(null)}
                style={{ marginTop: 20, width: "100%", padding: "14px", background: "#2a2a2a", border: "none", borderRadius: 12, color: "#aaa", fontSize: 14, cursor: "pointer" }}>
                关闭 Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ emoji, zh, en }: { emoji: string; zh: string; en: string }) {
  return (
    <div style={{ padding: "0 16px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 4, height: 36, background: "linear-gradient(180deg,#f5c842,#c0392b)", borderRadius: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f0ede6" }}>{emoji} {zh}</div>
        <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>{en}</div>
      </div>
    </div>
  );
}

function AllergenTag({ a, large }: { a: Allergen; large?: boolean }) {
  const color = ALLERGEN_COLOR[a] ?? "#888";
  return (
    <span style={{ fontSize: large ? 12 : 9, padding: large ? "3px 10px" : "2px 5px", borderRadius: 4,
      background: color + "25", color, fontWeight: 700, letterSpacing: 0.5, border: `1px solid ${color}40` }}>
      {a}
    </span>
  );
}
