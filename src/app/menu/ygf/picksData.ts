// src/app/menu/ygf/picksData.ts
// 杨国福「探索页」的全部内容源。
//
// 四个入口各答一个问题:
//   Ma-Fans      今天有什么福利、还能点什么?
//   Our Broths   我该选什么汤?
//   Ingredients  有什么值得拿?
//   Sauce Bar    我这一碗怎么调得更好吃?
//
// ⚠️ 本文件里带 [草稿] 标记的文案均为待店内确认,上线前请逐条核对。
//    产品事实(工艺、时长、配料)绝不可由文案推测而来。

import { allCategories, toppings, type MenuItem as ByItem } from '@/app/menu/beiyuan/menuData';

/* ═══════════════════════════════════════════════════════════
   0. 一级入口 —— 环形扑克牌
   扫码落地看到的就是这四张牌在慢慢转。文案要勾人,不要"XX介绍"。
   ═══════════════════════════════════════════════════════════ */

export type EntryId = 'mafans' | 'broth' | 'items' | 'sauce';

export interface EntryCard {
  id: EntryId;
  /** 牌角标记 —— 像扑克牌左上右下那两个角 */
  mark: string;
  titleEn: string;
  titleCn: string;
  /** 勾子:给他一个点进去的理由,不是这页有什么 */
  hookEn: string;
  hookCn: string;
  img: string;
  /** 牌面主色 */
  color: string;
}

export const ENTRY_CARDS: EntryCard[] = [
  {
    id: 'mafans', mark: '🧧',
    titleEn: 'Ma-Fans', titleCn: '小福会员',
    hookEn: 'Popcorn chicken for $1.99',
    hookCn: '$1.99 盐酥鸡,会员专享',
    img: '/beiyuan-S06.webp', color: '#B91C1C',
  },
  {
    id: 'broth', mark: '🍲',
    titleEn: 'Our Broths', titleCn: '汤底 · 一碗的灵魂',
    hookEn: 'Why the broth is worth the extra',
    hookCn: '五款汤底,凭什么值得多花钱',
    img: '/ygf-broth-spicy.webp', color: '#8B1A1A',
  },
  {
    id: 'items', mark: '🥬',
    titleEn: 'Ingredients', titleCn: '食材 · 今天吃什么',
    hookEn: '100+ at the bar. These few are worth it.',
    hookCn: '台上一百多种,这几样别错过',
    img: '/ygf-meat-beef-brisket.webp', color: '#0F766E',
  },
  {
    id: 'sauce', mark: '🥣',
    titleEn: 'Sauce Bar', titleCn: '调料 · 调出你的味道',
    hookEn: 'Free and unlimited. Here is how to mix it.',
    hookCn: '免费不限量,照着这个调',
    img: '/ygf-sauce-sesame-peanut-v2.webp', color: '#C8912A',
  },
];

/* ═══════════════════════════════════════════════════════════
   1. Ma-Fans —— 当季活动 / 会员权益
   换季只改这一段:万圣节、冬季热饮、春节,一级菜单永远不动
   ═══════════════════════════════════════════════════════════ */

export interface Campaign {
  /** false = 活动区整块不出现,页面自动从入会卡开始 */
  active: boolean;
  seasonEn: string;   // BACK TO SCHOOL —— 活动大标题
  seasonCn: string;   // 开学季福利
  nameEn: string;     // Popcorn Chicken —— 具体福利
  nameCn: string;
  price: number;
  wasPrice?: number;
  img?: string;       // 单品方图;海报本体放频道,App 里用干净产品图
  /** 领取规则 —— 按柜台真正能执行的口径写 */
  rulesEn: string[];
  rulesCn: string[];
}

export const CAMPAIGN: Campaign = {
  active: true,
  seasonEn: 'BACK TO SCHOOL',
  seasonCn: '开学季福利',
  nameEn: 'Popcorn Chicken',
  nameCn: '盐酥鸡',
  price: 1.99,
  wasPrice: 10.49,
  img: '/beiyuan-S06.webp',
  // 频道匿名,无法核对"会员身份",只能核对"当场打开频道"
  rulesEn: ['Show the channel at the counter', 'Limit 1 per order', 'Dine-in only'],
  rulesCn: ['到柜台出示已关注的频道', '每单限一份', '仅限堂食'],
};

/** 关注频道能拿到什么 —— 转化的理由,不是客套话。保持三条以内 */
export const MEMBER_PERKS: { emoji: string; en: string; cn: string }[] = [
  { emoji: '🧧', en: 'Member-only prices', cn: '专属价,只在频道发' },
  { emoji: '🆕', en: 'First to know',      cn: '新品限时,先看到' },
  { emoji: '🤫', en: 'Secret sauce mixes', cn: '隐藏调料配方' },
];

/* ═══════════════════════════════════════════════════════════
   2. 加点推荐 —— 饮品 / 小吃(均来自隔壁北苑南家,同一柜台)
   价格不硬写,从北苑 menuData 实时算;北苑改价这里自动跟着变
   ═══════════════════════════════════════════════════════════ */

export interface Pick {
  key: string;
  /** 北苑单品 id —— 名称 / 图 / 基础价从北苑数据取 */
  ref?: string;
  /** 不在北苑单品表里的(如加点类),手填 */
  nameEn?: string;
  nameCn?: string;
  price?: number;
  img?: string;
  /** 不影响价格的选项:茶底、甜度、辣度 */
  mods?: string[];
  /** 北苑配料 id —— 价格自动累加 */
  toppingIds?: string[];
  /** 其他加价:奶基底、大杯等 */
  extra?: number;
  /** 什么味道 —— [草稿] 待确认 */
  tasteEn?: string;
  tasteCn?: string;
  /** 为什么配麻辣烫 —— [草稿] 待确认 */
  pairEn?: string;
  pairCn?: string;
}

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
  tasteEn?: string; tasteCn?: string;
  pairEn?: string;  pairCn?: string;
  missing: boolean;
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
    tasteEn: p.tasteEn, tasteCn: p.tasteCn,
    pairEn: p.pairEn,   pairCn: p.pairCn,
    missing: !!p.ref && !base,
  };
}

// ─── 饮品 8 款 ────────────────────────────────────────────
// 前 3 款已填 [草稿] 口味/搭配文案,用于定版式;其余待补
export const DRINK_PICKS: Pick[] = [
  { key: 'd1', ref: 'C-A-05', mods: ['Green Tea 绿茶', '50% Sugar 半糖'], toppingIds: ['T-23'],
    tasteEn: 'Light and floral, honey up front, tea kept in the background.',
    tasteCn: '清甜带花香,茶味不抢戏。',
    pairEn: 'The easiest way to cool down a málà bowl.',
    pairCn: '解辣最顺口的一杯,微辣以上推荐。' },
  { key: 'd2', ref: 'C-B-01', mods: ['Black Tea 红茶', '50% Sugar 半糖'], toppingIds: ['T-01'],
    tasteEn: 'The classic — full black tea, creamy, chewy boba.',
    tasteCn: '最经典的一杯,红茶厚、奶香足、珍珠有嚼劲。',
    pairEn: 'Milk rounds off the heat; safe pick for a first visit.',
    pairCn: '奶感压辣,第一次来点这杯不会错。' },
  { key: 'd3', ref: 'C-B-05', mods: ['75% Sugar 七分糖'], toppingIds: ['T-02'],
    tasteEn: 'Bold and aromatic Thai tea with soft egg pudding.',
    tasteCn: '泰式茶香浓,配滑嫩鸡蛋布丁。',
    pairEn: 'Stands up to the spiciest bowl without getting lost.',
    pairCn: '味道够厚,大辣也压得住。' },
  { key: 'd4', ref: 'R-A-04', mods: ['50% Sugar 半糖'], toppingIds: ['T-15'] },
  { key: 'd5', ref: 'R-A-05', mods: ['House Milk Blend 招牌特调奶', '75% Sugar 七分糖'], extra: 0.5 },
  { key: 'd6', ref: 'R-A-01', mods: ['House Creamer 招牌奶香', '50% Sugar 半糖'], toppingIds: ['T-24'] },
  { key: 'd7', ref: 'R-A-06', mods: ['House Milk Blend 招牌特调奶', '50% Sugar 半糖'], toppingIds: ['T-06'], extra: 0.5 },
  { key: 'd8', ref: 'H-B-07', mods: ['Large 大杯', '75% Sugar 七分糖'], extra: 1.0 },
];

// ─── 小吃 6 款 ────────────────────────────────────────────
export const SNACK_PICKS: Pick[] = [
  { key: 's1', ref: 'S06', mods: ['Mild 微辣'],
    tasteEn: 'Craggy, crunchy, tossed with pepper-salt and fried basil.',
    tasteCn: '外脆里嫩,椒盐加九层塔。',
    pairEn: 'Crunch against soup — the pairing everyone orders twice.',
    pairCn: '一口酥一口汤,点过的人基本都会再点。' },
  { key: 's2', nameEn: 'Night Market Sausage (3 Sticks)', nameCn: '夜市烤香肠(3条)', price: 11.98,
    tasteEn: 'Sweet-savory Taiwanese sausage, grilled until the skin snaps.',
    tasteCn: '台式香肠,微甜,烤到脆皮。' },
  { key: 's3', ref: 'S12' },
  { key: 's4', ref: 'S16', mods: ['Mild 微辣'] },
  { key: 's5', nameEn: 'Fried Rice', nameCn: '蛋炒饭', price: 5.99, img: '/beiyuan-fried-rice.webp' },
  { key: 's6', ref: 'S09' },
];

// ─── 新品 / 限时 —— 空时该区块不出现 ──────────────────────
export interface NewArrival {
  key: string; nameEn: string; nameCn: string;
  img?: string; blurbEn?: string; blurbCn?: string; tag?: string;
}
export const NEW_ARRIVALS: NewArrival[] = [];

/* ═══════════════════════════════════════════════════════════
   3. Ingredients —— 食材 · 今天吃什么
   只讲值得讲的。100 多种还常换,做全目录维护不住也没人看。
   ═══════════════════════════════════════════════════════════ */

export type SpotlightTier = 'new' | 'favorite' | 'try';

export interface Spotlight {
  key: string;
  tier: SpotlightTier;
  /** 对应 ygf menuData 里的 item id,用于取图 */
  itemId?: string;
  nameEn: string;
  nameCn: string;
  img?: string;
  /** 这是什么 */
  whatEn?: string; whatCn?: string;
  /** 什么口感 */
  textureEn?: string; textureCn?: string;
  /** 怎么煮最好吃 —— 只有店里知道,待补 */
  cookEn?: string; cookCn?: string;
  /** 配什么汤底 —— 只有店里知道,待补 */
  brothEn?: string; brothCn?: string;
}

export const TIER_META: Record<SpotlightTier, { en: string; cn: string; emoji: string; color: string }> = {
  new:      { en: 'NEW',            cn: '新品',     emoji: '🆕', color: '#B91C1C' },
  favorite: { en: 'YGF FAVORITES',  cn: '招牌推荐', emoji: '⭐', color: '#C8912A' },
  try:      { en: 'TRY THIS',       cn: '值得试试', emoji: '👀', color: '#0F766E' },
};

// 每档先放 2 款真实样品,用于定版式;内容待店内确认后批量补
export const SPOTLIGHTS: Spotlight[] = [
  { key: 'sp1', tier: 'new', itemId: 'fish-roe-lucky-bag',
    nameEn: 'Fish Roe Lucky Bag', nameCn: '鱼籽福袋',
    whatEn: 'A tofu-skin pouch tied shut over a fish-roe filling.',
    whatCn: '豆皮扎口,里面包着鱼籽馅。' },
  { key: 'sp2', tier: 'new', itemId: 'cheese-fish-tofu',
    nameEn: 'Cheese Fish Tofu', nameCn: '芝士鱼豆腐',
    whatEn: 'Fish tofu with a cheese centre that melts in the broth.',
    whatCn: '鱼豆腐夹芝士,在汤里会化开。' },

  { key: 'sp3', tier: 'favorite', itemId: 'beef-brisket',
    nameEn: 'Fatty Beef Slices', nameCn: '牛五花',
    whatEn: 'Thin-cut beef with even marbling.',
    whatCn: '薄切牛五花,肥瘦相间。' },
  { key: 'sp4', tier: 'favorite', itemId: 'shrimp-paste',
    nameEn: 'Handmade Shrimp Paste', nameCn: '手工虾滑',
    whatEn: 'Shrimp minced and folded by hand, spooned straight into the bowl.',
    whatCn: '整虾手打成滑,现舀现下。' },

  { key: 'sp5', tier: 'try', itemId: 'beef-aorta',
    nameEn: 'Beef Aorta', nameCn: '黄喉',
    whatEn: 'Not a throat despite the name — it is the aorta, prized for its snap.',
    whatCn: '名字叫喉,其实是主动脉,吃的就是那口脆。' },
  { key: 'sp6', tier: 'try', itemId: 'konjac-knots',
    nameEn: 'Konjac Knots', nameCn: '魔芋结',
    whatEn: 'Plant-based, almost no calories, soaks up whatever broth it sits in.',
    whatCn: '植物做的,几乎没有热量,特别吸汤。' },
];

/* ═══════════════════════════════════════════════════════════
   4. Sauce Bar —— 调料 · 调出你的味道
   配方在前,认识调料在后,Secret Mixes 指向频道
   ═══════════════════════════════════════════════════════════ */

export interface SauceRecipe {
  key: string;
  emoji: string;
  nameEn: string;
  nameCn: string;
  /** 一句话:这碗调出来是什么味 */
  noteEn?: string;
  noteCn?: string;
  /** 配方,按加的顺序写 */
  steps: { cn: string; en: string; amount?: string }[];
  /** 高亮色 */
  color: string;
}

// ⚠️ [草稿] 以下配方为版式占位,比例与用料待店内确认后替换
export const SAUCE_RECIPES: SauceRecipe[] = [
  {
    key: 'nutty', emoji: '🥜', color: '#B07A2B',
    nameEn: 'Creamy & Nutty', nameCn: '浓香麻酱',
    noteEn: 'Thick, mellow, tames the heat.',
    noteCn: '厚、香、压辣,不会盖住汤味。',
    steps: [
      { cn: '芝麻酱', en: 'Sesame paste', amount: '2 勺' },
      { cn: '蒜泥',   en: 'Minced garlic', amount: '1 勺' },
      { cn: '香油',   en: 'Sesame oil', amount: '少许' },
      { cn: '熟芝麻', en: 'Toasted sesame', amount: '撒面' },
    ],
  },
  {
    key: 'tangy', emoji: '🌶️', color: '#B91C1C',
    nameEn: 'Spicy & Tangy', nameCn: '酸辣开胃',
    noteEn: 'Sharp and bright — cuts through a rich bowl.',
    noteCn: '酸香冲,越吃越开胃。',
    steps: [
      { cn: '陈醋',   en: 'Aged black vinegar', amount: '2 勺' },
      { cn: '辣椒油', en: 'Chili oil', amount: '1 勺' },
      { cn: '小米辣', en: "Bird's eye chili", amount: '看辣度' },
      { cn: '香菜',   en: 'Cilantro', amount: '适量' },
    ],
  },
  {
    key: 'house', emoji: '🔥', color: '#C8912A',
    nameEn: 'YGF House Mix', nameCn: '小福推荐',
    noteEn: "The one we make for ourselves.",
    noteCn: '我们自己吃的那一碗。',
    steps: [
      { cn: '芝麻酱', en: 'Sesame paste', amount: '1 勺' },
      { cn: '腐乳酱', en: 'Fermented tofu sauce', amount: '半勺' },
      { cn: '蚝油',   en: 'Oyster sauce', amount: '半勺' },
      { cn: '蒜泥',   en: 'Minced garlic', amount: '1 勺' },
      { cn: '葱花',   en: 'Scallions', amount: '撒面' },
    ],
  },
];

/** 认识一下 —— 中国顾客熟、美国顾客未必认识的几样 */
export interface SauceNote {
  key: string; nameEn: string; nameCn: string;
  descEn: string; descCn: string; img?: string;
}
export const SAUCE_NOTES: SauceNote[] = [
  { key: 'sesame', nameEn: 'Sesame Paste', nameCn: '芝麻酱',
    descEn: 'Ground toasted sesame — thick, nutty, the backbone of most northern-style bowls.',
    descCn: '炒香的芝麻磨成酱,北方吃法的底子,负责"厚"。' },
  { key: 'chive', nameEn: 'Chive Flower Paste', nameCn: '韭菜花酱',
    descEn: 'Fermented chive blossom. Salty, funky, a little goes a long way.',
    descCn: '韭菜花发酵做的,咸鲜带劲,一点点就够。' },
  { key: 'vinegar', nameEn: 'Aged Black Vinegar', nameCn: '陈醋',
    descEn: 'Mellower and rounder than white vinegar — adds lift without sharp acidity.',
    descCn: '比白醋柔,提味不刺口。' },
];

/** Secret Mixes —— 本身不在 App 里公布,指向频道 */
export const SECRET_MIX = {
  titleEn: "This week's secret mix",
  titleCn: '本周隐藏配方',
  bodyEn: 'One mix we only share with Ma-Fans. Changes every week.',
  bodyCn: '每周一个,只在频道里发。',
};
