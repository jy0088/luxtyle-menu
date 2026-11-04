// S.J. Distributors — meat & fresh (class A, delivers to store). Shared by Bei Yuan + YGF.
// Only Kevin edits prices / pack sizes / specs here; staff only enter quantities.
// Fields marked `q` are pending confirmation with SJ (see project doc SJ-order-sheet-v2-gap-analysis).
import type { Sku, VendorConfig } from './types';

const CATS = ['猪肉', '牛肉', '鸡肉', '海鲜', '丸类·蛋'];

const SKUS: Sku[] = [
  { id: 'pk-rib',    cat: '猪肉', brand: 'BY',  name: '排骨 Center Cut',     unit: 'CS', lb: 33,   basis: 'lb', price: 2.56,  note: '1/2寸厚，肥肉部分尽量少', par: 1 },
  { id: 'pk-belly',  cat: '猪肉', brand: 'ALL', name: '五花肉（大箱）',        unit: 'CS', lb: 60,   basis: 'lb', price: 2.16,  note: '大箱', par: 1, q: 'v2单价$3.55/LB待核' },
  { id: 'pk-ground', cat: '猪肉', brand: 'BY',  name: '猪绞肉',              unit: 'CS', lb: 40,   basis: 'lb', price: 2.5,   note: '', par: 0 },
  { id: 'pk-shldr',  cat: '猪肉', brand: 'BY',  name: '前腿瘦肉',            unit: 'CS', lb: null, basis: 'lb', price: 2.16,  note: '', par: 0, q: '箱规待补' },
  { id: 'pk-loin',   cat: '猪肉', brand: 'BY',  name: '大里肌肉',            unit: 'CS', lb: null, basis: 'lb', price: 2.16,  note: '', par: 0, q: '箱规待补' },
  { id: 'pk-foot',   cat: '猪肉', brand: 'ALL', name: '猪脚',                unit: 'CS', lb: null, basis: 'unit', price: 69.3,  note: '切好的', par: 0 },
  { id: 'pk-ring',   cat: '猪肉', brand: 'BY',  name: '猪圈圈',              unit: 'CS', lb: 30,   basis: 'lb', price: 1.81,  note: '切好的', par: 1, q: '是否=v2猪大肠$29.70' },
  { id: 'pk-ball',   cat: '丸类·蛋', brand: 'YGF', name: '猪肉丸',            unit: 'CS', lb: null, basis: 'unit', price: null,  note: '', par: 2 },

  { id: 'bf-shank',  cat: '牛肉', brand: 'ALL', name: '牛腱肉（新西兰）',      unit: 'CS', lb: 60,   basis: 'lb', price: 2.16,  note: '新西兰牛腱肉', par: 1, q: 'v2 HALAL $6/LB疑为不同货' },
  { id: 'bf-short',  cat: '牛肉', brand: 'BY',  name: '牛小排',              unit: 'CS', lb: 40,   basis: 'lb', price: 4.59,  note: '肥肉/筋太多的不要', par: 0 },
  { id: 'bf-chuck',  cat: '牛肉', brand: 'YGF', name: '牛板腱 Chuck Roll',    unit: 'CS', lb: null, basis: 'unit', price: null,  note: '', par: 4 },
  { id: 'bf-cucum',  cat: '牛肉', brand: 'YGF', name: '大黄瓜条牛肉',          unit: 'CS', lb: null, basis: 'unit', price: null,  note: '', par: 2 },
  { id: 'bf-tendon', cat: '牛肉', brand: 'YGF', name: '牛筋',                unit: 'CS', lb: null, basis: 'unit', price: 92.4,  note: '', par: 3, q: '是否=v2牛腱筋' },
  { id: 'bf-bone',   cat: '牛肉', brand: 'YGF', name: '牛筒骨（切）',          unit: 'CS', lb: 58,   basis: 'lb', price: 0.78,  note: '切好的', par: 2 },
  { id: 'bf-honey',  cat: '牛肉', brand: 'YGF', name: '蜂窝牛肚（金钱肚）',    unit: 'CS', lb: null, basis: 'lb', price: 6.5,   note: '1LB装', par: 4, q: '箱规待补' },
  { id: 'bf-tripe',  cat: '牛肉', brand: 'YGF', name: '白牛肚丝（牛百叶丝）',  unit: 'CS', lb: null, basis: 'unit', price: 85,    note: '', par: 4 },
  { id: 'bf-aorta',  cat: '牛肉', brand: 'YGF', name: '牛黄喉',              unit: 'CS', lb: null, basis: 'unit', price: 155,   note: '', par: 2 },

  { id: 'ck-thigh',  cat: '鸡肉', brand: 'ALL', name: '去皮去骨鸡腿肉',        unit: 'CS', lb: 40,   basis: 'lb', price: 1.01,  note: '', par: 3, q: 'v2 $60–68/箱待核' },
  { id: 'ck-leg',    cat: '鸡肉', brand: 'BY',  name: '带皮带骨上腿肉',        unit: 'CS', lb: 40,   basis: 'lb', price: 0.6,   note: '', par: 1 },
  { id: 'ck-gizz',   cat: '鸡肉', brand: 'YGF', name: '鸡胗',                unit: 'CS', lb: null, basis: 'unit', price: null,  note: '', par: 2 },
  { id: 'ck-breast', cat: '鸡肉', brand: 'YGF', name: '带骨鸡胸 #40',         unit: 'CS', lb: null, basis: 'unit', price: 32,    note: '', par: 2 },
  { id: 'ck-bone',   cat: '鸡肉', brand: 'YGF', name: '鸡胸骨',              unit: 'CS', lb: null, basis: 'unit', price: 24,    note: '', par: 2 },

  { id: 'sf-basa',   cat: '海鲜', brand: 'BY',  name: '龙利鱼排（巴沙鱼）',    unit: 'CS', lb: 22,   basis: 'lb', price: 2.16,  note: '8OZ左右即可', par: 1 },
  { id: 'sf-eel',    cat: '海鲜', brand: 'BY',  name: '极上淡火烧鳗鱼（半成品）', unit: 'CS', lb: 22, basis: 'lb', price: 7.96,  note: '11OZ+', par: 1, q: 'v2 $263/箱待核' },
  { id: 'sf-squid',  cat: '海鲜', brand: 'ALL', name: '鱿鱼须',              unit: 'CS', lb: null, basis: 'unit', price: 95.52, note: '', par: 2 },
  { id: 'sf-shrimp', cat: '海鲜', brand: 'YGF', name: '去头带壳虾 31/35',      unit: 'CS', lb: null, basis: 'unit', price: 159.2, note: '', par: 1 },
  { id: 'sf-peeled', cat: '海鲜', brand: 'YGF', name: '去壳虾仁（有尾）',      unit: 'CS', lb: null, basis: 'unit', price: 52,    note: '', par: 4 },
  { id: 'sf-paste',  cat: '海鲜', brand: 'YGF', name: '虾滑',                unit: 'CS', lb: null, basis: 'unit', price: 250,   note: '', par: 2 },
  { id: 'sf-scallop', cat: '海鲜', brand: 'YGF', name: '小干贝',             unit: 'CS', lb: null, basis: 'unit', price: null,  note: '', par: 1 },
  { id: 'sf-frog24', cat: '海鲜', brand: 'YGF', name: '牛蛙腿 2/4',           unit: 'CS', lb: null, basis: 'unit', price: null,  note: '2/4', par: 1 },
  { id: 'sf-frog46', cat: '海鲜', brand: 'YGF', name: '牛蛙腿 4/6',           unit: 'CS', lb: null, basis: 'unit', price: null,  note: '4/6', par: 2 },

  { id: 'eg-quail',  cat: '丸类·蛋', brand: 'YGF', name: '鹌鹑蛋罐头',        unit: 'CS', lb: null, basis: 'unit', price: 47.5,  note: '', par: 3 },
  { id: 'bl-gong',   cat: '丸类·蛋', brand: 'YGF', name: '贡丸',              unit: 'CS', lb: null, basis: 'unit', price: null,  note: '', par: 2, q: '确认是否SJ供' },
];

export const SJ: VendorConfig = {
  id: 'sj',
  name: 'S.J. Distributors',
  shortName: 'SJ',
  minLb: 100,
  contact: 'Walter Z. (408) 520-9456',
  terms: '周一至周六可送 · 100 磅起送',
  cats: CATS,
  skus: SKUS,
};
