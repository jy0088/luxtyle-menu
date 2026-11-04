// T&L Food Inc. (泰隆) — rice, dry goods, packaging, eggs, sauces, produce (class A, delivers to store).
// Seeded from the v2 workbook (81 lines → deduplicated). Prices = last purchase; verify before relying on them.
import type { Sku, VendorConfig } from './types';

const CATS = ['主食/淀粉', '蛋/肉', '蔬菜/菌菇', '豆制品', '调料/酱料', '包材/耗材', '茶饮/其他'];
const U = (id: string, cat: string, brand: Sku['brand'], name: string, unit: string, price: number | null, par: number, note = '', q?: string): Sku =>
  ({ id, cat, brand, name, unit, lb: null, basis: 'unit', price, note, par, ...(q ? { q } : {}) });

const SKUS: Sku[] = [
  // 主食/淀粉
  U('tl-rice',      '主食/淀粉', 'ALL', '大米 / 寿司米 50磅', 'cs', 27.95, 4, '', 'v2 有大米/寿司米/日本米三条同价，合并为一条，确认是否同一货'),
  U('tl-lamian',    '主食/淀粉', 'BY',  '山东拉面', 'pc', 5.5, 10),
  U('tl-youtiao',   '主食/淀粉', 'ALL', '油条 3条装', 'pc', 3.55, 17),
  U('tl-mantou',    '主食/淀粉', 'BY',  '白馒头 30个', 'cs', 5.35, 1),
  U('tl-smantou',   '主食/淀粉', 'BY',  '小馒头 12pc', 'pc', 2.65, 3),
  U('tl-liangfen',  '主食/淀粉', 'YGF', '凉粉', 'pc', 2, 24),
  U('tl-lingfen',   '主食/淀粉', 'ALL', '菱粉', 'pc', 0.95, 5),
  // 蛋/肉
  U('tl-eggs',      '蛋/肉', 'ALL', '大鸡蛋 15打', 'cs', 19.5, 3),
  U('tl-porkneck',  '蛋/肉', 'YGF', '猪颈骨', 'lb', 1.36, 30),
  U('tl-huazhi',    '蛋/肉', 'BY',  '花枝丸', 'cs', 4.5, 5),
  // 蔬菜/菌菇
  U('tl-napa',      '蔬菜/菌菇', 'ALL', '山东大白菜', 'cs', 39.5, 1, '', 'v2 有 $29.5/$39.5/$46.5 三条，确认规格'),
  U('tl-cabbage',   '蔬菜/菌菇', 'ALL', '绿卷心菜 / 高丽菜 35磅', 'cs', 18.5, 2),
  U('tl-baocai',    '蔬菜/菌菇', 'ALL', '包心菜', 'cs', 20.5, 2),
  U('tl-garlic',    '蔬菜/菌菇', 'ALL', '去皮蒜头', 'lb', 2.8, 10),
  U('tl-ginger',    '蔬菜/菌菇', 'ALL', '生姜', 'lb', 1.6, 5),
  U('tl-shallot',   '蔬菜/菌菇', 'ALL', '红葱头', 'lb', 2.2, 6),
  U('tl-onion',     '蔬菜/菌菇', 'ALL', '洋葱', 'bag', 14, 1),
  U('tl-potato',    '蔬菜/菌菇', 'YGF', '土豆', 'cs', 15.95, 1),
  U('tl-carrot',    '蔬菜/菌菇', 'ALL', '大胡萝卜 25磅', 'bag', 15.5, 1),
  U('tl-daikon',    '蔬菜/菌菇', 'ALL', '白萝卜', 'cs', 19.5, 1),
  U('tl-cucumber',  '蔬菜/菌菇', 'ALL', '黄瓜', 'bx', 22.75, 1, '', 'v2 有 $22.75/$32.25 两条'),
  U('tl-mungsprout','蔬菜/菌菇', 'ALL', '绿豆芽 5磅', 'bag', 3.95, 1),
  U('tl-soysprout', '蔬菜/菌菇', 'YGF', '黄豆芽', 'cs', 9.95, 1),
  U('tl-edamame',   '蔬菜/菌菇', 'BY',  '冻毛豆仁', 'pc', 2.05, 10),
  U('tl-thaichili', '蔬菜/菌菇', 'ALL', '冷冻泰国红辣椒 6oz', 'pc', 2.25, 40),
  // 豆制品
  U('tl-tofu',      '豆制品', 'ALL', '福临门老豆腐', 'cs', 27.95, 2),
  U('tl-hardtofu',  '豆制品', 'YGF', '硬豆腐', 'cs', 28.5, 1),
  U('tl-xianggan',  '豆制品', 'ALL', '福临门香干 12oz', 'pc', 3.65, 15),
  U('tl-wuxiang',   '豆制品', 'BY',  '五香豆干', 'pc', 3.65, 15),
  // 调料/酱料
  U('tl-soy',       '调料/酱料', 'ALL', '蓬莱酱油', 'cs', 35.5, 1, '', 'v2 蓬莱/达莱/逢莱疑为同一品'),
  U('tl-oyster',    '调料/酱料', 'ALL', '熊猫蚝油', 'pc', 7.5, 2),
  U('tl-doubanjiang','调料/酱料','ALL', '四川辣豆瓣酱', 'pc', 3.5, 15),
  U('tl-chilioil',  '调料/酱料', 'ALL', '联合香辣油', 'pc', 18.95, 1),
  U('tl-sesameoil', '调料/酱料', 'ALL', '吉祥麻油', 'cs', 25.95, 1),
  U('tl-wine',      '调料/酱料', 'ALL', '绍兴料酒', 'cs', 24.95, 1),
  U('tl-ketchup',   '调料/酱料', 'ALL', '番茄酱', '件', 43.95, 1),
  U('tl-sugar',     '调料/酱料', 'ALL', '白砂糖', 'bg', 34.5, 1),
  U('tl-rocksugar', '调料/酱料', 'ALL', '冰糖', 'pc', 0.95, 10),
  U('tl-salt',      '调料/酱料', 'ALL', '盐', 'pc', 1.75, 5),
  U('tl-wpepper',   '调料/酱料', 'ALL', '白胡椒粉', 'pc', 37.95, 1),
  U('tl-chickenpdr','调料/酱料', 'ALL', '太太乐鸡粉', 'pc', 20.5, 3),
  U('tl-licorice',  '调料/酱料', 'BY',  '甘草粉', 'pc', 4.95, 1),
  U('tl-zhacai',    '调料/酱料', 'BY',  '榨菜丝（低盐）', 'pc', 1.15, 40),
  U('tl-meicai',    '调料/酱料', 'BY',  '梅菜心', 'pc', 2.65, 10),
  U('tl-wasabi',    '调料/酱料', 'BY',  '芥末条', 'pc', 1.1, 2),
  // 包材/耗材
  U('tl-tray4',     '包材/耗材', 'BY',  '4杯托盘', 'cs', 48, 1),
  U('tl-straw9',    '包材/耗材', 'BY',  '9寸吸管', 'cs', 35.95, 2),
  U('tl-fork',      '包材/耗材', 'ALL', '塑料叉（中胶叉）', 'cs', 9.95, 1),
  U('tl-spoon',     '包材/耗材', 'ALL', '中胶汤勺', 'cs', 9.95, 1),
  U('tl-chopsticks','包材/耗材', 'ALL', '铁人筷子', 'cs', 47.95, 1),
  U('tl-napkin2',   '包材/耗材', 'ALL', '双层餐巾纸', 'cs', 57.95, 1),
  U('tl-napkinto',  '包材/耗材', 'ALL', '外卖餐巾纸', 'cs', 54.95, 1),
  U('tl-bagL',      '包材/耗材', 'ALL', '大手提袋', 'cs', 15.5, 1),
  U('tl-bag',       '包材/耗材', 'ALL', '手提袋', 'cs', 9.5, 2),
  U('tl-tshirtbag', '包材/耗材', 'ALL', '背心袋', 'cs', 15.5, 1),
  // 茶饮/其他
  U('tl-fructose',  '茶饮/其他', 'BY',  '果糖 3x1', 'cs', 37.95, 4),
  U('tl-matcha-ic', '茶饮/其他', 'BY',  '绿茶雪糕', 'cs', 43.95, 1),
  U('tl-cosmo',     '茶饮/其他', 'BY',  'COSMO 芽菜', 'bag', 3.95, 1),
];

export const TL: VendorConfig = {
  id: 'tl',
  name: 'T&L Food Inc.（泰隆）',
  shortName: '泰隆',
  minLb: null,
  contact: '— 待补',
  terms: '送货日 / 起送额待补',
  cats: CATS,
  skus: SKUS,
};
