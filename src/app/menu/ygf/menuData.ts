export type Allergen = "Fish" | "Shellfish" | "Soy" | "Wheat" | "Gluten" | "Egg" | "Milk" | "Sesame" | "Peanuts";

export interface MenuItem {
  id: string;
  zh: string;
  en: string;
  img?: string;
  allergens?: Allergen[];
  note?: string;
  isNew?: boolean;
}

export interface ComboItem {
  itemId: string;   // references MenuItem.id
  weight: string;   // e.g. "150g"
}

export interface Combo {
  id: string;
  zh: string;
  en: string;
  highlight: string;
  items: ComboItem[];
  staple: string;
}

export interface Broth {
  id: string;
  zh: string;
  en: string;
  tagline: string;
  features: string[];
  spicy: string;
  spicyLevel: 0 | 1 | 2 | 3; // 0=none,1=mild,2=med,3=hot
  color: string;
  img?: string;
  badge: string;
  combos: Combo[];
}

export interface MenuCategory {
  id: string;
  emoji: string;
  zh: string;
  en: string;
  items: MenuItem[];
}

export interface SauceCategory {
  zh: string;
  en: string;
  items: { zh: string; en: string; img?: string; allergens?: Allergen[] }[];
}

// ─── All menu items (flat, referenced by id) ─────────────
export const ALL_ITEMS: MenuItem[] = [
  // 🥩 Meat
  { id: "beef-brisket",       zh: "牛五花",     en: "Fatty Beef Slices",         img: "/ygf-meat-beef-brisket.webp" },
  { id: "beef-flat-iron",     zh: "牛板翼",     en: "Beef Flat Iron",            img: "/ygf-meat-beef-flat-iron.webp" },
  { id: "lamb",               zh: "羊肉",       en: "Lamb Slices",               img: "/ygf-meat-lamb-slices.webp" },
  { id: "pork-shoulder",      zh: "猪梅花",     en: "Pork Shoulder",             img: "/ygf-meat-pork-shoulder.webp" },
  { id: "shrimp-paste",       zh: "手工虾滑",   en: "Handmade Shrimp Paste",     img: "/ygf-seafood-shrimp-paste.webp", allergens: ["Shellfish"] },
  { id: "beef-aorta",         zh: "黄喉",       en: "Beef Aorta",                img: "/ygf-meat-beef-aorta.webp" },
  { id: "premium-omasum",     zh: "牛百叶",     en: "Premium Beef Omasum",       img: "/ygf-meat-premium-beef-omasum.webp" },
  { id: "beef-omasum",        zh: "黑毛肚",     en: "Black Beef Tripe",          img: "/ygf-meat-beef-omasum.webp" },
  { id: "frog-legs",          zh: "牛蛙腿",     en: "Frog Legs",                 img: "/ygf-meat-frog-legs.webp", allergens: ["Fish"] },
  { id: "basa-fillet",        zh: "巴沙鱼片",   en: "Basa Fish Fillet",          img: "/ygf-seafood-basa-fillet.webp", allergens: ["Fish"] },
  { id: "pork-sausage",       zh: "白油肠",     en: "Pork Sausage",              img: "/ygf-meat-pork-sausage.webp", allergens: ["Soy","Wheat"] },
  { id: "mini-sausages",      zh: "亲亲肠",     en: "Mini Sausages",             img: "/ygf-meat-mini-sausages.webp", allergens: ["Soy"] },
  { id: "spam",               zh: "午餐肉",     en: "Spam / Luncheon Meat",      img: "/ygf-meat-spam.webp", allergens: ["Soy","Wheat"] },
  { id: "beef-tendon",        zh: "卤牛筋",     en: "Braised Beef Tendon",       img: "/ygf-meat-braised-beef-tendon.webp", allergens: ["Soy"] },
  { id: "pork-intestine",     zh: "卤肥肠",     en: "Braised Pork Intestine",    img: "/ygf-meat-braised-pork-intestine.webp", allergens: ["Soy"] },
  { id: "honeycomb-tripe",    zh: "卤蜂巢肚",   en: "Braised Honeycomb Tripe",   img: "/ygf-meat-braised-honeycomb-tripe.webp", allergens: ["Soy"] },
  { id: "quail-eggs",         zh: "鹌鹑蛋",     en: "Quail Eggs",                img: "/ygf-meat-quail-eggs.webp", allergens: ["Egg"] },
  // 🦐 Seafood & Balls
  { id: "fish-roe-ball",      zh: "鱼籽包心丸", en: "Fish Ball w/ Fish Roe",     img: "/ygf-balls-fish-roe-ball.webp",           allergens: ["Fish","Wheat","Soy"] },
  { id: "cheese-fish-ball",   zh: "芝士包心丸", en: "Cheese-Filled Fish Ball",   img: "/ygf-balls-cheese-filled-fish-ball.webp", allergens: ["Fish","Milk","Wheat"] },
  { id: "fish-roe-lucky-bag", zh: "鱼籽福袋",   en: "Fish Roe Lucky Bag",        img: "/ygf-balls-fish-roe-lucky-bag.webp",      allergens: ["Fish","Wheat","Soy"], isNew: true },
  { id: "soup-fish-ball",     zh: "灌汤鱼丸",   en: "Soup-Filled Fish Ball",                                                     allergens: ["Fish","Wheat"] },
  { id: "baby-scallops",      zh: "鲜嫩扇贝",   en: "Baby Scallops",             img: "/ygf-seafood-baby-scallops.webp",         allergens: ["Shellfish"] },
  { id: "shrimp-shell",       zh: "带壳去头大虾",en: "Shell-On Shrimp",          img: "/ygf-seafood-shrimp-shell.webp",          allergens: ["Shellfish"] },
  { id: "peeled-shrimp",      zh: "去壳虾",     en: "Peeled Shrimp",             img: "/ygf-seafood-peeled-shrimp.webp",         allergens: ["Shellfish"] },
  { id: "squid-tentacles",    zh: "鱿鱼须",     en: "Squid Tentacles",           img: "/ygf-seafood-squid-tentacles.webp",       allergens: ["Shellfish"] },
  { id: "squid-balls",        zh: "鱿鱼丸",     en: "Squid Balls",               img: "/ygf-balls-squid-balls.webp",             allergens: ["Shellfish","Fish","Wheat"] },
  { id: "beef-ball-burst",    zh: "爆浆牛肉丸", en: "Juicy Beef Balls",          img: "/ygf-seafood-beef-ball-burst.webp",       allergens: ["Wheat","Soy"] },
  { id: "mussels",            zh: "青口贻贝",   en: "Mussels",                   img: "/ygf-seafood-mussels.webp",               allergens: ["Shellfish"] },
  { id: "lobster-ball",       zh: "仿龙虾球",   en: "Lobster-Style Ball",        img: "/ygf-seafood-lobster-ball.webp",          allergens: ["Fish","Wheat","Soy"] },
  { id: "pork-meatballs",     zh: "猪肉丸",     en: "Pork Meatballs",            img: "/ygf-balls-pork-meatballs.webp",          allergens: ["Wheat","Soy"] },
  { id: "crab-sticks",        zh: "蟹棒",       en: "Crab Sticks",               img: "/ygf-seafood-crab-sticks.webp",           allergens: ["Fish","Wheat","Soy"] },
  { id: "chikuwa",            zh: "竹轮鱼饼",   en: "Chikuwa Fish Cake",         img: "/ygf-seafood-chikuwa.webp",               allergens: ["Fish","Wheat","Soy"] },
  { id: "cheese-fish-tofu",   zh: "芝士鱼豆腐", en: "Cheese Fish Tofu",          img: "/ygf-seafood-cheese-fish-tofu.webp",      allergens: ["Fish","Milk","Soy","Wheat"] },
  // 🟨 Tofu
  { id: "tofu-puffs",         zh: "豆腐泡",     en: "Tofu Puffs",               img: "/ygf-tofu-tofu-puffs.webp",       allergens: ["Soy"] },
  { id: "chiba-tofu",         zh: "千叶豆腐",   en: "Thousand Layer Tofu",      img: "/ygf-tofu-chiba-tofu.webp",       allergens: ["Soy","Wheat"] },
  { id: "frozen-tofu",        zh: "冻豆腐",     en: "Frozen Tofu",              img: "/ygf-tofu-frozen-tofu.webp",      allergens: ["Soy"] },
  { id: "bean-curd-sticks",   zh: "腐竹",       en: "Bean Curd Sticks",         img: "/ygf-tofu-bean-curd-sticks.webp", allergens: ["Soy"] },
  { id: "tofu-skin",          zh: "油豆皮",     en: "Fried Tofu Skin",          img: "/ygf-tofu-tofu-skin.webp",        allergens: ["Soy"] },
  // 🥬 Veg
  { id: "napa-cabbage",   zh: "大白菜", en: "Napa Cabbage",        img: "/ygf-veg-napa-cabbage.webp" },
  { id: "spinach",        zh: "菠菜",   en: "Spinach",             img: "/ygf-veg-spinach.webp" },
  { id: "crown-daisy",    zh: "茼蒿",   en: "Crown Daisy",         img: "/ygf-veg-crown-daisy.webp" },
  { id: "a-choy",         zh: "A菜",    en: "A-Choy",              img: "/ygf-veg-lettuce.webp" },
  { id: "lettuce",        zh: "生菜",   en: "Lettuce",             img: "/ygf-veg-lettuce.webp" },
  { id: "celtuce",        zh: "莴苣片", en: "Celtuce Slices",      img: "/ygf-veg-romaine-lettuce.webp" },
  { id: "zucchini",       zh: "西葫芦", en: "Zucchini",            img: "/ygf-veg-zucchini.webp" },
  { id: "lotus-root",     zh: "莲藕片", en: "Lotus Root Slices",   img: "/ygf-veg-lotus-root.webp" },
  { id: "taro",           zh: "芋头",   en: "Taro",                img: "/ygf-veg-taro.webp" },
  { id: "potato",         zh: "土豆片", en: "Potato Slices",       img: "/ygf-veg-potato-slices.webp" },
  { id: "baby-corn",      zh: "玉米笋", en: "Baby Corn",           img: "/ygf-veg-baby-corn.webp" },
  { id: "bamboo",         zh: "竹笋",   en: "Bamboo Shoots",       img: "/ygf-veg-bamboo-shoots.webp" },
  { id: "kelp-knots",     zh: "海带结", en: "Kelp Knots",          img: "/ygf-veg-kelp-knots.webp" },
  { id: "konjac-knots",   zh: "魔芋结", en: "Konjac Knots",        img: "/ygf-veg-konjac-knots.webp" },
  { id: "gongcai",        zh: "贡菜",   en: "Gongcai",             img: "/ygf-veg-jelly-vegetable.webp" },
  { id: "nagaimo",        zh: "日本山药",en: "Nagaimo",            img: "/ygf-veg-nagaimo.webp" },
  // 🍄 Mushroom
  { id: "king-oyster", zh: "杏鲍菇", en: "King Oyster Mushrooms", img: "/ygf-mushroom-king-oyster.webp" },
  { id: "beech",       zh: "海鲜菇", en: "Beech Mushrooms",       img: "/ygf-mushroom-beech.webp" },
  { id: "enoki",       zh: "金针菇", en: "Enoki Mushrooms",       img: "/ygf-mushroom-enoki.webp" },
  // 🍜 Staple
  { id: "fried-dough",    zh: "小油条",   en: "Mini Fried Dough Sticks", img: "/ygf-staple-fried-dough-sticks.webp", allergens: ["Wheat","Gluten"] },
  { id: "ramen",          zh: "日式拉面", en: "Japanese Ramen Noodles",  img: "/ygf-staple-ramen.webp",              allergens: ["Wheat","Gluten"] },
  { id: "hand-shaved",    zh: "刀削面",   en: "Hand-Shaved Noodles",     img: "/ygf-staple-hand-shaved-noodles.webp",allergens: ["Wheat","Gluten"] },
  { id: "plain-noodles",  zh: "阳春面",   en: "Plain Noodles",           img: "/ygf-staple-plain-noodles.webp",      allergens: ["Wheat","Gluten"] },
  { id: "wide-glass",     zh: "火锅宽粉", en: "Wide Glass Noodles",      img: "/ygf-staple-wide-glass-noodles.webp" },
  { id: "glass-noodles",  zh: "冬粉",     en: "Glass Noodles",           img: "/ygf-staple-glass-noodles.webp" },
  { id: "rice-vermicelli",zh: "米粉",     en: "Rice Vermicelli",         img: "/ygf-staple-rice-vermicelli.webp" },
  { id: "instant",        zh: "方便面",   en: "Instant Noodles",         img: "/ygf-staple-instant-noodles.webp",    allergens: ["Wheat","Gluten","Soy"] },
  { id: "rice-cakes",     zh: "年糕",     en: "Rice Cakes",              img: "/ygf-staple-rice-cakes.webp" },
  { id: "steamed-rice",   zh: "白米饭",   en: "Steamed Rice" },
];

export function getItem(id: string): MenuItem | undefined {
  return ALL_ITEMS.find(i => i.id === id);
}

// ─── Broths ───────────────────────────────────────────────
export const BROTHS: Broth[] = [
  {
    id: "spicy",
    zh: "经典草本骨汤",
    en: "Classic Herbal Beef Bone Broth",
    tagline: "杨国福秘制骨汤，熬制超过8小时，层次丰富，经典原创",
    features: ["秘制骨汤底料", "可选辣度", "8小时慢熬", "经典原创配方"],
    spicy: "微辣 / 中辣 / 大辣",
    spicyLevel: 2,
    color: "#8B1A1A",
    img: "/ygf-broth-spicy.webp",
    badge: "经典原创",
    combos: [
      { id: "sichuan-offal", zh: "川味牛杂碗", en: "Sichuan Beef Offal Bowl", highlight: "四川风格，最正宗",
        items: [
          { itemId: "beef-brisket",    weight: "150g" },
          { itemId: "premium-omasum", weight: "100g" },
          { itemId: "beef-aorta",     weight: "100g" },
          { itemId: "potato",         weight: "100g" },
          { itemId: "kelp-knots",     weight: "100g" },
          { itemId: "enoki",          weight: "50g" },
          { itemId: "frozen-tofu",    weight: "100g" },
        ], staple: "粉丝" },
      { id: "spicy-beef", zh: "麻辣牛肉碗", en: "Spicy Beef Lover Bowl", highlight: "牛肉控必点",
        items: [
          { itemId: "beef-brisket",   weight: "150g" },
          { itemId: "beef-flat-iron", weight: "150g" },
          { itemId: "beef-ball-burst",weight: "50g" },
          { itemId: "potato",         weight: "100g" },
          { itemId: "enoki",          weight: "50g" },
        ], staple: "米线" },
      { id: "surf-turf", zh: "麻辣三拼碗", en: "Spicy Surf & Turf Bowl", highlight: "海陆双拼",
        items: [
          { itemId: "beef-brisket",  weight: "150g" },
          { itemId: "shrimp-paste",  weight: "100g" },
          { itemId: "basa-fillet",   weight: "100g" },
          { itemId: "tofu-puffs",    weight: "80g" },
          { itemId: "kelp-knots",    weight: "80g" },
        ], staple: "粉丝" },
    ],
  },
  {
    id: "tomato",
    zh: "酸甜番茄汤",
    en: "Sweet & Sour Tomato Broth",
    tagline: "精选新鲜番茄慢熬，酸甜开胃，老少皆宜，招牌推荐",
    features: ["新鲜番茄", "不辣", "酸甜开胃", "全年龄适合"],
    spicy: "不辣",
    spicyLevel: 0,
    color: "#9B2226",
    img: "/ygf-broth-tomato.webp",
    badge: "招牌推荐",
    combos: [
      { id: "tomato-beef", zh: "番茄牛肉碗", en: "Tomato Beef Bowl", highlight: "番茄牛肉经典搭配",
        items: [
          { itemId: "beef-brisket",   weight: "150g" },
          { itemId: "beef-flat-iron", weight: "150g" },
          { itemId: "potato",         weight: "100g" },
          { itemId: "enoki",          weight: "60g" },
        ], staple: "米线" },
      { id: "tomato-seafood", zh: "番茄海鲜碗", en: "Tomato Seafood Bowl", highlight: "番茄海鲜",
        items: [
          { itemId: "peeled-shrimp", weight: "100g" },
          { itemId: "basa-fillet",   weight: "100g" },
          { itemId: "mussels",       weight: "100g" },
          { itemId: "tofu-puffs",    weight: "80g" },
        ], staple: "米线" },
      { id: "tomato-veg", zh: "番茄清爽碗", en: "Fresh Tomato Veg Bowl", highlight: "轻食爽口",
        items: [
          { itemId: "shrimp-paste", weight: "150g" },
          { itemId: "spam",         weight: "150g" },
          { itemId: "napa-cabbage", weight: "100g" },
          { itemId: "enoki",        weight: "60g" },
        ], staple: "粉丝" },
    ],
  },
  {
    id: "tomyum",
    zh: "酸辣冬阴功汤",
    en: "Tom Yum Broth",
    tagline: "正宗泰式香料配方，柠檬草与椰奶完美融合，酸辣鲜香",
    features: ["泰式香料", "酸辣", "柠檬草风味", "新品上市"],
    spicy: "酸辣",
    spicyLevel: 1,
    color: "#7B4F00",
    img: "/ygf-broth-tomyum.webp",
    badge: "新品上市",
    combos: [
      { id: "thai-seafood", zh: "泰式海鲜碗", en: "Thai Seafood Bowl", highlight: "泰式经典",
        items: [
          { itemId: "peeled-shrimp", weight: "100g" },
          { itemId: "mussels",       weight: "100g" },
          { itemId: "basa-fillet",   weight: "100g" },
          { itemId: "enoki",         weight: "60g" },
        ], staple: "米线" },
      { id: "tomyum-trio", zh: "冬阴功三拼", en: "Tom Yum Trio Bowl", highlight: "酸辣浓香",
        items: [
          { itemId: "beef-brisket", weight: "150g" },
          { itemId: "shrimp-paste", weight: "100g" },
          { itemId: "basa-fillet",  weight: "100g" },
          { itemId: "tofu-puffs",   weight: "80g" },
        ], staple: "粉丝" },
      { id: "tomyum-lamb", zh: "冬阴功羊肉碗", en: "Tom Yum Lamb Bowl", highlight: "酸辣羊肉",
        items: [
          { itemId: "lamb",          weight: "150g" },
          { itemId: "peeled-shrimp", weight: "100g" },
          { itemId: "spam",          weight: "100g" },
          { itemId: "lotus-root",    weight: "80g" },
        ], staple: "米线" },
    ],
  },
  {
    id: "drymix",
    zh: "石磨醇香麻辣拌",
    en: "Spicy Dry Mix",
    tagline: "无汤干拌，石磨麻辣酱汁裹满每一口，浓郁过瘾",
    features: ["无汤干拌", "石磨酱汁", "微辣", "酱香浓郁"],
    spicy: "微辣（无汤）",
    spicyLevel: 1,
    color: "#7D3C00",
    img: "/ygf-broth-drymix.webp",
    badge: "酱汁浓郁",
    combos: [
      { id: "dry-beef", zh: "麻辣牛肉拌", en: "Spicy Beef Mix", highlight: "干拌重口",
        items: [
          { itemId: "beef-brisket",   weight: "150g" },
          { itemId: "beef-flat-iron", weight: "150g" },
          { itemId: "beef-ball-burst",weight: "50g" },
          { itemId: "lotus-root",     weight: "80g" },
        ], staple: "阳春面" },
      { id: "dry-trio", zh: "麻辣三拼拌", en: "Spicy Trio Mix", highlight: "干拌三拼",
        items: [
          { itemId: "lamb",         weight: "150g" },
          { itemId: "shrimp-paste", weight: "100g" },
          { itemId: "spam",         weight: "100g" },
          { itemId: "konjac-knots", weight: "80g" },
        ], staple: "粉丝" },
      { id: "campus", zh: "学生拌碗", en: "Campus Spicy Bowl", highlight: "最容易爆单",
        items: [
          { itemId: "beef-brisket", weight: "150g" },
          { itemId: "spam",         weight: "150g" },
          { itemId: "potato",       weight: "100g" },
          { itemId: "enoki",        weight: "60g" },
        ], staple: "粉丝" },
    ],
  },
  {
    id: "clear",
    zh: "滋补清汤",
    en: "Nourishing Clear Broth",
    tagline: "牛骨小火慢熬，汤色清澈金黄，清甜鲜美，养生之选",
    features: ["牛骨慢熬", "不辣", "清甜鲜美", "养生之选"],
    spicy: "不辣",
    spicyLevel: 0,
    color: "#6B5300",
    img: undefined,
    badge: "养生之选",
    combos: [
      { id: "clear-seafood", zh: "清汤海鲜碗", en: "Light Seafood Bowl", highlight: "清爽健康",
        items: [
          { itemId: "peeled-shrimp", weight: "100g" },
          { itemId: "mussels",       weight: "100g" },
          { itemId: "basa-fillet",   weight: "100g" },
          { itemId: "napa-cabbage",  weight: "100g" },
        ], staple: "米线" },
      { id: "clear-beef", zh: "清汤牛肉碗", en: "Classic Beef Soup Bowl", highlight: "暖胃经典",
        items: [
          { itemId: "beef-flat-iron", weight: "150g" },
          { itemId: "beef-brisket",   weight: "150g" },
          { itemId: "beef-ball-burst",weight: "50g" },
          { itemId: "spinach",        weight: "80g" },
        ], staple: "阳春面" },
      { id: "clear-healthy", zh: "清汤健康碗", en: "Healthy Veg Protein Bowl", highlight: "健康轻食",
        items: [
          { itemId: "basa-fillet",  weight: "150g" },
          { itemId: "shrimp-paste", weight: "150g" },
          { itemId: "tofu-puffs",   weight: "80g" },
          { itemId: "spinach",      weight: "80g" },
        ], staple: "粉丝" },
    ],
  },
];

// ─── Menu categories ──────────────────────────────────────
export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: "meat", emoji: "🥩", zh: "精选肉类", en: "Meats & Offal",
    items: ALL_ITEMS.filter(i => ["beef-brisket","beef-flat-iron","lamb","pork-shoulder","shrimp-paste","beef-aorta","premium-omasum","beef-omasum","frog-legs","basa-fillet","pork-sausage","mini-sausages","spam","beef-tendon","pork-intestine","honeycomb-tripe"].includes(i.id)),
  },
  {
    id: "seafood", emoji: "🦐", zh: "海鲜丸滑", en: "Seafood & Balls",
    items: ALL_ITEMS.filter(i => ["fish-roe-ball","cheese-fish-ball","fish-roe-lucky-bag","soup-fish-ball","baby-scallops","shrimp-shell","peeled-shrimp","squid-tentacles","squid-balls","beef-ball-burst","mussels","lobster-ball","pork-meatballs","crab-sticks","chikuwa","cheese-fish-tofu"].includes(i.id)),
  },
  {
    id: "tofu", emoji: "🟨", zh: "豆制品", en: "Tofu & Soy",
    items: ALL_ITEMS.filter(i => ["tofu-puffs","chiba-tofu","frozen-tofu","bean-curd-sticks","tofu-skin"].includes(i.id)),
  },
  {
    id: "veg", emoji: "🥬", zh: "时令蔬菜", en: "Vegetables",
    items: ALL_ITEMS.filter(i => ["napa-cabbage","spinach","crown-daisy","a-choy","lettuce","celtuce","zucchini","lotus-root","taro","potato","baby-corn","bamboo","kelp-knots","konjac-knots","quail-eggs","gongcai","nagaimo"].includes(i.id)),
  },
  {
    id: "mushroom", emoji: "🍄", zh: "菌菇类", en: "Mushrooms",
    items: ALL_ITEMS.filter(i => ["king-oyster","beech","enoki"].includes(i.id)),
  },
  {
    id: "staple", emoji: "🍜", zh: "主食淀粉", en: "Noodles & Staples",
    items: ALL_ITEMS.filter(i => ["fried-dough","ramen","hand-shaved","plain-noodles","wide-glass","glass-noodles","rice-vermicelli","instant","rice-cakes","steamed-rice"].includes(i.id)),
  },
];

// ─── Sauce categories ─────────────────────────────────────
export const SAUCE_CATEGORIES: SauceCategory[] = [
  {
    zh: "基础酱料", en: "Base Sauces",
    items: [
      { zh: "芝麻酱",   en: "Sesame Paste",          allergens: ["Sesame"] },
      { zh: "腐乳酱",   en: "Fermented Tofu Sauce",  img: "/ygf-sauce-fermented-tofu.webp", allergens: ["Soy"] },
      { zh: "沙茶酱",   en: "Shacha Sauce",           allergens: ["Fish","Shellfish","Soy"] },
      { zh: "蚝油",     en: "Oyster Sauce",           img: "/ygf-sauce-oyster.webp",         allergens: ["Shellfish"] },
      { zh: "酱油",     en: "Soy Sauce",              allergens: ["Soy","Wheat"] },
      { zh: "双椒油",   en: "Double Chili Oil",       img: "/ygf-sauce-double-chili.webp" },
      { zh: "辣椒油",   en: "Chili Oil",              img: "/ygf-sauce-chili-oil.webp",      allergens: ["Sesame"] },
      { zh: "椒麻酱",   en: "Sichuan Pepper Sauce",   img: "/ygf-sauce-sichuan-pepper.webp", allergens: ["Sesame","Soy"] },
      { zh: "麻辣拌酱", en: "Spicy Dry Mix Sauce",    img: "/ygf-sauce-spicy-mix.webp",      allergens: ["Soy","Sesame","Gluten"] },
      { zh: "韭菜花酱", en: "Chive Flower Paste" },
    ],
  },
  {
    zh: "酸香调味", en: "Tangy & Aromatic",
    items: [
      { zh: "柚子醋",  en: "Yuzu Ponzu",          allergens: ["Soy","Wheat"] },
      { zh: "陈醋",    en: "Aged Black Vinegar",   img: "/ygf-sauce-vinegar.webp" },
      { zh: "香油",    en: "Sesame Oil",           allergens: ["Sesame"] },
    ],
  },
  {
    zh: "新鲜香料", en: "Fresh Toppings",
    items: [
      { zh: "蒜泥",   en: "Minced Garlic",    img: "/ygf-sauce-garlic.webp" },
      { zh: "小米辣", en: "Bird's Eye Chili", img: "/ygf-sauce-chili.webp" },
      { zh: "香菜",   en: "Cilantro",         img: "/ygf-sauce-cilantro.webp" },
      { zh: "葱花",   en: "Scallions",        img: "/ygf-sauce-scallion.webp" },
    ],
  },
  {
    zh: "干料点缀", en: "Dry Garnishes",
    items: [
      { zh: "花生碎", en: "Crushed Peanuts", img: "/ygf-sauce-peanut.webp",  allergens: ["Peanuts"] },
      { zh: "熟芝麻", en: "Toasted Sesame",  img: "/ygf-sauce-sesame.webp",  allergens: ["Sesame"] },
    ],
  },
];

export const ALLERGEN_COLOR: Record<string, string> = {
  Fish: "#1565C0", Shellfish: "#6A1B9A", Soy: "#E65100", Wheat: "#4E342E",
  Gluten: "#37474F", Egg: "#F57F17", Milk: "#2E7D32", Sesame: "#880E4F", Peanuts: "#B71C1C",
};
