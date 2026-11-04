// Browser-side client for /api/staff/*. Remote-first with on-device fallback:
// every list is cached in localStorage so the pages keep working offline / before the DB is connected.
import { STAFF_PIN } from '@/data/types';

export interface Ev<T = Record<string, unknown>> { id: string; type: string; store?: string | null; vendor?: string | null; who?: string | null; status?: string | null; ts: number; data: T }
export interface StockRow { onHand: number; at: number; by?: string | null }

const H = () => ({ 'content-type': 'application/json', 'x-staff-pin': STAFF_PIN });
export function lsGet<T>(k: string, fb: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; } }
export function lsSet(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }

let dbState: boolean | null = null;
export async function dbOnline(): Promise<boolean> {
  if (dbState !== null) return dbState;
  try { const r = await fetch('/api/staff/health', { cache: 'no-store' }); const j = await r.json(); dbState = !!j.db; } catch { dbState = false; }
  return dbState;
}

export async function listEvents<T>(params: { type: string; store?: string; since?: number; limit?: number }): Promise<Ev<T>[] | null> {
  try {
    const u = new URLSearchParams(); u.set('type', params.type); if (params.store) u.set('store', params.store); if (params.since) u.set('since', String(params.since)); if (params.limit) u.set('limit', String(params.limit));
    const r = await fetch('/api/staff/events?' + u, { headers: H(), cache: 'no-store' }); if (!r.ok) return null; return await r.json();
  } catch { return null; }
}
export async function putEvent<T>(ev: Ev<T>): Promise<boolean> {
  try { const r = await fetch('/api/staff/events', { method: 'POST', headers: H(), body: JSON.stringify(ev) }); return r.ok; } catch { return false; }
}
export async function patchEvent(id: string, patch: { status?: string; data?: Record<string, unknown> }): Promise<boolean> {
  try { const r = await fetch('/api/staff/events/' + encodeURIComponent(id), { method: 'PATCH', headers: H(), body: JSON.stringify(patch) }); return r.ok; } catch { return false; }
}
export async function getStock(): Promise<Record<string, StockRow> | null> {
  try { const r = await fetch('/api/staff/stock', { headers: H(), cache: 'no-store' }); if (!r.ok) return null; return await r.json(); } catch { return null; }
}
export async function putStock(rows: { itemId: string; onHand: number; by?: string }[], delta = false): Promise<boolean> {
  try { const r = await fetch('/api/staff/stock', { method: 'PUT', headers: H(), body: JSON.stringify({ rows, delta }) }); return r.ok; } catch { return false; }
}

/** merge remote + local by id, newest wins; keeps unsynced local rows */
export function mergeEvents<T>(remote: Ev<T>[], local: Ev<T>[]): Ev<T>[] {
  const m = new Map<string, Ev<T>>(); for (const e of local) m.set(e.id, e); for (const e of remote) m.set(e.id, e);
  return [...m.values()].sort((a, b) => b.ts - a.ts);
}
