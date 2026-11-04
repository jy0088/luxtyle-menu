// Class C — local runs（周边采买）: Costco, Restaurant Depot, Asian supermarkets.
// Staff tick what's needed → shopping list → after the run, log receipt total + card + brand split.
// Seeded from the v2 workbook (Costco 45 → deduplicated, RD 4) plus a supermarket gap-fill list.

export interface ShopItem { id: string; store: ShopStoreId; cat: string; name: string; unit: string; price: number | null; par: number; brand: 'BY' | 'YGF' | 'ALL' }
export type ShopStoreId = 'costco' | 'rd' | 'market';
export interface ShopStore { id: ShopStoreId; name: string; note: string }

export const SHOP_STORES: ShopStore[] = [
  { id: 'costco', name: 'Costco #578', note: '走店采购，凭小票结账' },
  { id: 'rd',     name: 'Restaurant Depot', note: '大包装，不定期' },
  { id: 'market', name: '超市（99 Ranch / Zion / H Mart）', note: '蔬菜补位、临时缺货' },
];

export const CARDS = ['公司卡 Luxtyle Creations', '公司卡 Luxtyle City', 'Kevin 个人卡', '现金'];

const I = (id: string, store: ShopStoreId, cat: string, brand: ShopItem['brand'], name: string, unit: string, price: number | null, par: number): ShopItem => ({ id, store, cat, brand, name, unit, price, par });

export const SHOP_ITEMS: ShopItem[] = [
  // Costco — 包材/清洁
  I('c-trash33',   'costco', '包材/清洁', 'ALL', '33 加仑垃圾袋', '件', 19.99, 2),
  I('c-cupwhite',  'costco', '包材/清洁', 'ALL', '白色一次性纸杯', '箱', 13.99, 2),
  I('c-cupred',    'costco', '包材/清洁', 'ALL', '红色一次性杯', '箱', 11.49, 2),
  I('c-wrap',      'costco', '包材/清洁', 'ALL', '保鲜膜 3000尺', '件', 16.89, 1),
  I('c-box8',      'costco', '包材/清洁', 'ALL', '外卖纸箱 #8', '箱', 39.99, 2),
  I('c-gloves',    'costco', '包材/清洁', 'ALL', '一次性手套', '件', 11.79, 1),
  I('c-workglove', 'costco', '包材/清洁', 'ALL', '工作手套 中号', '件', 18.99, 1),
  I('c-cleaner',   'costco', '包材/清洁', 'ALL', '多功能清洁剂', '件', 33.99, 1),
  I('c-dish',      'costco', '包材/清洁', 'ALL', '洗洁精', '瓶', 15.99, 2),
  I('c-bleach',    'costco', '包材/清洁', 'ALL', '漂白水', '件', 18.99, 1),
  I('c-glass',     'costco', '包材/清洁', 'ALL', '玻璃清洁剂', '件', 8.79, 1),
  I('c-towel',     'costco', '包材/清洁', 'ALL', '毛巾 / 抹布', '件', 19.99, 1),
  I('c-seatcover', 'costco', '包材/清洁', 'ALL', '马桶坐垫纸', '件', 37.99, 1),
  I('c-bandaid',   'costco', '包材/清洁', 'ALL', '创可贴', '件', 13.99, 1),
  I('c-clips',     'costco', '包材/清洁', 'ALL', '弹簧夹', '件', 14.99, 1),
  I('c-dessertpot','costco', '包材/清洁', 'BY',  '甜品锅 3/8"', '件', 34.99, 1),
  // Costco — 食材
  I('c-oil35',     'costco', '食材', 'ALL', '大豆油 35磅', '桶', 32.79, 1),
  I('c-fryoil',    'costco', '食材', 'ALL', 'KS 炸油', '桶', 31.49, 3),
  I('c-milk',      'costco', '食材', 'BY',  '全脂牛奶', '罐', 6.39, 1),
  I('c-milkpdr',   'costco', '食材', 'BY',  '雀巢全脂奶粉', '罐', 22.99, 2),
  I('c-creamer',   'costco', '食材', 'BY',  '咖啡伴侣', '罐', 7.99, 24),
  I('c-whip',      'costco', '食材', 'BY',  '奶油喷罐', '件', 10.99, 1),
  I('c-cream',     'costco', '食材', 'BY',  '淡奶油', '罐', 3.39, 1),
  I('c-brownsugar','costco', '食材', 'BY',  '红糖', '袋', 22.79, 2),
  I('c-chicken',   'costco', '食材', 'BY',  '烤鸡', '只', 27.99, 4),
  I('c-porkneck',  'costco', '食材', 'YGF', '猪颈肉', '件', 57.49, 2),
  I('c-groundpork','costco', '食材', 'ALL', '猪肉碎 4磅', '包', 43.96, 1),
  I('c-teriyaki',  'costco', '食材', 'BY',  '照烧酱', '件', 9.39, 2),
  I('c-tomato',    'costco', '食材', 'YGF', '罗马番茄', '箱', 25.99, 1),
  I('c-strawb',    'costco', '食材', 'BY',  '草莓', '盒', 12.79, 2),
  I('c-pineapple', 'costco', '食材', 'BY',  '有机菠萝', '件', 10.29, 1),
  I('c-apple',     'costco', '食材', 'BY',  '粉女士苹果', '件', 4.49, 1),
  I('c-lime',      'costco', '食材', 'BY',  '青柠 3磅', '袋', 4.39, 3),
  // Restaurant Depot
  I('rd-napkin',   'rd', '包材/清洁', 'ALL', '餐巾纸卷', 'cs', 92.93, 2),
  I('rd-soupbase', 'rd', '食材', 'YGF', '汤底料 16oz', '件', 32.39, 2),
  I('rd-concentr', 'rd', '食材', 'YGF', '汤料浓缩', '件', 27.99, 1),
  I('rd-carrot',   'rd', '食材', 'ALL', '大胡萝卜 25磅', '件', 10.95, 1),
  // 超市 gap-fill
  I('m-bokchoy',   'market', '蔬菜', 'ALL', '青江菜', 'lb', null, 5),
  I('m-napa',      'market', '蔬菜', 'ALL', '大白菜', '颗', null, 3),
  I('m-enoki',     'market', '蔬菜', 'YGF', '金针菇', '包', null, 10),
  I('m-beech',     'market', '蔬菜', 'YGF', '海鲜菇', '包', null, 6),
  I('m-scallion',  'market', '蔬菜', 'ALL', '青葱', '把', null, 5),
  I('m-cilantro',  'market', '蔬菜', 'ALL', '香菜', '把', null, 5),
  I('m-tofu',      'market', '蔬菜', 'ALL', '老豆腐', '盒', null, 6),
  I('m-eggs',      'market', '蔬菜', 'ALL', '鸡蛋', '打', null, 3),
];
