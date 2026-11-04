// Shared types for class-A vendors (deliver to store). One config file per vendor.

export type Brand = 'BY' | 'YGF' | 'ALL';
/** 'lb' = price per pound with `lb` per case; 'unit' = price per order unit */
export type Basis = 'lb' | 'unit';

export interface Sku {
  id: string;
  cat: string;
  brand: Brand;
  name: string;
  /** order unit shown on the sheet: CS, bag, pc, lb… */
  unit: string;
  /** pounds per case; null = unknown / not applicable */
  lb: number | null;
  basis: Basis;
  /** reference price; null = not yet priced */
  price: number | null;
  /** standing spec printed on every order */
  note: string;
  /** usual order quantity */
  par: number;
  /** open question — shown as a warning until resolved */
  q?: string;
}

export interface Store {
  id: string;
  name: string;
  billTo: string;
  shipTo: string;
  shipNote: string;
  brands: Exclude<Brand, 'ALL'>[];
}

export interface VendorConfig {
  id: string;
  name: string;
  shortName: string;
  /** minimum order in pounds (null = none known) */
  minLb: number | null;
  contact: string;
  /** e.g. delivery days / cut-off */
  terms: string;
  cats: string[];
  skus: Sku[];
}

export const STAFF_PIN = '4973';

export const STORES: Store[] = [
  { id: 'cm', name: 'Clairemont Mesa 7315', billTo: 'Tea Station (Luxtyle Creations Inc.)', shipTo: '7315 Clairemont Mesa Blvd, San Diego', shipNote: '后门 · 14:00–20:00', brands: ['BY', 'YGF'] },
  { id: 'mm', name: 'Mira Mesa 9003', billTo: 'Luxtyle City Inc.', shipTo: '9003 Mira Mesa Blvd, San Diego', shipNote: '14:00–20:00', brands: ['BY'] },
];

export function csPrice(s: Sku): number | null {
  if (s.price == null) return null;
  return s.basis === 'unit' ? s.price : s.lb ? s.price * s.lb : null;
}
