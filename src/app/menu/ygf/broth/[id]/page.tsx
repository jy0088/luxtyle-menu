"use client";
import Link from "next/link";
import { use } from "react";
import { BROTHS, ALL_ITEMS } from "../../menuData";

const C = {
  bg: "#FDFAF5", bgCard: "#FFFFFF", bgSoft: "#FFF4E6",
  gold: "#C8912A", goldLight: "#F5D98A", goldPale: "#FFF1CC",
  red: "#B91C1C", ink: "#1C1410", inkMid: "#6B5B4E", inkLight: "#A89880",
  border: "#E8D9C4", borderStrong: "#C8A878",
};

export default function BrothPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const broth = BROTHS.find(b => b.id === id);
  if (!broth) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Noto Sans SC', sans-serif" }}>
      <div style={{ fontSize: 48 }}>🍲</div>
      <div style={{ color: C.inkMid }}>汤底未找到</div>
      <Link href="/menu/ygf" style={{ color: C.red, textDecoration: "none", fontWeight: 700 }}>← 返回菜单</Link>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: C.bg, fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", color: C.ink }}>

      {/* Sticky back bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(253,250,245,0.95)", backdropFilter: "blur(8px)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `2px solid ${C.border}` }}>
        <Link href="/menu/ygf" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, background: C.bgCard, borderRadius: 14, textDecoration: "none", fontSize: 20, color: C.ink, border: `2px solid ${C.border}`, flexShrink: 0 }}>‹</Link>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.ink }}>{broth.zh}</div>
          <div style={{ fontSize: 11, color: C.inkLight }}>{broth.en}</div>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: broth.color }}>
        {broth.img
          ? <img src={broth.img} alt={broth.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🍲</div>
        }
      </div>

      {/* Info card */}
      <div style={{ margin: "16px 16px 0", background: C.bgCard, borderRadius: 20, padding: "22px 20px", border: `2px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 12, background: C.gold, color: "#fff", borderRadius: 8, padding: "4px 12px", fontWeight: 800 }}>{broth.badge}</span>
          <span style={{ fontSize: 14, color: C.inkMid }}>{"🌶".repeat(broth.spicyLevel) || "🍃"} {broth.spicy}</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px", color: C.ink }}>{broth.zh}</h1>
        <p style={{ fontSize: 15, color: C.inkMid, lineHeight: 1.8, margin: "0 0 18px" }}>{broth.tagline}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {broth.features.map(f => (
            <span key={f} style={{ fontSize: 12, background: C.goldPale, color: C.gold, borderRadius: 20, padding: "6px 14px", border: `1px solid ${C.goldLight}`, fontWeight: 600 }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Combos */}
      <div style={{ padding: "24px 16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 4, height: 28, background: `linear-gradient(180deg, ${C.gold}, ${C.red})`, borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.ink }}>推荐搭配</div>
            <div style={{ fontSize: 11, color: C.inkLight, letterSpacing: 2 }}>RECOMMENDED COMBOS</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {broth.combos.map((combo, idx) => (
            <Link key={combo.id} href={`/menu/ygf/broth/${broth.id}/combo/${combo.id}`}
              style={{ display: "block", background: C.bgCard, borderRadius: 18, overflow: "hidden", textDecoration: "none", border: `2px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "18px 18px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.gold, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>搭配 {idx + 1} · COMBO {idx + 1}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.ink, marginBottom: 4 }}>{combo.zh}</div>
                    <div style={{ fontSize: 12, color: C.inkLight }}>{combo.en}</div>
                  </div>
                  <span style={{ fontSize: 24, color: C.border, marginLeft: 12 }}>›</span>
                </div>
                {/* Ingredient preview */}
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {combo.items.slice(0, 5).map(ci => {
                    const found = ALL_ITEMS.find(i => i.id === ci.itemId);
                    return (
                      <span key={ci.itemId} style={{ fontSize: 12, background: C.bgSoft, color: C.inkMid, borderRadius: 20, padding: "4px 12px", border: `1px solid ${C.border}` }}>
                        {found?.zh ?? ci.itemId}
                      </span>
                    );
                  })}
                  {combo.items.length > 5 && <span style={{ fontSize: 12, color: C.inkLight, padding: "4px 2px" }}>+{combo.items.length - 5}种</span>}
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.inkMid }}>主食：</span>
                  <span style={{ fontSize: 12, background: C.redLight, color: C.red, borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>{combo.staple}</span>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: C.gold, fontWeight: 700 }}>{combo.highlight} ›</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const redLight = "#FEE2E2";
