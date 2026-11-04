'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import '../order/order.css';
import { SHOP_STORES, SHOP_ITEMS, CARDS, type ShopStoreId } from '@/data/shopping';
import { STORES, STAFF_PIN } from '@/data/vendors/types';

type Qty = Record<string, number>;
interface Run { id: string; date: string; shop: ShopStoreId; forStore: string; who: string; qty: Qty; extras: string; status: 'planned' | 'done'; ts: number;
  total?: number; card?: string; byShare?: number; receiptNote?: string; doneTs?: number }

const K = { draft: 'shop.draft', extras: 'shop.extras', runs: 'shop.runs', who: 'staff.who', store: 'staff.store', shop: 'shop.shop', pin: 'sj.pinok' };
function lsGet<T>(k: string, fb: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; } }
function lsSet(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }
const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTs = (t?: number) => { if (!t) return ''; const d = new Date(t); return `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const shopName = (id: ShopStoreId) => SHOP_STORES.find(s => s.id === id)!.name;
const storeName = (id: string) => STORES.find(s => s.id === id)?.name || id;
const lines = (q: Qty) => SHOP_ITEMS.filter(i => q[i.id]).map(i => ({ i, n: q[i.id] }));

function listText(r: Run) {
  const L = lines(r.qty); const est = L.reduce((a, x) => a + (x.i.price || 0) * x.n, 0);
  return [
    `采买清单 ${r.id} · ${shopName(r.shop)}`, `为 ${storeName(r.forStore)} · ${r.who} · ${r.date}`, '',
    ...L.map(x => `☐ ${x.n} ${x.i.unit}  ${x.i.name}${x.i.price != null ? `  ≈$${(x.i.price * x.n).toFixed(0)}` : ''}  [${x.i.brand === 'ALL' ? '共用' : x.i.brand}]`),
    ...(r.extras ? ['', '另买：' + r.extras] : []), '',
    `预估 ≈ $${est.toFixed(0)}（不含临时项）`,
  ].join('\n');
}
function acctText(r: Run) {
  const L = lines(r.qty); const by = (r.byShare ?? 50);
  return [
    `采买报销 ${r.id} · ${shopName(r.shop)}`, `日期 ${fmtTs(r.doneTs)}  采买人 ${r.who}  门店 ${storeName(r.forStore)}`,
    `小票合计 $${(r.total ?? 0).toFixed(2)}  付款 ${r.card || '—'}`,
    `品牌分摊：BY ${by}% ≈ $${((r.total ?? 0) * by / 100).toFixed(2)} / YGF ${100 - by}% ≈ $${((r.total ?? 0) * (100 - by) / 100).toFixed(2)}`, '',
    ...L.map(x => `${x.n} ${x.i.unit}  ${x.i.name}  [${x.i.brand === 'ALL' ? '共用' : x.i.brand}]`),
    ...(r.extras ? ['另买：' + r.extras] : []), ...(r.receiptNote ? ['备注：' + r.receiptNote] : []), '', '小票照片另发。',
  ].join('\n');
}

export default function ShoppingApp() {
  const [ready, setReady] = useState(false); const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState(''); const [pinErr, setPinErr] = useState('');
  const [shop, setShop] = useState<ShopStoreId>('costco');
  const [forStore, setForStore] = useState(STORES[0].id); const [who, setWho] = useState('');
  const [qty, setQty] = useState<Qty>({}); const [extras, setExtras] = useState('');
  const [runs, setRuns] = useState<Run[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState(''); const toastT = useRef<number | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQty(lsGet(K.draft, {})); setExtras(lsGet(K.extras, '')); setRuns(lsGet(K.runs, [])); setWho(lsGet(K.who, '')); setForStore(lsGet(K.store, STORES[0].id)); setShop(lsGet(K.shop, 'costco'));
    const ok = lsGet<number>(K.pin, 0); if (ok && Date.now() - ok < 90 * 864e5) setUnlocked(true); setReady(true);
  }, []);
  const toast = useCallback((m: string) => { setToastMsg(m); window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => setToastMsg(''), 2200); }, []);
  const copy = (txt: string) => navigator.clipboard?.writeText(txt).then(() => toast('已复制')).catch(() => toast('复制失败，请长按选择文字'));
  const saveQty = (q: Qty) => { setQty(q); lsSet(K.draft, q); };
  const saveRuns = (r: Run[]) => { const s = r.slice(0, 80); setRuns(s); lsSet(K.runs, s); };
  const onPin = (v: string) => { setPin(v); if (v.length < 4) return; if (v === STAFF_PIN) { lsSet(K.pin, Date.now()); setUnlocked(true); } else { setPinErr('PIN 不对'); setPin(''); } };
  const bump = (id: string, d: number) => { const q = { ...qty }; q[id] = Math.max(0, (q[id] || 0) + d); if (!q[id]) delete q[id]; saveQty(q); };
  const items = SHOP_ITEMS.filter(i => i.store === shop); const cats = [...new Set(items.map(i => i.cat))];
  const picked = lines(qty).filter(x => x.i.store === shop); const est = picked.reduce((a, x) => a + (x.i.price || 0) * x.n, 0);
  const makeRun = () => {
    if (!who.trim()) { toast('请填写采买人'); return; }
    const d = new Date(); const id = 'SHOP' + fmtDate(d).replace(/-/g, '').slice(2) + '-' + pad(d.getHours()) + pad(d.getMinutes());
    const q: Qty = {}; picked.forEach(x => { q[x.i.id] = x.n; });
    const r: Run = { id, date: fmtDate(d), shop, forStore, who: who.trim(), qty: q, extras: extras.trim(), status: 'planned', ts: d.getTime() };
    saveRuns([r, ...runs]); const rest = { ...qty }; picked.forEach(x => delete rest[x.i.id]); saveQty(rest); setExtras(''); lsSet(K.extras, ''); setOpen(id);
  };
  if (!ready) return <div className="so" />;
  const run = runs.find(r => r.id === open);

  return (
    <div className="so">
      {!unlocked && (<div className="gate"><div className="box"><h2>L$ 员工</h2><p>采买清单 · 店内 PIN</p>
        <input id="pin" type="password" inputMode="numeric" maxLength={4} autoComplete="off" aria-label="PIN" value={pin} onChange={e => onPin(e.target.value)} autoFocus /><div className="err">{pinErr}</div></div></div>)}
      <header>
        <div className="hrow">
          <h1><a href="/staff" style={{ color: 'inherit', textDecoration: 'none' }}>‹</a> 采买 <small>{SHOP_STORES.find(s => s.id === shop)!.note}</small></h1>
          <div className="meta">
            <select id="forStore" aria-label="门店" value={forStore} onChange={e => { setForStore(e.target.value); lsSet(K.store, e.target.value); }}>{STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            <input id="who" placeholder="采买人" value={who} onChange={e => { setWho(e.target.value); lsSet(K.who, e.target.value); }} style={{ width: '6.5em' }} />
          </div>
        </div>
        <div className="tabs">
          {SHOP_STORES.map(s => <button key={s.id} className="tab" data-on={shop === s.id} onClick={() => { setShop(s.id); lsSet(K.shop, s.id); }}>{s.name.split('（')[0]}</button>)}
        </div>
      </header>
      <main>
        {cats.map(c => (
          <section className="cat" key={c}><h2>{c}</h2>
            {items.filter(i => i.cat === c).map(i => { const n = qty[i.id] || 0; return (
              <div className={'row' + (n ? ' has' : '')} key={i.id}>
                <div><div className="name"><span className={'badge ' + i.brand}>{i.brand === 'ALL' ? '共用' : i.brand}</span>{i.name}</div>
                  <div className="spec">{i.unit}{i.price != null ? ` · $${i.price.toFixed(2)}` : ''} · 常买 {i.par}</div></div>
                <div className="step"><button aria-label="减一" onClick={() => bump(i.id, -1)}>−</button><span className={'v num' + (n ? '' : ' zero')}>{n}</span><button aria-label="加一" onClick={() => bump(i.id, 1)}>+</button></div>
              </div>); })}
          </section>))}
        <div className="field"><label htmlFor="extras">清单外临时要买的（自由填写）</label><input id="extras" value={extras} onChange={e => { setExtras(e.target.value); lsSet(K.extras, e.target.value); }} placeholder="例如 柠檬 2 袋、电池" /></div>
        <section className="cat"><h2>采买记录 · 回来后点开填小票</h2>
          {runs.length === 0 && <div className="empty">还没有采买记录</div>}
          {runs.map(r => (<button className="hist" key={r.id} onClick={() => setOpen(r.id)}>
            <span className="d">{r.date} <span className="s num">{r.id}</span></span><span className={'pill ' + (r.status === 'done' ? 'received' : 'sent')}>{r.status === 'done' ? `已报销 $${(r.total ?? 0).toFixed(0)}` : '待购买'}</span>
            <span className="s">{shopName(r.shop)} · {lines(r.qty).length} 项 · {r.who} · {storeName(r.forStore)}</span><span /></button>))}
        </section>
      </main>
      <footer><div className="tot"><span>已选 <b className="num">{picked.length}</b> 项</span><span>预估 $<b className="num">{est.toFixed(0)}</b></span></div>
        <div className="acts"><button className="btn" onClick={() => { const rest = { ...qty }; picked.forEach(x => delete rest[x.i.id]); saveQty(rest); }}>清空本店</button><button className="btn pri" disabled={!picked.length && !extras.trim()} onClick={makeRun}>生成采买清单</button></div></footer>

      {run && <RunSheet r={run} copy={copy} toast={toast} onClose={() => setOpen(null)} onDone={p => { saveRuns(runs.map(x => x.id === run.id ? { ...x, ...p, status: 'done', doneTs: Date.now() } : x)); toast('已记录，复制报销单发会计'); }} />}
      <div className={'toast' + (toastMsg ? ' on' : '')} role="status">{toastMsg}</div>
    </div>
  );
}

function RunSheet({ r, copy, toast, onClose, onDone }: { r: Run; copy: (t: string) => void; toast: (m: string) => void; onClose: () => void; onDone: (p: { total: number; card: string; byShare: number; receiptNote: string }) => void }) {
  const done = r.status === 'done';
  const [total, setTotal] = useState(r.total != null ? String(r.total) : ''); const [card, setCard] = useState(r.card || CARDS[0]);
  const [by, setBy] = useState(r.byShare ?? 50); const [note, setNote] = useState(r.receiptNote || '');
  return (
    <div className="sheet">
      <div className="top"><h2>{shopName(r.shop)} {r.id}</h2><span className={'pill ' + (done ? 'received' : 'sent')}>{done ? '已报销' : '待购买'}</span><button className="x" onClick={onClose}>返回</button></div>
      <div className="acts"><button className="btn pri" onClick={() => copy(listText(r))}>复制购物清单</button></div>
      <div className="out"><h3>清单</h3><pre>{listText(r)}</pre></div>
      <div className="out"><h3>买完填小票</h3>
        <div className="field"><label htmlFor="total">小票合计 $ *</label><input id="total" type="number" inputMode="decimal" step="0.01" value={total} disabled={done} onChange={e => setTotal(e.target.value)} /></div>
        <div className="field"><label htmlFor="card">付款方式 *</label><select id="card" value={card} disabled={done} onChange={e => setCard(e.target.value)}>{CARDS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label htmlFor="by">品牌分摊：北苑 {by}% / 杨国福 {100 - by}%</label><input id="by" type="range" min={0} max={100} step={10} value={by} disabled={done} onChange={e => setBy(+e.target.value)} /></div>
        <div className="field"><label htmlFor="rnote">备注（缺货、替代品、退货）</label><input id="rnote" value={note} disabled={done} onChange={e => setNote(e.target.value)} /></div>
        {!done && <div className="acts" style={{ marginTop: 12 }}><button className="btn ok" onClick={() => { if (!total || isNaN(+total)) { toast('请填写小票合计'); return; } onDone({ total: +total, card, byShare: by, receiptNote: note.trim() }); }}>确认 → 生成报销单</button></div>}
      </div>
      {done && <div className="out"><h3>发会计（小票照片另发）</h3><pre>{acctText(r)}</pre><div className="acts"><button className="btn pri" onClick={() => copy(acctText(r))}>复制报销单</button></div></div>}
    </div>
  );
}
