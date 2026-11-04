// Class D — own warehouse (9863 Pacific Heights Blvd, San Diego 92121; run by Jason).
// Goods land here first (vendor delivery or LA pickup); the two stores draw from it.
// Seeded from the v2 workbook (Wintime + JFC). `par` = starting reorder level (v2 惯常量);
// tune after the first 60-day count. YGF总仓 / 杰克兄弟 / 壹禾 SKUs still to be added.

export type WhVendorId = 'wintime' | 'jfc' | 'ygf' | 'jack' | 'yihe';
export type Inbound = 'delivery' | 'la-pickup';

export interface WhVendor { id: WhVendorId; name: string; inbound: Inbound; contact?: string }
export interface WhSku {
  id: string;
  vendor: WhVendorId;
  cat: string;
  name: string;
  unit: string;
  /** reorder level in `unit` */
  par: number;
  /** reference price per unit (last purchase); null = unknown */
  price: number | null;
  brand: 'BY' | 'YGF' | 'ALL';
}

export const WAREHOUSE = {
  name: '仓库 Pacific Heights',
  address: '9863 Pacific Heights Blvd, San Diego, CA 92121',
  manager: 'Jason',
  countEveryDays: 60,
  leadDaysBeforeRun: 7,
};

export const WH_VENDORS: WhVendor[] = [
  { id: 'wintime', name: '红日 Wintime', inbound: 'delivery' },
  { id: 'jfc',     name: 'JFC International', inbound: 'delivery' },
  { id: 'ygf',     name: '杨国福总仓', inbound: 'la-pickup' },
  { id: 'jack',    name: '杰克兄弟', inbound: 'la-pickup' },
  { id: 'yihe',    name: '壹禾', inbound: 'la-pickup' },
];

export const WH_CATS = ['茶饮原料', '包材/耗材', '主食/海鲜/肉类', '调料/酱料'];

const W = 'wintime' as const, J = 'jfc' as const;
export const WH_SKUS: WhSku[] = [
  // ---- 红日 Wintime · 茶饮原料 ----
  { id: 'w-b10',      vendor: W, cat: '茶饮原料', name: 'B-10 红碎茶', unit: 'bag', par: 24, price: 7.38, brand: 'BY' },
  { id: 'w-oc40',     vendor: W, cat: '茶饮原料', name: 'OC-40 (3kg)', unit: 'bag', par: 1, price: 170.94, brand: 'BY' },
  { id: 'w-s20',      vendor: W, cat: '茶饮原料', name: 'S-20 (3kg)', unit: 'bag', par: 1, price: 58.8, brand: 'BY' },
  { id: 'w-thai',     vendor: W, cat: '茶饮原料', name: 'Thai Tea', unit: 'cs', par: 1, price: 108.15, brand: 'BY' },
  { id: 'w-earl',     vendor: W, cat: '茶饮原料', name: '伯爵红茶叶', unit: 'bag', par: 2, price: 10.25, brand: 'BY' },
  { id: 'w-earlg',    vendor: W, cat: '茶饮原料', name: '伯爵绿茶', unit: 'bag', par: 1, price: 18.5, brand: 'BY' },
  { id: 'w-chrys',    vendor: W, cat: '茶饮原料', name: '八宝菊花茶', unit: 'box', par: 1, price: 7, brand: 'BY' },
  { id: 'w-wmelon',   vendor: W, cat: '茶饮原料', name: '冬瓜汁', unit: 'bot', par: 1, price: 24, brand: 'BY' },
  { id: 'w-spotato',  vendor: W, cat: '茶饮原料', name: '地瓜粉', unit: 'cs', par: 2, price: 64, brand: 'BY' },
  { id: 'w-almond',   vendor: W, cat: '茶饮原料', name: '杏仁汁', unit: 'cs', par: 12, price: 6.49, brand: 'BY' },
  { id: 'w-orange',   vendor: W, cat: '茶饮原料', name: '柳橙汁', unit: 'bot', par: 2, price: 24, brand: 'BY' },
  { id: 'w-gardenia', vendor: W, cat: '茶饮原料', name: '栀子绿茶', unit: 'bag', par: 6, price: 10, brand: 'BY' },
  { id: 'w-osm',      vendor: W, cat: '茶饮原料', name: '桂花乌龙', unit: 'bag', par: 1, price: 27.5, brand: 'BY' },
  { id: 'w-peach',    vendor: W, cat: '茶饮原料', name: '水蜜桃汁', unit: 'bot', par: 4, price: 24, brand: 'BY' },
  { id: 'w-bsugarc',  vendor: W, cat: '茶饮原料', name: '浓黑糖浆', unit: 'bot', par: 1, price: 24, brand: 'BY' },
  { id: 'w-soak',     vendor: W, cat: '茶饮原料', name: '浸渍粉', unit: 'bag', par: 4, price: 18, brand: 'BY' },
  { id: 'w-rose',     vendor: W, cat: '茶饮原料', name: '玫瑰汁', unit: 'bot', par: 1, price: 24, brand: 'BY' },
  { id: 'w-roseb',    vendor: W, cat: '茶饮原料', name: '玫瑰红茶', unit: 'bag', par: 2, price: 10.25, brand: 'BY' },
  { id: 'w-wpeach',   vendor: W, cat: '茶饮原料', name: '白桃乌龙', unit: 'bag', par: 3, price: 19.5, brand: 'BY' },
  { id: 'w-jasmine',  vendor: W, cat: '茶饮原料', name: '白露茉莉绿茶', unit: 'bag', par: 11, price: 13, brand: 'BY' },
  { id: 'w-passion',  vendor: W, cat: '茶饮原料', name: '百香汁', unit: 'bot', par: 6, price: 24, brand: 'BY' },
  { id: 'w-passionj', vendor: W, cat: '茶饮原料', name: '百香酱', unit: 'bot', par: 1, price: 24, brand: 'BY' },
  { id: 'w-redbean',  vendor: W, cat: '茶饮原料', name: '红豆罐头', unit: 'can', par: 1, price: 22, brand: 'BY' },
  { id: 'w-mung',     vendor: W, cat: '茶饮原料', name: '绿豆罐头', unit: 'can', par: 2, price: 14, brand: 'BY' },
  { id: 'w-mango',    vendor: W, cat: '茶饮原料', name: '芒果酱', unit: 'bot', par: 3, price: 16, brand: 'BY' },
  { id: 'w-sesame',   vendor: W, cat: '茶饮原料', name: '芝麻汁', unit: 'bot', par: 6, price: 24, brand: 'BY' },
  { id: 'w-strawb',   vendor: W, cat: '茶饮原料', name: '草莓汁', unit: 'bot', par: 2, price: 24, brand: 'BY' },
  { id: 'w-lychee',   vendor: W, cat: '茶饮原料', name: '葛枝茸菇', unit: 'bot', par: 12, price: 11, brand: 'BY' },
  { id: 'w-pear',     vendor: W, cat: '茶饮原料', name: '蓊梨汁', unit: 'bot', par: 6, price: 24, brand: 'BY' },
  { id: 'w-vermic',   vendor: W, cat: '茶饮原料', name: '金宝冬粉', unit: 'bag', par: 12, price: 2.5, brand: 'BY' },
  { id: 'w-tgy',      vendor: W, cat: '茶饮原料', name: '铁观音炭乌龙', unit: 'bag', par: 1, price: 18.5, brand: 'BY' },
  { id: 'w-bsugar',   vendor: W, cat: '茶饮原料', name: '黑糖浆', unit: 'bot', par: 4, price: 28, brand: 'BY' },
  { id: 'w-boba',     vendor: W, cat: '茶饮原料', name: '黑色大珍珠', unit: 'cs', par: 2, price: 48, brand: 'BY' },
  { id: 'w-taro',     vendor: W, cat: '茶饮原料', name: '芋头粉', unit: 'bag', par: 24, price: 13, brand: 'BY' },
  { id: 'w-longan',   vendor: W, cat: '茶饮原料', name: '龙眼蜜糖浆', unit: 'bot', par: 10, price: 13, brand: 'BY' },
  // ---- 红日 Wintime · 包材/耗材 ----
  { id: 'w-cup700',   vendor: W, cat: '包材/耗材', name: '700ML 磨砂冷饮杯', unit: '件', par: 14, price: 45, brand: 'BY' },
  { id: 'w-lid90',    vendor: W, cat: '包材/耗材', name: '90 透明折塞盖', unit: '件', par: 7, price: 43.5, brand: 'BY' },
  { id: 'w-btb50',    vendor: W, cat: '包材/耗材', name: 'BTB50', unit: 'box', par: 1, price: 12.8, brand: 'BY' },
  { id: 'w-sz218',    vendor: W, cat: '包材/耗材', name: 'SZ218 圆碗套装中', unit: '件', par: 2, price: 27, brand: 'ALL' },
  { id: 'w-sz318t',   vendor: W, cat: '包材/耗材', name: 'SZ318 两格内托', unit: '件', par: 1, price: 6, brand: 'ALL' },
  { id: 'w-sz318',    vendor: W, cat: '包材/耗材', name: 'SZ318 圆碗套装大', unit: '件', par: 2, price: 28.5, brand: 'ALL' },
  { id: 'w-sz621',    vendor: W, cat: '包材/耗材', name: 'SZ621 单格黑长盒', unit: '件', par: 2, price: 34.5, brand: 'ALL' },
  { id: 'w-cutlery',  vendor: W, cat: '包材/耗材', name: '一次性餐具包', unit: '件', par: 3, price: 44, brand: 'ALL' },
  { id: 'w-3box',     vendor: W, cat: '包材/耗材', name: '三格套餐盒', unit: '件', par: 1, price: 60, brand: 'ALL' },
  { id: 'w-3side',    vendor: W, cat: '包材/耗材', name: '三格配菜盒', unit: '件', par: 1, price: 2, brand: 'ALL' },
  { id: 'w-round1000',vendor: W, cat: '包材/耗材', name: '主餐圆盒大 1000ml', unit: '件', par: 1, price: 44, brand: 'ALL' },
  { id: 'w-sq500',    vendor: W, cat: '包材/耗材', name: '主餐方碗大 500ml', unit: '件', par: 2, price: 42, brand: 'ALL' },
  { id: 'w-sq350',    vendor: W, cat: '包材/耗材', name: '主餐方碗小 350ml', unit: '件', par: 2, price: 27, brand: 'ALL' },
  { id: 'w-paper',    vendor: W, cat: '包材/耗材', name: '打印纸', unit: '件', par: 2, price: 20, brand: 'ALL' },
  { id: 'w-sleeve',   vendor: W, cat: '包材/耗材', name: '热饮杯套', unit: '件', par: 1, price: 34.5, brand: 'BY' },
  { id: 'w-spoon',    vendor: W, cat: '包材/耗材', name: '独立包甜品勺', unit: '件', par: 3, price: 2, brand: 'ALL' },
  // ---- 红日 Wintime · 主食/海鲜/肉类 + 调料 ----
  { id: 'w-sesball',  vendor: W, cat: '主食/海鲜/肉类', name: '芝麻球', unit: 'cs', par: 3, price: 22, brand: 'BY' },
  { id: 'w-gongwan',  vendor: W, cat: '主食/海鲜/肉类', name: '贡丸', unit: 'bag', par: 2, price: 38, brand: 'ALL' },
  { id: 'w-wings',    vendor: W, cat: '主食/海鲜/肉类', name: "SAM'S 炸鸡翅", unit: 'bag', par: 8, price: 14, brand: 'BY' },
  { id: 'w-roastck',  vendor: W, cat: '主食/海鲜/肉类', name: "SAM'S 烤鸡", unit: 'bag', par: 23, price: 14, brand: 'BY' },
  { id: 'w-sweetchili',vendor: W, cat: '调料/酱料', name: '甜辣酱', unit: 'cs', par: 1, price: 29.4, brand: 'BY' },
  // ---- JFC ----
  { id: 'j-ramen',    vendor: J, cat: '主食/海鲜/肉类', name: '明星生拉面 冷冻', unit: 'cs', par: 2, price: 25.1, brand: 'ALL' },
  { id: 'j-takoyaki', vendor: J, cat: '主食/海鲜/肉类', name: '章鱼小丸子 45个', unit: 'cs', par: 2, price: 62.5, brand: 'BY' },
  { id: 'j-yoshi',    vendor: J, cat: '主食/海鲜/肉类', name: '吉野家牛肉饭 冷冻', unit: 'cs', par: 2, price: 102, brand: 'BY' },
  { id: 'j-tonkotsu', vendor: J, cat: '调料/酱料', name: '和光豚骨拉面汤底', unit: 'cs', par: 2, price: 38.58, brand: 'BY' },
  { id: 'j-babycorn', vendor: J, cat: '调料/酱料', name: '玉米笋 罐头', unit: 'cs', par: 3, price: 16.8, brand: 'YGF' },
  { id: 'j-ponzu',    vendor: J, cat: '调料/酱料', name: '味滋康柚子醋', unit: 'cs', par: 1, price: 60, brand: 'BY' },
  { id: 'j-garlicoil',vendor: J, cat: '调料/酱料', name: '和光大蒜油', unit: 'cs', par: 2, price: 22, brand: 'BY' },
  { id: 'j-corn',     vendor: J, cat: '调料/酱料', name: '整根玉米罐头', unit: '箱', par: 2, price: 16.8, brand: 'YGF' },
  { id: 'j-dashi',    vendor: J, cat: '调料/酱料', name: '日式高汤粉', unit: 'cs', par: 2, price: 10.8, brand: 'BY' },
  { id: 'j-panko',    vendor: J, cat: '调料/酱料', name: '面包糠', unit: 'cs', par: 1, price: 24.7, brand: 'BY' },
];
