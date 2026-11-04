import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { authorized, unauthorized, unavailable } from '@/lib/staffAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** PATCH { status?, data? } — merges `data` (shallow) and updates status */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return unauthorized();
  const { id } = await ctx.params;
  let b: { status?: string; data?: Record<string, unknown> }; try { b = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  try {
    const rows = await q(`update staff_events set status = coalesce($2, status), data = data || $3::jsonb, updated = $4 where id = $1 returning id`, [id, b.status ?? null, JSON.stringify(b.data ?? {}), Date.now()]);
    if (!rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) { return unavailable(e); }
}
