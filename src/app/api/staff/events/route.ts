import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { authorized, unauthorized, unavailable } from '@/lib/staffAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface EventRow { id: string; type: string; store: string | null; vendor: string | null; who: string | null; status: string | null; ts: number; updated: number; data: Record<string, unknown> }

/** GET ?type=order&store=cm&since=<ms>&limit=200 */
export async function GET(req: Request) {
  if (!authorized(req)) return unauthorized();
  const u = new URL(req.url);
  const type = u.searchParams.get('type'); const store = u.searchParams.get('store'); const since = Number(u.searchParams.get('since') || 0);
  const limit = Math.min(1000, Number(u.searchParams.get('limit') || 300));
  const where: string[] = []; const params: unknown[] = [];
  if (type) { params.push(type); where.push(`type = $${params.length}`); }
  if (store) { params.push(store); where.push(`store = $${params.length}`); }
  if (since) { params.push(since); where.push(`ts >= $${params.length}`); }
  params.push(limit);
  try {
    const rows = await q<EventRow>(`select id,type,store,vendor,who,status,ts,updated,data from staff_events ${where.length ? 'where ' + where.join(' and ') : ''} order by ts desc limit $${params.length}`, params);
    return NextResponse.json(rows.map(r => ({ ...r, ts: Number(r.ts), updated: Number(r.updated) })));
  } catch (e) { return unavailable(e); }
}

/** POST { id, type, store, vendor, who, status, ts, data } — upsert whole event */
export async function POST(req: Request) {
  if (!authorized(req)) return unauthorized();
  let b: Partial<EventRow>; try { b = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (!b.id || !b.type || !b.ts || !b.data) return NextResponse.json({ error: 'id, type, ts, data required' }, { status: 400 });
  try {
    await q(`insert into staff_events (id,type,store,vendor,who,status,ts,updated,data) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      on conflict (id) do update set store=excluded.store, vendor=excluded.vendor, who=excluded.who, status=excluded.status, updated=excluded.updated, data=excluded.data`,
      [b.id, b.type, b.store ?? null, b.vendor ?? null, b.who ?? null, b.status ?? null, b.ts, Date.now(), JSON.stringify(b.data)]);
    return NextResponse.json({ ok: true });
  } catch (e) { return unavailable(e); }
}
