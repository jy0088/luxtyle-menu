import { NextResponse } from 'next/server';
import { STAFF_PIN } from '@/data/types';

/** Shared-secret check: pages send the store PIN as x-staff-pin. Override with STAFF_PIN env. */
export function authorized(req: Request) {
  const pin = process.env.STAFF_PIN || STAFF_PIN;
  return req.headers.get('x-staff-pin') === pin;
}
export const unauthorized = () => NextResponse.json({ error: 'unauthorized' }, { status: 401 });
export const unavailable = (e?: unknown) => NextResponse.json({ error: 'db unavailable', detail: e instanceof Error ? e.message : String(e ?? '') }, { status: 503 });
