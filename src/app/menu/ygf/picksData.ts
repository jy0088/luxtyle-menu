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
  /** 牌面 —— 不配图,靠配色立起来 */
  grad: string;
  edge: string;
}

export const ENTRY_CARDS: EntryCard[] = [
  {
    id: 'mafans', mark: '🧧',
    titleEn: 'Ma-Fans', titleCn: '小福会员',
    hookEn: 'Popcorn chicken for $1.99',
    hookCn: '$1.99 盐酥鸡,会员专享',
    grad: 'linear-gradient(158deg,#C4181A 0%,#8A0F12 46%,#4A0709 100%)',
    edge: '#F2C14E',
  },
  {
    id: 'broth', mark: '🍲',
    titleEn: 'Our Broths', titleCn: '汤底 · 一碗的灵魂',
    hookEn: 'Why the broth is worth the extra',
    hookCn: '五款汤底,凭什么值得多花钱',
    grad: 'linear-gradient(158deg,#E08A1E 0%,#A8480C 44%,#4E1B05 100%)',
    edge: '#FFD98A',
  },
  {
    id: 'items', mark: '🥬',
    titleEn: 'Ingredients', titleCn: '食材 · 今天吃什么',
    hookEn: '100+ at the bar. These few are worth it.',
    hookCn: '台上一百多种,这几样别错过',
    grad: 'linear-gradient(158deg,#1C8F7A 0%,#0E5A4C 46%,#04241F 100%)',
    edge: '#8FE3CE',
  },
  {
    id: 'sauce', mark: '🥣',
    titleEn: 'Sauce Bar', titleCn: '调料 · 调出你的味道',
    hookEn: 'Free and unlimited. Here is how to mix it.',
    hookCn: '免费不限量,照着这个调',
    grad: 'linear-gradient(158deg,#5E4B2E 0%,#3A2C18 48%,#181008 100%)',
    edge: '#E7C87A',
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
  /** 这杯/这份的来历 —— 店长推荐舞台详情里的 STORY 段 */
  storyEn?: string;
  storyCn?: string;
  /** PAIR IT 点名的配料 —— 舞台上会有一个配料 chip 滑到杯子旁边;文案没点名配料就不填 */
  pairItem?: PairItem;
  /** 舞台卡片与详情背景的主色 */
  tint?: { accent: string; deep: string };
}

export type PairGlyph = 'aloe' | 'milk' | 'cream';
export interface PairItem { en: string; cn: string; glyph: PairGlyph }

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
  storyEn?: string; storyCn?: string;
  pairItem?: PairItem;
  tint?: { accent: string; deep: string };
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
    storyEn: p.storyEn, storyCn: p.storyCn,
    pairItem: p.pairItem, tint: p.tint,
    missing: !!p.ref && !base,
  };
}

// ─── 饮品 8 款 ────────────────────────────────────────────
// 前 3 款已填 [草稿] 口味/搭配文案,用于定版式;其余待补
// STORY / TASTE / PAIR IT for d4–d8 and s2–s6: copy supplied by Kevin on 2026-09-26 ("YGF Explore ·
// Drinks & Snacks Copy"), including the product facts in it (real osmanthus / white peach flesh /
// chrysanthemum / coconut flesh, house-made sausage, calamari prepared in store). Only change made:
// d6's English PAIR IT names "house creamer" to match the preset (see the note on d6).
export const DRINK_PICKS: Pick[] = [
  { key: 'd1', ref: 'C-A-05', tint: { accent: '#D9A441', deep: '#46300B' }, mods: ['Green Tea 绿茶', '50% Sugar 半糖'], toppingIds: ['T-23'],
    tasteEn: 'Light and floral, honey up front, tea kept in the background.',
    tasteCn: '清甜带花香,茶味不抢戏。',
    pairEn: 'The easiest way to cool down a málà bowl.',
    pairCn: '解辣最顺口的一杯,微辣以上推荐。' },
  { key: 'd2', ref: 'C-B-01', tint: { accent: '#B8835A', deep: '#3A2414' }, mods: ['Black Tea 红茶', '50% Sugar 半糖'], toppingIds: ['T-01'],
    tasteEn: 'The classic — full black tea, creamy, chewy boba.',
    tasteCn: '最经典的一杯,红茶厚、奶香足、珍珠有嚼劲。',
    pairEn: 'Milk rounds off the heat; safe pick for a first visit.',
    pairCn: '奶感压辣,第一次来点这杯不会错。' },
  { key: 'd3', ref: 'C-B-05', tint: { accent: '#E07B39', deep: '#45200C' }, mods: ['75% Sugar 七分糖'], toppingIds: ['T-02'],
    tasteEn: 'Bold and aromatic Thai tea with soft egg pudding.',
    tasteCn: '泰式茶香浓,配滑嫩鸡蛋布丁。',
    pairEn: 'Stands up to the spiciest bowl without getting lost.',
    pairCn: '味道够厚,大辣也压得住。' },
  { key: 'd4', ref: 'R-A-04', mods: ['50% Sugar 半糖'], toppingIds: ['T-15'],
    tint: { accent: '#D9A441', deep: '#4A330C' },
    storyEn: 'Real osmanthus meets oolong, letting the floral aroma settle naturally into the tea.',
    storyCn: '桂花与乌龙同制，让真实花香慢慢融进茶里。',
    tasteEn: 'Smooth oolong, gentle sweetness, and a lingering osmanthus finish.',
    tasteCn: '乌龙醇香回甘，桂花清甜，花香悠长。',
    pairEn: 'Add aloe for a crisp, juicy bite that refreshes after spicy food.',
    pairCn: '加芦荟果肉，清脆爽口，吃辣后格外清爽。',
    pairItem: { en: 'Aloe', cn: '芦荟', glyph: 'aloe' } },
  { key: 'd5', ref: 'R-A-05', mods: ['House Milk Blend 招牌特调奶', '75% Sugar 七分糖'], extra: 0.5,
    tint: { accent: '#EE9F88', deep: '#552723' },
    storyEn: 'Real white peach flesh meets oolong, lifted with just a touch of chrysanthemum.',
    storyCn: '白桃果肉入乌龙，再借一缕菊香提亮茶韵。',
    tasteEn: 'Fresh peach sweetness, smooth tea, and a light floral finish.',
    tasteCn: '桃香鲜甜，乌龙回甘，尾段带淡淡菊香。',
    pairEn: 'Our signature milk softens the tea and rounds out the heat.',
    pairCn: '配招牌特调奶，柔和茶感，也更衬麻辣。',
    pairItem: { en: 'House Milk Blend', cn: '招牌特调奶', glyph: 'milk' } },
  { key: 'd6', ref: 'R-A-01', mods: ['House Creamer 招牌奶香', '50% Sugar 半糖'], toppingIds: ['T-24'],
    tint: { accent: '#C8763A', deep: '#3B1C0B' },
    storyEn: 'A roasted rock oolong made for people who want to taste the tea itself.',
    storyCn: '岩茶重焙火，大红袍喝的就是茶香本身。',
    tasteEn: 'Bold roast, full body, and a warm, lingering finish.',
    tasteCn: '焙火香明显，茶汤厚实，回甘温润悠长。',
    // Kevin's draft said "signature milk"; this drink is set with House Creamer, so the English names that instead
    pairEn: 'Add our house creamer—the tea stays bold even beside rich, spicy broth.',
    pairCn: '配招牌奶香，茶味依旧站得住，搭浓辣也不弱。',
    pairItem: { en: 'House Creamer', cn: '招牌奶香', glyph: 'cream' } },
  { key: 'd7', ref: 'R-A-06', mods: ['House Milk Blend 招牌特调奶', '50% Sugar 半糖'], toppingIds: ['T-06'], extra: 0.5,
    tint: { accent: '#CDB48C', deep: '#3A2F22' },
    storyEn: 'Real coconut flesh is blended with oolong for a naturally soft coconut aroma.',
    storyCn: '真椰肉与乌龙同制，让椰香自然融进茶里。',
    tasteEn: 'Smooth oolong, mellow coconut, clean and gently sweet.',
    tasteCn: '乌龙回甘，椰香柔和，清甜却不腻。',
    pairEn: 'Signature milk makes it silkier and especially easy with spicy food.',
    pairCn: '配招牌特调奶，更柔顺醇厚，也更适合麻辣。',
    pairItem: { en: 'House Milk Blend', cn: '招牌特调奶', glyph: 'milk' } },
  { key: 'd8', ref: 'H-B-07', mods: ['Large 大杯', '75% Sugar 七分糖'], extra: 1.0,
    tint: { accent: '#8FAE5E', deep: '#22321A' },
    storyEn: 'Pure matcha powder. Nothing needed to hide the tea.',
    storyCn: '纯抹茶粉现调，喝的就是抹茶本身。',
    tasteEn: 'Fresh, earthy and gently bitter, followed by a clean sweetness.',
    tasteCn: '入口鲜醇微苦，随后回甘，茶感干净。',
    pairEn: 'Warm matcha gives your palate a softer break between spicy bites.',
    pairCn: '热抹茶穿插麻辣之间，让味觉节奏更柔和。' },
];

// ─── 小吃 6 款 ────────────────────────────────────────────
export const SNACK_PICKS: Pick[] = [
  { key: 's1', ref: 'S06', mods: ['Mild 微辣'],
    tasteEn: 'Craggy, crunchy, tossed with pepper-salt and fried basil.',
    tasteCn: '外脆里嫩,椒盐加九层塔。',
    pairEn: 'Crunch against soup — the pairing everyone orders twice.',
    pairCn: '一口酥一口汤,点过的人基本都会再点。' },
  { key: 's2', nameEn: 'Night Market Sausage (3 Sticks)', nameCn: '夜市烤香肠(3条)', price: 11.98,
    storyEn: 'House-made sausage inspired by the sweet-savory flavors of Taiwan’s night markets.',
    storyCn: '把台湾夜市那口甜香，做进自制手工香肠里。',
    tasteEn: 'Lightly charred outside, juicy inside, with a sweet savory finish.',
    tasteCn: '外皮微焦，肉香带甜，越嚼越香。',
    pairEn: 'Sweet meets spicy—a natural contrast beside malatang.',
    pairCn: '一甜一辣，配麻辣烫层次特别明显。' },
  { key: 's3', ref: 'S12',
    storyEn: 'A soft Taiwanese-style scallion pancake where the scallion aroma leads.',
    storyCn: '台式葱油饼，葱香才是主角。',
    tasteEn: 'Soft, chewy and savory—not the thin, crispy kind.',
    tasteCn: '柔软带韧，咸香十足，不走酥脆路线。',
    pairEn: 'Its soft, savory bite works especially well with rich broth and spice.',
    pairCn: '柔软葱香，刚好接住浓汤和辣味。' },
  { key: 's4', ref: 'S16', mods: ['Mild 微辣'],
    storyEn: 'House-prepared and fried for a crisp shell with a springy bite inside.',
    storyCn: '店内自制现炸，外酥里嫩，保留鱿鱼弹牙口感。',
    tasteEn: 'Crispy outside, tender and bouncy inside, finished with fragrant salt and pepper.',
    tasteCn: '外酥里嫩，弹牙鲜香，椒盐味十足。',
    pairEn: 'Add chili salt & pepper for an extra kick beside malatang.',
    pairCn: '推荐加辣椒椒盐，配麻辣烫更带劲。' },
  { key: 's5', nameEn: 'Fried Rice', nameCn: '蛋炒饭', price: 5.99, img: '/beiyuan-fried-rice.webp',
    storyEn: 'High-heat wok frying brings out the aroma before the first bite.',
    storyCn: '大火快炒，锅气先到。',
    tasteEn: 'Eggy, savory and balanced, with rice cooked to a comfortable bite.',
    tasteCn: '蛋香明显，咸香顺口，米饭软硬适中。',
    pairEn: 'A mellow, savory break between rich and spicy bites.',
    pairCn: '穿插麻辣之间，刚好把浓辣味道稳下来。' },
  { key: 's6', ref: 'S09',
    storyEn: 'Real octopus pieces in every bite, finished with sauce and bonito flakes.',
    storyCn: '每一口都有章鱼颗粒，再铺浓酱和柴鱼片。',
    tasteEn: 'Soft, savory and rich, with plenty of umami from sauce and bonito.',
    tasteCn: '软香咸鲜，浓酱与柴鱼片香气很足。',
    pairEn: 'Rich umami and spicy broth take turns keeping every bite interesting.',
    pairCn: '浓香与麻辣交替，吃起来更有层次。' },
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

/** 食材二级(Kevin 2026-09-26):新品上架 / 特色招牌 / 推荐搭配,三个固定显示;
    某一档还没内容时显示「店长正在配」而不是隐藏(Kevin 要求三个都在)。 */
export type SpotlightTier = 'new' | 'signature' | 'pair';
export const SPOTLIGHT_TIERS: SpotlightTier[] = ['new', 'signature', 'pair'];

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
  new:       { en: 'NEW ARRIVALS',          cn: '新品上架', emoji: '🆕', color: '#B91C1C' },
  signature: { en: 'HOUSE SIGNATURES',      cn: '特色招牌', emoji: '⭐', color: '#C8912A' },
  pair:      { en: 'RECOMMENDED PAIRINGS',  cn: '推荐搭配', emoji: '🥢', color: '#0F766E' },
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

  { key: 'sp3', tier: 'signature', itemId: 'beef-brisket',
    nameEn: 'Fatty Beef Slices', nameCn: '牛五花',
    whatEn: 'Thin-cut beef with even marbling.',
    whatCn: '薄切牛五花,肥瘦相间。' },
  { key: 'sp4', tier: 'signature', itemId: 'shrimp-paste',
    nameEn: 'Handmade Shrimp Paste', nameCn: '手工虾滑',
    whatEn: 'Shrimp minced and folded by hand, spooned straight into the bowl.',
    whatCn: '整虾手打成滑,现舀现下。' },

  { key: 'sp5', tier: 'signature', itemId: 'beef-aorta',
    nameEn: 'Beef Aorta', nameCn: '黄喉',
    whatEn: 'Not a throat despite the name — it is the aorta, prized for its snap.',
    whatCn: '名字叫喉,其实是主动脉,吃的就是那口脆。' },
  { key: 'sp6', tier: 'signature', itemId: 'konjac-knots',
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

/* ═══════════════════════════════════════════════════════════
   5. 二级横幅 —— 点开在同页展开,不跳页
   一级名字锁定;二级三级命名见 NAMING.md
   ═══════════════════════════════════════════════════════════ */

export interface Banner {
  key: string;
  emoji: string;
  titleEn: string;
  titleCn: string;
  /** 收起时那一行:告诉他里面有什么,一句话 */
  hookCn: string;
  grad: string;
  edge: string;
}

// Ma-Fans —— 顺序按确认:店长推荐 → 当季活动 → 会员福利
export const MAFANS_BANNERS: Banner[] = [
  { key: 'picks',    emoji: '🧋', titleEn: "Manager's Picks", titleCn: '店长推荐',
    hookCn: '饮品 8 款 · 小吃 6 款,甜度加料都配好了',
    grad: 'linear-gradient(120deg,#C8912A,#8A5E12)', edge: '#F5D98A' },
  { key: 'campaign', emoji: '🧧', titleEn: 'This Season',     titleCn: '当季活动',
    hookCn: '开学季 · $1.99 盐酥鸡',
    grad: 'linear-gradient(120deg,#C4181A,#6E0B0D)', edge: '#F2C14E' },
  { key: 'perks',    emoji: '⭐', titleEn: 'Member Perks',    titleCn: '会员福利',
    hookCn: '免费加入,三样只在频道给',
    grad: 'linear-gradient(120deg,#1FA855,#0E6B34)', edge: '#8FE3B4' },
  { key: 'new',      emoji: '🆕', titleEn: 'New & Limited',   titleCn: '新品 · 限时',
    hookCn: '这一档现在是空的,有新品才出现',
    grad: 'linear-gradient(120deg,#0F766E,#064E45)', edge: '#8FE3CE' },
];

// Ingredients —— 三档;色值跟 TIER_META 对齐
export const ITEM_BANNERS: Record<SpotlightTier, { hookCn: string; grad: string; edge: string }> = {
  new:       { hookCn: '刚上台的几样',   grad: 'linear-gradient(120deg,#B91C1C,#6E0B0D)', edge: '#F2A9A9' },
  pair:      { hookCn: '这几样放一碗',   grad: 'linear-gradient(120deg,#0F766E,#064E45)', edge: '#8FE3CE' },
  signature: { hookCn: '回头客拿得最多的', grad: 'linear-gradient(120deg,#C8912A,#8A5E12)', edge: '#F5D98A' },
};

/* 汤底横幅配色 —— 中国传统色,按口味取色(Kevin 2026-09-26)。
   只管 Explore 页的横幅;menuData 里的 color 仍给汤底详情页用。 */
export const BROTH_SKIN: Record<string, { en: string; cn: string; grad: string; edge: string; c: string; d: string }> = {
  spicy:  { cn: '胭脂', en: 'Rouge',     grad: 'linear-gradient(120deg,#B8323A,#5E1119)', edge: '#E7A1A6', c: '#B8323A', d: '#5E1119' },  // 麻辣骨汤:深红
  tomato: { cn: '橘红', en: 'Tangerine', grad: 'linear-gradient(120deg,#E8692A,#9C3413)', edge: '#FFC39C', c: '#E8692A', d: '#9C3413' },  // 酸甜番茄:橙红
  tomyum: { cn: '竹青', en: 'Bamboo',    grad: 'linear-gradient(120deg,#7A9650,#34502A)', edge: '#C9DDA8', c: '#7A9650', d: '#34502A' },  // 冬阴功:香茅青柠
  drymix: { cn: '赭石', en: 'Ochre',     grad: 'linear-gradient(120deg,#946538,#472A16)', edge: '#DDBF97', c: '#946538', d: '#472A16' },  // 石磨麻辣拌:芝麻焙香
  clear:  { cn: '石青', en: 'Azurite',   grad: 'linear-gradient(120deg,#2A86A6,#1B4458)', edge: '#A6D6E6', c: '#2A86A6', d: '#1B4458' },  // 清汤:清透
};

// Sauce Bar
export const SAUCE_BANNERS: Banner[] = [
  { key: 'recipes', emoji: '🥣', titleEn: 'Mix Recipes',      titleCn: '照着调',
    hookCn: '三个配方,照着放就行',
    grad: 'linear-gradient(120deg,#B07A2B,#6B4412)', edge: '#E7C87A' },
  { key: 'know',    emoji: '🫙', titleEn: 'Know Your Sauces', titleCn: '认识调料',
    hookCn: '芝麻酱、韭菜花、陈醋分别管什么',
    grad: 'linear-gradient(120deg,#6B5B4E,#3A2C18)', edge: '#D8C6A8' },
  { key: 'all',     emoji: '📋', titleEn: 'All Sauces',       titleCn: '全部调料',
    hookCn: '调料台上全部有什么',
    grad: 'linear-gradient(120deg,#5E4B2E,#2A1F10)', edge: '#C8A878' },
  { key: 'secret',  emoji: '🤫', titleEn: 'Secret Mixes',     titleCn: '隐藏配方',
    hookCn: '每周一个,只在频道里发',
    grad: 'linear-gradient(120deg,#241A14,#0B0705)', edge: '#C8912A' },
];

/** 各页顶部那两行:进来先说清这页干什么用 */
export const SECTION_INTRO: Record<EntryId, { en: string; cn: string }> = {
  mafans: { en: 'Add-ons picked by the manager, plus what members get.',
            cn: '店长替你配好的加点,和会员能拿到的福利。' },
  broth:  { en: 'Five broths. Tap one to see what goes into it.',
            cn: '五款汤底,点开看这一锅是怎么来的。' },
  items:  { en: 'Over 100 items at the bar — these are worth a closer look.',
            cn: '台上一百多种,这几样值得看一眼。' },
  sauce:  { en: 'The sauce bar is free and unlimited. Start with one of these.',
            cn: '调料台免费、不限量。不知道怎么调,照着下面来。' },
};

/* ═══════════════════════════════════════════════════════════
   6. 汤底故事 —— Kevin 2026-09-28 提供的五款汤底介绍,按手机阅读精简。
   只保留原文里的事实,没有新增任何原料 / 工艺说法。页面按「熬汤工序」逐步展开。
   ═══════════════════════════════════════════════════════════ */

type Bi = { en: string; cn: string };
export interface BrothStep {
  label: Bi;                    // STORY / CRAFT / … 段落名
  en: string; cn: string;
  /** 一个会从 0 跳到目标值的数字(如 17 种草本) */
  stat?: { n: number; unit: Bi };
  /** 依次弹出的配料小标签 */
  chips?: Bi[];
}
export interface BrothStory {
  kicker: Bi;                   // 一句话立住这款汤
  steps: BrothStep[];
  checkTitle: Bi;               // 怎么判断一锅好汤
  checks: Bi[];                 // 三条标准,前面的勾一笔画出
}

const L = {
  story:   { en: 'STORY', cn: '故事' },
  craft:   { en: 'CRAFT', cn: '工序' },
  why:     { en: 'WHY IT WORKS', cn: '为什么好喝' },
  balance: { en: 'BALANCE', cn: '平衡' },
  herbs:   { en: 'HERBAL LAYER', cn: '草本' },
  final:   { en: 'THE FINAL STEP', cn: '收尾' },
};
const GOOD_BROTH = { en: 'How to tell a good broth', cn: '怎么判断一锅好汤' };

export const BROTH_STORY: Record<string, BrothStory> = {
  spicy: {
    kicker: { en: 'Beef and chicken stocks, 17 herbs, then the málà.', cn: '牛鸡双汤、17 种草本，最后才是麻辣。' },
    steps: [
      { label: L.story, en: 'Beef bones, beef shank, chicken feet and chicken bones — built for depth, aroma and body.',
        cn: '牛大骨、牛腱、鸡爪、鸡骨打底，要的是厚度、肉香和胶质感。' },
      { label: L.craft, en: 'Beef and chicken stocks simmer separately, then blend by a fixed ratio — every pot tastes the same.',
        cn: '牛骨汤、鸡骨汤分开熬，再按固定比例调和，每一锅味道都稳。' },
      { label: L.herbs, en: 'Natural herbs and spices, timed closely: too short lacks aroma, too long turns bitter.',
        cn: '天然草本香料，严控时间：短了不香，久了发苦。', stat: { n: 17, unit: { en: 'herbs & spices', cn: '种草本香料' } } },
      { label: L.final, en: 'Chili oil, chili and Sichuan pepper finish the classic YGF málà — adjusted to your taste.',
        cn: '辣椒油、辣椒、花椒收尾，完成经典麻辣；出品时按你的口味再调。' },
    ],
    checkTitle: GOOD_BROTH,
    checks: [
      { en: 'Rich, never heavy', cn: '浓而不腻' },
      { en: 'Fragrant, never bitter', cn: '香而不苦' },
      { en: 'Body to carry the whole bowl', cn: '托得住整碗食材' },
    ],
  },
  tomato: {
    kicker: { en: 'No water — chicken broth and stir-fried tomato.', cn: '不用清水，鸡汤加炒番茄。' },
    steps: [
      { label: L.story, en: 'Instead of water, our house-made chicken broth is the base — savory from the first sip.',
        cn: '不用清水，用自熬鸡汤打底，一开始就更鲜、更有厚度。' },
      { label: L.craft, en: 'Two tomato pastes stir-fried with fresh carrot until the tomato turns sandy and concentrated.',
        cn: '两种番茄膏加新鲜胡萝卜翻炒，炒到翻砂，香气和浓度才出来。' },
      { label: L.why, en: 'Chicken broth carries the savory depth; the sautéed tomato brings brightness, sweetness and body.',
        cn: '鸡汤负责托鲜，炒番茄负责酸甜和浓度，两层味道叠在一起。' },
    ],
    checkTitle: GOOD_BROTH,
    checks: [
      { en: 'Bright sweet-and-sour', cn: '酸甜明亮' },
      { en: 'Full, never watery', cn: '有厚度，不水不寡' },
      { en: 'Naturally sweet, not sugary', cn: '甜得自然，不只剩甜' },
    ],
  },
  tomyum: {
    kicker: { en: 'Classic Thai tom yum, tuned for a malatang bowl.', cn: '传统泰式冬阴功，调成适合麻辣烫的一碗。' },
    steps: [
      { label: L.story, en: 'Built on the classic Thai tom yum profile, then lightly tuned for malatang.',
        cn: '以传统泰式冬阴功风味为基础，再轻微调整，更适合麻辣烫。' },
      { label: L.craft, en: 'Seven ingredients build it layer by layer — sour, spicy and fragrant.',
        cn: '七样原料层层叠出酸、辣与香气。',
        chips: [
          { en: 'Tom yum paste', cn: '冬阴功酱' }, { en: 'Lemongrass', cn: '香茅' }, { en: 'Fish sauce', cn: '鱼露' },
          { en: "Bird's eye chili", cn: '小米辣' }, { en: 'Lime', cn: '青柠' }, { en: 'Galangal', cn: '南姜' },
          { en: 'Kaffir lime leaf', cn: '柠檬叶' },
        ] },
      { label: L.balance, en: 'Bright and herbal like the original, with the edges softened so more ingredients fit in.',
        cn: '保留明亮酸香和草本气息，微调刺激感，让更多食材都融得进。' },
    ],
    checkTitle: GOOD_BROTH,
    checks: [
      { en: 'Sour, but bright', cn: '酸得明亮' },
      { en: 'Spicy, with layers', cn: '辣得有层次' },
      { en: 'Aroma that holds up', cn: '香气立得住' },
    ],
  },
  drymix: {
    kicker: { en: 'No broth — sesame sauce that coats every bite.', cn: '不是汤底，是裹住每一口的芝麻酱。' },
    steps: [
      { label: L.story, en: 'Unlike a broth bowl, this one is built on a rich sesame sauce that coats every ingredient.',
        cn: '和汤底麻辣烫不同，麻辣拌以浓香芝麻酱为核心，裹住每一种食材。' },
      { label: L.craft, en: 'Sesame sauce goes in first, then chili, numbing spice and seasoning, layer by layer.',
        cn: '芝麻酱先打底，再叠加辣、麻与调味，香、麻、辣各有层次。' },
      { label: L.why, en: 'The sauce clings, so every bite is sesame-rich with a spicy, savory finish.',
        cn: '酱汁均匀挂在食材上，每一口都有芝麻浓香，再带出麻辣咸香。' },
    ],
    checkTitle: { en: 'How to tell a good dry mix', cn: '怎么判断一碗好的麻辣拌' },
    checks: [
      { en: 'Evenly coated', cn: '挂酱均匀' },
      { en: 'Creamy, never gluey', cn: '浓而不糊' },
      { en: 'Fragrant, never greasy', cn: '香而不腻' },
    ],
  },
  clear: {
    kicker: { en: 'Our house broth, held back — taste the stock itself.', cn: '原汤做得更克制，喝的就是汤底本身。' },
    steps: [
      { label: L.story, en: 'A simpler take on our house broth, for guests who want to taste the stock itself.',
        cn: '把原汤做得更克制，适合想喝清爽、直接感受汤底的人。' },
      { label: L.craft, en: 'Our beef-bone house broth with only light seasoning, so its own savoriness leads.',
        cn: '以牛骨原汤为基础，只做少量调味，让原汤的鲜香站在最前面。' },
      { label: L.why, en: 'Less seasoning means the broth has to stand on its own body, aroma and clean finish.',
        cn: '调味越少，越考验原汤本身的厚度、香气和干净度。' },
    ],
    checkTitle: { en: 'How to tell a good clear broth', cn: '怎么判断一锅好清汤' },
    checks: [
      { en: 'Clean and savory', cn: '清鲜' },
      { en: 'Balanced', cn: '平衡，入口干净' },
      { en: 'Light seasoning, never thin', cn: '调味轻，汤不薄' },
    ],
  },
};
