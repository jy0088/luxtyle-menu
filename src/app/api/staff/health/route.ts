import { NextResponse } from 'next/server';
import { hasDb, q } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasDb()) return NextResponse.json({ db: false, reason: 'no POSTGRES_URL / DATABASE_URL' });
  try { await q('select 1'); return NextResponse.json({ db: true }); }
  catch (e) { return NextResponse.json({ db: false, reason: e instanceof Error ? e.message : String(e) }); }
}
