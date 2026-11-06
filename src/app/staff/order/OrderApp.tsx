'use client';
// Class A — vendor delivers to store. One page per vendor; items browsed by category (vendor is implied).
import { useEffect, useMemo, useState } from 'react';
import { STORES, type Vendor } from '@/data/types';
import { ITEMS } from '@/data/catalog';
import { renderSheet, sheetText, totals, newId, fmtDate, fmtTs, type SheetDoc, type SheetRow } from '@/lib/sheet';
import { lsGet, lsSet, type Ev } from '@/lib/staffApi';
import { useGate, useToast, usePref, useEvents, DbBanner, catTree, CatTabs, Sections, ItemRow, Header, useShare, useItemMap, SheetImg } from '../_ui';

type Qty = Record<string, number>;
interface OrderData { vendor: string; store: string; who: string; qty: Qty; eta?: string; memo?: string;
  recv?: Qty; receipt?: string; recvBy?: string; recvNote?: string; recvTs?: number; actualTotal?: number }
type OrderEv = Ev<OrderData>;
const STATUS: Record<string, string> = { sent: '已下单·待收货', received: '已收货' };

export default function OrderApp({ vendor }: { vendor: Vendor }) {
  const { ready, gate } = useGate(); const { toast, toastEl } = useToast(); const { copy, share } = useShare(toast);
  const [who, setWho] = usePref('staff.who', ''); const [store, setStore] = usePref('staff.store', STORES[0].id);
  const [brand, setBrand] = useState<'ALL' | 'BY' | 'YGF'>('ALL'); const [cat, setCat] = useState('全部');
  const [view, setView] = useState<'order' | 'history'>('order');
  const [qty, setQty] = useState<Qty>({});
  const [sheet, setSheet] = useState<{ t: 'confirm'; ev: OrderEv } | { t: 'dispatch'; id: string } | { t: 'receive'; id: string } | null>(null);
  const draftKey = `draft.order.${vendor.id}`;
  const { list, remote, save, patch } = useEvents<OrderData>('order');
  const itemMap = useItemMap();
  const st = STORES.find(s => s.id === store) || STORES[0];

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    setQty(lsGet(draftKey, {}));
    const route = () => { setView(location.hash === '#history' ? 'history' : 'order'); setSheet(null); }; route();
    window.addEventListener('hashchange', route); return () => window.removeEventListener('hashchange', route); }, [draftKey]);
  const saveQty = (q: Qty) => { setQty(q); lsSet(draftKey, q); };
  const go = (v: 'order' | 'history') => { const h = v === 'order' ? '' : '#history'; if (location.hash !== h) location.hash = h; else { setView(v); setSheet(null); } };

  const items = useMemo(() => ITEMS.filter(i => i.sources.some(s => s.vendor === vendor.id) && (i.brand === 'ALL' || st.brands.includes(i.brand)) && (brand === 'ALL' || i.brand === brand || i.brand === 'ALL')), [vendor.id, st, brand]);
  const tree = useMemo(() => catTree(items), [items]);
  const rows = (q: Qty): SheetRow[] => Object.entries(q).filter(([, n]) => n > 0).map(([id, n]) => ({ item: itemMap[id], qty: n })).filter(r => r.item);
  const t = totals(rows(qty));
  const mine = list.filter(e => e.data.vendor === vendor.id);
  const pending = mine.filter(e => e.status === 'sent').length;

  const docOf = (ev: OrderEv): SheetDoc => { const s = STORES.find(x => x.id === ev.data.store) || STORES[0]; return {
    title: `${vendor.shortName} 叫货单 · Order Sheet`, id: ev.id, date: fmtDate(new Date(ev.ts)), accent: '#b4461c',
    meta: [`Bill To: ${s.billTo}`, `Ship To: ${s.shipTo} · ${s.shipNote}`, `请货人 ${ev.data.who}${ev.data.eta ? ` · 希望送货 ${ev.data.eta}` : ''}`], rows: rows(ev.data.qty), memo: ev.data.memo, showPrice: false }; };  // vendor-facing: no prices
  const acctText = (ev: OrderEv) => { const R = rows(ev.data.qty); const tt = totals(R); const by = R.filter(r => r.item.brand !== 'YGF'), ygf = R.filter(r => r.item.brand === 'YGF');
    const sum = (rs: SheetRow[]) => rs.reduce((a, r) => a + ((r.item.basis === 'lb' ? (r.item.lb || 0) * (r.item.refPrice || 0) : (r.item.refPrice || 0)) * r.qty), 0);
    return [`采购单 ${ev.id} — ${vendor.name}`, `门店 ${st.name} · 公司 ${st.billTo}`, `下单 ${fmtTs(ev.ts)} · 请货人 ${ev.data.who} · 预计送货 ${ev.data.eta || '—'}`, '', sheetText({ ...docOf(ev), showPrice: true }).split('\n').slice(4).join('\n'), '', `参考合计 ≈ $${tt.amt.toFixed(2)} · BY ≈ $${sum(by).toFixed(2)} / YGF ≈ $${sum(ygf).toFixed(2)}`, `收货后补发：到货差异 + ${vendor.shortName} 收据号 + 实付金额`].join('\n'); };

  if (!ready) return <div className="so" />;
  const find = (id: string) => mine.find(e => e.id === id);

  return (
    <div className="so">{gate}
      <Header title={`${vendor.shortName} 叫货`} sub={vendor.terms} right={<>
        <select id="store" aria-label="门店" value={store} onChange={e => { setStore(e.target.value); setBrand('ALL'); }}>{STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <input id="who" placeholder="请货人" value={who} onChange={e => setWho(e.target.value)} style={{ width: '6.5em' }} /></>}>
        <div className="tabs">
          {st.brands.length > 1 && (['ALL', 'BY', 'YGF'] as const).map(b => <button key={b} className="tab" data-on={brand === b} onClick={() => setBrand(b)}>{{ ALL: '全部品牌', BY: '北苑', YGF: '杨国福' }[b]}</button>)}
          <div className="nav"><button className="tab" data-on={view === 'order'} onClick={() => go('order')}>叫货</button><button className="tab" data-on={view === 'history'} onClick={() => go('history')}>收货 / 历史{pending > 0 && <span className="cnt">{pending}</span>}</button></div>
        </div>
        {view === 'order' && <CatTabs tree={tree} cur={cat} onPick={setCat} />}
        <DbBanner remote={remote} />
      </Header>

      <main>
        {view === 'order' && <Sections tree={tree} cur={cat} render={it => <ItemRow key={it.id} it={it} n={qty[it.id] || 0} onBump={d => { const q = { ...qty }; q[it.id] = Math.max(0, (q[it.id] || 0) + d); if (!q[it.id]) delete q[it.id]; saveQty(q); }} />} />}
        {view === 'history' && (<>
          <section className="cat"><h2>{vendor.shortName} 叫货历史 · 点开收货确认</h2></section>
          {mine.length === 0 && <div className="empty">还没有叫货记录</div>}
          {mine.map(e => { const tt = totals(rows(e.data.qty)); const s = STORES.find(x => x.id === e.data.store); return (
            <button className="hist" key={e.id} onClick={() => setSheet({ t: 'receive', id: e.id })}>
              <span className="d">{fmtDate(new Date(e.ts))} <span className="s num">{e.id}</span></span><span className={'pill ' + e.status}>{STATUS[e.status || 'sent']}</span>
              <span className="s">{s?.name} · {tt.pcs} 件 · ≈${tt.amt.toFixed(0)} · {e.data.who}{e.data.receipt ? ' · 收据 ' + e.data.receipt : ''}</span><span /></button>); })}
        </>)}
      </main>

      {view === 'order' && (<footer>
        <div className="tot"><span>件数 <b className="num">{t.pcs}</b></span>{t.lb > 0 && <span>约 <b className="num">{Math.round(t.lb)}</b> 磅</span>}<span>参考 $<b className="num">{t.amt.toFixed(0)}{t.unpriced ? '+' : ''}</b></span>
          {vendor.minLb != null && <span className={'minw' + (t.pcs && t.lb >= vendor.minLb ? ' ok' : '')}>{!t.pcs ? `起送 ${vendor.minLb} 磅` : t.lb >= vendor.minLb ? '已达起送' : `距起送还差 ${Math.ceil(vendor.minLb - t.lb)} 磅`}</span>}</div>
        <div className="acts">
          <button className="btn" onClick={() => { const q = { ...qty }; for (const i of items) if (i.par) q[i.id] = i.par; saveQty(q); toast('已按惯常量填入，请逐项核对'); }}>按惯常量填</button>
          <button className="btn" onClick={() => saveQty({})}>清空</button>
          <button className="btn pri" disabled={!t.pcs} onClick={() => { if (!who.trim()) { toast('请先填写请货人'); return; } const d = new Date(); setSheet({ t: 'confirm', ev: { id: newId(vendor.id.toUpperCase()), type: 'order', store, vendor: vendor.id, who: who.trim(), status: 'sent', ts: d.getTime(), data: { vendor: vendor.id, store, who: who.trim(), qty: { ...qty } } } }); }}>生成叫货单</button>
        </div></footer>)}

      {sheet?.t === 'confirm' && <Confirm ev={sheet.ev} doc={docOf(sheet.ev)} minLb={vendor.minLb ?? null} onClose={() => setSheet(null)} onSubmit={async ev => { await save(ev); saveQty({}); setSheet({ t: 'dispatch', id: ev.id }); }} />}
      {sheet?.t === 'dispatch' && find(sheet.id) && <Dispatch ev={find(sheet.id)!} doc={docOf(find(sheet.id)!)} acct={acctText(find(sheet.id)!)} copy={copy} share={share} onClose={() => go('history')} />}
      {sheet?.t === 'receive' && find(sheet.id) && <Receive ev={find(sheet.id)!} rows={rows(find(sheet.id)!.data.qty)} vendorShort={vendor.shortName} copy={copy} toast={toast} onClose={() => setSheet(null)} onShow={() => setSheet({ t: 'dispatch', id: sheet.id })}
        onAgain={() => { saveQty({ ...find(sheet.id)!.data.qty }); go('order'); toast('已复制到草稿'); }}
        onConfirm={async p => { await patch(sheet.id, { status: 'received', data: { ...p, recvTs: Date.now() } }); toast('收货已确认'); }} />}
      {toastEl}
    </div>);
}

function Confirm({ ev, doc, minLb, onClose, onSubmit }: { ev: OrderEv; doc: SheetDoc; minLb: number | null; onClose: () => void; onSubmit: (ev: OrderEv) => void }) {
  const [eta, setEta] = useState(''); const [memo, setMemo] = useState(''); const t = totals(doc.rows);
  const withMeta = { ...ev, data: { ...ev.data, eta: eta.trim(), memo: memo.trim() } };
  return (<div className="sheet">
    <div className="top"><h2>确认叫货 {ev.id}</h2><button className="x" onClick={onClose}>返回修改</button></div>
    <div className="field"><label htmlFor="eta">希望送货日（可选）</label><input id="eta" value={eta} onChange={e => setEta(e.target.value)} placeholder="例如 周一 11/10" /></div>
    <div className="field"><label htmlFor="memo">给供应商的备注（可选，印在单上）</label><input id="memo" value={memo} onChange={e => setMemo(e.target.value)} /></div>
    <div className="out"><h3>预览</h3><pre>{sheetText({ ...doc, memo: memo.trim(), meta: doc.meta.map((m, i) => i === 2 && eta.trim() ? m + ` · 希望送货 ${eta.trim()}` : m) })}</pre></div>
    {minLb != null && t.lb < minLb && <p className="hint" style={{ color: 'var(--crit)' }}>未达 {minLb} 磅起送（约 {Math.round(t.lb)} 磅），供应商可能不送。</p>}
    <div className="acts"><button className="btn pri" onClick={() => onSubmit(withMeta)}>确认 → 生成发群图 + 会计单</button></div>
  </div>);
}

function Dispatch({ ev, doc, acct, copy, share, onClose }: { ev: OrderEv; doc: SheetDoc; acct: string; copy: (t: string) => void; share: (d: string, n: string) => void; onClose: () => void }) {
  const [img, setImg] = useState('');
  useEffect(() => { let on = true; (document.fonts?.ready ?? Promise.resolve()).then(() => { if (on) setImg(renderSheet(doc)); }); return () => { on = false; }; }, [doc]);
  return (<div className="sheet">
    <div className="top"><h2>叫货单 {ev.id}</h2><span className={'pill ' + ev.status}>{STATUS[ev.status || 'sent']}</span><button className="x" onClick={onClose}>完成</button></div>
    <div className="acts"><button className="btn pri" disabled={!img} onClick={() => share(img, `${ev.id}.png`)}>一键发送图片 → 微信 / 相册</button><button className="btn" onClick={() => copy(sheetText(doc))}>复制文字版</button></div>
    <div className="out"><h3>① 叫货单图片</h3>{img ? <SheetImg src={img} /> : <p className="hint">生成中…</p>}</div>
    <div className="out"><h3>② 会计单</h3><pre>{acct}</pre><div className="acts"><button className="btn" onClick={() => copy(acct)}>复制会计单</button></div></div>
  </div>);
}

function Receive({ ev, rows, vendorShort, copy, toast, onClose, onShow, onAgain, onConfirm }: { ev: OrderEv; rows: SheetRow[]; vendorShort: string; copy: (t: string) => void; toast: (m: string) => void; onClose: () => void; onShow: () => void; onAgain: () => void;
  onConfirm: (p: { recv: Qty; receipt: string; recvBy: string; recvNote: string; actualTotal?: number }) => void }) {
  const done = ev.status === 'received'; const d = ev.data;
  const [rc, setRc] = useState<Record<string, string>>(() => Object.fromEntries(rows.map(r => [r.item.id, d.recv?.[r.item.id] != null ? String(d.recv[r.item.id]) : ''])));
  const [receipt, setReceipt] = useState(d.receipt || ''); const [rby, setRby] = useState(d.recvBy || ''); const [note, setNote] = useState(d.recvNote || ''); const [actual, setActual] = useState(d.actualTotal != null ? String(d.actualTotal) : '');
  const ref = totals(rows).amt;
  const confirm = () => {
    if (!receipt.trim()) { toast('请填写收据号'); return; } if (!rby.trim()) { toast('请填写收货人'); return; }
    if (rows.some(r => rc[r.item.id] === '')) { toast('每一项都要填到货数量（没到填 0）'); return; }
    onConfirm({ recv: Object.fromEntries(rows.map(r => [r.item.id, +rc[r.item.id]])), receipt: receipt.trim(), recvBy: rby.trim(), recvNote: note.trim(), actualTotal: actual ? +actual : undefined });
  };
  const diffs = rows.filter(r => d.recv && d.recv[r.item.id] !== r.qty);
  const recvText = [`收货回执 ${ev.id} — ${vendorShort}`, `收据号 ${d.receipt} · 收货人 ${d.recvBy} · ${fmtTs(d.recvTs)}`, d.actualTotal != null ? `实付 $${d.actualTotal.toFixed(2)} vs 参考 $${ref.toFixed(2)}（${d.actualTotal - ref >= 0 ? '+' : ''}${(d.actualTotal - ref).toFixed(2)}）` : `参考合计 $${ref.toFixed(2)}`,
    diffs.length ? '差异：' : '到货与订单一致。', ...diffs.map(r => `  ${r.item.zh}  订 ${r.qty} / 到 ${d.recv![r.item.id]}`), d.recvNote ? `备注：${d.recvNote}` : ''].filter(Boolean).join('\n');
  return (<div className="sheet">
    <div className="top"><h2>收货 {ev.id}</h2><span className={'pill ' + ev.status}>{STATUS[ev.status || 'sent']}</span><button className="x" onClick={onClose}>返回</button></div>
    <p className="hint" style={{ marginTop: 0 }}>下单 {fmtTs(ev.ts)} · {d.who}{d.eta ? ' · 希望送货 ' + d.eta : ''}</p>
    <div className="rcv rhead"><span>品名</span><span>订</span><span>到货</span><span>差</span></div>
    {rows.map(r => { const v = rc[r.item.id]; const df = v === '' ? null : +v - r.qty; return (<div className="rcv" key={r.item.id}>
      <span>{r.item.zh}<div className="spec">{r.item.en}</div></span><span className="num" style={{ textAlign: 'center' }}>{r.qty}</span>
      <input type="number" inputMode="numeric" min={0} id={'r-' + r.item.id} value={v} disabled={done} onChange={e => setRc({ ...rc, [r.item.id]: e.target.value })} />
      <span className={'diff num ' + (df == null ? '' : df ? 'bad' : 'good')}>{df == null ? '' : df > 0 ? '+' + df : df}</span></div>); })}
    {!done && <div className="acts" style={{ marginTop: 8 }}><button className="btn" onClick={() => setRc(Object.fromEntries(rows.map(r => [r.item.id, String(r.qty)])))}>全部按订量到货</button></div>}
    <div className="field"><label htmlFor="receipt">{vendorShort} 收据 / Invoice 号 *</label><input id="receipt" value={receipt} disabled={done} onChange={e => setReceipt(e.target.value)} /></div>
    <div className="field"><label htmlFor="actual">收据实付合计 $（参考 ${ref.toFixed(2)}）</label><input id="actual" type="number" inputMode="decimal" step="0.01" value={actual} disabled={done} onChange={e => setActual(e.target.value)} /></div>
    <div className="field"><label htmlFor="rby">收货人 *</label><input id="rby" value={rby} disabled={done} onChange={e => setRby(e.target.value)} /></div>
    <div className="field"><label htmlFor="rnote">收货备注（破损、退货、换货）</label><input id="rnote" value={note} disabled={done} onChange={e => setNote(e.target.value)} /></div>
    {done ? <p className="hint">已于 {fmtTs(d.recvTs)} 确认收货。</p> : <div className="acts" style={{ marginTop: 14 }}><button className="btn ok" onClick={confirm}>确认收货</button></div>}
    <div className="acts"><button className="btn" onClick={onAgain}>再叫一次（复制到草稿）</button><button className="btn" onClick={onShow}>查看叫货单 / 重发</button></div>
    {done && <div className="out"><h3>发会计（收货回执）</h3><pre>{recvText}</pre><div className="acts"><button className="btn" onClick={() => copy(recvText)}>复制回执</button></div></div>}
  </div>);
}

