'use client';
// Shared building blocks for the staff tools. All pages use the same gate, header, category nav and row.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import './order/order.css';
import { CATS, ITEMS } from '@/data/catalog';
import { STAFF_PIN, type Item, type Brand } from '@/data/types';
import { refText, specOf, exportImage } from '@/lib/sheet';
import { lsGet, lsSet, listEvents, putEvent, patchEvent, mergeEvents, dbOnline, type Ev } from '@/lib/staffApi';

// ---------- gate ----------
export function useGate() {
  const [ready, setReady] = useState(false); const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState(''); const [err, setErr] = useState('');
  useEffect(() => {
    const ok = lsGet<number>('sj.pinok', 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ok && Date.now() - ok < 90 * 864e5) setUnlocked(true);
    setReady(true);
  }, []);
  const onPin = (v: string) => { setPin(v); if (v.length < 4) return; if (v === STAFF_PIN) { lsSet('sj.pinok', Date.now()); setUnlocked(true); } else { setErr('PIN 不对'); setPin(''); } };
  const gate = !ready ? null : unlocked ? null : (
    <div className="gate"><div className="box"><h2>L$ 员工</h2><p>店内 PIN / Store PIN</p>
      <input id="pin" type="password" inputMode="numeric" maxLength={4} autoComplete="off" aria-label="PIN" value={pin} onChange={e => onPin(e.target.value)} autoFocus /><div className="err">{err}</div></div></div>);
  return { ready, unlocked, gate };
}

// ---------- toast ----------
export function useToast() {
  const [msg, setMsg] = useState(''); const t = useRef<number | undefined>(undefined);
  const toast = useCallback((m: string) => { setMsg(m); window.clearTimeout(t.current); t.current = window.setTimeout(() => setMsg(''), 2200); }, []);
  const el = <div className={'toast' + (msg ? ' on' : '')} role="status">{msg}</div>;
  return { toast, toastEl: el };
}

// ---------- persistent small prefs ----------
export function usePref(key: string, fb: string) {
  const [v, setV] = useState(fb);
  useEffect(() => { setV(lsGet(key, fb)); }, [key, fb]);
  return [v, (n: string) => { setV(n); lsSet(key, n); }] as const;
}

// ---------- event store: remote-first, local cache ----------
export function useEvents<T>(type: string, opts: { store?: string; since?: number } = {}) {
  const key = `ev.${type}`;
  const [list, setList] = useState<Ev<T>[]>([]); const [remote, setRemote] = useState<boolean | null>(null);
  const refresh = useCallback(async () => {
    const local = lsGet<Ev<T>[]>(key, []);
    const r = await listEvents<T>({ type, store: opts.store, since: opts.since, limit: 500 });
    if (r) { const m = mergeEvents(r, local); setList(m); lsSet(key, m.slice(0, 200)); setRemote(true); }
    else { setList(local); setRemote(false); }
  }, [key, type, opts.store, opts.since]);
  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(lsGet<Ev<T>[]>(key, [])); refresh(); }, [key, refresh]);
  const save = useCallback(async (ev: Ev<T>) => {
    setList(l => { const m = mergeEvents([ev], l); lsSet(key, m.slice(0, 200)); return m; });
    const ok = await putEvent(ev); if (!ok) setRemote(false); return ok;
  }, [key]);
  const patch = useCallback(async (id: string, p: { status?: string; data?: Partial<T> }) => {
    setList(l => { const m = l.map(e => e.id === id ? { ...e, status: p.status ?? e.status, data: { ...e.data, ...(p.data || {}) } } : e); lsSet(key, m.slice(0, 200)); return m; });
    const ok = await patchEvent(id, { status: p.status, data: p.data as Record<string, unknown> }); if (!ok) setRemote(false); return ok;
  }, [key]);
  return { list, remote, save, patch, refresh };
}

export function DbBanner({ remote }: { remote: boolean | null }) {
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { dbOnline().then(setChecked); }, []);
  if (remote !== false && checked !== false) return null;
  return <div className="banner">未连接数据库：数据只存在本机，其他手机看不到。Vercel 里添加 Postgres 后自动恢复同步。 / Offline mode — data stays on this device.</div>;
}

// ---------- category navigation ----------
export function catTree(items: Item[]) {
  return CATS.map(c => ({ cat1: c.cat1, subs: c.cat2.map(s => ({ cat2: s, items: items.filter(i => i.cat1 === c.cat1 && i.cat2 === s) })).filter(s => s.items.length) })).filter(c => c.subs.length);
}
export function CatTabs({ tree, cur, onPick }: { tree: ReturnType<typeof catTree>; cur: string; onPick: (c: string) => void }) {
  return <div className="tabs">{[{ cat1: '全部' }, ...tree].map(c => <button key={c.cat1} className="tab" data-on={cur === c.cat1} onClick={() => onPick(c.cat1)}>{c.cat1}</button>)}</div>;
}

// ---------- rows ----------
export const BrandBadge = ({ b }: { b: Brand }) => <span className={'badge ' + b}>{b === 'ALL' ? '共用' : b}</span>;
export function ItemRow({ it, n, onBump, extra }: { it: Item; n: number; onBump: (d: number) => void; extra?: ReactNode }) {
  return (
    <div className={'row' + (n ? ' has' : '')}>
      <div>
        <div className="name"><BrandBadge b={it.brand} />{it.zh}<span className="en">{it.en}</span></div>
        <div className="spec">{[specOf(it), refText(it)].filter(Boolean).join(' · ')}{extra}{it.q && <span className="q"> · ⚠ {it.q}</span>}</div>
      </div>
      <div className="step"><button aria-label="减一" onClick={() => onBump(-1)}>−</button><span className={'v num' + (n ? '' : ' zero')}>{n}</span><button aria-label="加一" onClick={() => onBump(1)}>+</button></div>
    </div>);
}
export function Sections({ tree, cur, render }: { tree: ReturnType<typeof catTree>; cur: string; render: (it: Item) => ReactNode }) {
  return <>{tree.filter(c => cur === '全部' || c.cat1 === cur).map(c => c.subs.map(s => (
    <section className="cat" key={c.cat1 + s.cat2}><h2>{c.cat1} · {s.cat2}</h2>{s.items.map(render)}</section>)))}</>;
}

// ---------- header ----------
export function Header({ title, sub, right, children }: { title: string; sub?: string; right?: ReactNode; children?: ReactNode }) {
  return (
    <header>
      <div className="hrow">
        <h1><a href="/staff" style={{ color: 'inherit', textDecoration: 'none' }}>‹</a> {title} {sub && <small>{sub}</small>}</h1>
        <div className="meta">{right}</div>
      </div>
      {children}
    </header>);
}

// ---------- share helpers ----------
export function useShare(toast: (m: string) => void) {
  const copy = (txt: string) => navigator.clipboard?.writeText(txt).then(() => toast('已复制')).catch(() => toast('复制失败，请长按选择文字'));
  const share = async (dataUrl: string, name: string) => { const r = await exportImage(dataUrl, name); if (r === 'downloaded') toast('已下载到「文件」/ 下载目录'); if (r === 'failed') toast('导出失败，请长按图片保存'); };
  return { copy, share };
}
export const itemsFor = (pred: (i: Item) => boolean) => ITEMS.filter(pred);
export function useItemMap() { return useMemo(() => Object.fromEntries(ITEMS.map(i => [i.id, i])) as Record<string, Item>, []); }
// eslint-disable-next-line @next/next/no-img-element
export const SheetImg = ({ src }: { src: string }) => <img className="sheetimg" src={src} alt="单据图片" />;
