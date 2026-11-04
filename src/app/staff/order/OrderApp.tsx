'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './order.css';
import {
  SKUS, CATS, VENDOR, STORES, STAFF_PIN, csPrice,
  type Sku, type Brand, type Store,
} from '@/data/vendors/sj';

// ---------- types ----------
type Status = 'sent' | 'received';
type Qty = Record<string, number>;
interface Order {
  id: string; date: string; store: string; who: string; qty: Qty; status: Status; ts: number;
  eta?: string; memo?: string;
  recv?: Qty; receipt?: string; recvBy?: string; recvNote?: string; recvTs?: number;
}
type View = 'order' | 'history';
type Sheet = { t: 'confirm'; o: Order } | { t: 'dispatch'; id: string } | { t: 'receive'; id: string } | null;

const STATUS: Record<Status, string> = { sent: '已下单·待收货', received: '已收货' };

// ---------- storage (per device; server sync comes later) ----------
const K = { draft: 'sj.draft', who: 'sj.who', store: 'sj.store', hist: 'sj.hist', pin: 'sj.pinok' };
function lsGet<T>(k: string, fb: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; } }
function lsSet(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }

// ---------- helpers ----------
const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTs = (t?: number) => { if (!t) return ''; const d = new Date(t); return `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const storeOf = (id: string): Store => STORES.find(s => s.id === id) || STORES[0];
function totals(q: Qty) {
  let cs = 0, lb = 0, amt = 0, unk = 0;
  for (const s of SKUS) { const n = q[s.id] || 0; if (!n) continue; cs += n; if (s.lb) lb += n * s.lb; else unk++; const p = csPrice(s); if (p != null) amt += n * p; else unk++; }
  return { cs, lb, amt, unk };
}
const lines = (q: Qty) => SKUS.filter(s => q[s.id]).map(s => ({ s, n: q[s.id] }));
const isYgf = (s: Sku) => s.brand === 'YGF';

function orderText(o: Order) {
  const st = storeOf(o.store); const L = lines(o.qty); const t = totals(o.qty);
  const fmt = (x: { s: Sku; n: number }) => `${x.n} ${x.s.unit}  ${x.s.name}${x.s.note ? '（' + x.s.note + '）' : ''}`;
  const by = L.filter(x => !isYgf(x.s)), ygf = L.filter(x => isYgf(x.s));
  return [
    `SJ 叫货单 · ${st.billTo}`,
    `日期 ${o.date}  请货人 ${o.who || '—'}  单号 ${o.id}${o.eta ? '  希望送货 ' + o.eta : ''}`,
    `送货：${st.shipTo} · ${st.shipNote}`, '',
    ...(by.length ? ['【北苑 / 共用】', ...by.map(fmt)] : []),
    ...(ygf.length ? ['', '【杨国福】', ...ygf.map(fmt)] : []),
    '', `合计 ${t.cs} 箱 · 约 ${Math.round(t.lb)}${t.unk ? '+' : ''} 磅`,
    o.memo ? `备注：${o.memo}` : '',
  ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
}
function acctText(o: Order) {
  const st = storeOf(o.store); const L = lines(o.qty); const t = totals(o.qty);
  const sum = (f: (s: Sku) => boolean) => L.filter(x => f(x.s)).reduce((a, x) => a + (csPrice(x.s) || 0) * x.n, 0);
  const row = (x: { s: Sku; n: number }) => { const p = csPrice(x.s); return `${x.s.name}  ${x.n} CS${x.s.lb ? ' × ' + x.s.lb + 'LB' : ''}  ${p != null ? '≈$' + (p * x.n).toFixed(2) : '价格待补'}  [${isYgf(x.s) ? 'YGF' : 'BY'}]`; };
  return [
    `采购单 ${o.id} — ${VENDOR.name}`, `门店：${st.name}  公司：${st.billTo}`,
    `下单 ${fmtTs(o.ts)}  请货人 ${o.who || '—'}  预计送货：${o.eta || '—'}`, '',
    ...L.map(row), '',
    `预估合计 ≈ $${t.amt.toFixed(2)}${t.unk ? '（部分未定价）' : ''}  ·  ${t.cs} 箱  ·  约 ${Math.round(t.lb)} 磅`,
    `按品牌分摊：BY ≈ $${sum(s => !isYgf(s)).toFixed(2)} / YGF ≈ $${sum(isYgf).toFixed(2)}`, '',
    `收货后将补发：到货数量差异 + SJ 收据/Invoice 号`,
  ].join('\n');
}
function recvText(o: Order) {
  const L = lines(o.qty); const rc = o.recv || {};
  const diffs = L.filter(x => (rc[x.s.id] ?? x.n) !== x.n);
  return [
    `收货回执 ${o.id} — ${VENDOR.name} · ${storeOf(o.store).name}`, `SJ 收据/Invoice 号：${o.receipt}`, `收货人 ${o.recvBy} · ${fmtTs(o.recvTs)}`,
    diffs.length ? '差异：' : '到货与订单一致，无差异。',
    ...diffs.map(x => `  ${x.s.name}  订 ${x.n} / 到 ${rc[x.s.id]}  (${rc[x.s.id] - x.n > 0 ? '+' : ''}${rc[x.s.id] - x.n})`),
    o.recvNote ? `备注：${o.recvNote}` : '',
  ].filter(Boolean).join('\n');
}
/** Renders the order as a PNG data URL (large type, readable in WeChat). */
function drawSheet(o: Order): string {
  const st = storeOf(o.store); const L = lines(o.qty); const t = totals(o.qty); const W = 1200, rowH = 80, top = 300;
  const groups = new Set(L.map(x => isYgf(x.s))).size;
  const H = top + L.length * rowH + groups * 70 + (o.memo ? 60 : 0) + 170;
  const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2;
  const g = cv.getContext('2d')!; g.scale(2, 2);
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.textBaseline = 'middle';
  const F = (w: number, s: number) => { g.font = `${w} ${s}px "PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif`; };
  F(700, 46); g.fillStyle = '#111'; g.fillText('SJ 订货单（肉类生鲜）', 40, 60);
  F(400, 28); g.fillStyle = '#444';
  g.fillText(`Bill To: ${st.billTo}`, 40, 120);
  g.fillText(`送货: ${st.shipTo} · ${st.shipNote}`, 40, 164);
  g.fillText(`日期: ${o.date}    请货人: ${o.who || '—'}    单号: ${o.id}${o.eta ? '    希望送货: ' + o.eta : ''}`, 40, 208);
  g.fillStyle = '#111'; g.fillRect(40, 248, W - 80, 2);
  F(700, 24); g.fillStyle = '#666';
  g.fillText('数量', 56, 274); g.fillText('单位', 170, 274); g.fillText('品名', 290, 274); g.fillText('规格 / 备注', 740, 274); g.fillText('到货', 1080, 274);
  g.fillRect(40, 296, W - 80, 1);
  let y = top; let last: string | null = null;
  const draw = (x: { s: Sku; n: number }) => {
    const b = isYgf(x.s) ? 'YGF' : 'BY';
    if (b !== last) { F(700, 28); g.fillStyle = b === 'YGF' ? '#b4461c' : '#1f5f8b'; g.fillText(b === 'YGF' ? '杨国福' : '北苑 / 共用', 56, y + 30); y += 70; last = b; }
    F(700, 40); g.fillStyle = '#111'; g.fillText(String(x.n), 66, y + rowH / 2);
    F(400, 28); g.fillText(x.s.unit, 170, y + rowH / 2);
    F(500, 32); g.fillText(x.s.name, 290, y + rowH / 2);
    F(400, 26); g.fillStyle = '#555'; g.fillText([x.s.lb ? x.s.lb + 'LB/CS' : '', x.s.note].filter(Boolean).join(' · '), 740, y + rowH / 2);
    g.strokeStyle = '#bbb'; g.lineWidth = 2; g.strokeRect(1080, y + 14, 80, rowH - 28);
    g.fillStyle = '#e5e5e5'; g.fillRect(40, y + rowH - 1, W - 80, 1); y += rowH;
  };
  L.filter(x => !isYgf(x.s)).forEach(draw); L.filter(x => isYgf(x.s)).forEach(draw);
  F(700, 32); g.fillStyle = '#111'; g.fillText(`合计 ${t.cs} 箱 · 约 ${Math.round(t.lb)}${t.unk ? '+' : ''} 磅`, 40, y + 50);
  if (o.memo) { F(400, 26); g.fillStyle = '#b4461c'; g.fillText(`备注: ${o.memo}`, 40, y + 100); y += 60; }
  F(400, 24); g.fillStyle = '#666'; g.fillText('RECEIVED BY: ____________   收据号: ____________   日期: ________', 40, y + 110);
  return cv.toDataURL('image/png');
}

/** One-tap export: share sheet (→ WeChat / Save Image) where supported, else a file download. */
async function exportImage(dataUrl: string, filename: string, toast: (m: string) => void) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try { await nav.share({ files: [file], title: filename }); return; }
      catch (e) { if ((e as Error).name === 'AbortError') return; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('已下载到「文件」/ 下载目录');
  } catch { toast('导出失败，请长按图片保存'); }
}

// ---------- component ----------
export default function OrderApp() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState(''); const [pinErr, setPinErr] = useState('');
  const [qty, setQty] = useState<Qty>({});
  const [who, setWho] = useState('');
  const [store, setStore] = useState(STORES[0].id);
  const [hist, setHist] = useState<Order[]>([]);
  const [brand, setBrand] = useState<Brand>('ALL');
  const [view, setView] = useState<View>('order');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [toastMsg, setToastMsg] = useState(''); const toastT = useRef<number | undefined>(undefined);
  const today = useMemo(() => fmtDate(new Date()), []);
  const st = storeOf(store);

  // hydrate from localStorage + hash (client-only state; server renders an empty shell)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQty(lsGet<Qty>(K.draft, {})); setWho(lsGet(K.who, '')); setStore(lsGet(K.store, STORES[0].id)); setHist(lsGet<Order[]>(K.hist, []));
    const ok = lsGet<number>(K.pin, 0); if (ok && Date.now() - ok < 90 * 864e5) setUnlocked(true);
    const route = () => { setView(location.hash === '#history' ? 'history' : 'order'); setSheet(null); };
    route(); window.addEventListener('hashchange', route); setReady(true);
    return () => window.removeEventListener('hashchange', route);
  }, []);

  const toast = useCallback((m: string) => { setToastMsg(m); window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => setToastMsg(''), 2200); }, []);
  const saveQty = (q: Qty) => { setQty(q); lsSet(K.draft, q); };
  const saveHist = (h: Order[]) => { const s = h.slice(0, 80); setHist(s); lsSet(K.hist, s); };
  const go = (v: View) => { const h = v === 'order' ? '' : '#' + v; if (location.hash !== h) location.hash = h; else { setView(v); setSheet(null); } };
  const vis = (s: Sku) => (brand === 'ALL' || s.brand === brand || s.brand === 'ALL') && (s.brand === 'ALL' || st.brands.includes(s.brand));
  const copy = (txt: string) => navigator.clipboard?.writeText(txt).then(() => toast('已复制')).catch(() => toast('复制失败，请长按选择文字'));

  const t = totals(qty);
  const pendingR = hist.filter(o => o.status === 'sent').length;

  const onPin = (v: string) => {
    setPin(v); if (v.length < 4) return;
    if (v === STAFF_PIN) { lsSet(K.pin, Date.now()); setUnlocked(true); } else { setPinErr('PIN 不对'); setPin(''); }
  };
  const bump = (id: string, d: number) => { const q = { ...qty }; q[id] = Math.max(0, (q[id] || 0) + d); if (!q[id]) delete q[id]; saveQty(q); };
  const startConfirm = () => {
    if (!who.trim()) { toast('请先填写请货人'); document.getElementById('who')?.focus(); return; }
    const d = new Date(); const id = 'SJ' + fmtDate(d).replace(/-/g, '').slice(2) + '-' + pad(d.getHours()) + pad(d.getMinutes());
    setSheet({ t: 'confirm', o: { id, date: fmtDate(d), store, who: who.trim(), qty: { ...qty }, status: 'sent', ts: Date.now() } });
  };
  const update = (id: string, patch: Partial<Order>) => saveHist(hist.map(o => o.id === id ? { ...o, ...patch } : o));
  const find = (id: string) => hist.find(o => o.id === id);

  if (!ready) return <div className="so" />;

  return (
    <div className="so">
      {!unlocked && (
        <div className="gate"><div className="box">
          <h2>SJ 叫货单</h2><p>Luxtyle 员工 · 店内 PIN</p>
          <input id="pin" type="password" inputMode="numeric" maxLength={4} autoComplete="off" aria-label="PIN" value={pin} onChange={e => onPin(e.target.value)} autoFocus />
          <div className="err">{pinErr}</div>
        </div></div>
      )}

      <header>
        <div className="hrow">
          <h1>SJ 叫货单 <small>{st.shipNote}</small></h1>
          <div className="meta">
            <select id="store" aria-label="门店" value={store} onChange={e => { setStore(e.target.value); lsSet(K.store, e.target.value); setBrand('ALL'); }}>
              {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input id="who" placeholder="请货人" value={who} onChange={e => { setWho(e.target.value); lsSet(K.who, e.target.value); }} style={{ width: '6.5em' }} />
            <span className="num">{today}</span>
          </div>
        </div>
        <div className="tabs">
          {st.brands.length > 1 && (['ALL', ...st.brands] as Brand[]).map(b => (
            <button key={b} className="tab" data-on={brand === b} onClick={() => setBrand(b)}>{{ ALL: '全部', BY: '北苑', YGF: '杨国福' }[b]}</button>
          ))}
          <div className="nav">
            <button className="tab" data-on={view === 'order'} onClick={() => go('order')}>叫货</button>
            <button className="tab" data-on={view === 'history'} onClick={() => go('history')}>收货 / 历史{pendingR > 0 && <span className="cnt">{pendingR}</span>}</button>
          </div>
        </div>
      </header>

      <main>
        {view === 'order' && CATS.map(c => {
          const items = SKUS.filter(s => s.cat === c && vis(s)); if (!items.length) return null;
          return (
            <section className="cat" key={c}><h2>{c}</h2>
              {items.map(s => { const n = qty[s.id] || 0; const cp = csPrice(s); return (
                <div className={'row' + (n ? ' has' : '')} key={s.id}>
                  <div>
                    <div className="name"><span className={'badge ' + s.brand}>{s.brand === 'ALL' ? '共用' : s.brand}</span>{s.name}</div>
                    <div className="spec">
                      {[s.lb ? `${s.lb} LB/CS` : '箱规?', s.price != null ? (s.basis === 'lb' ? `$${s.price.toFixed(2)}/LB` : `$${s.price.toFixed(2)}/CS`) : '价格待补', cp != null && s.basis === 'lb' ? `≈$${cp.toFixed(0)}/CS` : '', s.note].filter(Boolean).join(' · ')}
                      {s.q && <span className="q"> · ⚠ {s.q}</span>}
                    </div>
                  </div>
                  <div className="step">
                    <button aria-label="减一" onClick={() => bump(s.id, -1)}>−</button>
                    <span className={'v num' + (n ? '' : ' zero')}>{n}</span>
                    <button aria-label="加一" onClick={() => bump(s.id, 1)}>+</button>
                  </div>
                </div>); })}
            </section>);
        })}

        {view === 'history' && (<>
          <section className="cat"><h2>叫货历史 · 点开收货确认</h2></section>
          {hist.length === 0 && <div className="empty">还没有叫货记录</div>}
          {hist.map(o => { const tt = totals(o.qty); return (
            <button className="hist" key={o.id} onClick={() => setSheet({ t: 'receive', id: o.id })}>
              <span className="d">{o.date} <span className="s num">{o.id}</span></span><span className={'pill ' + o.status}>{STATUS[o.status]}</span>
              <span className="s">{storeOf(o.store).name} · {tt.cs} 箱 · ≈{Math.round(tt.lb)} 磅 · {o.who}{o.receipt ? ' · 收据 ' + o.receipt : ''}{o.recvBy ? ' · ' + o.recvBy + '收' : ''}</span><span />
            </button>); })}
        </>)}
      </main>

      {view === 'order' && (
        <footer>
          <div className="tot">
            <span>箱数 <b className="num">{t.cs}</b></span>
            <span>约 <b className="num">{Math.round(t.lb)}{t.unk ? '+' : ''}</b> 磅</span>
            <span>约 $<b className="num">{t.amt.toFixed(0)}{t.unk ? '+' : ''}</b></span>
            <span className={'minw' + (t.cs && t.lb >= VENDOR.minLb ? ' ok' : '')}>
              {!t.cs ? `起送 ${VENDOR.minLb} 磅` : t.lb >= VENDOR.minLb ? '已达起送' : `距起送还差 ${Math.ceil(VENDOR.minLb - t.lb)} 磅${t.unk ? '（部分箱规未知）' : ''}`}
            </span>
          </div>
          <div className="acts">
            <button className="btn" onClick={() => { const q = { ...qty }; for (const s of SKUS) if (s.par && vis(s)) q[s.id] = s.par; saveQty(q); toast('已按惯常量填入，请逐项核对'); }}>按惯常量填</button>
            <button className="btn" onClick={() => saveQty({})}>清空</button>
            <button className="btn pri" disabled={!t.cs} onClick={startConfirm}>生成叫货单</button>
          </div>
        </footer>
      )}

      {sheet?.t === 'confirm' && <ConfirmSheet o={sheet.o} onClose={() => setSheet(null)} onSubmit={o => { saveHist([o, ...hist]); saveQty({}); setSheet({ t: 'dispatch', id: o.id }); }} />}
      {sheet?.t === 'dispatch' && find(sheet.id) && <DispatchSheet o={find(sheet.id)!} copy={copy} toast={toast} onClose={() => go('history')} />}
      {sheet?.t === 'receive' && find(sheet.id) && <ReceiveSheet o={find(sheet.id)!} copy={copy} toast={toast} onClose={() => setSheet(null)}
        onShowSheet={() => setSheet({ t: 'dispatch', id: sheet.id })}
        onAgain={() => { saveQty({ ...find(sheet.id)!.qty }); go('order'); toast('已复制到草稿'); }}
        onConfirm={p => { update(sheet.id, { ...p, status: 'received', recvTs: Date.now() }); toast('收货已确认'); }} />}

      <div className={'toast' + (toastMsg ? ' on' : '')} role="status">{toastMsg}</div>
    </div>
  );
}

// ---------- sheets ----------
// Data-URL PNG generated on device; next/image is not applicable.
// eslint-disable-next-line @next/next/no-img-element
const SheetImg = ({ src }: { src: string }) => <img className="sheetimg" src={src} alt="叫货单图片" />;

function Flow({ o }: { o: Order }) {
  const steps: [Status, string][] = [['sent', '① 下单 → 发群 + 会计'], ['received', '② 收货确认']];
  const rank: Record<Status, number> = { sent: 0, received: 1 };
  return <div className="flow">{steps.map(([s, l], i) => <span key={s} className={rank[o.status] >= i ? 'on' : ''}>{l}</span>)}</div>;
}

function ConfirmSheet({ o, onClose, onSubmit }: { o: Order; onClose: () => void; onSubmit: (o: Order) => void }) {
  const [eta, setEta] = useState(''); const [memo, setMemo] = useState('');
  const t = totals(o.qty);
  return (
    <div className="sheet">
      <div className="top"><h2>确认叫货 {o.id}</h2><button className="x" onClick={onClose}>返回修改</button></div>
      <Flow o={o} />
      <div className="field"><label htmlFor="eta">希望送货日（可选）</label><input id="eta" value={eta} onChange={e => setEta(e.target.value)} placeholder="例如 周一 11/10" /></div>
      <div className="field"><label htmlFor="memo">给 SJ 的备注（可选，会印在单上）</label><input id="memo" value={memo} onChange={e => setMemo(e.target.value)} placeholder="例如 五花肉要瘦一点" /></div>
      <div className="out"><h3>预览</h3><pre>{orderText({ ...o, eta: eta.trim(), memo: memo.trim() })}</pre></div>
      {t.lb < VENDOR.minLb && <p className="hint" style={{ color: 'var(--crit)' }}>未达 {VENDOR.minLb} 磅起送（约 {Math.round(t.lb)} 磅），SJ 可能不送。</p>}
      <div className="acts"><button className="btn pri" onClick={() => onSubmit({ ...o, eta: eta.trim(), memo: memo.trim() })}>确认 → 生成发群图 + 会计单</button></div>
    </div>
  );
}

function DispatchSheet({ o, copy, toast, onClose }: { o: Order; copy: (t: string) => void; toast: (m: string) => void; onClose: () => void }) {
  const [img, setImg] = useState('');
  useEffect(() => { let on = true; (document.fonts?.ready ?? Promise.resolve()).then(() => { if (on) setImg(drawSheet(o)); }); return () => { on = false; }; }, [o]);
  return (
    <div className="sheet">
      <div className="top"><h2>叫货单 {o.id}</h2><span className={'pill ' + o.status}>{STATUS[o.status]}</span><button className="x" onClick={onClose}>完成</button></div>
      <Flow o={o} />
      <div className="acts">
        <button className="btn pri" disabled={!img} onClick={() => exportImage(img, `${o.id}.png`, toast)}>一键发送图片 → 微信 / 相册</button>
        <button className="btn" onClick={() => copy(orderText(o))}>复制文字版</button>
      </div>
      <div className="out"><h3>① 叫货单图片（预览）</h3>
        {img ? <SheetImg src={img} /> : <p className="hint">生成中…</p>}
        <p className="hint">点上面的按钮直接选微信群发送，或存到相册；长按图片也可以。</p></div>
      <div className="out"><h3>② 发会计（当前请复制；后续自动发送）</h3><pre>{acctText(o)}</pre>
        <div className="acts"><button className="btn pri" onClick={() => copy(acctText(o))}>复制会计单</button></div></div>
      <div className="out"><h3>文字版</h3><pre>{orderText(o)}</pre></div>
    </div>
  );
}

function ReceiveSheet({ o, copy, toast, onClose, onAgain, onShowSheet, onConfirm }: {
  o: Order; copy: (t: string) => void; toast: (m: string) => void; onClose: () => void; onAgain: () => void; onShowSheet: () => void;
  onConfirm: (p: { recv: Qty; receipt: string; recvBy: string; recvNote: string }) => void;
}) {
  const L = lines(o.qty); const done = o.status === 'received';
  const [rc, setRc] = useState<Record<string, string>>(() => Object.fromEntries(L.map(x => [x.s.id, o.recv?.[x.s.id] != null ? String(o.recv[x.s.id]) : ''])));
  const [receipt, setReceipt] = useState(o.receipt || ''); const [rby, setRby] = useState(o.recvBy || ''); const [rnote, setRnote] = useState(o.recvNote || '');
  const confirm = () => {
    if (!receipt.trim()) { toast('请填写 SJ 收据号'); return; }
    if (!rby.trim()) { toast('请填写收货人'); return; }
    if (L.some(x => rc[x.s.id] === '')) { toast('每一项都要填到货数量（没到填 0）'); return; }
    onConfirm({ recv: Object.fromEntries(L.map(x => [x.s.id, +rc[x.s.id]])), receipt: receipt.trim(), recvBy: rby.trim(), recvNote: rnote.trim() });
  };
  return (
    <div className="sheet">
      <div className="top"><h2>收货 {o.id}</h2><span className={'pill ' + o.status}>{STATUS[o.status]}</span><button className="x" onClick={onClose}>返回</button></div>
      <Flow o={o} />
      <p className="hint" style={{ marginTop: 0 }}>{storeOf(o.store).name} · 下单 {fmtTs(o.ts)} · {o.who}{o.eta ? ' · 希望送货 ' + o.eta : ''}</p>
      <div className="rcv rhead"><span>品名</span><span>订</span><span>到货</span><span>差</span></div>
      {L.map(x => { const v = rc[x.s.id]; const df = v === '' ? null : +v - x.n; return (
        <div className="rcv" key={x.s.id}>
          <span>{x.s.name}</span><span className="num" style={{ textAlign: 'center' }}>{x.n}</span>
          <input type="number" inputMode="numeric" min={0} id={'r-' + x.s.id} value={v} disabled={done} onChange={e => setRc({ ...rc, [x.s.id]: e.target.value })} />
          <span className={'diff num ' + (df == null ? '' : df ? 'bad' : 'good')}>{df == null ? '' : df > 0 ? '+' + df : df}</span>
        </div>); })}
      {!done && <div className="acts" style={{ marginTop: 8 }}><button className="btn" onClick={() => setRc(Object.fromEntries(L.map(x => [x.s.id, String(x.n)])))}>全部按订量到货</button></div>}
      <div className="field"><label htmlFor="receipt">SJ 收据 / Invoice 号 *</label><input id="receipt" value={receipt} disabled={done} onChange={e => setReceipt(e.target.value)} placeholder="送货单右上角号码" /></div>
      <div className="field"><label htmlFor="rby">收货人 *</label><input id="rby" value={rby} disabled={done} onChange={e => setRby(e.target.value)} /></div>
      <div className="field"><label htmlFor="rnote">收货备注（破损、退货、换货）</label><input id="rnote" value={rnote} disabled={done} onChange={e => setRnote(e.target.value)} /></div>
      {done ? <p className="hint">已于 {fmtTs(o.recvTs)} 确认收货。</p> : <div className="acts" style={{ marginTop: 14 }}><button className="btn ok" onClick={confirm}>确认收货</button></div>}
      <div className="acts">
        <button className="btn" onClick={onAgain}>再叫一次（复制到草稿）</button>
        <button className="btn" onClick={onShowSheet}>查看叫货单 / 重发</button>
      </div>
      {done && <div className="out"><h3>发会计（收货回执）</h3><pre>{recvText(o)}</pre><div className="acts"><button className="btn" onClick={() => copy(recvText(o))}>复制回执</button></div></div>}
    </div>
  );
}
