// src/lib/table.ts
// Table codes printed on the acrylic stands (A1–A12, B1–B14, C1–C18, S1–S8).
// Source of truth: tables.csv in Kevin's ops folder. Keep this in sync when zones change.

export type Zone = 'A' | 'B' | 'C' | 'S';
export type Seating = 'dining' | 'open';
export type BrandDefault = 'beiyuan' | 'ygf' | 'all';

export const TABLE_COOKIE = 'lx_table';
export const TABLE_COOKIE_MAX_AGE = 60 * 60 * 12; // 12h — one visit, not forever

export const ZONES: Record<Zone, { max: number; seating: Seating; brand: BrandDefault; landing: string }> = {
  A: { max: 12, seating: 'dining', brand: 'beiyuan', landing: '/menu/beiyuan?store=clairemont' },
  B: { max: 14, seating: 'open', brand: 'all', landing: '/' },
  C: { max: 18, seating: 'dining', brand: 'ygf', landing: '/menu/ygf' },
  S: { max: 8, seating: 'open', brand: 'all', landing: '/' },
};

export type TableInfo = { code: string; zone: Zone; seating: Seating; brand: BrandDefault };

/** Parse "a1" / "C18" → TableInfo, or null when out of range. */
export function parseTableCode(raw: string | null | undefined): TableInfo | null {
  if (!raw) return null;
  const m = /^([ABCS])(\d{1,2})$/i.exec(raw.trim());
  if (!m) return null;
  const zone = m[1].toUpperCase() as Zone;
  const n = Number(m[2]);
  if (n < 1 || n > ZONES[zone].max) return null;
  return { code: `${zone}${n}`, zone, seating: ZONES[zone].seating, brand: ZONES[zone].brand };
}

/** Client-side read of the table cookie set by /t/[code]. */
export function readTableCookie(): TableInfo | null {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${TABLE_COOKIE}=`));
  return parseTableCode(hit ? decodeURIComponent(hit.slice(TABLE_COOKIE.length + 1)) : null);
}
