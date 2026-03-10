"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { use } from "react";
import { BROTHS, ALL_ITEMS, ALLERGEN_COLOR, type MenuItem, type Allergen } from "../../../../menuData";

const C = {
  bg: "#FDFAF5", bgCard: "#FFFFFF", bgSoft: "#FFF4E6",
  gold: "#C8912A", goldLight: "#F5D98A", goldPale: "#FFF1CC",
  red: "#B91C1C", redLight: "#FEE2E2",
  ink: "#1C1410", inkMid: "#6B5B4E", inkLight: "#A89880",
  border: "#E8D9C4",
};

export default function ComboPage({ params }: { params: Promise<{ id: string; comboId: string }> }) {
  const { id, comboId } = use(params);
  const broth = BROTHS.find(b => b.id === id);
  const combo = broth?.combos.find(c => c.id === comboId);

  const [page, setPage] = useState(0);
  const [enlargedItem, setEnlargedItem] = useState<(MenuItem & { weight: string }) | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!broth || !combo) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Noto Sans SC', sans-serif" }}>
      <div style={{ fontSize: 48 }}>🥣</div>
      <div style={{ color: C.inkMid }}>搭配未找到</div>
      <Link href={`/menu/ygf/broth/${id}`} style={{ color: C.red, textDecoration: "none", fontWeight: 700 }}>← 返回汤底</Link>
    </div>
  );

  const resolved: (MenuItem & { weight: string })[] = combo.items.map(ci => {
    const found = ALL_ITEMS.find(i => i.id === ci.itemId);
    return found ? { ...found, weight: ci.weight } : { id: ci.itemId, zh: ci.itemId, en: ci.itemId, weight: ci.weight };
  });

  const PER_PAGE = 4;
  const totalPages = Math.ceil(resolved.length / PER_PAGE);
  const pageItems = resolved.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  function pressStart(item: MenuItem & { weight: string }) {
    pressTimer.current = setTimeout(() => setEnlargedItem(item), 500);
  }
  function pressEnd() { if (pressTimer.current) clearTimeout(pressTimer.current); }

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: C.bg, fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", color: C.ink }}>

      {/* Sticky back bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(253,250,245,0.95)", backdropFilter: "blur(8px)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `2px solid ${C.border}` }}>
        <Link href={`/menu/ygf/broth/${id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, background: C.bgCard, borderRadius: 14, textDecoration: "none", fontSize: 20, color: C.ink, border: `2px solid ${C.border}`, flexShrink: 0 }}>‹</Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{combo.zh}</div>
          <div style={{ fontSize: 11, color: C.inkLight }}>{combo.en} · {broth.zh}</div>
        </div>
      </div>

      {/* Combo hero */}
      <div style={{ background: broth.color, padding: "22px 20px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 6, letterSpacing: 2, textTransform: "uppercase" }}>推荐搭配 · COMBO</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{combo.zh}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>{combo.highlight}</div>
        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>主食</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{combo.staple}</span>
        </div>
      </div>

      {/* Page info */}
      {totalPages > 1 && (
        <div style={{ padding: "14px 16px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, color: C.inkMid, fontWeight: 600 }}>食材清单 · {resolved.length} 种食材</div>
          <div style={{ fontSize: 12, color: C.inkLight }}>第 {page + 1} / {totalPages} 页</div>
        </div>
      )}

      {/* 2×2 grid */}
      <div style={{ padding: "14px 16px 0", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {pageItems.map(item => (
          <div key={item.id}
            onMouseDown={() => pressStart(item)} onMouseUp={pressEnd}
            onTouchStart={() => pressStart(item)} onTouchEnd={pressEnd}
            onContextMenu={e => { e.preventDefault(); setEnlargedItem(item); }}
            style={{ background: C.bgCard, borderRadius: 16, overflow: "hidden", cursor: "pointer",
              border: `2px solid ${C.border}`, userSelect: "none", position: "relative",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {/* Weight badge */}
            <div style={{ position: "absolute", top: 8, left: 8, zIndex: 2,
              background: "rgba(0,0,0,0.65)", color: C.goldLight, fontSize: 11, fontWeight: 800,
              padding: "3px 8px", borderRadius: 8 }}>{item.weight}</div>
            {/* Image */}
            <div style={{ aspectRatio: "1", background: "#F5EFE6", overflow: "hidden" }}>
              {item.img
                ? <img src={item.img} alt={item.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: C.border }}>🍽</div>
              }
            </div>
            {/* Info */}
            <div style={{ padding: "12px 12px 14px" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, marginBottom: 3 }}>{item.zh}</div>
              <div style={{ fontSize: 11, color: C.inkLight, lineHeight: 1.4 }}>{item.en}</div>
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

        {/* Staple card on last page */}
        {page === totalPages - 1 && (
          <div style={{ background: C.goldPale, borderRadius: 16, border: `2px solid ${C.goldLight}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 20, gap: 8, minHeight: 200 }}>
            <div style={{ fontSize: 36 }}>🍜</div>
            <div style={{ fontSize: 13, color: C.gold, fontWeight: 700 }}>推荐主食</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.ink }}>{combo.staple}</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, padding: "24px 0 8px" }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ width: 52, height: 52, borderRadius: 14, background: C.bgCard, border: `2px solid ${page > 0 ? C.border : "#eee"}`,
              color: page > 0 ? C.ink : C.border, fontSize: 22, cursor: page > 0 ? "pointer" : "default" }}>‹</button>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                style={{ width: i === page ? 22 : 8, height: 8, borderRadius: 4, background: i === page ? C.gold : C.border, border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
            ))}
          </div>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            style={{ width: 52, height: 52, borderRadius: 14, background: C.bgCard, border: `2px solid ${page < totalPages - 1 ? C.border : "#eee"}`,
              color: page < totalPages - 1 ? C.ink : C.border, fontSize: 22, cursor: page < totalPages - 1 ? "pointer" : "default" }}>›</button>
        </div>
      )}

      <div style={{ textAlign: "center", fontSize: 12, color: C.inkLight, padding: "12px 16px 48px" }}>
        长按食材图片查看详情 · Long press for details & allergens
      </div>

      {/* Long-press modal */}
      {enlargedItem && (
        <div onClick={() => setEnlargedItem(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.bgCard, borderRadius: 24, overflow: "hidden", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={e => e.stopPropagation()}>
            {enlargedItem.img && (
              <img src={enlargedItem.img} alt={enlargedItem.zh} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
            )}
            <div style={{ padding: "22px 22px 28px" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.ink }}>{enlargedItem.zh}</div>
              <div style={{ fontSize: 14, color: C.inkMid, marginTop: 4 }}>{enlargedItem.en}</div>
              <div style={{ marginTop: 10, fontSize: 14, color: C.gold, fontWeight: 700 }}>推荐克重：{enlargedItem.weight}</div>
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
                style={{ marginTop: 22, width: "100%", padding: "18px", background: C.ink, border: "none", borderRadius: 60, color: "#fff", fontSize: 16, cursor: "pointer", fontWeight: 700, fontFamily: "'Noto Sans SC', sans-serif" }}>
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
      background: color + "18", color, fontWeight: 700, border: `1.5px solid ${color}50` }}>
      {a}
    </span>
  );
}
