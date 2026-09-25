// src/app/menu/ygf/picksData.ts
// 店长推荐 —— 杨国福顾客的加点入口(饮品 + 小吃,均来自隔壁北苑南家,同一柜台)
//
// 关键设计:价格不在这里硬写,而是从北苑 menuData 实时算出来。
// 北苑改价或改配料价,这里自动跟着变,不会出现两处价格打架。
//
// 一条推荐 = 一个已经配好的完整订单(茶底/甜度/加料都定好),
// 顾客不用再做选择,把屏幕给店员看就能点。

import { allCategories, toppings, type MenuItem as ByItem } from '@/app/menu/beiyuan/menuData';

export interface Pick {
  key: string;
  /** 北苑单品 id —— 名称/图/基础价从北苑数据取 */
  ref?: string;
  /** 不在北苑单品表里的(如加点类),手填 */
  nameEn?: string;
  nameCn?: string;
  price?: number;
  img?: string;
  /** 不影响价格的选项,如茶底、甜度、辣度 */
  mods?: string[];
  /** 北苑配料 id —— 价格自动累加 */
  toppingIds?: string[];
  /** 其他加价(奶基底、大杯等),配 extraNote 说明 */
  extra?: number;
}

// 北苑单品查表(只取 type:'items' 的顶层单品,推荐项都在其中)
const BY_ITEMS = new Map<string, ByItem>();
for (const cat of allCategories) {
  for (const it of cat.items ?? []) BY_ITEMS.set(it.id, it);
}
const BY_TOPPINGS = new Map(toppings.map(t => [t.id, t]));

export interface ResolvedPick {
  key: string;
  nameEn: string;
  nameCn: string;
  img?: string;
  mods: string[];
  total: number;
  missing: boolean;   // 北苑数据里找不到该 id —— 开发期自检用
}

export function resolvePick(p: Pick): ResolvedPick {
  const base = p.ref ? BY_ITEMS.get(p.ref) : undefined;
  const tops = (p.toppingIds ?? [])
    .map(id => BY_TOPPINGS.get(id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const basePrice = p.price ?? base?.price ?? 0;
  const total = basePrice + tops.reduce((s, t) => s + t.price, 0) + (p.extra ?? 0);

  return {
    key: p.key,
    nameEn: p.nameEn ?? base?.nameEn ?? p.ref ?? '',
    nameCn: p.nameCn ?? base?.nameCn ?? '',
    img: p.img ?? base?.img,
    mods: [...(p.mods ?? []), ...tops.map(t => `${t.nameEn} ${t.nameCn}`)],
    total,
    missing: !!p.ref && !base,
  };
}

// ─── 8 款饮品 ─────────────────────────────────────────────
export const DRINK_PICKS: Pick[] = [
  { key: 'd1', ref: 'C-A-05', mods: ['Green Tea 绿茶', '50% Sugar 半糖'], toppingIds: ['T-23'] },
  { key: 'd2', ref: 'C-B-01', mods: ['Black Tea 红茶', '50% Sugar 半糖'], toppingIds: ['T-01'] },
  { key: 'd3', ref: 'C-B-05', mods: ['75% Sugar 七分糖'], toppingIds: ['T-02'] },
  { key: 'd4', ref: 'R-A-04', mods: ['50% Sugar 半糖'], toppingIds: ['T-15'] },
  { key: 'd5', ref: 'R-A-05', mods: ['House Milk Blend 招牌特调奶', '75% Sugar 七分糖'], extra: 0.5 },
  { key: 'd6', ref: 'R-A-01', mods: ['House Creamer 招牌奶香', '50% Sugar 半糖'], toppingIds: ['T-24'] },
  { key: 'd7', ref: 'R-A-06', mods: ['House Milk Blend 招牌特调奶', '50% Sugar 半糖'], toppingIds: ['T-06'], extra: 0.5 },
  { key: 'd8', ref: 'H-B-07', mods: ['Large 大杯', '75% Sugar 七分糖'], extra: 1.0 },
];

// ─── 6 款小吃 ─────────────────────────────────────────────
export const SNACK_PICKS: Pick[] = [
  { key: 's1', ref: 'S06', mods: ['Mild 微辣'] },
  // 夜市烤香肠(3条):POS 有、北苑单品表里没有(S13 已并入 S14),故手填
  { key: 's2', nameEn: 'Night Market Sausage (3 Sticks)', nameCn: '夜市烤香肠(3条)', price: 11.98 },
  { key: 's3', ref: 'S12' },
  { key: 's4', ref: 'S16', mods: ['Mild 微辣'] },
  // 蛋炒饭:属于「加点与套餐升级」,不是单品,故手填
  { key: 's5', nameEn: 'Fried Rice', nameCn: '蛋炒饭', price: 5.99, img: '/beiyuan-fried-rice.webp' },
  { key: 's6', ref: 'S09' },
];
