'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../order/order.css';
import { WAREHOUSE, WH_VENDORS, WH_CATS, WH_SKUS, type WhSku, type WhVendorId } from '@/data/warehouse';
import { STORES, STAFF_PIN } from '@/data/vendors/types';

// ---------- types ----------
type View = 'count' | 'req' | 'replenish';
type Qty = Record<string, number>;
interface Stock { onHand: number; at: number }
interface Req { id: string; date: string; store: string; who: string; qty: Qty; memo?: string; status: 'sent' | 'fulfilled'; ts: number; fulfilledTs?: number }
interface CountSnap { id: string; ts: number; by: string; onHand: Qty }

// ---------- storage (per device; server sync later) ----------
const K = { stock: 'wh.stock', counts: 'wh.counts', reqs: 'wh.reqs', draft: 'wh.draft', who: 'wh.who', store: 'wh.store', run: 'wh.run', pin: 'sj.pinok' };
function lsGet<T>(k: string, fb: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; } }
function lsSet(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTs = (t?: number) => { if (!t) return ''; const d = new Date(t); return `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const vendorOf = (id: WhVendorId) => WH_VENDORS.find(v => v.id === id)!;
const storeName = (id: string) => STORES.find(s => s.id === id)?.name || id;
const lines = (q: Qty) => WH_SKUS.filter(s => q[s.id]).map(s => ({ s, n: q[s.id] }));

function reqText(r: Req) {
  const L = lines(r.qty);
  return [
    `仓库领料单 ${r.id} → ${WAREHOUSE.name}`,
    `门店 ${storeName(r.store)}  请货人 ${r.who}  ${fmtTs(r.ts)}`, '',
    ...L.map(x => `${x.n} ${x.s.unit}  ${x.s.name}  [${vendorOf(x.s.vendor).name}]`), '',
    `合计 ${L.length} 项`, r.memo ? `备注：${r.memo}` : '',
  ].filter(Boolean).join('\n');
}
function replenishText(v: WhVendorId, rows: { s: WhSku; onHand: number; short: number }[], run: string) {
  const vd = vendorOf(v);
  return [
    `仓库补货单 — ${vd.name}（${vd.inbound === 'la-pickup' ? 'LA 自提' : '送仓库'}）`,
    `${WAREHOUSE.name} · ${WAREHOUSE.address}`,
    vd.inbound === 'la-pickup' && run ? `车次 ${run}` : '', `生成 ${fmtTs(Date.now())}`, '',
    ...rows.map(r => `${r.short} ${r.s.unit}  ${r.s.name}  （在手 ${r.onHand} / 安全量 ${r.s.par}）`), '',
    `合计 ${rows.length} 项`,
  ].filter(Boolean).join('\n');
}
function drawReq(r: Req): string {
  const L = lines(r.qty); const W = 1200, rowH = 76, top = 260; const H = top + L.length * rowH + (r.memo ? 60 : 0) + 150;
  const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; const g = cv.getContext('2d')!; g.scale(2, 2);
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.textBaseline = 'middle';
  const F = (w: number, s: number) => { g.font = `${w} ${s}px "PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif`; };
  F(700, 46); g.fillStyle = '#111'; g.fillText('仓库领料单', 40, 60);
  F(400, 28); g.fillStyle = '#444';
  g.fillText(`${WAREHOUSE.name} · ${WAREHOUSE.address}`, 40, 120);
  g.fillText(`门店: ${storeName(r.store)}    请货人: ${r.who}    单号: ${r.id}    ${r.date}`, 40, 164);
  g.fillStyle = '#111'; g.fillRect(40, 204, W - 80, 2);
  F(700, 24); g.fillStyle = '#666'; g.fillText('数量', 56, 230); g.fillText('单位', 170, 230); g.fillText('品名', 290, 230); g.fillText('供应商', 860, 230); g.fillText('发货', 1080, 230);
  g.fillRect(40, 252, W - 80, 1);
  let y = top;
  for (const x of L) {
    F(700, 40); g.fillStyle = '#111'; g.fillText(String(x.n), 66, y + rowH / 2);
    F(400, 28); g.fillText(x.s.unit, 170, y + rowH / 2);
    F(500, 32); g.fillText(x.s.name, 290, y + rowH / 2);
    F(400, 24); g.fillStyle = '#555'; g.fillText(vendorOf(x.s.vendor).name, 860, y + rowH / 2);
    g.strokeStyle = '#bbb'; g.lineWidth = 2; g.strokeRect(1080, y + 14, 80, rowH - 28);
    g.fillStyle = '#e5e5e5'; g.fillRect(40, y + rowH - 1, W - 80, 1); y += rowH;
  }
  F(700, 32); g.fillStyle = '#111'; g.fillText(`合计 ${L.length} 项`, 40, y + 50);
  if (r.memo) { F(400, 26); g.fillStyle = '#b4461c'; g.fillText(`备注: ${r.memo}`, 40, y + 100); y += 60; }
  F(400, 24); g.fillStyle = '#666'; g.fillText('发货人 (Jason): ____________   发货日期: ________   门店签收: ____________', 40, y + 100);
  return cv.toDataURL('image/png');
}
async function exportImage(dataUrl: string, filename: string, toast: (m: string) => void) {
  try {
    const blob = await (await fetch(dataUrl)).blob(); const file = new File([blob], filename, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) { try { await nav.share({ files: [file], title: filename }); return; } catch (e) { if ((e as Error).name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    toast('已下载到「文件」/ 下载目录');
  } catch { toast('导出失败，请长按图片保存'); }
}
// eslint-disable-next-line @next/next/no-img-element
const SheetImg = ({ src }: { src: string }) => <img className="sheetimg" src={src} alt="领料单图片" />;

// ---------- component ----------
export default function WarehouseApp({ mode }: { mode: 'inbound' | 'pickup' }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState(''); const [pinErr, setPinErr] = useState('');
  const [view, setView] = useState<View>(mode === 'pickup' ? 'req' : 'count');
  const [stock, setStock] = useState<Record<string, Stock>>({});
  const [counts, setCounts] = useState<CountSnap[]>([]);
  const [countDraft, setCountDraft] = useState<Record<string, string>>({});
  const [reqs, setReqs] = useState<Req[]>([]);
  const [draft, setDraft] = useState<Qty>({});
  const [who, setWho] = useState(''); const [store, setStore] = useState(STORES[0].id);
  const [run, setRun] = useState('');
  const [vendorF, setVendorF] = useState<WhVendorId | 'all'>('all');
  const [sheet, setSheet] = useState<{ t: 'confirm'; r: Req } | { t: 'dispatch'; id: string } | null>(null);
  const [memo, setMemo] = useState('');
  const [toastMsg, setToastMsg] = useState(''); const toastT = useRef<number | undefined>(undefined);
  const [now] = useState(() => Date.now());
  const today = useMemo(() => fmtDate(new Date(now)), [now]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStock(lsGet(K.stock, {})); setCounts(lsGet(K.counts, [])); setReqs(lsGet(K.reqs, [])); setDraft(lsGet(K.draft, {}));
    setWho(lsGet(K.who, '')); setStore(lsGet(K.store, STORES[0].id)); setRun(lsGet(K.run, ''));
    const ok = lsGet<number>(K.pin, 0); if (ok && Date.now() - ok < 90 * 864e5) setUnlocked(true);
    const route = () => { if (mode === 'pickup') { setView('req'); setSheet(null); return; } const h = location.hash.replace('#', ''); setView(h === 'replenish' ? h : 'count'); setSheet(null); };
    route(); window.addEventListener('hashchange', route); setReady(true);
    return () => window.removeEventListener('hashchange', route);
  }, [mode]);

  const toast = useCallback((m: string) => { setToastMsg(m); window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => setToastMsg(''), 2200); }, []);
  const go = (v: View) => { const h = v === 'count' ? '' : '#' + v; if (location.hash !== h) location.hash = h; else { setView(v); setSheet(null); } };
  const copy = (txt: string) => navigator.clipboard?.writeText(txt).then(() => toast('已复制')).catch(() => toast('复制失败，请长按选择文字'));
  const saveDraft = (q: Qty) => { setDraft(q); lsSet(K.draft, q); };
  const saveReqs = (r: Req[]) => { const s = r.slice(0, 80); setReqs(s); lsSet(K.reqs, s); };
  const saveStock = (s: Record<string, Stock>) => { setStock(s); lsSet(K.stock, s); };
  const onPin = (v: string) => { setPin(v); if (v.length < 4) return; if (v === STAFF_PIN) { lsSet(K.pin, Date.now()); setUnlocked(true); } else { setPinErr('PIN 不对'); setPin(''); } };

  const lastCount = counts[0];
  const daysSince = lastCount ? Math.max(0, Math.floor((now - lastCount.ts) / 864e5)) : null;
  const visSku = (s: WhSku) => vendorF === 'all' || s.vendor === vendorF;
  const low = WH_SKUS.filter(s => stock[s.id] && stock[s.id].onHand < s.par);
  const pendingReq = reqs.filter(r => r.status === 'sent').length;

  // ---- actions ----
  const saveCount = () => {
    const filled = Object.entries(countDraft).filter(([, v]) => v !== '');
    if (!filled.length) { toast('还没有填任何数量'); return; }
    if (!who.trim()) { toast('请填写盘点人'); return; }
    const now = Date.now(); const s = { ...stock }; const onHand: Qty = {};
    for (const [id, v] of filled) { s[id] = { onHand: +v, at: now }; onHand[id] = +v; }
    saveStock(s);
    const snap: CountSnap = { id: 'CNT' + fmtDate(new Date()).replace(/-/g, '').slice(2), ts: now, by: who.trim(), onHand };
    const c = [snap, ...counts].slice(0, 24); setCounts(c); lsSet(K.counts, c); setCountDraft({});
    toast(`已保存 ${filled.length} 项盘点`);
  };
  const bump = (id: string, d: number) => { const q = { ...draft }; q[id] = Math.max(0, (q[id] || 0) + d); if (!q[id]) delete q[id]; saveDraft(q); };
  const startReq = () => {
    if (!who.trim()) { toast('请填写请货人'); return; }
    const d = new Date(); const id = 'WH' + fmtDate(d).replace(/-/g, '').slice(2) + '-' + pad(d.getHours()) + pad(d.getMinutes());
    setSheet({ t: 'confirm', r: { id, date: fmtDate(d), store, who: who.trim(), qty: { ...draft }, status: 'sent', ts: Date.now() } });
  };
  const fulfil = (id: string) => {
    const r = reqs.find(x => x.id === id); if (!r) return;
    const s = { ...stock }; for (const [sid, n] of Object.entries(r.qty)) if (s[sid]) s[sid] = { ...s[sid], onHand: Math.max(0, s[sid].onHand - n) };
    saveStock(s); saveReqs(reqs.map(x => x.id === id ? { ...x, status: 'fulfilled', fulfilledTs: Date.now() } : x)); toast('已发货，库存已扣减');
  };

  if (!ready) return <div className="so" />;
  const findReq = (id: string) => reqs.find(r => r.id === id);

  return (
    <div className="so">
      {!unlocked && (<div className="gate"><div className="box"><h2>L$ 员工</h2><p>{WAREHOUSE.address} · 店内 PIN</p>
        <input id="pin" type="password" inputMode="numeric" maxLength={4} autoComplete="off" aria-label="PIN" value={pin} onChange={e => onPin(e.target.value)} autoFocus /><div className="err">{pinErr}</div></div></div>)}

      <header>
        <div className="hrow">
          <h1><a href="/staff" style={{ color: 'inherit', textDecoration: 'none' }}>‹</a> {mode === 'pickup' ? '仓库提货' : '仓库进货'} <small>{mode === 'pickup' ? '门店向仓库领料' : `${WAREHOUSE.manager} · 9863 Pacific Heights · 60 天盘点`}</small></h1>
          <div className="meta">
            {view === 'req' && <select id="store" aria-label="门店" value={store} onChange={e => { setStore(e.target.value); lsSet(K.store, e.target.value); }}>{STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}
            <input id="who" placeholder={view === 'req' ? '请货人' : '盘点人'} value={who} onChange={e => { setWho(e.target.value); lsSet(K.who, e.target.value); }} style={{ width: '6.5em' }} />
            <span className="num">{today}</span>
          </div>
        </div>
        <div className="tabs">
          {(['all', ...WH_VENDORS.map(v => v.id)] as (WhVendorId | 'all')[]).map(v => (
            <button key={v} className="tab" data-on={vendorF === v} onClick={() => setVendorF(v)}>{v === 'all' ? '全部' : vendorOf(v).name}</button>
          ))}
          {mode === 'inbound' && <div className="nav">
            <button className="tab" data-on={view === 'count'} onClick={() => go('count')}>盘点</button>
            <button className="tab" data-on={view === 'replenish'} onClick={() => go('replenish')}>补货{low.length > 0 && <span className="cnt">{low.length}</span>}</button>
            <a className="tab" href="/staff/pickup">领料记录{pendingReq > 0 && <span className="cnt">{pendingReq}</span>}</a>
          </div>}
        </div>
      </header>

      <main>
        {view === 'count' && (<>
          <div className="out" style={{ marginTop: 10 }}>
            <h3>上次盘点</h3>
            {lastCount ? <p style={{ margin: 0 }}>{fmtTs(lastCount.ts)} · {lastCount.by} · {Object.keys(lastCount.onHand).length} 项 · <b style={{ color: daysSince! >= WAREHOUSE.countEveryDays ? 'var(--crit)' : 'var(--ok)' }}>{daysSince} 天前{daysSince! >= WAREHOUSE.countEveryDays ? '，已到期' : `，${WAREHOUSE.countEveryDays - daysSince!} 天后到期`}</b></p> : <p style={{ margin: 0, color: 'var(--mute)' }}>还没有盘点记录。填入在手数量后点「保存盘点」。</p>}
          </div>
          {WH_CATS.map(c => { const items = WH_SKUS.filter(s => s.cat === c && visSku(s)); if (!items.length) return null; return (
            <section className="cat" key={c}><h2>{c}</h2>
              <div className="rcv rhead"><span>品名</span><span>安全量</span><span>在手</span><span>状态</span></div>
              {items.map(s => { const st = stock[s.id]; const v = countDraft[s.id] ?? ''; const cur = v !== '' ? +v : st?.onHand; const isLow = cur != null && cur < s.par; return (
                <div className="rcv" key={s.id}>
                  <span>{s.name}<div className="spec">{vendorOf(s.vendor).name} · {s.unit}{st ? ` · 上次 ${st.onHand} (${fmtDate(new Date(st.at))})` : ''}</div></span>
                  <span className="num" style={{ textAlign: 'center' }}>{s.par}</span>
                  <input type="number" inputMode="numeric" min={0} id={'c-' + s.id} value={v} placeholder={st ? String(st.onHand) : '—'} onChange={e => setCountDraft({ ...countDraft, [s.id]: e.target.value })} />
                  <span className={'diff num ' + (cur == null ? '' : isLow ? 'bad' : 'good')}>{cur == null ? '' : isLow ? '缺' : '够'}</span>
                </div>); })}
            </section>); })}
        </>)}

        {view === 'req' && (<>
          {WH_CATS.map(c => { const items = WH_SKUS.filter(s => s.cat === c && visSku(s)); if (!items.length) return null; return (
            <section className="cat" key={c}><h2>{c}</h2>
              {items.map(s => { const n = draft[s.id] || 0; const st = stock[s.id]; return (
                <div className={'row' + (n ? ' has' : '')} key={s.id}>
                  <div><div className="name"><span className={'badge ' + s.brand}>{s.brand === 'ALL' ? '共用' : s.brand}</span>{s.name}</div>
                    <div className="spec">{vendorOf(s.vendor).name} · {s.unit}{st ? ` · 仓库在手 ${st.onHand}` : ''}{s.price != null ? ` · $${s.price.toFixed(2)}/${s.unit}` : ''}</div></div>
                  <div className="step"><button aria-label="减一" onClick={() => bump(s.id, -1)}>−</button><span className={'v num' + (n ? '' : ' zero')}>{n}</span><button aria-label="加一" onClick={() => bump(s.id, 1)}>+</button></div>
                </div>); })}
            </section>); })}
          <section className="cat"><h2>领料记录 · Jason 发货后点「已发货」扣库存</h2>
            {reqs.length === 0 && <div className="empty">还没有领料记录</div>}
            {reqs.map(r => (
              <div className="hist" key={r.id}>
                <span className="d">{r.date} <span className="s num">{r.id}</span></span><span className={'pill ' + (r.status === 'sent' ? 'sent' : 'received')}>{r.status === 'sent' ? '待发货' : '已发货'}</span>
                <span className="s">{storeName(r.store)} · {lines(r.qty).length} 项 · {r.who}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button className="pill" onClick={() => setSheet({ t: 'dispatch', id: r.id })}>查看</button>
                  {r.status === 'sent' && <button className="pill received" onClick={() => fulfil(r.id)}>已发货</button>}
                </span>
              </div>))}
          </section>
        </>)}

        {view === 'replenish' && (<>
          <div className="field"><label htmlFor="run">下次 LA 车次（Jason 安排，提前 {WAREHOUSE.leadDaysBeforeRun} 天备单）</label><input id="run" value={run} onChange={e => { setRun(e.target.value); lsSet(K.run, e.target.value); }} placeholder="例如 11/18 周二" /></div>
          {low.length === 0 && <div className="empty">{Object.keys(stock).length ? '所有已盘点品项都在安全量以上' : '先做一次盘点，低于安全量的品项会出现在这里'}</div>}
          {WH_VENDORS.map(v => { const rows = low.filter(s => s.vendor === v.id && visSku(s)).map(s => ({ s, onHand: stock[s.id].onHand, short: s.par - stock[s.id].onHand })); if (!rows.length) return null; const txt = replenishText(v.id, rows, run); return (
            <section className="cat" key={v.id}>
              <h2>{v.name} · {v.inbound === 'la-pickup' ? 'LA 自提' : '送仓库'} · {rows.length} 项</h2>
              <div className="rcv rhead"><span>品名</span><span>安全量</span><span>在手</span><span>补</span></div>
              {rows.map(r => (<div className="rcv" key={r.s.id}><span>{r.s.name}<div className="spec">{r.s.unit}</div></span><span className="num" style={{ textAlign: 'center' }}>{r.s.par}</span><span className="num" style={{ textAlign: 'center' }}>{r.onHand}</span><span className="diff num bad">{r.short}</span></div>))}
              <div className="acts"><button className="btn pri" onClick={() => copy(txt)}>复制 {v.name} 补货单</button></div>
            </section>); })}
        </>)}
      </main>

      {view === 'count' && (<footer><div className="tot"><span>已填 <b className="num">{Object.values(countDraft).filter(v => v !== '').length}</b> 项</span><span>低于安全量 <b className="num" style={{ color: low.length ? 'var(--crit)' : undefined }}>{low.length}</b> 项</span></div>
        <div className="acts"><button className="btn" onClick={() => setCountDraft({})}>清空输入</button><button className="btn pri" onClick={saveCount}>保存盘点</button></div></footer>)}
      {view === 'req' && (<footer><div className="tot"><span>领料 <b className="num">{lines(draft).length}</b> 项 · {storeName(store)}</span></div>
        <div className="acts"><button className="btn" onClick={() => saveDraft({})}>清空</button><button className="btn pri" disabled={!lines(draft).length} onClick={startReq}>生成领料单</button></div></footer>)}

      {sheet?.t === 'confirm' && (<div className="sheet">
        <div className="top"><h2>确认领料 {sheet.r.id}</h2><button className="x" onClick={() => setSheet(null)}>返回修改</button></div>
        <div className="field"><label htmlFor="memo">给仓库的备注（可选）</label><input id="memo" value={memo} onChange={e => setMemo(e.target.value)} /></div>
        <div className="out"><h3>预览</h3><pre>{reqText({ ...sheet.r, memo: memo.trim() })}</pre></div>
        <div className="acts"><button className="btn pri" onClick={() => { const r = { ...sheet.r, memo: memo.trim() }; saveReqs([r, ...reqs]); saveDraft({}); setMemo(''); setSheet({ t: 'dispatch', id: r.id }); }}>确认 → 生成发给 Jason 的图</button></div>
      </div>)}
      {sheet?.t === 'dispatch' && findReq(sheet.id) && <Dispatch r={findReq(sheet.id)!} copy={copy} toast={toast} onClose={() => setSheet(null)} />}

      <div className={'toast' + (toastMsg ? ' on' : '')} role="status">{toastMsg}</div>
    </div>
  );
}

function Dispatch({ r, copy, toast, onClose }: { r: Req; copy: (t: string) => void; toast: (m: string) => void; onClose: () => void }) {
  const [img, setImg] = useState('');
  useEffect(() => { let on = true; (document.fonts?.ready ?? Promise.resolve()).then(() => { if (on) setImg(drawReq(r)); }); return () => { on = false; }; }, [r]);
  return (
    <div className="sheet">
      <div className="top"><h2>领料单 {r.id}</h2><span className={'pill ' + (r.status === 'sent' ? 'sent' : 'received')}>{r.status === 'sent' ? '待发货' : '已发货'}</span><button className="x" onClick={onClose}>完成</button></div>
      <div className="acts"><button className="btn pri" disabled={!img} onClick={() => exportImage(img, `${r.id}.png`, toast)}>一键发送图片 → 微信 (Jason)</button><button className="btn" onClick={() => copy(reqText(r))}>复制文字版</button></div>
      <div className="out"><h3>领料单图片</h3>{img ? <SheetImg src={img} /> : <p className="hint">生成中…</p>}</div>
      <div className="out"><h3>文字版</h3><pre>{reqText(r)}</pre></div>
    </div>
  );
}
