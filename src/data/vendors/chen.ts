// 陈氏 (Angela) — Asian produce (class A, delivers to store). Replaced VIP Wholesales.
// SKU list seeded from the VIP produce lines in the v2 workbook as a starting point;
// prices are VIP's last prices and are flagged until 陈氏 quotes. Trim / add to match what 陈氏 actually carries.
import type { Sku, VendorConfig } from './types';

const CATS = ['叶菜', '菌菇', '根茎/其他', '冷冻/加工'];
const Q = 'VIP 旧价，待陈氏报价';
const U = (id: string, cat: string, brand: Sku['brand'], name: string, unit: string, price: number | null, par: number, note = ''): Sku =>
  ({ id, cat, brand, name, unit, lb: null, basis: 'unit', price, note, par, q: Q });

const SKUS: Sku[] = [
  U('ch-acai',     '叶菜', 'YGF', 'A菜', 'cs', 49.5, 1),
  U('ch-napa',     '叶菜', 'ALL', '大白菜', 'cs', 52.5, 1),
  U('ch-tonghao',  '叶菜', 'YGF', '茼蒿 20磅', 'cs', 32.5, 1),
  U('ch-stonghao', '叶菜', 'YGF', '小茼蒿', 'cs', 29.5, 1),
  U('ch-bokchoy',  '叶菜', 'ALL', '青江菜', 'cs', null, 1),
  U('ch-spinach',  '叶菜', 'YGF', '菠菜', 'cs', 39.54, 1),
  U('ch-woju',     '叶菜', 'YGF', '莴笋', 'cs', 38.95, 1),
  U('ch-wosun',    '叶菜', 'YGF', '莴荀', 'cs', 39.5, 1),
  U('ch-scallion', '叶菜', 'ALL', '青葱', 'cs', 29.95, 1),
  U('ch-cilantro', '叶菜', 'ALL', '香菜 30CT', 'cs', 18.95, 1),
  U('ch-enoki',    '菌菇', 'YGF', '金针菇 25x200G', 'cs', 29.95, 1),
  U('ch-beech',    '菌菇', 'YGF', '海鲜菇 40/150G', 'cs', 29.99, 1),
  U('ch-kingoyster','菌菇','YGF', '帝王菇', 'cs', 19.99, 1),
  U('ch-garlic',   '根茎/其他', 'ALL', '去皮蒜头', 'cs', 105, 1),
  U('ch-nagaimo',  '根茎/其他', 'YGF', '日本山药', 'cs', 75.95, 1),
  U('ch-onion',    '根茎/其他', 'ALL', '黄洋葱 50LB', 'bag', 17.95, 1),
  U('ch-lotus',    '冷冻/加工', 'YGF', '冷冻莲藕片 22x450G', 'cs', 47.5, 1),
  U('ch-ricecake', '冷冻/加工', 'YGF', '韩国年糕', 'cs', 62.5, 1),
  U('ch-konjac',   '冷冻/加工', 'YGF', '魔芋丝', 'cs', 51, 1),
  U('ch-crab',     '冷冻/加工', 'YGF', '假蟹肉条（钻石牌）5磅', 'box', 18.75, 5),
  U('ch-feiniu',   '冷冻/加工', 'YGF', '肥牛（箱）', 'cs', null, 2, '按磅计价，箱规待补'),
];

export const CHEN: VendorConfig = {
  id: 'chen',
  name: '陈氏蔬菜 (Angela)',
  shortName: '陈氏',
  minLb: null,
  contact: 'Angela (619) 806-7275',
  terms: '送货日 / 起送额待补',
  cats: CATS,
  skus: SKUS,
};
