"use client";
import Link from "next/link";
import { use } from "react";
import { BROTHS, ALL_ITEMS } from "../../menuData";

export default function BrothPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const broth = BROTHS.find(b => b.id === id);
  if (!broth) return <NotFound />;

  return (
    <div style={{ fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", background: "#0d0d0d", color: "#f0ede6", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>

      {/* Back + header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(13,13,13,0.95)", backdropFilter: "blur(10px)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #1a1a1a" }}>
        <Link href="/menu/ygf" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, background: "#1a1a1a", borderRadius: 12, textDecoration: "none", fontSize: 18, color: "#f0ede6", flexShrink: 0 }}>‹</Link>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f0ede6" }}>{broth.zh}</div>
          <div style={{ fontSize: 11, color: "#666" }}>{broth.en}</div>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: broth.color }}>
        {broth.img
          ? <img src={broth.img} alt={broth.zh} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${broth.color},#2a1500)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🍲</div>
        }
      </div>

      {/* Broth info */}
      <div style={{ padding: "24px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 11, background: "#f5c842", color: "#000", borderRadius: 6, padding: "4px 10px", fontWeight: 800, letterSpacing: 1 }}>{broth.badge}</span>
          <span style={{ fontSize: 13, color: "#aaa" }}>{"🌶".repeat(broth.spicyLevel) || "🍃"} {broth.spicy}</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: "#f0ede6" }}>{broth.zh}</h1>
        <p style={{ fontSize: 15, color: "#bbb", lineHeight: 1.8, margin: "0 0 20px" }}>{broth.tagline}</p>

        {/* Feature tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {broth.features.map(f => (
            <span key={f} style={{ fontSize: 13, background: "#1e1e1e", color: "#ccc", borderRadius: 20, padding: "6px 14px", border: "1px solid #2a2a2a" }}>{f}</span>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 4, height: 32, background: "linear-gradient(180deg,#f5c842,#c0392b)", borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>推荐搭配</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Recommended Combos</div>
          </div>
        </div>

        {/* 3 Combo cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 40 }}>
          {broth.combos.map((combo, idx) => (
            <Link key={combo.id} href={`/menu/ygf/broth/${broth.id}/combo/${combo.id}`}
              style={{ display: "block", background: "#1a1a1a", borderRadius: 16, overflow: "hidden", textDecoration: "none", border: "1px solid #2a2a2a" }}>
              <div style={{ padding: "18px 18px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#f5c842", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
                      搭配 {idx + 1} · COMBO {idx + 1}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#f0ede6", marginBottom: 4 }}>{combo.zh}</div>
                    <div style={{ fontSize: 12, color: "#777" }}>{combo.en}</div>
                  </div>
                  <span style={{ fontSize: 22, color: "#333", marginLeft: 12 }}>›</span>
                </div>

                {/* Ingredient preview pills */}
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {combo.items.slice(0, 4).map(ci => {
                    const found = ALL_ITEMS.find(i => i.id === ci.itemId);
                    return (
                      <span key={ci.itemId} style={{ fontSize: 11, background: "#252525", color: "#ccc", borderRadius: 20, padding: "4px 10px" }}>
                        {found?.zh ?? ci.itemId} {ci.weight}
                      </span>
                    );
                  })}
                  {combo.items.length > 4 && (
                    <span style={{ fontSize: 11, color: "#555", padding: "4px 4px" }}>+{combo.items.length - 4}种</span>
                  )}
                </div>

                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#888" }}>主食：</span>
                  <span style={{ fontSize: 11, background: "#c0392b22", color: "#e88", borderRadius: 4, padding: "2px 8px", fontWeight: 600 }}>{combo.staple}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#f5c842" }}>{combo.highlight}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🍲</div>
      <div style={{ color: "#888" }}>汤底未找到</div>
      <Link href="/menu/ygf" style={{ color: "#f5c842", textDecoration: "none" }}>← 返回菜单</Link>
    </div>
  );
}
