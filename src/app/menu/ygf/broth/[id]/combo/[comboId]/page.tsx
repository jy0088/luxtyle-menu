"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { use } from "react";
import { BROTHS, ALL_ITEMS, ALLERGEN_COLOR, type MenuItem, type Allergen } from "../../../../menuData";

export default function ComboPage({ params }: { params: Promise<{ id: string; comboId: string }> }) {
  const { id, comboId } = use(params);
  const broth = BROTHS.find(b => b.id === id);
  const combo = broth?.combos.find(c => c.id === comboId);

  const [page, setPage] = useState(0);
  const [enlargedItem, setEnlargedItem] = useState<MenuItem | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!broth || !combo) return <NotFound brothId={id} />;

  // Resolve items
  const resolvedItems: (MenuItem & { weight: string })[] = combo.items.map(ci => {
    const found = ALL_ITEMS.find(i => i.id === ci.itemId);
    return found
      ? { ...found, weight: ci.weight }
      : { id: ci.itemId, zh: ci.itemId, en: ci.itemId, weight: ci.weight };
  });

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(resolvedItems.length / ITEMS_PER_PAGE);
  const pageItems = resolvedItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  function pressStart(item: MenuItem) {
    pressTimer.current = setTimeout(() => setEnlargedItem(item), 500);
  }
  function pressEnd() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  return (
    <div style={{ fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", background: "#0d0d0d", color: "#f0ede6", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>

      {/* Sticky header with back */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(13,13,13,0.95)", backdropFilter: "blur(10px)", padding: "14px 16px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/menu/ygf/broth/${id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, background: "#1a1a1a", borderRadius: 12, textDecoration: "none", fontSize: 18, color: "#f0ede6", flexShrink: 0 }}>‹</Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f0ede6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{combo.zh}</div>
            <div style={{ fontSize: 11, color: "#666" }}>{combo.en} · {broth.zh}</div>
          </div>
        </div>
      </div>

      {/* Combo hero strip */}
      <div style={{ background: broth.color, padding: "20px 16px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: 1 }}>推荐搭配 · RECOMMENDED COMBO</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{combo.zh}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{combo.highlight}</div>
        <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "6px 12px" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>搭配主食</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f5c842" }}>{combo.staple}</span>
        </div>
      </div>

      {/* Page indicator */}
      {totalPages > 1 && (
        <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#666" }}>食材清单 · {resolvedItems.length} 种</div>
          <div style={{ fontSize: 12, color: "#888" }}>第 {page + 1} / {totalPages} 页</div>
        </div>
      )}

      {/* 2×2 grid (4 items per page) */}
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {pageItems.map((item) => (
            <div key={item.id}
              onMouseDown={() => pressStart(item)}
              onMouseUp={pressEnd}
              onTouchStart={() => pressStart(item)}
              onTouchEnd={pressEnd}
              onContextMenu={e => { e.preventDefault(); setEnlargedItem(item); }}
              style={{ background: "#1a1a1a", borderRadius: 16, overflow: "hidden", cursor: "pointer", userSelect: "none", position: "relative" }}>

              {/* Image */}
              <div style={{ aspectRatio: "1", background: "#111", overflow: "hidden" }}>
                {item.img
                  ? <img src={item.img} alt={item.zh} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#2a2a2a" }}>🍽</div>
                }
              </div>

              {/* Weight badge */}
              <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "#f5c842", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
                {item.weight}
              </div>

              {/* Info */}
              <div style={{ padding: "12px 12px 14px" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#f0ede6", marginBottom: 3 }}>{item.zh}</div>
                <div style={{ fontSize: 11, color: "#777", lineHeight: 1.4 }}>{item.en}</div>
                {item.allergens?.length ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                    {item.allergens.map(a => <AllergenTag key={a} a={a} />)}
                  </div>
                ) : (
                  <div style={{ marginTop: 8, fontSize: 10, color: "#3a7a3a" }}>✓ 无主要过敏源</div>
                )}
              </div>
            </div>
          ))}

          {/* Staple card (always last) */}
          {page === totalPages - 1 && (
            <div style={{ background: "#1e1200", borderRadius: 16, overflow: "hidden", border: "1px solid #3a2800", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 8, minHeight: 200 }}>
              <div style={{ fontSize: 36 }}>🍜</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f5c842" }}>主食</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#f0ede6" }}>{combo.staple}</div>
              <div style={{ fontSize: 11, color: "#888" }}>Noodles / Staple</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 24, padding: "0 0 8px" }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ width: 48, height: 48, borderRadius: 12, background: page > 0 ? "#1a1a1a" : "#111", border: "1px solid #2a2a2a", color: page > 0 ? "#f0ede6" : "#333", fontSize: 20, cursor: page > 0 ? "pointer" : "default" }}>‹</button>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{ width: i === page ? 20 : 7, height: 7, borderRadius: 4, background: i === page ? "#f5c842" : "#333", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              style={{ width: 48, height: 48, borderRadius: 12, background: page < totalPages - 1 ? "#1a1a1a" : "#111", border: "1px solid #2a2a2a", color: page < totalPages - 1 ? "#f0ede6" : "#333", fontSize: 20, cursor: page < totalPages - 1 ? "pointer" : "default" }}>›</button>
          </div>
        )}
      </div>

      {/* Hint */}
      <div style={{ textAlign: "center", fontSize: 11, color: "#444", padding: "16px 16px 40px" }}>
        长按食材图片查看详情与过敏源 · Long press to see details
      </div>

      {/* Long-press modal */}
      {enlargedItem && (
        <div onClick={() => setEnlargedItem(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 22, overflow: "hidden", width: "100%", maxWidth: 380 }}
            onClick={e => e.stopPropagation()}>
            {enlargedItem.img && (
              <img src={enlargedItem.img} alt={enlargedItem.zh} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
            )}
            <div style={{ padding: "22px 22px 28px" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#f0ede6" }}>{enlargedItem.zh}</div>
              <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{(enlargedItem as any).en}</div>
              {(enlargedItem as any).weight && (
                <div style={{ marginTop: 10, fontSize: 14, color: "#f5c842", fontWeight: 700 }}>推荐克重：{(enlargedItem as any).weight}</div>
              )}
              {enlargedItem.allergens?.length ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: "#f5c842", marginBottom: 10, fontWeight: 700 }}>⚠️ 过敏源 Allergens</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {enlargedItem.allergens.map(a => <AllergenTag key={a} a={a} large />)}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16, fontSize: 13, color: "#4caf50" }}>✅ 无主要过敏源 No major allergens listed</div>
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
    <span style={{ fontSize: large ? 13 : 10, padding: large ? "5px 12px" : "2px 6px", borderRadius: 6,
      background: color + "25", color, fontWeight: 700, border: `1px solid ${color}40` }}>
      {a}
    </span>
  );
}

function NotFound({ brothId }: { brothId: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🥣</div>
      <div style={{ color: "#888" }}>搭配未找到</div>
      <Link href={`/menu/ygf/broth/${brothId}`} style={{ color: "#f5c842", textDecoration: "none", fontSize: 15 }}>← 返回汤底</Link>
    </div>
  );
}
