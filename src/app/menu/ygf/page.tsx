"use client";
import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────
type Allergen = "Fish" | "Shellfish" | "Soy" | "Wheat" | "Gluten" | "Egg" | "Milk" | "Sesame" | "Peanuts";

interface MenuItem {
  id: string;
  zh: string;
  en: string;
  img?: string;
  allergens?: Allergen[];
  note?: string;
  new?: boolean;
}

interface MenuCategory {
  id: string;
  emoji: string;
  zh: string;
  en: string;
  items: MenuItem[];
}

interface Broth {
  id: string;
  zh: string;
  en: string;
  desc: string;
  spicy: string;
  color: string; // gradient or image
  img?: string;
  badge?: string;
  combos: { zh: string; en: string; items: string }[];
}

interface SauceItem {
  zh: string;
  en: string;
  img?: string;
  allergens?: Allergen[];
}

// ─── Broths ───────────────────────────────────────────────
const BROTHS: Broth[] = [
  {
    id: "spicy",
    zh: "经典草本骨汤",
    en: "Classic Herbal Beef Bone Broth",
    desc: "石磨麻辣，香气层次丰富",
    spicy: "微辣 / 中辣 / 大辣",
    color: "linear-gradient(135deg,#c0392b,#e67e22)",
    img: "/ygf-broth-spicy.webp",
    badge: "经典原创",
    combos: [
      { zh: "川味牛杂碗", en: "Sichuan Beef Offal Bowl", items: "牛五花 · 牛百叶 · 黄喉 · 粉丝" },
      { zh: "麻辣牛肉碗", en: "Spicy Beef Lover Bowl", items: "牛五花 · 牛板翼 · 爆浆牛肉丸 · 米线" },
      { zh: "麻辣三拼碗", en: "Spicy Surf & Turf Bowl", items: "牛五花 · 手工虾滑 · 巴沙鱼片 · 粉丝" },
    ],
  },
  {
    id: "tomato",
    zh: "酸甜番茄汤",
    en: "Sweet & Sour Tomato Broth",
    desc: "新鲜番茄熬制，酸甜开胃",
    spicy: "不辣",
    color: "linear-gradient(135deg,#c0392b,#e74c3c)",
    img: "/ygf-broth-tomato.webp",
    badge: "招牌推荐",
    combos: [
      { zh: "番茄牛肉碗", en: "Tomato Beef Bowl", items: "牛五花 · 牛板翼 · 米线" },
      { zh: "番茄海鲜碗", en: "Tomato Seafood Bowl", items: "去壳虾 · 巴沙鱼片 · 青口 · 米线" },
      { zh: "番茄清爽碗", en: "Fresh Tomato Veg Bowl", items: "手工虾滑 · 午餐肉 · 粉丝" },
    ],
  },
  {
    id: "tomyum",
    zh: "酸辣冬阴功汤",
    en: "Tom Yum Broth",
    desc: "泰式香料熬制，酸辣开胃",
    spicy: "酸辣",
    color: "linear-gradient(135deg,#e67e22,#f39c12)",
    img: "/ygf-broth-tomyum.webp",
    badge: "新品上市",
    combos: [
      { zh: "泰式海鲜碗", en: "Thai Seafood Bowl", items: "去壳虾 · 青口 · 巴沙鱼片 · 米线" },
      { zh: "冬阴功三拼", en: "Tom Yum Trio Bowl", items: "牛五花 · 手工虾滑 · 巴沙鱼片 · 粉丝" },
      { zh: "冬阴功羊肉碗", en: "Tom Yum Lamb Bowl", items: "羊肉 · 去壳虾 · 午餐肉 · 米线" },
    ],
  },
  {
    id: "drymix",
    zh: "石磨醇香麻辣拌",
    en: "Grind Pleasant Spicy Dry Mix",
    desc: "无汤干拌，酱汁浓郁香辣",
    spicy: "微辣（无汤）",
    color: "linear-gradient(135deg,#d35400,#e67e22)",
    img: "/ygf-broth-drymix.webp",
    badge: "酱汁浓郁",
    combos: [
      { zh: "麻辣牛肉拌", en: "Spicy Beef Mix", items: "牛五花 · 牛板翼 · 爆浆牛肉丸 · 阳春面" },
      { zh: "麻辣三拼拌", en: "Spicy Trio Mix", items: "羊肉 · 手工虾滑 · 午餐肉 · 粉丝" },
      { zh: "学生拌碗", en: "Campus Spicy Bowl", items: "牛五花 · 午餐肉 · 粉丝" },
    ],
  },
  {
    id: "clear",
    zh: "滋补清汤",
    en: "Nourishing Clear Broth",
    desc: "牛骨慢熬，清甜鲜美",
    spicy: "不辣",
    color: "linear-gradient(135deg,#f5c842,#f9e07a)",
    img: undefined, // temp: use gradient
    badge: "养生之选",
    combos: [
      { zh: "清汤海鲜碗", en: "Light Seafood Bowl", items: "去壳虾 · 青口 · 巴沙鱼片 · 米线" },
      { zh: "清汤牛肉碗", en: "Classic Beef Soup Bowl", items: "牛板翼 · 牛五花 · 爆浆牛肉丸 · 阳春面" },
      { zh: "清汤健康碗", en: "Healthy Veg Protein Bowl", items: "巴沙鱼片 · 手工虾滑 · 粉丝" },
    ],
  },
];

// ─── Menu Data ────────────────────────────────────────────
const MENU: MenuCategory[] = [
  {
    id: "meat", emoji: "🥩", zh: "精选肉类", en: "Meats & Offal",
    items: [
      { id: "beef-brisket",        zh: "牛五花",    en: "Fatty Beef Slices",          img: "/ygf-meat-beef-brisket.webp" },
      { id: "beef-flat-iron",      zh: "牛板翼",    en: "Beef Flat Iron",             img: "/ygf-meat-beef-flat-iron.webp" },
      { id: "lamb",                zh: "羊肉",      en: "Lamb Slices",                img: "/ygf-meat-lamb-slices.webp" },
      { id: "pork-shoulder",       zh: "猪梅花",    en: "Pork Shoulder",              img: "/ygf-meat-pork-shoulder.webp" },
      { id: "shrimp-paste",        zh: "手工虾滑",  en: "Handmade Shrimp Paste",      img: "/ygf-seafood-shrimp-paste.webp", allergens: ["Shellfish"] },
      { id: "beef-aorta",          zh: "黄喉",      en: "Beef Aorta",                 img: "/ygf-meat-beef-aorta.webp" },
      { id: "premium-omasum",      zh: "牛百叶",    en: "Premium Beef Omasum",        img: "/ygf-meat-premium-beef-omasum.webp" },
      { id: "beef-omasum",         zh: "黑毛肚",    en: "Black Beef Tripe",           img: "/ygf-meat-beef-omasum.webp" },
      { id: "frog-legs",           zh: "牛蛙腿",    en: "Frog Legs",                  img: "/ygf-meat-frog-legs.webp", allergens: ["Fish"] },
      { id: "basa-fillet",         zh: "巴沙鱼片",  en: "Basa Fish Fillet",           img: "/ygf-seafood-basa-fillet.webp", allergens: ["Fish"] },
      { id: "pork-sausage",        zh: "白油肠",    en: "Pork Sausage",               img: "/ygf-meat-pork-sausage.webp", allergens: ["Soy","Wheat"] },
      { id: "mini-sausages",       zh: "亲亲肠",    en: "Mini Sausages",              img: "/ygf-meat-mini-sausages.webp", allergens: ["Soy"] },
      { id: "spam",                zh: "午餐肉",    en: "Spam / Luncheon Meat",       img: "/ygf-meat-spam.webp", allergens: ["Soy","Wheat"] },
      { id: "beef-tendon",         zh: "卤牛筋",    en: "Braised Beef Tendon",        img: "/ygf-meat-braised-beef-tendon.webp", allergens: ["Soy"] },
      { id: "pork-intestine",      zh: "卤肥肠",    en: "Braised Pork Intestine",     img: "/ygf-meat-braised-pork-intestine.webp", allergens: ["Soy"] },
      { id: "honeycomb-tripe",     zh: "卤蜂巢肚",  en: "Braised Honeycomb Tripe",    img: "/ygf-meat-braised-honeycomb-tripe.webp", allergens: ["Soy"] },
    ],
  },
  {
    id: "seafood", emoji: "🦐", zh: "海鲜丸滑", en: "Seafood & Fish Balls",
    items: [
      { id: "fish-roe-ball",       zh: "鱼籽包心丸",  en: "Fish Ball w/ Fish Roe",       img: "/ygf-balls-fish-roe-ball.webp",           allergens: ["Fish","Wheat","Soy"] },
      { id: "cheese-fish-ball",    zh: "芝士包心丸",  en: "Cheese-Filled Fish Ball",     img: "/ygf-balls-cheese-filled-fish-ball.webp", allergens: ["Fish","Milk","Wheat"] },
      { id: "fish-roe-lucky-bag",  zh: "鱼籽福袋",   en: "Fish Roe Lucky Bag",          img: "/ygf-balls-fish-roe-lucky-bag.webp",      allergens: ["Fish","Wheat","Soy"], new: true },
      { id: "soup-fish-ball",      zh: "灌汤鱼丸",   en: "Soup-Filled Fish Ball",       allergens: ["Fish","Wheat"] },
      { id: "baby-scallops",       zh: "鲜嫩扇贝",   en: "Baby Scallops",               img: "/ygf-seafood-baby-scallops.webp",         allergens: ["Shellfish"] },
      { id: "shrimp-shell",        zh: "带壳去头大虾", en: "Headless Shell-On Shrimp",  img: "/ygf-seafood-shrimp-shell.webp",          allergens: ["Shellfish"] },
      { id: "peeled-shrimp",       zh: "去壳虾",     en: "Peeled Shrimp",              img: "/ygf-seafood-peeled-shrimp.webp",         allergens: ["Shellfish"] },
      { id: "squid-tentacles",     zh: "鱿鱼须",     en: "Squid Tentacles",            img: "/ygf-seafood-squid-tentacles.webp",       allergens: ["Shellfish"] },
      { id: "squid-balls",         zh: "鱿鱼丸",     en: "Squid Balls",                img: "/ygf-balls-squid-balls.webp",             allergens: ["Shellfish","Fish","Wheat"] },
      { id: "beef-ball-burst",     zh: "爆浆牛肉丸", en: "Juicy Beef Balls",           img: "/ygf-seafood-beef-ball-burst.webp",       allergens: ["Wheat","Soy"] },
      { id: "mussels",             zh: "青口贻贝",   en: "Mussels",                    img: "/ygf-seafood-mussels.webp",               allergens: ["Shellfish"] },
      { id: "lobster-ball",        zh: "仿龙虾球",   en: "Lobster-Style Ball",         img: "/ygf-seafood-lobster-ball.webp",          allergens: ["Fish","Wheat","Soy"] },
      { id: "pork-meatballs",      zh: "猪肉丸",     en: "Pork Meatballs",             img: "/ygf-balls-pork-meatballs.webp",          allergens: ["Wheat","Soy"] },
      { id: "crab-sticks",         zh: "蟹棒",       en: "Crab Sticks",                img: "/ygf-seafood-crab-sticks.webp",           allergens: ["Fish","Wheat","Soy"] },
      { id: "chikuwa",             zh: "竹轮鱼饼",   en: "Chikuwa Fish Cake",          img: "/ygf-seafood-chikuwa.webp",               allergens: ["Fish","Wheat","Soy"] },
      { id: "cheese-fish-tofu",    zh: "芝士鱼豆腐", en: "Cheese Fish Tofu",           img: "/ygf-seafood-cheese-fish-tofu.webp",      allergens: ["Fish","Milk","Soy","Wheat"] },
    ],
  },
  {
    id: "tofu", emoji: "🟨", zh: "豆制品", en: "Tofu & Soy",
    items: [
      { id: "tofu-puffs",       zh: "豆腐泡",   en: "Tofu Puffs",            img: "/ygf-tofu-tofu-puffs.webp",      allergens: ["Soy"] },
      { id: "chiba-tofu",       zh: "千叶豆腐", en: "Thousand Layer Tofu",   img: "/ygf-tofu-chiba-tofu.webp",      allergens: ["Soy","Wheat"] },
      { id: "frozen-tofu",      zh: "冻豆腐",   en: "Frozen Tofu",           img: "/ygf-tofu-frozen-tofu.webp",     allergens: ["Soy"] },
      { id: "bean-curd-sticks", zh: "腐竹",     en: "Bean Curd Sticks",      img: "/ygf-tofu-bean-curd-sticks.webp",allergens: ["Soy"] },
      { id: "tofu-skin",        zh: "油豆皮",   en: "Fried Tofu Skin",       img: "/ygf-tofu-tofu-skin.webp",       allergens: ["Soy"] },
    ],
  },
  {
    id: "veg", emoji: "🥬", zh: "时令蔬菜", en: "Vegetables",
    items: [
      { id: "napa-cabbage",  zh: "大白菜", en: "Napa Cabbage",           img: "/ygf-veg-napa-cabbage.webp" },
      { id: "spinach",       zh: "菠菜",   en: "Spinach",                img: "/ygf-veg-spinach.webp" },
      { id: "crown-daisy",   zh: "茼蒿",   en: "Crown Daisy",            img: "/ygf-veg-crown-daisy.webp" },
      { id: "a-choy",        zh: "A菜",    en: "A-Choy",                 img: "/ygf-veg-lettuce.webp" },
      { id: "lettuce",       zh: "生菜",   en: "Lettuce",                img: "/ygf-veg-lettuce.webp" },
      { id: "celtuce",       zh: "莴苣片", en: "Celtuce Slices",         img: "/ygf-veg-romaine-lettuce.webp" },
      { id: "zucchini",      zh: "西葫芦", en: "Zucchini",               img: "/ygf-veg-zucchini.webp" },
      { id: "lotus-root",    zh: "莲藕片", en: "Lotus Root Slices",      img: "/ygf-veg-lotus-root.webp" },
      { id: "taro",          zh: "芋头",   en: "Taro",                   img: "/ygf-veg-taro.webp" },
      { id: "potato",        zh: "土豆片", en: "Potato Slices",          img: "/ygf-veg-potato-slices.webp" },
      { id: "baby-corn",     zh: "玉米笋", en: "Baby Corn",              img: "/ygf-veg-baby-corn.webp" },
      { id: "bamboo",        zh: "竹笋",   en: "Bamboo Shoots",          img: "/ygf-veg-bamboo-shoots.webp" },
      { id: "kelp-knots",    zh: "海带结", en: "Kelp Knots",             img: "/ygf-veg-kelp-knots.webp" },
      { id: "konjac-knots",  zh: "魔芋结", en: "Konjac Knots",           img: "/ygf-veg-konjac-knots.webp" },
      { id: "quail-eggs",    zh: "鹌鹑蛋", en: "Quail Eggs",             img: "/ygf-meat-quail-eggs.webp", allergens: ["Egg"] },
      { id: "gongcai",       zh: "贡菜",   en: "Gongcai",                img: "/ygf-veg-jelly-vegetable.webp" },
      { id: "nagaimo",       zh: "日本山药",en: "Nagaimo",               img: "/ygf-veg-nagaimo.webp" },
    ],
  },
  {
    id: "mushroom", emoji: "🍄", zh: "菌菇类", en: "Mushrooms",
    items: [
      { id: "king-oyster", zh: "杏鲍菇", en: "King Oyster Mushrooms", img: "/ygf-mushroom-king-oyster.webp" },
      { id: "beech",       zh: "海鲜菇", en: "Beech Mushrooms",       img: "/ygf-mushroom-beech.webp" },
      { id: "enoki",       zh: "金针菇", en: "Enoki Mushrooms",       img: "/ygf-mushroom-enoki.webp" },
    ],
  },
  {
    id: "staple", emoji: "🍜", zh: "主食淀粉", en: "Noodles & Staples",
    items: [
      { id: "fried-dough",   zh: "小油条",   en: "Mini Fried Dough Sticks",  img: "/ygf-staple-fried-dough-sticks.webp", allergens: ["Wheat","Gluten"] },
      { id: "ramen",         zh: "日式拉面", en: "Japanese Ramen Noodles",    img: "/ygf-staple-ramen.webp",              allergens: ["Wheat","Gluten"] },
      { id: "hand-shaved",   zh: "刀削面",   en: "Hand-Shaved Noodles",       img: "/ygf-staple-hand-shaved-noodles.webp",allergens: ["Wheat","Gluten"] },
      { id: "plain-noodles", zh: "阳春面",   en: "Plain Noodles",             img: "/ygf-staple-plain-noodles.webp",      allergens: ["Wheat","Gluten"] },
      { id: "wide-glass",    zh: "火锅宽粉", en: "Wide Glass Noodles",        img: "/ygf-staple-wide-glass-noodles.webp" },
      { id: "glass-noodles", zh: "冬粉",     en: "Glass Noodles",             img: "/ygf-staple-glass-noodles.webp" },
      { id: "rice-vermicelli",zh: "米粉",    en: "Rice Vermicelli",           img: "/ygf-staple-rice-vermicelli.webp" },
      { id: "instant",       zh: "方便面",   en: "Instant Noodles",           img: "/ygf-staple-instant-noodles.webp",    allergens: ["Wheat","Gluten","Soy"] },
      { id: "rice-cakes",    zh: "年糕",     en: "Rice Cakes",                img: "/ygf-staple-rice-cakes.webp" },
      { id: "steamed-rice",  zh: "白米饭",   en: "Steamed Rice" },
    ],
  },
];

// ─── Sauces ───────────────────────────────────────────────
const SAUCE_CATEGORIES = [
  {
    zh: "基础酱料", en: "Base Sauces",
    items: [
      { zh: "芝麻酱", en: "Sesame Paste",         allergens: ["Sesame"] as Allergen[] },
      { zh: "腐乳酱", en: "Fermented Tofu Sauce", img: "/ygf-sauce-fermented-tofu.webp", allergens: ["Soy"] as Allergen[] },
      { zh: "沙茶酱", en: "Shacha Sauce",          allergens: ["Fish","Shellfish","Soy"] as Allergen[] },
      { zh: "蚝油",   en: "Oyster Sauce",          img: "/ygf-sauce-oyster.webp",         allergens: ["Shellfish"] as Allergen[] },
      { zh: "酱油",   en: "Soy Sauce",             allergens: ["Soy","Wheat"] as Allergen[] },
      { zh: "双椒油", en: "Double Chili Oil",      img: "/ygf-sauce-double-chili.webp" },
      { zh: "辣椒油", en: "Chili Oil",             img: "/ygf-sauce-chili-oil.webp",      allergens: ["Sesame"] as Allergen[] },
      { zh: "椒麻酱", en: "Sichuan Pepper Sauce",  img: "/ygf-sauce-sichuan-pepper.webp", allergens: ["Sesame","Soy"] as Allergen[] },
      { zh: "麻辣拌酱",en:"Spicy Dry Mix Sauce",  img: "/ygf-sauce-spicy-mix.webp",      allergens: ["Soy","Sesame","Gluten"] as Allergen[] },
      { zh: "韭菜花酱",en:"Chive Flower Paste" },
    ],
  },
  {
    zh: "酸香调味", en: "Tangy & Aromatic",
    items: [
      { zh: "柚子醋", en: "Yuzu Ponzu",         allergens: ["Soy","Wheat"] as Allergen[] },
      { zh: "陈醋",   en: "Aged Black Vinegar" },
      { zh: "香油",   en: "Sesame Oil",         allergens: ["Sesame"] as Allergen[] },
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
      { zh: "花生碎", en: "Crushed Peanuts",  img: "/ygf-sauce-peanut.webp",  allergens: ["Peanuts"] as Allergen[] },
      { zh: "熟芝麻", en: "Toasted Sesame",   img: "/ygf-sauce-sesame.webp",  allergens: ["Sesame"] as Allergen[] },
    ],
  },
];

// ─── Allergen badge colors ─────────────────────────────────
const ALLERGEN_COLOR: Record<Allergen, string> = {
  Fish: "#2196f3", Shellfish: "#9c27b0", Soy: "#ff9800", Wheat: "#795548",
  Gluten: "#607d8b", Egg: "#ffc107", Milk: "#4caf50", Sesame: "#e91e63", Peanuts: "#f44336",
};

// ─── Component ────────────────────────────────────────────
export default function YGFMenuPage() {
  const [selectedBroth, setSelectedBroth] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("meat");
  const [activeSauceTab, setActiveSauceTab] = useState(0);

  const selectedBrothData = BROTHS.find(b => b.id === selectedBroth);

  return (
    <div style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif", background: "#0d0d0d", color: "#f0ede6", minHeight: "100vh" }}>

      {/* ── Hero / Header ─────────────────────────────── */}
      <div style={{ background: "linear-gradient(180deg,#1a0a00 0%,#0d0d0d 100%)", padding: "28px 20px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#c0392b", textTransform: "uppercase", marginBottom: 8 }}>杨国福麻辣烫 · San Diego</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1, background: "linear-gradient(135deg,#f5c842,#e67e22)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          YGF Malatang
        </h1>
        <p style={{ fontSize: 13, color: "#999", margin: "6px 0 0", letterSpacing: 1 }}>Pick Your Broth · Build Your Bowl</p>

        {/* ── Promo Banner ── */}
        <div style={{ margin: "16px -20px 0", background: "linear-gradient(90deg,#c0392b,#922b21)", padding: "10px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>🎉 开业酬宾 Grand Opening Specials</div>
          <div style={{ fontSize: 11, color: "#ffc8c8" }}>
            <span>🍹 全日赠送开业饮品 · Complimentary Drink for All Guests</span>
          </div>
          <div style={{ fontSize: 11, color: "#ffc8c8" }}>
            <span>🍜 周一至周五 · 每桌第二碗半价 &nbsp;|&nbsp; Mon–Fri: 2nd Bowl 50% Off</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 100px" }}>

        {/* ── Section: 汤底选择 ─────────────────────────── */}
        <SectionTitle emoji="🍲" zh="选择汤底" en="Choose Your Broth" />

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {BROTHS.map(broth => (
            <div
              key={broth.id}
              onClick={() => setSelectedBroth(selectedBroth === broth.id ? null : broth.id)}
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: selectedBroth === broth.id ? "2px solid #f5c842" : "2px solid transparent",
                cursor: "pointer",
                transition: "border 0.2s",
                boxShadow: selectedBroth === broth.id ? "0 0 16px rgba(245,200,66,0.3)" : "none",
              }}
            >
              {/* Broth card header */}
              <div style={{ position: "relative", height: 100, background: broth.color, overflow: "hidden" }}>
                {broth.img && (
                  <img src={broth.img} alt={broth.zh}
                    style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "55%", objectFit: "cover", objectPosition: "center" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(0,0,0,0.65) 45%,transparent)" }} />
                <div style={{ position: "relative", padding: "14px 16px" }}>
                  {broth.badge && (
                    <span style={{ fontSize: 9, background: "#f5c842", color: "#000", borderRadius: 4, padding: "2px 6px", fontWeight: 700, letterSpacing: 1 }}>{broth.badge}</span>
                  )}
                  <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6, color: "#fff" }}>{broth.zh}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{broth.en}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>🌶 {broth.spicy}</div>
                </div>
              </div>

              {/* Combos (expanded) */}
              {selectedBroth === broth.id && (
                <div style={{ background: "#1a1a1a", padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, marginBottom: 10 }}>推荐搭配 · Recommended Combos</div>
                  {broth.combos.map((combo, i) => (
                    <div key={i} style={{ background: "#242424", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#f5c842" }}>{combo.zh}</div>
                          <div style={{ fontSize: 10, color: "#777", marginTop: 1 }}>{combo.en}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>{combo.items}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Section: 调料台 ──────────────────────────── */}
        <SectionTitle emoji="🥣" zh="调料台" en="Condiment Station" />

        {/* Tabs */}
        <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "0 16px 12px", scrollbarWidth: "none" }}>
          {SAUCE_CATEGORIES.map((cat, i) => (
            <button key={i} onClick={() => setActiveSauceTab(i)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: activeSauceTab === i ? "#c0392b" : "#1e1e1e",
                color: activeSauceTab === i ? "#fff" : "#888",
                transition: "all 0.2s",
              }}>
              {SAUCE_CATEGORIES[i].zh}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {SAUCE_CATEGORIES[activeSauceTab].items.map((sauce, i) => (
            <SauceCard key={i} item={sauce} />
          ))}
        </div>

        {/* ── Section: 菜品一览 ─────────────────────────── */}
        <SectionTitle emoji="📋" zh="菜品一览" en="All Ingredients" />

        {/* Category tabs */}
        <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "0 16px 14px", scrollbarWidth: "none" }}>
          {MENU.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: activeCategory === cat.id ? "#c0392b" : "#1e1e1e",
                color: activeCategory === cat.id ? "#fff" : "#888",
                transition: "all 0.2s",
              }}>
              {cat.emoji} {cat.zh}
            </button>
          ))}
        </div>

        {MENU.filter(c => c.id === activeCategory).map(cat => (
          <div key={cat.id} style={{ padding: "0 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {cat.items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* ── Growth Module ────────────────────────────── */}
        <SectionTitle emoji="✨" zh="互动专区" en="Connect With Us" />
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/menu/ygf/review" style={{
            display: "flex", alignItems: "center", gap: 14, background: "#1a1a1a",
            borderRadius: 14, padding: "16px", textDecoration: "none",
            border: "1px solid #2a2a2a",
          }}>
            <span style={{ fontSize: 28 }}>⭐</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f5c842" }}>Leave a Google Review</div>
              <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>帮我们写一条评价，非常感谢！</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#555", fontSize: 18 }}>›</span>
          </Link>
          <Link href="/menu/ygf/share" style={{
            display: "flex", alignItems: "center", gap: 14, background: "#1a1a1a",
            borderRadius: 14, padding: "16px", textDecoration: "none",
            border: "1px solid #2a2a2a",
          }}>
            <span style={{ fontSize: 28 }}>📸</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E1306C" }}>Share Your Bowl on Instagram</div>
              <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>Tag us and get featured 🔥</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#555", fontSize: 18 }}>›</span>
          </Link>
          <Link href="/menu/ygf/vip" style={{
            display: "flex", alignItems: "center", gap: 14, background: "#1a1a1a",
            borderRadius: 14, padding: "16px", textDecoration: "none",
            border: "1px solid #2a2a2a",
          }}>
            <span style={{ fontSize: 28 }}>💬</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#25D366" }}>Join VIP WhatsApp List</div>
              <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>早鸟优惠 · 新品抢先知</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#555", fontSize: 18 }}>›</span>
          </Link>
        </div>

        {/* ── Allergy Notice ───────────────────────────── */}
        <div style={{ margin: "28px 16px 0", background: "#1a1a1a", borderRadius: 14, padding: "16px", border: "1px solid #2a2a2a" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f5c842", marginBottom: 8, letterSpacing: 1 }}>⚠️ ALLERGY NOTICE 过敏源提示</div>
          <p style={{ fontSize: 10, color: "#777", lineHeight: 1.7, margin: 0 }}>
            Our menu contains or may come into contact with: <strong style={{ color: "#aaa" }}>Fish, Shellfish, Soy, Wheat/Gluten, Sesame, Egg, Milk, Peanuts</strong>.
            Cross-contact may occur. Please inform our staff of any allergies before ordering.
          </p>
          <p style={{ fontSize: 10, color: "#666", lineHeight: 1.7, margin: "8px 0 0" }}>
            本菜单含有或可能接触以下过敏源：鱼类、甲壳类、大豆、小麦/麸质、芝麻、鸡蛋、乳制品、花生。存在交叉污染风险，请提前告知工作人员。
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────
function SectionTitle({ emoji, zh, en }: { emoji: string; zh: string; en: string }) {
  return (
    <div style={{ padding: "28px 16px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#f0ede6" }}>{zh}</div>
        <div style={{ fontSize: 10, color: "#666", letterSpacing: 1, textTransform: "uppercase" }}>{en}</div>
      </div>
      <div style={{ flex: 1, height: 1, background: "#222", marginLeft: 8 }} />
    </div>
  );
}

function AllergenBadges({ allergens }: { allergens?: Allergen[] }) {
  if (!allergens?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
      {allergens.map(a => (
        <span key={a} style={{
          fontSize: 8, padding: "1px 4px", borderRadius: 3,
          background: ALLERGEN_COLOR[a] + "33",
          color: ALLERGEN_COLOR[a],
          fontWeight: 700, letterSpacing: 0.5,
        }}>{a}</span>
      ))}
    </div>
  );
}

function ItemCard({ item }: { item: MenuItem }) {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 12, overflow: "hidden", position: "relative" }}>
      {item.new && (
        <div style={{ position: "absolute", top: 6, right: 6, zIndex: 2, background: "#c0392b", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 4 }}>NEW</div>
      )}
      <div style={{ width: "100%", aspectRatio: "1", background: "#111", overflow: "hidden" }}>
        {item.img ? (
          <img src={item.img} alt={item.zh}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 24 }}>🍽</div>
        )}
      </div>
      <div style={{ padding: "8px 8px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f0ede6" }}>{item.zh}</div>
        <div style={{ fontSize: 9, color: "#666", marginTop: 2, lineHeight: 1.3 }}>{item.en}</div>
        <AllergenBadges allergens={item.allergens} />
      </div>
    </div>
  );
}

function SauceCard({ item }: { item: SauceItem }) {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ width: "100%", aspectRatio: "1", background: "#111", overflow: "hidden" }}>
        {item.img ? (
          <img src={item.img} alt={item.zh}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 22 }}>🥄</div>
        )}
      </div>
      <div style={{ padding: "7px 8px 9px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#f0ede6" }}>{item.zh}</div>
        <div style={{ fontSize: 9, color: "#666", marginTop: 1 }}>{item.en}</div>
        <AllergenBadges allergens={item.allergens} />
      </div>
    </div>
  );
}
