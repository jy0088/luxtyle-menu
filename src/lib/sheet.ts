// Unified document renderer for every staff sheet (叫货单 / 领料单 / 采买清单 / 补货单).
// One layout: header block → bilingual rows with spec + reference price → totals → sign line.
import type { Item } from '@/data/types';
import { unitPrice } from '@/data/types';

export interface SheetRow { item: Item; qty: number; extraNote?: string }
export interface SheetDoc {
  title: string;            // e.g. "SJ 叫货单 · Order Sheet"
  meta: string[];           // header lines (Bill To / Ship To / 门店 / 请货人 …)
  id: string; date: string;
  rows: SheetRow[];
  memo?: string;
  showPrice?: boolean;      // default true
  signLine?: string;        // default receiving sign line
  accent?: string;          // header rule color
}

const pad = (n: number) => String(n).padStart(2, '0');
export const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fmtTs = (t?: number) => { if (!t) return ''; const d = new Date(t); return `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const newId = (prefix: string, d = new Date()) => `${prefix}${fmtDate(d).replace(/-/g, '').slice(2)}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

export function specOf(it: Item) { return [it.pack, it.note].filter(Boolean).join(' · '); }
export function refText(it: Item) {
  if (it.refPrice == null) return '待定价';
  if (it.basis === 'lb') { const u = unitPrice(it); return `$${it.refPrice.toFixed(2)}/LB${u != null ? ` ≈ $${u.toFixed(2)}/${it.unit}` : ''}`; }
  return `$${it.refPrice.toFixed(2)}/${it.unit}`;
}
export function totals(rows: SheetRow[]) {
  let pcs = 0, lb = 0, amt = 0, unpriced = 0;
  for (const r of rows) { pcs += r.qty; if (r.item.lb) lb += r.item.lb * r.qty; const u = unitPrice(r.item); if (u == null) unpriced++; else amt += u * r.qty; }
  return { pcs, lb, amt, unpriced };
}

/** Plain-text version (for WeChat paste / accounting). */
export function sheetText(doc: SheetDoc) {
  const t = totals(doc.rows); const price = doc.showPrice !== false;
  const line = (r: SheetRow) => {
    const u = unitPrice(r.item);
    return `${r.qty} ${r.item.unit}  ${r.item.zh} / ${r.item.en}${r.item.pack ? `  [${r.item.pack}]` : ''}${r.item.note ? `（${r.item.note}）` : ''}${price ? (u != null ? `  ≈$${(u * r.qty).toFixed(2)}` : '  价格待定') : ''}${r.extraNote ? `  ${r.extraNote}` : ''}`;
  };
  const groups = new Map<string, SheetRow[]>(); for (const r of doc.rows) { const k = r.item.cat1; if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(r); }
  return [
    doc.title, `单号 ${doc.id} · ${doc.date}`, ...doc.meta, '',
    ...[...groups.entries()].flatMap(([k, rs]) => [`【${k}】`, ...rs.map(line)]),
    '', `合计 ${t.pcs} 件${t.lb ? ` · 约 ${Math.round(t.lb)} 磅` : ''}${price ? ` · 参考 ≈ $${t.amt.toFixed(2)}${t.unpriced ? `（${t.unpriced} 项未定价）` : ''}` : ''}`,
    doc.memo ? `备注：${doc.memo}` : '',
  ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
}

function fit(g: CanvasRenderingContext2D, text: string, max: number) {
  if (g.measureText(text).width <= max) return text;
  let t = text; while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…';
}

/** PNG data URL. 1200 px wide @2x, large type so it reads in WeChat. */
export function renderSheet(doc: SheetDoc): string {
  const price = doc.showPrice !== false;
  const W = 1240, rowH = 92, headH = 150 + doc.meta.length * 40 + 70;
  const groups = new Map<string, SheetRow[]>(); for (const r of doc.rows) { const k = r.item.cat1; if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(r); }
  const H = headH + doc.rows.length * rowH + groups.size * 56 + (doc.memo ? 60 : 0) + 190;
  const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2;
  const g = cv.getContext('2d')!; g.scale(2, 2); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.textBaseline = 'middle';
  const F = (w: number, s: number) => { g.font = `${w} ${s}px "PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif`; };
  const accent = doc.accent || '#1d1b17';
  // header
  F(700, 42); g.fillStyle = '#111'; g.fillText(doc.title, 40, 56);
  F(500, 26); g.fillStyle = '#444'; g.fillText(`单号 ${doc.id}    日期 ${doc.date}`, 40, 104);
  let y = 144; F(400, 26); for (const m of doc.meta) { g.fillText(m, 40, y); y += 40; }
  y += 6; g.fillStyle = accent; g.fillRect(40, y, W - 80, 3); y += 22;
  F(700, 22); g.fillStyle = '#666';
  const cx = { qty: 50, unit: 150, name: 240, spec: 700, ref: 960, box: 1130 };
  g.fillText('数量 Qty', cx.qty, y); g.fillText('单位', cx.unit, y); g.fillText('品名 Item', cx.name, y); g.fillText('规格 Spec', cx.spec, y); if (price) g.fillText('参考价 Ref', cx.ref, y); g.fillText('到货', cx.box, y);
  y += 22; g.fillStyle = '#ddd'; g.fillRect(40, y, W - 80, 1); y += 8;
  for (const [cat, rs] of groups) {
    F(700, 24); g.fillStyle = accent; g.fillText(cat, cx.qty, y + 28); y += 56;
    for (const r of rs) {
      const it = r.item; const u = unitPrice(it);
      F(700, 40); g.fillStyle = '#111'; g.fillText(String(r.qty), cx.qty + 8, y + rowH / 2);
      F(400, 24); g.fillStyle = '#333'; g.fillText(it.unit, cx.unit, y + rowH / 2);
      F(600, 30); g.fillStyle = '#111'; g.fillText(fit(g, it.zh, cx.spec - cx.name - 16), cx.name, y + rowH / 2 - 16);
      F(400, 21); g.fillStyle = '#777'; g.fillText(fit(g, it.en, cx.spec - cx.name - 16), cx.name, y + rowH / 2 + 18);
      F(400, 22); g.fillStyle = '#444';
      const spec = [it.pack, it.note, r.extraNote].filter(Boolean).join(' · '); g.fillText(fit(g, spec, (price ? cx.ref : cx.box) - cx.spec - 16), cx.spec, y + rowH / 2);
      if (price) { F(400, 22); g.fillStyle = '#444'; g.fillText(u != null ? `$${u.toFixed(2)}` : '待定价', cx.ref, y + rowH / 2 - 14); F(400, 19); g.fillStyle = '#888'; if (it.basis === 'lb' && it.refPrice != null) g.fillText(`$${it.refPrice.toFixed(2)}/LB`, cx.ref, y + rowH / 2 + 14); else if (u != null) g.fillText(`小计 $${(u * r.qty).toFixed(2)}`, cx.ref, y + rowH / 2 + 14); }
      g.strokeStyle = '#bbb'; g.lineWidth = 2; g.strokeRect(cx.box, y + 20, 70, rowH - 40);
      g.fillStyle = '#e8e8e8'; g.fillRect(40, y + rowH - 1, W - 80, 1); y += rowH;
    }
  }
  const t = totals(doc.rows);
  F(700, 30); g.fillStyle = '#111'; g.fillText(`合计 ${t.pcs} 件${t.lb ? ` · 约 ${Math.round(t.lb)} 磅` : ''}${price ? ` · 参考 ≈ $${t.amt.toFixed(2)}${t.unpriced ? `（${t.unpriced} 项未定价）` : ''}` : ''}`, 40, y + 44);
  y += 80;
  if (doc.memo) { F(400, 24); g.fillStyle = '#b4461c'; g.fillText(`备注: ${doc.memo}`, 40, y + 20); y += 60; }
  F(400, 22); g.fillStyle = '#666'; g.fillText(doc.signLine || 'RECEIVED BY: ______________   收据号 Invoice #: ______________   日期: ________', 40, y + 30);
  return cv.toDataURL('image/png');
}

/** One-tap export: share sheet where supported (→ WeChat / Save Image), else download. */
export async function exportImage(dataUrl: string, filename: string): Promise<'shared' | 'downloaded' | 'cancelled' | 'failed'> {
  try {
    const blob = await (await fetch(dataUrl)).blob(); const file = new File([blob], filename, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) { try { await nav.share({ files: [file], title: filename }); return 'shared'; } catch (e) { if ((e as Error).name === 'AbortError') return 'cancelled'; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return 'downloaded';
  } catch { return 'failed'; }
}
