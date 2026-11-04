import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { authorized, unauthorized, unavailable } from '@/lib/staffAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!authorized(req)) return unauthorized();
  try {
    const rows = await q<{ item_id: string; on_hand: string; counted_at: string; by: string | null }>('select item_id,on_hand,counted_at,by from staff_stock');
    const out: Record<string, { onHand: number; at: number; by: string | null }> = {};
    for (const r of rows) out[r.item_id] = { onHand: Number(r.on_hand), at: Number(r.counted_at), by: r.by };
    return NextResponse.json(out);
  } catch (e) { return unavailable(e); }
}

/** PUT [{ itemId, onHand, by }] — upsert; `delta: true` in body object form subtracts instead */
export async function PUT(req: Request) {
  if (!authorized(req)) return unauthorized();
  let b: { rows: { itemId: string; onHand: number; by?: string }[]; delta?: boolean }; try { b = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (!Array.isArray(b.rows)) return NextResponse.json({ error: 'rows[] required' }, { status: 400 });
  const now = Date.now();
  try {
    for (const r of b.rows) {
      if (b.delta) await q(`update staff_stock set on_hand = greatest(0, on_hand - $2), by = coalesce($3, by) where item_id = $1`, [r.itemId, r.onHand, r.by ?? null]);
      else await q(`insert into staff_stock (item_id,on_hand,counted_at,by) values ($1,$2,$3,$4) on conflict (item_id) do update set on_hand=excluded.on_hand, counted_at=excluded.counted_at, by=excluded.by`, [r.itemId, r.onHand, now, r.by ?? null]);
    }
    return NextResponse.json({ ok: true, at: now });
  } catch (e) { return unavailable(e); }
}
