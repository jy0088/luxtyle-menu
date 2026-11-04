'use client';
// Class D — own warehouse. mode='inbound' (Jason: count + replenish) · mode='pickup' (store: requisition).
// Items by category; the supplying vendor is shown as a note only.
import { useEffect, useMemo, useState } from 'react';
import { STORES, VENDORS, WAREHOUSE, vendorById, type Item } from '@/data/types';
import { ITEMS } from '@/data/catalog';
import { renderSheet, sheetText, newId, fmtDate, fmtTs, type SheetDoc, type SheetRow } from '@/lib/sheet';
import { lsGet, lsSet, getStock, putStock, type Ev, type StockRow } from '@/lib/staffApi';
import { useGate, useToast, usePref, useEvents, DbBanner, catTree, CatTabs, Sections, ItemRow, Header, useShare, useItemMap, SheetImg } from '../_ui';

type Qty = Record<string, number>;
interface ReqData { store: string; who: string; qty: Qty; memo?: string; fulfilledTs?: number; fulfilledBy?: string }
interface CountData { by: string; onHand: Qty }
type ReqEv = Ev<ReqData>;
const D_ITEMS = ITEMS.filter(i => i.channels.includes('D'));
const nowMs = () => Date.now();
const vendorNote = (it: Item) => it.sources.map(s => vendorById(s.vendor)?.shortName).filter(Boolean).join(' / ');

export default function WarehouseApp({ mode }: { mode: 'inbound' | 'pickup' }) {
  const { ready, gate } = useGate(); const { toast, toastEl } = useToast(); const { copy, share } = useShare(toast);
  const [who, setWho] = usePref('staff.who', ''); const [store, setStore] = usePref('staff.store', STORES[0].id); const [run, setRun] = usePref('wh.run', '');
  const [cat, setCat] = useState('全部');
  const [view, setView] = useState<'count' | 'replenish' | 'req'>(mode === 'pickup' ? 'req' : 'count');
  const [stock, setStock] = useState<Record<string, StockRow>>({}); const [stockRemote, setStockRemote] = useState<boolean | null>(null);
  const [countDraft, setCountDraft] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Qty>({}); const [memo, setMemo] = useState('');
  const [sheet, setSheet] = useState<{ t: 'confirm'; ev: ReqEv } | { t: 'dispatch'; id: string } | null>(null);
  const [now] = useState(() => Date.now());
  const reqs = useEvents<ReqData>('req'); const counts = useEvents<CountData>('count');
  const itemMap = useItemMap();
  const tree = useMemo(() => catTree(D_ITEMS), []);

  const loadStock = async () => { const r = await getStock(); if (r) { setStock(r); lsSet('wh.stock', r); setStockRemote(true); } else { setStock(lsGet('wh.stock', {})); setStockRemote(false); } };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(lsGet('draft.req', {})); loadStock();
    const route = () => { if (mode === 'pickup') { setView('req'); setSheet(null); return; } setView(location.hash === '#replenish' ? 'replenish' : 'count'); setSheet(null); };
    route(); window.addEventListener('hashchange', route); return () => window.removeEventListener('hashchange', route); }, [mode]);
  const saveDraft = (q: Qty) => { setDraft(q); lsSet('draft.req', q); };
  const go = (v: 'count' | 'replenish') => { const h = v === 'count' ? '' : '#replenish'; if (location.hash !== h) location.hash = h; else setView(v); };
  const rows = (q: Qty): SheetRow[] => Object.entries(q).filter(([, n]) => n > 0).map(([id, n]) => ({ item: itemMap[id], qty: n })).filter(r => r.item);
  const lastCount = counts.list[0]; const daysSince = lastCount ? Math.max(0, Math.floor((now - lastCount.ts) / 864e5)) : null;
  const low = D_ITEMS.filter(i => stock[i.id] && stock[i.id].onHand < i.par);

  const saveCount = async () => {
    const filled = Object.entries(countDraft).filter(([, v]) => v !== ''); if (!filled.length) { toast('还没有填任何数量'); return; } if (!who.trim()) { toast('请填写盘点人'); return; }
    const rowsIn = filled.map(([itemId, v]) => ({ itemId, onHand: +v, by: who.trim() })); const onHand: Qty = Object.fromEntries(rowsIn.map(r => [r.itemId, r.onHand]));
    const s = { ...stock }; const ts = nowMs(); rowsIn.forEach(r => { s[r.itemId] = { onHand: r.onHand, at: ts, by: r.by }; }); setStock(s); lsSet('wh.stock', s);
    const ok = await putStock(rowsIn); if (!ok) setStockRemote(false);
    await counts.save({ id: newId('CNT'), type: 'count', store: WAREHOUSE.id, who: who.trim(), status: 'done', ts, data: { by: who.trim(), onHand } });
    setCountDraft({}); toast(`已保存 ${filled.length} 项盘点`);
  };
  const fulfil = async (e: ReqEv) => {
    const rowsIn = Object.entries(e.data.qty).map(([itemId, n]) => ({ itemId, onHand: n, by: who.trim() || 'Jason' }));
    const s = { ...stock }; rowsIn.forEach(r => { if (s[r.itemId]) s[r.itemId] = { ...s[r.itemId], onHand: Math.max(0, s[r.itemId].onHand - r.onHand) }; }); setStock(s); lsSet('wh.stock', s);
    await putStock(rowsIn, true); await reqs.patch(e.id, { status: 'fulfilled', data: { fulfilledTs: nowMs(), fulfilledBy: who.trim() || 'Jason' } }); toast('已发货，库存已扣减');
  };
  const docOf = (e: ReqEv): SheetDoc => ({ title: '仓库领料单 · Warehouse Requisition', id: e.id, date: fmtDate(new Date(e.ts)), accent: '#2e7d4f', showPrice: false,
    meta: [`${WAREHOUSE.name} · ${WAREHOUSE.address}`, `门店 ${STORES.find(s => s.id === e.data.store)?.name} · 请货人 ${e.data.who}`], rows: rows(e.data.qty), memo: e.data.memo, signLine: '发货人 (Jason): ____________   发货日期: ________   门店签收: ____________' });
  if (!ready) return <div className="so" />;
  const findReq = (id: string) => reqs.list.find(r => r.id === id);
  

  return (<div className="so">{gate}
    <Header title={mode === 'pickup' ? '仓库提货' : '仓库进货'} sub={mode === 'pickup' ? '门店向仓库领料' : `${WAREHOUSE.manager} · 9863 Pacific Heights · ${WAREHOUSE.countEveryDays} 天盘点`} right={<>
      {mode === 'pickup' && <select id="store" aria-label="门店" value={store} onChange={e => setStore(e.target.value)}>{STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}
      <input id="who" placeholder={mode === 'pickup' ? '请货人' : '盘点人'} value={who} onChange={e => setWho(e.target.value)} style={{ width: '6.5em' }} /></>}>
      {mode === 'inbound' && <div className="tabs"><div className="nav" style={{ marginLeft: 0 }}>
        <button className="tab" data-on={view === 'count'} onClick={() => go('count')}>盘点</button>
        <button className="tab" data-on={view === 'replenish'} onClick={() => go('replenish')}>补货{low.length > 0 && <span className="cnt">{low.length}</span>}</button>
        <a className="tab" href="/staff/pickup">领料记录{reqs.list.filter(r => r.status === 'sent').length > 0 && <span className="cnt">{reqs.list.filter(r => r.status === 'sent').length}</span>}</a></div></div>}
      {view !== 'replenish' && <CatTabs tree={tree} cur={cat} onPick={setCat} />}
      <DbBanner remote={stockRemote === false ? false : reqs.remote} />
    </Header>

    <main>
      {view === 'count' && (<>
        <div className="out" style={{ marginTop: 10 }}><h3>上次盘点</h3>
          {lastCount ? <p style={{ margin: 0 }}>{fmtTs(lastCount.ts)} · {lastCount.data.by} · {Object.keys(lastCount.data.onHand).length} 项 · <b style={{ color: daysSince! >= WAREHOUSE.countEveryDays ? 'var(--crit)' : 'var(--ok)' }}>{daysSince} 天前{daysSince! >= WAREHOUSE.countEveryDays ? '，已到期' : `，${WAREHOUSE.countEveryDays - daysSince!} 天后到期`}</b></p> : <p style={{ margin: 0, color: 'var(--mute)' }}>还没有盘点记录。填入在手数量后点「保存盘点」。</p>}</div>
        {tree.filter(c => cat === '全部' || c.cat1 === cat).map(c => c.subs.map(s => (
          <section className="cat" key={c.cat1 + s.cat2}><h2>{c.cat1} · {s.cat2}</h2>
            <div className="rcv rhead"><span>品名</span><span>安全量</span><span>在手</span><span>状态</span></div>
            {s.items.map(it => { const st = stock[it.id]; const v = countDraft[it.id] ?? ''; const cur = v !== '' ? +v : st?.onHand; const isLow = cur != null && cur < it.par; return (
              <div className="rcv" key={it.id}>
                <span>{it.zh}<div className="spec">{it.en} · {it.unit} · {vendorNote(it)}{st ? ` · 上次 ${st.onHand} (${fmtDate(new Date(st.at))})` : ''}</div></span>
                <span className="num" style={{ textAlign: 'center' }}>{it.par}</span>
                <input type="number" inputMode="numeric" min={0} id={'c-' + it.id} value={v} placeholder={st ? String(st.onHand) : '—'} onChange={e => setCountDraft({ ...countDraft, [it.id]: e.target.value })} />
                <span className={'diff num ' + (cur == null ? '' : isLow ? 'bad' : 'good')}>{cur == null ? '' : isLow ? '缺' : '够'}</span></div>); })}
          </section>)))}
      </>)}

      {view === 'replenish' && (<>
        <div className="field"><label htmlFor="run">下次 LA 车次（Jason 安排，提前 {WAREHOUSE.leadDaysBeforeRun} 天备单）</label><input id="run" value={run} onChange={e => setRun(e.target.value)} placeholder="例如 11/18 周二" /></div>
        {low.length === 0 && <div className="empty">{Object.keys(stock).length ? '所有已盘点品项都在安全量以上' : '先做一次盘点，低于安全量的品项会出现在这里'}</div>}
        {VENDORS.filter(v => v.channel === 'D').map(v => { const rs = low.filter(i => i.sources.some(s => s.vendor === v.id)); if (!rs.length) return null;
          const txt = [`仓库补货单 — ${v.name}（${v.inbound === 'la-pickup' ? 'LA 自提' : '送仓库'}）`, `${WAREHOUSE.name} · ${WAREHOUSE.address}`, v.inbound === 'la-pickup' && run ? `车次 ${run}` : '', '', ...rs.map(i => `${i.par - stock[i.id].onHand} ${i.unit}  ${i.zh} / ${i.en}  （在手 ${stock[i.id].onHand} / 安全量 ${i.par}）${i.refPrice != null ? `  参考 $${i.refPrice.toFixed(2)}/${i.unit}` : ''}`), '', `合计 ${rs.length} 项`].filter(Boolean).join('\n');
          return (<section className="cat" key={v.id}><h2>{v.name} · {v.inbound === 'la-pickup' ? 'LA 自提' : '送仓库'} · {rs.length} 项</h2>
            <div className="rcv rhead"><span>品名</span><span>安全量</span><span>在手</span><span>补</span></div>
            {rs.map(i => <div className="rcv" key={i.id}><span>{i.zh}<div className="spec">{i.cat1} · {i.cat2} · {i.unit}</div></span><span className="num" style={{ textAlign: 'center' }}>{i.par}</span><span className="num" style={{ textAlign: 'center' }}>{stock[i.id].onHand}</span><span className="diff num bad">{i.par - stock[i.id].onHand}</span></div>)}
            <div className="acts"><button className="btn pri" onClick={() => copy(txt)}>复制 {v.shortName} 补货单</button></div></section>); })}
      </>)}

      {view === 'req' && (<>
        <Sections tree={tree} cur={cat} render={it => <ItemRow key={it.id} it={it} n={draft[it.id] || 0} extra={<> · 来源 {vendorNote(it)}{stock[it.id] ? ` · 仓库在手 ${stock[it.id].onHand}` : ''}</>} onBump={d => { const q = { ...draft }; q[it.id] = Math.max(0, (q[it.id] || 0) + d); if (!q[it.id]) delete q[it.id]; saveDraft(q); }} />} />
        <section className="cat"><h2>领料记录 · Jason 发货后点「已发货」扣库存</h2>
          {reqs.list.length === 0 && <div className="empty">还没有领料记录</div>}
          {reqs.list.map(e => (<div className="hist" key={e.id}>
            <span className="d">{fmtDate(new Date(e.ts))} <span className="s num">{e.id}</span></span><span className={'pill ' + (e.status === 'sent' ? 'sent' : 'received')}>{e.status === 'sent' ? '待发货' : '已发货'}</span>
            <span className="s">{STORES.find(s => s.id === e.data.store)?.name} · {Object.keys(e.data.qty).length} 项 · {e.data.who}</span>
            <span style={{ display: 'flex', gap: 6 }}><button className="pill" onClick={() => setSheet({ t: 'dispatch', id: e.id })}>查看</button>{e.status === 'sent' && <button className="pill received" onClick={() => fulfil(e)}>已发货</button>}</span></div>))}
        </section>
      </>)}
    </main>

    {view === 'count' && <footer><div className="tot"><span>已填 <b className="num">{Object.values(countDraft).filter(v => v !== '').length}</b> 项</span><span>低于安全量 <b className="num" style={{ color: low.length ? 'var(--crit)' : undefined }}>{low.length}</b> 项</span></div>
      <div className="acts"><button className="btn" onClick={() => setCountDraft({})}>清空输入</button><button className="btn pri" onClick={saveCount}>保存盘点</button></div></footer>}
    {view === 'req' && <footer><div className="tot"><span>领料 <b className="num">{rows(draft).length}</b> 项 · {STORES.find(s => s.id === store)?.name}</span></div>
      <div className="acts"><button className="btn" onClick={() => saveDraft({})}>清空</button><button className="btn pri" disabled={!rows(draft).length} onClick={() => { if (!who.trim()) { toast('请填写请货人'); return; } const d = new Date(); setSheet({ t: 'confirm', ev: { id: newId('WH'), type: 'req', store, vendor: WAREHOUSE.id, who: who.trim(), status: 'sent', ts: d.getTime(), data: { store, who: who.trim(), qty: { ...draft } } } }); }}>生成领料单</button></div></footer>}

    {sheet?.t === 'confirm' && (<div className="sheet">
      <div className="top"><h2>确认领料 {sheet.ev.id}</h2><button className="x" onClick={() => setSheet(null)}>返回修改</button></div>
      <div className="field"><label htmlFor="memo">给仓库的备注（可选）</label><input id="memo" value={memo} onChange={e => setMemo(e.target.value)} /></div>
      <div className="out"><h3>预览</h3><pre>{sheetText(docOf({ ...sheet.ev, data: { ...sheet.ev.data, memo: memo.trim() } }))}</pre></div>
      <div className="acts"><button className="btn pri" onClick={async () => { const e = { ...sheet.ev, data: { ...sheet.ev.data, memo: memo.trim() } }; await reqs.save(e); saveDraft({}); setMemo(''); setSheet({ t: 'dispatch', id: e.id }); }}>确认 → 生成发给 Jason 的图</button></div></div>)}
    {sheet?.t === 'dispatch' && findReq(sheet.id) && <Dispatch e={findReq(sheet.id)!} doc={docOf(findReq(sheet.id)!)} copy={copy} share={share} onClose={() => setSheet(null)} />}
    {toastEl}
  </div>);
}

function Dispatch({ e, doc, copy, share, onClose }: { e: ReqEv; doc: SheetDoc; copy: (t: string) => void; share: (d: string, n: string) => void; onClose: () => void }) {
  const [img, setImg] = useState('');
  useEffect(() => { let on = true; (document.fonts?.ready ?? Promise.resolve()).then(() => { if (on) setImg(renderSheet(doc)); }); return () => { on = false; }; }, [doc]);
  return (<div className="sheet">
    <div className="top"><h2>领料单 {e.id}</h2><span className={'pill ' + (e.status === 'sent' ? 'sent' : 'received')}>{e.status === 'sent' ? '待发货' : '已发货'}</span><button className="x" onClick={onClose}>完成</button></div>
    <div className="acts"><button className="btn pri" disabled={!img} onClick={() => share(img, `${e.id}.png`)}>一键发送图片 → 微信 (Jason)</button><button className="btn" onClick={() => copy(sheetText(doc))}>复制文字版</button></div>
    <div className="out"><h3>领料单图片</h3>{img ? <SheetImg src={img} /> : <p className="hint">生成中…</p>}</div>
    <div className="out"><h3>文字版</h3><pre>{sheetText(doc)}</pre></div>
  </div>);
}
