'use client';
// Weekly statistics per store. Reads the shared event store; needs the database to be meaningful.
import { useMemo, useState } from 'react';
import { STORES, VENDORS, vendorById, unitPrice } from '@/data/types';
import { fmtDate } from '@/lib/sheet';
import { useGate, useEvents, DbBanner, Header, useItemMap } from '../_ui';

type Qty = Record<string, number>;
interface OrderData { vendor: string; store: string; who: string; qty: Qty; recv?: Qty; actualTotal?: number; receipt?: string }
interface ShopData { shop: string; store: string; who: string; qty: Qty; total?: number; card?: string; byShare?: number }
interface ReqData { store: string; who: string; qty: Qty }

function weekStart(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x; }
const money = (n: number) => '$' + n.toFixed(2);

export default function StatsApp() {
  const { ready, gate } = useGate();
  const [store, setStore] = useState(STORES[0].id); const [off, setOff] = useState(0);
  const [now] = useState(() => Date.now());
  const orders = useEvents<OrderData>('order'); const shops = useEvents<ShopData>('shop'); const reqs = useEvents<ReqData>('req');
  const items = useItemMap();
  const ws = useMemo(() => { const s = weekStart(new Date(now)); s.setDate(s.getDate() - off * 7); return s; }, [now, off]);
  const we = useMemo(() => { const e = new Date(ws); e.setDate(e.getDate() + 7); return e; }, [ws]);
  const inWeek = (ts: number) => ts >= ws.getTime() && ts < we.getTime();
  const refOf = (q: Qty) => Object.entries(q).reduce((a, [id, n]) => { const it = items[id]; const u = it ? unitPrice(it) : null; return a + (u || 0) * n; }, 0);
  const pcs = (q: Qty) => Object.values(q).reduce((a, n) => a + n, 0);

  const O = orders.list.filter(e => e.data.store === store && inWeek(e.ts));
  const S = shops.list.filter(e => e.data.store === store && inWeek(e.ts));
  const R = reqs.list.filter(e => e.data.store === store && inWeek(e.ts));
  const byVendor = new Map<string, { n: number; pcs: number; ref: number; actual: number; actualN: number }>();
  for (const e of O) { const k = e.data.vendor; const v = byVendor.get(k) || { n: 0, pcs: 0, ref: 0, actual: 0, actualN: 0 }; v.n++; v.pcs += pcs(e.data.qty); v.ref += refOf(e.data.qty); if (e.data.actualTotal != null) { v.actual += e.data.actualTotal; v.actualN++; } byVendor.set(k, v); }
  const byCat = new Map<string, { pcs: number; ref: number }>();
  for (const e of [...O, ...R]) for (const [id, n] of Object.entries(e.data.qty)) { const it = items[id]; if (!it) continue; const c = byCat.get(it.cat1) || { pcs: 0, ref: 0 }; c.pcs += n; c.ref += (unitPrice(it) || 0) * n; byCat.set(it.cat1, c); }
  const shopTotal = S.reduce((a, e) => a + (e.data.total || 0), 0); const shopRef = S.reduce((a, e) => a + refOf(e.data.qty), 0);
  const byCard = new Map<string, number>(); for (const e of S) if (e.data.total) byCard.set(e.data.card || '—', (byCard.get(e.data.card || '—') || 0) + e.data.total);
  const shopBY = S.reduce((a, e) => a + (e.data.total || 0) * ((e.data.byShare ?? 50) / 100), 0);
  const orderRef = O.reduce((a, e) => a + refOf(e.data.qty), 0); const orderActual = O.filter(e => e.data.actualTotal != null);
  const diffs = O.flatMap(e => Object.entries(e.data.qty).filter(([id, n]) => e.data.recv && e.data.recv[id] !== n).map(([id, n]) => ({ e, id, n, got: e.data.recv![id] })));
  const unreceived = O.filter(e => e.status !== 'received').length;
  if (!ready) return <div className="so" />;
  return (<div className="so">{gate}
    <Header title="周统计" sub="按门店 · 周一至周日" right={<select id="store" aria-label="门店" value={store} onChange={e => setStore(e.target.value)}>{STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}>
      <DbBanner remote={orders.remote} />
    </Header>
    <main>
      <div className="wk"><button onClick={() => setOff(off + 1)}>‹ 上周</button><b>{fmtDate(ws)} — {fmtDate(new Date(we.getTime() - 1))}{off === 0 ? '（本周）' : ''}</b><button disabled={off === 0} onClick={() => setOff(off - 1)}>下周 ›</button></div>

      <div className="out"><h3>本周支出概览 · Week at a glance</h3>
        <div className="kv"><span>供应商叫货（参考价）A</span><b className="num">{money(orderRef)}</b></div>
        <div className="kv"><span>　其中已收货实付 {orderActual.length}/{O.length} 单</span><span className="num">{money(orderActual.reduce((a, e) => a + (e.data.actualTotal || 0), 0))}</span></div>
        <div className="kv"><span>周边采买（小票）C</span><b className="num">{money(shopTotal)}</b></div>
        <div className="kv"><span>　清单参考价 / 分摊 BY</span><span className="num">{money(shopRef)} / {money(shopBY)}</span></div>
        <div className="kv"><span>仓库领料 D（参考价）</span><b className="num">{money(R.reduce((a, e) => a + refOf(e.data.qty), 0))}</b></div>
        <div className="kv"><span><b>合计（A 参考 + C 小票 + D 参考）</b></span><b className="num">{money(orderRef + shopTotal + R.reduce((a, e) => a + refOf(e.data.qty), 0))}</b></div>
      </div>

      <div className="out"><h3>按供应商 · A 类</h3>
        {byVendor.size === 0 && <p className="hint">本周没有叫货</p>}
        {[...byVendor.entries()].map(([k, v]) => <div className="kv" key={k}><span>{vendorById(k)?.name || k} · {v.n} 单 · {v.pcs} 件</span><span className="num">{money(v.ref)}{v.actualN ? ` → 实付 ${money(v.actual)} (${v.actual - v.ref >= 0 ? '+' : ''}${(v.actual - v.ref).toFixed(0)})` : ''}</span></div>)}
        {unreceived > 0 && <p className="hint" style={{ color: 'var(--warn)' }}>{unreceived} 单尚未确认收货</p>}
      </div>

      <div className="out"><h3>按类目 · A + D</h3>
        {byCat.size === 0 && <p className="hint">—</p>}
        {[...byCat.entries()].sort((a, b) => b[1].ref - a[1].ref).map(([k, v]) => <div className="kv" key={k}><span>{k} · {v.pcs} 件</span><span className="num">{money(v.ref)}</span></div>)}
      </div>

      <div className="out"><h3>采买 · C 类</h3>
        {S.length === 0 && <p className="hint">本周没有采买</p>}
        {S.map(e => <div className="kv" key={e.id}><span>{fmtDate(new Date(e.ts))} {VENDORS.find(v => v.id === e.data.shop)?.shortName} · {e.data.who}</span><span className="num">{e.data.total != null ? money(e.data.total) : '待填小票'}</span></div>)}
        {[...byCard.entries()].map(([k, v]) => <div className="kv" key={k}><span>　{k}</span><span className="num">{money(v)}</span></div>)}
      </div>

      <div className="out"><h3>收货差异</h3>
        {diffs.length === 0 && <p className="hint">无差异</p>}
        {diffs.map((d, i) => <div className="kv" key={i}><span>{d.e.id} · {items[d.id]?.zh}</span><span className="num">订 {d.n} / 到 {d.got}</span></div>)}
      </div>
    </main>
  </div>);
}
