// src/app/t/[code]/route.ts
// QR on every table stand points here: luxtyle.biz/t/A1.
// Remembers the table in a cookie, then sends the guest to the zone's default menu.
import { NextResponse, type NextRequest } from 'next/server';
import { parseTableCode, TABLE_COOKIE, TABLE_COOKIE_MAX_AGE, ZONES } from '@/lib/table';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const table = parseTableCode(code);
  const target = table ? ZONES[table.zone].landing : '/';
  const res = NextResponse.redirect(new URL(target, req.url), 302);
  if (table) {
    res.cookies.set(TABLE_COOKIE, table.code, {
      path: '/',
      maxAge: TABLE_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }
  return res;
}
