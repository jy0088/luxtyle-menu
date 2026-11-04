'use client';
// Class C — local shopping runs (Costco / RD / supermarket). Items by category; store chosen per run.
import { useEffect, useMemo, useState } from 'react';
import { STORES, VENDORS, CARDS } from '@/data/types';
import { ITEMS } from '@/data/catalog';
import { sheetText, totals, newId, fmtDate, fmtTs, type SheetDoc, type SheetRow } from '@/lib/sheet';
import { lsGet, lsSet, type Ev } from '@/lib/staffApi';
import { useGate, useToast, usePref, useEvents, DbBanner, catTree, CatTabs, Sections, ItemRow, Header, useShare, useItemMap } from '../_ui';

type Qty = Record<string, number>;
interface ShopData { shop: string; store: string; who: string; qty: Qty; extras: string; total?: number; card?: string; byShare?: number; note?: string; doneTs?: number }
type ShopEv = Ev<ShopData>;
const SHOPS = VENDORS.filter(v => v.channel === 'C');

export default function ShoppingApp() {
  const { ready, gate } = useGate(); const { toast, toastEl } = useToast(); const { copy } = useShare(toast);
  const [who, setWho] = usePref('staff.who', ''); const [store, setStore] = usePref('staff.store', STORES[0].id); const [shop, setShop] = usePref('shop.shop', 'costco');
  const [cat, setCat] = useState('全部'); const [qty, setQty] = useState<Qty>({}); const [extras, setExtras] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const { list, remote, save, patch } = useEvents<ShopData>('shop'); const itemMap = useItemMap();
  const draftKey = 'draft.shop';
  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    setQty(lsGet(draftKey, {})); setExtras(lsGet('draft.shop.extras', '')); }, []);
  const saveQty = (q: Qty) => { setQty(q); lsSet(draftKey, q); };
  const items = useMemo(() => ITEMS.filter(i => i.sources.some(s => s.vendor === shop)), [shop]);
  const tree = useMemo(() => catTree(items), [items]);
  const rows = (q: Qty): SheetRow[] => Object.entries(q).filter(([, n]) => n > 0).map(([id, n]) => ({ item: itemMap[id], qty: n })).filter(r => r.item && r.item.sources.some(s => s.vendor === shop));
  const picked = rows(qty); const t = totals(picked);
  const shopV = SHOPS.find(s => s.id === shop) || SHOPS[0];
  const docOf = (e: ShopEv): SheetDoc => ({ title: `采买清单 · ${VENDORS.find(v => v.id === e.data.shop)?.name}`, id: e.id, date: fmtDate(new Date(e.ts)), accent: '#8a6d1f',
    meta: [`为 ${STORES.find(s => s.id === e.data.store)?.name} 采买 · ${e.data.who}`], rows: rows(e.data.qty), memo: e.data.extras ? '另买：' + e.data.extras : undefined, signLine: '小票合计 $________   付款卡 ________   采买人签字 ________' });
  const makeRun = async () => {
    if (!who.trim()) { toast('请填写采买人'); return; }
    const d = new Date(); const q: Qty = {}; picked.forEach(r => { q[r.item.id] = r.qty; });
    const e: ShopEv = { id: newId('SHOP'), type: 'shop', store, vendor: shop, who: who.trim(), status: 'planned', ts: d.getTime(), data: { shop, store, who: who.trim(), qty: q, extras: extras.trim() } };
    await save(e); const rest = { ...qty }; picked.forEach(r => delete rest[r.item.id]); saveQty(rest); setExtras(''); lsSet('draft.shop.extras', ''); setOpen(e.id);
  };
  if (!ready) return <div className="so" />;
  const cur = list.find(e => e.id === open);
  return (<div className="so">{gate}
    <Header title="采买" sub={shopV.terms} right={<>
      <select id="store" aria-label="门店" value={store} onChange={e => setStore(e.target.value)}>{STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <input id="who" placeholder="采买人" value={who} onChange={e => setWho(e.target.value)} style={{ width: '6.5em' }} /></>}>
      <div className="tabs">{SHOPS.map(s => <button key={s.id} className="tab" data-on={shop === s.id} onClick={() => { setShop(s.id); setCat('全部'); }}>{s.shortName}</button>)}</div>
      <CatTabs tree={tree} cur={cat} onPick={setCat} />
      <DbBanner remote={remote} />
    </Header>
    <main>
      <Sections tree={tree} cur={cat} render={it => <ItemRow key={it.id} it={it} n={qty[it.id] || 0} extra={<> · 常买 {it.par}</>} onBump={d => { const q = { ...qty }; q[it.id] = Math.max(0, (q[it.id] || 0) + d); if (!q[it.id]) delete q[it.id]; saveQty(q); }} />} />
      <div className="field"><label htmlFor="extras">清单外临时要买的（自由填写）</label><input id="extras" value={extras} onChange={e => { setExtras(e.target.value); lsSet('draft.shop.extras', e.target.value); }} placeholder="例如 柠檬 2 袋、电池" /></div>
      <section className="cat"><h2>采买记录 · 回来后点开填小票</h2>
        {list.length === 0 && <div className="empty">还没有采买记录</div>}
        {list.map(e => (<button className="hist" key={e.id} onClick={() => setOpen(e.id)}>
          <span className="d">{fmtDate(new Date(e.ts))} <span className="s num">{e.id}</span></span><span className={'pill ' + (e.status === 'done' ? 'received' : 'sent')}>{e.status === 'done' ? `已报销 $${(e.data.total ?? 0).toFixed(0)}` : '待购买'}</span>
          <span className="s">{VENDORS.find(v => v.id === e.data.shop)?.shortName} · {Object.keys(e.data.qty).length} 项 · {e.data.who} · {STORES.find(s => s.id === e.data.store)?.name}</span><span /></button>))}
      </section>
    </main>
    <footer><div className="tot"><span>已选 <b className="num">{picked.length}</b> 项</span><span>参考 $<b className="num">{t.amt.toFixed(0)}{t.unpriced ? '+' : ''}</b></span></div>
      <div className="acts"><button className="btn" onClick={() => { const rest = { ...qty }; picked.forEach(r => delete rest[r.item.id]); saveQty(rest); }}>清空本店</button><button className="btn pri" disabled={!picked.length && !extras.trim()} onClick={makeRun}>生成采买清单</button></div></footer>
    {cur && <RunSheet e={cur} doc={docOf(cur)} copy={copy} toast={toast} onClose={() => setOpen(null)} onDone={async p => { await patch(cur.id, { status: 'done', data: { ...p, doneTs: Date.now() } }); toast('已记录，复制报销单发会计'); }} />}
    {toastEl}
  </div>);
}

function RunSheet({ e, doc, copy, toast, onClose, onDone }: { e: ShopEv; doc: SheetDoc; copy: (t: string) => void; toast: (m: string) => void; onClose: () => void; onDone: (p: { total: number; card: string; byShare: number; note: string }) => void }) {
  const done = e.status === 'done'; const d = e.data;
  const [total, setTotal] = useState(d.total != null ? String(d.total) : ''); const [card, setCard] = useState(d.card || CARDS[0]); const [by, setBy] = useState(d.byShare ?? 50); const [note, setNote] = useState(d.note || '');
  const ref = totals(doc.rows).amt;
  const acct = [`采买报销 ${e.id} · ${VENDORS.find(v => v.id === d.shop)?.name}`, `日期 ${fmtTs(d.doneTs)} · 采买人 ${d.who} · 门店 ${STORES.find(s => s.id === d.store)?.name}`,
    `小票合计 $${(d.total ?? 0).toFixed(2)}（参考 $${ref.toFixed(2)}）· 付款 ${d.card || '—'}`, `分摊：BY ${d.byShare ?? 50}% ≈ $${((d.total ?? 0) * (d.byShare ?? 50) / 100).toFixed(2)} / YGF ${100 - (d.byShare ?? 50)}% ≈ $${((d.total ?? 0) * (100 - (d.byShare ?? 50)) / 100).toFixed(2)}`, '',
    sheetText(doc).split('\n').slice(3).join('\n'), d.note ? `备注：${d.note}` : '', '小票照片另发。'].filter(Boolean).join('\n');
  return (<div className="sheet">
    <div className="top"><h2>{VENDORS.find(v => v.id === d.shop)?.shortName} {e.id}</h2><span className={'pill ' + (done ? 'received' : 'sent')}>{done ? '已报销' : '待购买'}</span><button className="x" onClick={onClose}>返回</button></div>
    <div className="acts"><button className="btn pri" onClick={() => copy(sheetText(doc))}>复制购物清单</button></div>
    <div className="out"><h3>清单</h3><pre>{sheetText(doc)}</pre></div>
    <div className="out"><h3>买完填小票</h3>
      <div className="field"><label htmlFor="total">小票合计 $ *（参考 ${ref.toFixed(2)}）</label><input id="total" type="number" inputMode="decimal" step="0.01" value={total} disabled={done} onChange={ev => setTotal(ev.target.value)} /></div>
      <div className="field"><label htmlFor="card">付款方式 *</label><select id="card" value={card} disabled={done} onChange={ev => setCard(ev.target.value)}>{CARDS.map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="by">品牌分摊：北苑 {by}% / 杨国福 {100 - by}%</label><input id="by" type="range" min={0} max={100} step={10} value={by} disabled={done} onChange={ev => setBy(+ev.target.value)} /></div>
      <div className="field"><label htmlFor="rnote">备注（缺货、替代品、退货）</label><input id="rnote" value={note} disabled={done} onChange={ev => setNote(ev.target.value)} /></div>
      {!done && <div className="acts" style={{ marginTop: 12 }}><button className="btn ok" onClick={() => { if (!total || isNaN(+total)) { toast('请填写小票合计'); return; } onDone({ total: +total, card, byShare: by, note: note.trim() }); }}>确认 → 生成报销单</button></div>}
    </div>
    {done && <div className="out"><h3>发会计（小票照片另发）</h3><pre>{acct}</pre><div className="acts"><button className="btn pri" onClick={() => copy(acct)}>复制报销单</button></div></div>}
  </div>);
}
