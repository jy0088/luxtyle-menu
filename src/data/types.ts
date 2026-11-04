// Shared domain types for the staff tools (叫货 / 采买 / 仓库 / 统计).

export type Brand = 'BY' | 'YGF' | 'ALL';
/** A = vendor delivers to store · C = local shopping run · D = own warehouse */
export type Channel = 'A' | 'C' | 'D';

export interface Source { vendor: string; price?: number | null; pack?: string }

export interface Item {
  id: string;
  zh: string;
  /** English name — draft until reviewed */
  en: string;
  cat1: string;
  cat2: string;
  brand: Brand;
  /** order unit: CS, bag, pc, lb, 件… */
  unit: string;
  /** pack spec printed on sheets, e.g. "40 LB/CS", "25×200 g" */
  pack?: string;
  /** 'lb' = refPrice is per pound and `lb` is pounds per unit; default 'unit' */
  basis?: 'lb' | 'unit';
  lb?: number | null;
  /** THE reference price. All displays and estimates use it; receipts record actuals against it. */
  refPrice: number | null;
  /** usual quantity (A: per order · C: per run · D: reorder level) */
  par: number;
  note?: string;
  channels: Channel[];
  sources: Source[];
  q?: string;
}

export type CatTree = { cat1: string; cat2: string[] }[];

export interface Vendor {
  id: string;
  name: string;
  shortName: string;
  channel: Channel;
  /** A: delivers to store · D: 'delivery' to warehouse or 'la-pickup' */
  inbound?: 'delivery' | 'la-pickup';
  minLb?: number | null;
  contact?: string;
  terms?: string;
}

export interface Store {
  id: string;
  name: string;
  billTo: string;
  shipTo: string;
  shipNote: string;
  brands: Exclude<Brand, 'ALL'>[];
}

export const STAFF_PIN = '4973';

export const STORES: Store[] = [
  { id: 'cm', name: 'Clairemont Mesa 7315', billTo: 'Tea Station (Luxtyle Creations Inc.)', shipTo: '7315 Clairemont Mesa Blvd, San Diego', shipNote: '后门 · 14:00–20:00', brands: ['BY', 'YGF'] },
  { id: 'mm', name: 'Mira Mesa 9003', billTo: 'Luxtyle City Inc.', shipTo: '9003 Mira Mesa Blvd, San Diego', shipNote: '14:00–20:00', brands: ['BY'] },
];

export const WAREHOUSE = {
  id: 'wh',
  name: '仓库 Pacific Heights',
  address: '9863 Pacific Heights Blvd, San Diego, CA 92121',
  manager: 'Jason',
  countEveryDays: 60,
  leadDaysBeforeRun: 7,
};

export const VENDORS: Vendor[] = [
  // A — deliver to store
  { id: 'sj',   name: 'S.J. Distributors', shortName: 'SJ', channel: 'A', minLb: 100, contact: 'Walter Z. (408) 520-9456', terms: '周一至周六可送 · 100 磅起送' },
  { id: 'chen', name: '陈氏蔬菜 (Angela)', shortName: '陈氏', channel: 'A', minLb: null, contact: 'Angela (619) 806-7275', terms: '送货日 / 起送额待补' },
  { id: 'tl',   name: 'T&L Food Inc.（泰隆）', shortName: '泰隆', channel: 'A', minLb: null, contact: '待补', terms: '送货日 / 起送额待补' },
  // C — local runs
  { id: 'costco', name: 'Costco #578', shortName: 'Costco', channel: 'C', terms: '走店采购，凭小票结账' },
  { id: 'rd',     name: 'Restaurant Depot', shortName: 'RD', channel: 'C', terms: '大包装，不定期' },
  { id: 'market', name: '超市（99 Ranch / Zion / H Mart）', shortName: '超市', channel: 'C', terms: '蔬菜补位、临时缺货' },
  // D — into warehouse
  { id: 'wintime', name: '红日 Wintime', shortName: '红日', channel: 'D', inbound: 'delivery' },
  { id: 'jfc',     name: 'JFC International', shortName: 'JFC', channel: 'D', inbound: 'delivery' },
  { id: 'ygf',     name: '杨国福总仓', shortName: '总仓', channel: 'D', inbound: 'la-pickup' },
  { id: 'jack',    name: '杰克兄弟', shortName: '杰克', channel: 'D', inbound: 'la-pickup' },
  { id: 'yihe',    name: '壹禾', shortName: '壹禾', channel: 'D', inbound: 'la-pickup' },
];
export const vendorById = (id: string) => VENDORS.find(v => v.id === id);

export const CARDS = ['公司卡 Luxtyle Creations', '公司卡 Luxtyle City', 'Kevin 个人卡', '现金'];

/** reference price per order unit */
export function unitPrice(it: Item): number | null {
  if (it.refPrice == null) return null;
  return it.basis === 'lb' ? (it.lb ? it.refPrice * it.lb : null) : it.refPrice;
}
