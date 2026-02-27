// 北苑南家 Bei Yuan Tea & Boba - Complete Menu Data
// Updated: Feb 2026

export type TeaBase = 'B' | 'G' | 'O'; // Black / Green / Oolong

export interface MenuItem {
  id: string;
  nameEn: string;
  nameCn: string;
  price: number;
  priceL?: number;
  teaBases?: TeaBase[];
  note?: string;
  seasonal?: boolean;
  largeOnly?: boolean;
  caffeineF?: boolean;
  img?: string; // photo path e.g. /beiyuan-M-A-01.webp
}

export interface MenuSubCategory {
  id: string;
  nameEn: string;
  nameCn: string;
  price: number; // base price for all flavors in this sub
  items: { nameEn: string; nameCn: string; note?: string; seasonal?: boolean }[];
  note?: string;
}

export interface MenuCategory {
  id: string;
  nameEn: string;
  nameCn: string;
  type: 'items' | 'subcategories';
  items?: MenuItem[];
  subcategories?: MenuSubCategory[];
  customization?: Customization;
}

export interface Customization {
  sweetness?: boolean;
  ice?: boolean; // adjustable ice
  iceFixed?: boolean; // ice NOT adjustable
  topping?: boolean;
  size?: 'fixed' | 'S+L'; // fixed=1 size, S+L=small/large +$1
  teaBase?: boolean;
}

// ─────────────────────────────────────────────
// CATEGORY 1: Iced Flavored Tea 冰调味茶
// ─────────────────────────────────────────────
export const icedFlavoredTea: MenuCategory = {
  id: 'C-A',
  nameEn: 'Iced Flavored Tea',
  nameCn: '冰调味茶',
  type: 'items',
  customization: { sweetness: true, ice: true, topping: true, size: 'fixed', teaBase: true },
  items: [
    { id: 'C-A-01', nameEn: 'Bubble Tea', nameCn: '泡沫茶', price: 4.98, teaBases: ['B','G','O'] },
    { id: 'C-A-02', nameEn: 'Mango Tea', nameCn: '芒果茶', price: 5.98, teaBases: ['B','G','O'] },
    { id: 'C-A-03', nameEn: 'Passion Fruit Tea', nameCn: '百香茶', price: 5.98, teaBases: ['B','G','O'] },
    { id: 'C-A-04', nameEn: 'Peach Tea', nameCn: '水蜜桃茶', price: 5.98, teaBases: ['B','G','O'] },
    { id: 'C-A-05', nameEn: 'Rose Tea', nameCn: '玫瑰茶', price: 5.98, teaBases: ['B','G'] },
    { id: 'C-A-06', nameEn: 'Honey Tea', nameCn: '蜂蜜茶', price: 5.98, teaBases: ['B','G','O'] },
    { id: 'C-A-07', nameEn: 'Lychee Tea', nameCn: '荔枝茶', price: 5.98, teaBases: ['B','G','O'] },
    { id: 'C-A-08', nameEn: 'Royal Tea', nameCn: '伯爵茶', price: 5.98, teaBases: ['B','G'] },
    { id: 'C-A-12', nameEn: 'Yogurt Green Tea', nameCn: '多多绿茶', price: 5.98 },
    { id: 'C-A-13', nameEn: 'Chrysanthemum Tea', nameCn: '菊花茶', price: 5.98, caffeineF: true },
    { id: 'C-A-14a', nameEn: 'Osmanthus Oolong', nameCn: '桂花香乌龙', price: 6.98, note: '冰镇香型乌龙茶' },
    { id: 'C-A-14b', nameEn: 'White Peach Oolong', nameCn: '白桃香乌龙', price: 6.98, note: '冰镇香型乌龙茶' },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 2: Iced Flavored Milk Tea 冰调味奶茶
// ─────────────────────────────────────────────
export const icedMilkTea: MenuCategory = {
  id: 'C-B',
  nameEn: 'Iced Flavored Milk Tea',
  nameCn: '冰调味奶茶',
  type: 'items',
  customization: { sweetness: true, ice: true, topping: true, size: 'fixed', teaBase: true },
  items: [
    { id: 'C-B-03', nameEn: 'Tapioca Milk Tea', nameCn: '波霸奶茶', price: 5.50, teaBases: ['B','G','O'] },
    { id: 'C-B-04', nameEn: 'Milk Tea', nameCn: '奶茶', price: 5.50, teaBases: ['B','G','O'] },
    { id: 'C-B-06', nameEn: 'Honey Milk Tea', nameCn: '蜂蜜奶茶', price: 6.49, teaBases: ['B','G','O'] },
    { id: 'C-B-07', nameEn: 'Royal Milk Tea', nameCn: '皇家奶茶', price: 6.49, teaBases: ['B','G'] },
    { id: 'C-B-08', nameEn: 'Brown Sugar Tapioca Milk Tea', nameCn: '黑糖奶茶', price: 6.49, teaBases: ['B','O'] },
    { id: 'C-B-09', nameEn: 'Wintermelon Milk Tea', nameCn: '冬瓜奶茶', price: 6.49, teaBases: ['B','O'] },
    { id: 'C-B-10', nameEn: 'Thai Tea', nameCn: '泰式奶茶', price: 6.49 },
    { id: 'C-B-11', nameEn: 'Coconut Milk Tea', nameCn: '椰子奶茶', price: 6.49 },
    { id: 'C-B-12', nameEn: 'Almond Milk Tea', nameCn: '杏仁奶茶', price: 6.49 },
    { id: 'C-B-13', nameEn: 'Coffee Milk Tea', nameCn: '鸳鸯奶茶', price: 6.49 },
    { id: 'C-B-14', nameEn: 'Iced House Coffee', nameCn: '冰泡沫咖啡', price: 6.49 },
    // 北苑新中式奶茶系列 (Large Only)
    { id: 'C-B-15a', nameEn: 'Longan Jujube Milk Tea', nameCn: '桂圆红枣奶茶', price: 6.98, largeOnly: true, note: '北苑新中式' },
    { id: 'C-B-15b', nameEn: 'Black Sugar Ginger Jujube Milk Tea', nameCn: '黑糖姜枣奶茶', price: 6.98, largeOnly: true, note: '北苑新中式' },
    { id: 'C-B-15c', nameEn: 'Star Anise Milk Tea', nameCn: '八角奶茶', price: 6.98, largeOnly: true, note: '北苑新中式' },
    { id: 'C-B-15d', nameEn: 'Cinnamon Milk Tea', nameCn: '肉桂奶茶', price: 6.98, largeOnly: true, note: '北苑新中式' },
    // 北苑香型乌龙奶茶系列 (Large Only)
    { id: 'C-B-16a', nameEn: 'Osmanthus Oolong Milk Tea', nameCn: '桂花乌龙奶茶', price: 6.98, largeOnly: true, note: '北苑香型乌龙' },
    { id: 'C-B-16b', nameEn: 'Roasted Oolong Milk Tea', nameCn: '炭烧乌龙奶茶', price: 6.98, largeOnly: true, note: '北苑香型乌龙' },
    { id: 'C-B-16d', nameEn: 'Jin Jun Mei Milk Tea', nameCn: '金骏眉奶茶', price: 6.98, largeOnly: true, note: '北苑香型乌龙' },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 3: House Special Iced Drink 经典特调冰饮
// ─────────────────────────────────────────────
export const houseSpecialIced: MenuCategory = {
  id: 'C-C',
  nameEn: 'House Special Iced Drink',
  nameCn: '经典特调冰饮',
  type: 'subcategories',
  customization: { sweetness: true, iceFixed: true, topping: true, size: 'fixed' },
  subcategories: [
    {
      id: 'C-C-01',
      nameEn: 'Fresh Fruit Flavored Drink',
      nameCn: '果茶系列',
      price: 6.98,
      items: [
        { nameEn: 'Honey Lemon', nameCn: '蜂蜜柠檬' },
        { nameEn: 'Iced Fresh Lemon Green Tea', nameCn: '鲜绿柠檬茶' },
        { nameEn: 'Fresh Fruit Ice Tea', nameCn: '鲜果茶', seasonal: true },
        { nameEn: 'Watermelon Juice', nameCn: '西瓜汁', seasonal: true },
      ],
    },
    {
      id: 'C-C-02',
      nameEn: 'Coconut Flavored Drinks',
      nameCn: '生椰系列',
      price: 6.98,
      items: [
        { nameEn: 'Coconut Coffee', nameCn: '生椰咖啡' },
        { nameEn: 'Coconut Thai Tea', nameCn: '生椰泰式' },
        { nameEn: 'Coconut Latte', nameCn: '生椰拿铁茶' },
        { nameEn: 'Coconut Oolong', nameCn: '生椰炭烧乌龙' },
      ],
    },
    {
      id: 'C-C-03',
      nameEn: 'Flavored Milk Drink',
      nameCn: '沙奶系列',
      price: 6.98,
      items: [
        { nameEn: 'Taro Milk Drink', nameCn: '芋头沙奶', note: 'Caffeine Free' },
        { nameEn: 'Honey Dew Milk Drink', nameCn: '哈密瓜沙奶', note: 'Caffeine Free' },
        { nameEn: 'Strawberry Pudding', nameCn: '草莓布丁', note: 'Caffeine Free' },
        { nameEn: 'Brown Sugar Boba Fresh Milk', nameCn: '黑糖波霸鲜奶' },
      ],
    },
    {
      id: 'C-C-04',
      nameEn: 'Flavored Yogurt Drink',
      nameCn: '优格系列',
      price: 7.98,
      items: [
        { nameEn: 'Peach Yogurt Drink', nameCn: '水蜜桃优格' },
        { nameEn: 'Mango Yogurt Drink', nameCn: '芒果优格' },
        { nameEn: 'Strawberry Yogurt Drink', nameCn: '草莓优格' },
        { nameEn: 'Passion Fruit Yogurt Drink', nameCn: '百香优格' },
      ],
    },
    {
      id: 'C-C-05',
      nameEn: 'Matcha Flavored Drink',
      nameCn: '抹茶系列',
      price: 7.98,
      items: [
        { nameEn: 'Matcha Red Bean Latte', nameCn: '抹茶红豆拿铁' },
        { nameEn: 'Matcha Aloe Green Tea', nameCn: '抹茶鲜芦荟' },
        { nameEn: 'Matcha Ice Cream Milk Green Tea', nameCn: '抹茶冰淇淋奶绿' },
        { nameEn: 'Matcha Coffee', nameCn: '抹茶咖啡' },
      ],
    },
    {
      id: 'C-C-06',
      nameEn: 'Flavored Egg Honey Juice',
      nameCn: '蛋蜜汁系列',
      price: 7.98,
      items: [
        { nameEn: 'Passion Fruit Egg Honey Juice', nameCn: '百香蛋蜜汁' },
        { nameEn: 'Orange Egg Honey Juice', nameCn: '柳橙蛋蜜汁' },
        { nameEn: 'Peach Egg Honey Juice', nameCn: '水蜜桃蛋蜜汁' },
        { nameEn: 'Mango Egg Honey Juice', nameCn: '芒果蛋蜜汁' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 4: House Special Iced 经典特制冰品
// ─────────────────────────────────────────────
export const houseSpecialIcedFood: MenuCategory = {
  id: 'C-D',
  nameEn: 'House Special Iced',
  nameCn: '经典特制冰品',
  type: 'subcategories',
  customization: { sweetness: true, iceFixed: true, topping: true, size: 'fixed' },
  subcategories: [
    {
      id: 'C-D-01',
      nameEn: 'Flavored Jelly Ice',
      nameCn: '风味钻石冰',
      price: 6.98,
      note: 'Large Only',
      items: [
        { nameEn: 'Passion Fruit Jelly Ice', nameCn: '百香钻石冰' },
        { nameEn: 'Strawberry Jelly Ice', nameCn: '草莓钻石冰' },
        { nameEn: 'Mango Jelly Ice', nameCn: '芒果钻石冰' },
        { nameEn: 'Lychee Jelly Ice', nameCn: '荔枝钻石冰' },
      ],
    },
    {
      id: 'C-D-02',
      nameEn: 'Fruit Flavored Snow Ice',
      nameCn: '水果风味雪泥',
      price: 6.98,
      note: 'Large Only',
      items: [
        { nameEn: 'Strawberry Snow Ice', nameCn: '草莓雪泥' },
        { nameEn: 'Lychee Snow Ice', nameCn: '荔枝雪泥' },
        { nameEn: 'Mango Snow Ice', nameCn: '芒果雪泥' },
        { nameEn: 'Passion Fruit Snow Ice', nameCn: '百香雪泥' },
      ],
    },
    {
      id: 'C-D-03',
      nameEn: 'Milky Flavored Snow Ice',
      nameCn: '奶香风味雪泥',
      price: 6.98,
      note: 'Large Only',
      items: [
        { nameEn: 'Taro Snow Ice', nameCn: '芋头雪泥' },
        { nameEn: 'Honey Dew Snow Ice', nameCn: '哈密瓜雪泥' },
        { nameEn: 'Mocha Snow Ice', nameCn: '摩卡雪泥' },
        { nameEn: 'Milk Slush', nameCn: '风味冻奶' },
      ],
    },
    {
      id: 'C-D-04',
      nameEn: 'Flavored Shaved Ice',
      nameCn: '刨冰类',
      price: 6.98,
      note: 'One Size Only',
      items: [
        { nameEn: 'Red Bean Milk Shaved Ice', nameCn: '红豆牛奶刨冰' },
        { nameEn: 'Green Bean Milk Shaved Ice', nameCn: '绿豆牛奶刨冰' },
        { nameEn: 'Passion Fruit w/ Crystal Jelly Shaved Ice', nameCn: '水晶百香刨冰' },
        { nameEn: 'Strawberry Milk Shaved Ice', nameCn: '草莓牛奶刨冰' },
        { nameEn: 'Mango Shaved Ice', nameCn: '芒果刨冰', seasonal: true, note: '$7.98' },
        { nameEn: 'Iced Coconut Combination', nameCn: '椰香总汇圆仔冰', note: '$7.98' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 5: Hot Traditional/Flavored Tea 热传统/调味茶
// ─────────────────────────────────────────────
export const hotTea: MenuCategory = {
  id: 'H-A',
  nameEn: 'Hot Traditional / Flavored Tea',
  nameCn: '热传统/调味茶',
  type: 'items',
  customization: { sweetness: true, topping: true, size: 'S+L' },
  items: [
    { id: 'H-A-01', nameEn: 'Original Black / Green Tea', nameCn: '纯红/绿茶', price: 5.49, priceL: 6.49, teaBases: ['B','G'] },
    { id: 'H-A-02', nameEn: 'Royal Black Tea', nameCn: '伯爵红茶', price: 5.98, priceL: 6.98 },
    { id: 'H-A-03', nameEn: 'Rose Black Tea', nameCn: '玫瑰红茶', price: 5.98, priceL: 6.98 },
    { id: 'H-A-04', nameEn: 'Hibiscus Spice Tea', nameCn: '洛神蜜', price: 5.98, priceL: 6.98 },
    { id: 'H-A-05', nameEn: 'Perfume Fruit Tea', nameCn: '香水有毒', price: 5.98, priceL: 6.98, note: 'Green Tea 果味' },
    { id: 'H-A-06', nameEn: 'Grape Oolong', nameCn: '葡粒乌龙', price: 5.98, priceL: 6.98, note: 'Oolong 果味' },
    { id: 'H-A-07', nameEn: 'Fresh Fruit Tea', nameCn: '鲜果森林', price: 5.98, priceL: 6.98, note: 'Oolong 果味' },
    { id: 'H-A-08', nameEn: 'Dragon Well', nameCn: '龙井', price: 6.98, note: 'Green Tea 无糖' },
    { id: 'H-A-09', nameEn: 'Imperial Gyokuro Genmaicha', nameCn: '玄米茶', price: 6.98, note: 'Green Tea 无糖' },
    { id: 'H-A-10', nameEn: 'Tie Guan Yin', nameCn: '清香铁观音', price: 6.98, note: 'Oolong 无糖' },
    { id: 'H-A-11', nameEn: 'Jade Oolong', nameCn: '翡翠乌龙', price: 6.98, note: 'Oolong 无糖' },
    { id: 'H-A-12', nameEn: 'Da Hong Pao', nameCn: '大红袍', price: 6.98, note: 'Oolong 无糖' },
    { id: 'H-A-13', nameEn: 'Jin Jun Mei', nameCn: '金骏眉', price: 10.98, note: 'Black Tea 无糖' },
    { id: 'H-A-14', nameEn: 'Qimen Supreme', nameCn: '祁红', price: 9.98, note: 'Black Tea 无糖' },
    { id: 'H-A-15', nameEn: 'Yun Nan Golden Special', nameCn: '滇红', price: 10.98, note: 'Black Tea 无糖' },
    { id: 'H-A-16', nameEn: '6-Scented White Tip', nameCn: '6窨白毫', price: 12.98, note: 'Jasmine Tea 无糖' },
    { id: 'H-A-17', nameEn: "King's Tea 103", nameCn: '茶王 103', price: 6.98, note: 'Ginseng Oolong 无糖' },
    { id: 'H-A-18', nameEn: "King's Tea 109", nameCn: '茶王 109', price: 6.98, note: 'Ginseng Oolong 无糖' },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 6: Hot Flavored Milk Tea 热调味奶茶
// ─────────────────────────────────────────────
export const hotMilkTea: MenuCategory = {
  id: 'H-B',
  nameEn: 'Hot Flavored Milk Tea',
  nameCn: '热调味奶茶',
  type: 'items',
  customization: { sweetness: true, topping: true, size: 'S+L' },
  items: [
    { id: 'H-B-01', nameEn: 'Tapioca Milk Tea', nameCn: '波霸奶茶', price: 6.98, largeOnly: true, teaBases: ['B','G'] },
    { id: 'H-B-02', nameEn: 'Milk Tea', nameCn: '奶茶', price: 5.98, priceL: 6.98, teaBases: ['B','G'] },
    { id: 'H-B-04', nameEn: 'Royal Milk Tea', nameCn: '皇家奶茶/奶绿', price: 6.49, priceL: 7.49, teaBases: ['B','G'] },
    { id: 'H-B-05', nameEn: 'Thai Tea', nameCn: '泰式奶茶', price: 6.49, priceL: 7.49 },
    { id: 'H-B-06', nameEn: 'Almond Milk Tea', nameCn: '杏仁奶茶', price: 6.49, priceL: 7.49 },
    { id: 'H-B-07', nameEn: 'Hot Matcha', nameCn: '热抹茶', price: 6.49, priceL: 7.49 },
    { id: 'H-B-08', nameEn: 'Coffee Milk Tea', nameCn: '鸳鸯奶茶', price: 6.49, priceL: 7.49 },
    { id: 'H-B-09', nameEn: 'Rose Milk Tea', nameCn: '玫瑰奶茶', price: 6.49, priceL: 7.49 },
    { id: 'H-B-10', nameEn: 'Lavender Milk Tea', nameCn: '薰衣草奶茶', price: 6.49, priceL: 7.49 },
    { id: 'H-B-11', nameEn: 'Brown Sugar Milk Tea', nameCn: '黑糖奶茶', price: 6.49, priceL: 7.49 },
    { id: 'H-B-12', nameEn: 'Wintermelon Milk Tea', nameCn: '冬瓜奶茶', price: 6.49, priceL: 7.49 },
    { id: 'H-B-13', nameEn: 'Roasted Oolong Milk Tea', nameCn: '岩炭乌龙奶茶', price: 6.98, priceL: 7.98 },
    { id: 'H-B-14', nameEn: 'Longan Jujube Milk Tea', nameCn: '桂圆红枣奶茶', price: 6.98, priceL: 7.98 },
    { id: 'H-B-15', nameEn: 'Black Sugar Ginger Jujube Milk Tea', nameCn: '黑糖姜枣奶茶', price: 6.98, priceL: 7.98 },
    { id: 'H-B-16', nameEn: 'Star Anise Milk Tea', nameCn: '八角奶茶', price: 6.98, priceL: 7.98 },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 7: House Special Hot Drink 经典特调热饮
// ─────────────────────────────────────────────
export const houseSpecialHot: MenuCategory = {
  id: 'H-C',
  nameEn: 'House Special Hot Drink',
  nameCn: '经典特调热饮',
  type: 'subcategories',
  customization: { sweetness: true, topping: true, size: 'S+L' },
  subcategories: [
    {
      id: 'H-C-01',
      nameEn: 'Fruit Tea Series',
      nameCn: '果茶系列',
      price: 7.98,
      items: [
        { nameEn: 'Mixed Fruit Tea', nameCn: '综合水果茶' },
        { nameEn: 'Passion Fruit Black Tea', nameCn: '百香红茶' },
        { nameEn: 'Mango Black Tea', nameCn: '芒果红茶' },
        { nameEn: 'Honey Lemon', nameCn: '蜂蜜柠檬' },
        { nameEn: 'Fresh Lemon Green Tea', nameCn: '鲜绿柠檬茶' },
        { nameEn: 'Kumquat Lemon Tea', nameCn: '金桔柠檬茶' },
      ],
    },
    {
      id: 'H-C-02',
      nameEn: 'Wellness Series',
      nameCn: '养生系列',
      price: 7.98,
      items: [
        { nameEn: 'Honey Ginseng', nameCn: '蜂蜜人参' },
        { nameEn: 'Eight Treasure Chrysanthemum Tea', nameCn: '八宝菊花茶' },
        { nameEn: 'Boba Longan', nameCn: '波霸桂圆' },
        { nameEn: 'Longan Jujube', nameCn: '桂圆红枣' },
        { nameEn: 'Longan Ginseng Goji Berry', nameCn: '桂圆人参枸杞' },
        { nameEn: 'Ginger Tea', nameCn: '姜茶', note: 'Caffeine Free' },
        { nameEn: 'Chrysanthemum Tea', nameCn: '菊花茶', note: 'Caffeine Free' },
      ],
    },
    {
      id: 'H-C-03',
      nameEn: 'Milky Series',
      nameCn: '奶香系列',
      price: 5.98,
      items: [
        { nameEn: 'Taro Milk Drink', nameCn: '芋头沙奶' },
        { nameEn: 'Honey Dew Milk Drink', nameCn: '哈密瓜沙奶' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 8: Rice & Meal Set 精制套餐组合
// ─────────────────────────────────────────────
export const freeDrinkOptions = [
  { nameEn: 'Tapioca Milk Tea', nameCn: '波霸奶茶' },
  { nameEn: 'Tapioca Milk Green Tea', nameCn: '波霸奶绿' },
  { nameEn: 'Cold Brew White Peach Oolong', nameCn: '冰镇白桃乌龙' },
  { nameEn: 'Royal Milk Tea', nameCn: '皇家奶茶' },
  { nameEn: 'Passion Green Tea', nameCn: '百香绿茶' },
  { nameEn: 'Taro Milk Drink', nameCn: '芋头沙奶' },
  { nameEn: 'Coffee Milk Tea', nameCn: '鸳鸯奶茶' },
  { nameEn: 'Hot Milk Tea', nameCn: '热奶茶' },
  { nameEn: 'Hot Green Tea', nameCn: '热绿茶' },
  { nameEn: 'Hot Brown Sugar Milk Tea', nameCn: '热黑糖奶茶' },
  { nameEn: 'Hot Genmai Tea', nameCn: '热玄米茶' },
];

export const mealSet: MenuCategory = {
  id: 'M-A',
  nameEn: 'Rice & Meal Set',
  nameCn: '精制套餐组合',
  type: 'items',
  items: [
    { id: 'M-A-01', nameEn: 'Pork Stew Rice Meal Set', nameCn: '台式卤肉饭套餐', price: 18.95, img: '/beiyuan-M-A-01.webp' },
    { id: 'M-A-02', nameEn: 'Pickle Ground Pork Meal Set', nameCn: '台式瓜子肉燥套餐', price: 18.95 },
    { id: 'M-A-03', nameEn: 'Teriyaki Chicken Meal Set', nameCn: '照烧鸡排套餐', price: 18.95 },
    { id: 'M-A-04', nameEn: 'Pork w/ Preserved Dried Vegetables Meal Set', nameCn: '台式梅干扣肉套餐', price: 18.95 },
    { id: 'M-A-05', nameEn: 'Beef Bowl', nameCn: '牛丼套餐', price: 18.95, img: '/beiyuan-M-A-05.webp' },
    { id: 'M-A-06', nameEn: 'Teriyaki Eel Meal Set', nameCn: '鳗鱼套餐', price: 24.95, img: '/beiyuan-M-A-06.webp' },
    { id: 'M-A-07', nameEn: 'Curry Chicken Meal Set', nameCn: '咖喱鸡排套餐', price: 18.95, img: '/beiyuan-M-A-curry-chicken.webp' },
    { id: 'M-A-08', nameEn: 'Beef Stew Rice Meal Set', nameCn: '台式牛肉饭套餐', price: 18.95 },
    { id: 'M-A-09', nameEn: 'Spicy Tonkotsu Ramen', nameCn: '辣味豚骨拉面', price: 19.95, note: '辣度可选', img: '/beiyuan-M-A-09.webp' },
    { id: 'M-A-10', nameEn: "Pu-Erh Flavored Beef Stew Noodle", nameCn: '台式普洱牛肉面', price: 19.95 },
    { id: 'M-A-11', nameEn: 'Meat Balls with Bean Noodle', nameCn: '贡丸冬粉汤', price: 19.95, img: '/beiyuan-M-A-11.webp' },
    { id: 'M-A-12', nameEn: 'Beef Brisket in Clear Broth', nameCn: '清汤牛肉面', price: 19.95 },
    { id: 'M-A-13', nameEn: 'Crispy Pork Chop Meal Set', nameCn: '香酥排骨套餐', price: 15.99, note: '含套餐附赠饮料 · Includes free drink' },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 9: Entree Dishes 精制主餐单碟
// ─────────────────────────────────────────────
export const entreeDishes: MenuCategory = {
  id: 'M-B',
  nameEn: 'Entree Dishes',
  nameCn: '精制主餐单碟',
  type: 'items',
  items: [
    { id: 'M-B-01', nameEn: 'Spiced Pork Knuckles', nameCn: '台式烧猪脚', price: 13.98 },
    { id: 'M-B-02', nameEn: 'Spiced Pork Chop', nameCn: '香酥炸排骨', price: 11.98 },
    { id: 'M-B-03', nameEn: 'Braised Pork Chop', nameCn: '卤排骨', price: 11.98 },
    { id: 'M-B-04', nameEn: 'Marinated Chicken', nameCn: '香酥鸡排', price: 11.98 },
    { id: 'M-B-08', nameEn: 'Fish Fillet', nameCn: '台式炸鱼排', price: 11.98 },
    { id: 'M-B-11', nameEn: 'Spiced Pepper Chicken Chop', nameCn: '椒麻鸡排', price: 11.98 },
    { id: 'M-B-12', nameEn: 'Beef Short Ribs', nameCn: '香煎牛小排', price: 15.98, note: '咸甜', img: '/beiyuan-M-A-beef-ribs.webp' },
    { id: 'M-B-13', nameEn: 'Taiwanese Braised Beef', nameCn: '台式红烧牛肉', price: 11.98 },
    { id: 'M-B-18', nameEn: 'Braised Chicken', nameCn: '黄焖鸡', price: 11.98 },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 10: Noodles & Noodle Soups 精致主食面点
// ─────────────────────────────────────────────
export const noodles: MenuCategory = {
  id: 'M-C',
  nameEn: 'Noodles & Noodle Soups',
  nameCn: '精致主食面点',
  type: 'items',
  items: [
    { id: 'M-C-01', nameEn: 'Instant Noodle with Egg', nameCn: '台式泡面加蛋', price: 8.98, img: '/beiyuan-M-C-instant-noodle-egg.webp', img: '/beiyuan-M-C-instant-noodle-egg.webp' },
    { id: 'M-C-02', nameEn: 'Instant Beef Noodle with Ham and Egg', nameCn: '广式公仔泡面', img: '/beiyuan-M-C-instant-noodle-ham.webp', img: '/beiyuan-M-C-instant-noodle-ham.webp', price: 8.98 },
    { id: 'M-C-03', nameEn: 'Stir Fried Instant Noodle with Sausage', nameCn: '金门炒泡面', img: '/beiyuan-M-C-stir-fried-noodle.webp', price: 17.98 },
    { id: 'M-C-04', nameEn: 'Sausage Fried Rice', nameCn: '台式香肠炒饭', price: 17.98 },
    { id: 'M-C-05', nameEn: 'House Noodle with Deli Plate', nameCn: '阳春肉燥汤面加拼盘', price: 16.98 },
    { id: 'M-C-06', nameEn: 'Rice Noodle with Deli Plate', nameCn: '阳春肉燥汤面米粉加拼盘', price: 16.98 },
    { id: 'M-C-07', nameEn: 'Ja-Jang Noodle', nameCn: '廟口炸酱面', price: 16.98, img: '/beiyuan-M-C-jajang.webp', note: '微甜' },
    { id: 'M-C-08', nameEn: "Pu-Erh Flavored Beef Stew Noodle", nameCn: '台式普洱牛肉面', price: 16.98 },
    { id: 'M-C-09', nameEn: 'Beef Soup with Dumplings', nameCn: '牛肉汤水饺', price: 18.9, img: '/beiyuan-M-C-beef-dumpling.webp'8 },
    { id: 'M-C-10', nameEn: 'Wonton Noodle Soup', nameCn: '馄饨面', price: 16.98, img: '/beiyuan-M-C-wonton-noodle.webp' },
    { id: 'M-C-11', nameEn: 'Pork Dumplings', nameCn: '猪肉水饺', price: 16.98 },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 11: Snacks 精致茶点
// ─────────────────────────────────────────────
export const snacks: MenuCategory = {
  id: 'S-A',
  nameEn: 'Snacks',
  nameCn: '精致茶点',
  type: 'items',
  items: [
    { id: 'S01', nameEn: 'Tea Boiled Eggs (2 pcs)', nameCn: '茶叶蛋', price: 3.98, img: '/beiyuan-S-A-tea-egg.webp' },
    { id: 'S02', nameEn: 'Fried Wontons', nameCn: '炸馄饨', price: 7.98 },
    { id: 'S03', nameEn: 'Sweet Garlic Chicken Wings', nameCn: '蒜香蜜汁鸡翅', price: 9.98, note: '可选辣度' },
    { id: 'S04', nameEn: 'Fried Spicy Chicken Wings', nameCn: '炸鸡翅', price: 9.49 },
    { id: 'S05', nameEn: 'Fried Tofu', nameCn: '炸豆腐', price: 7.98 },
    { id: 'S06', nameEn: 'Popcorn Chicken', nameCn: '盐酥鸡', price: 9.49 },
    { id: 'S08', nameEn: 'Fried Squid Balls', nameCn: '炸花枝丸', price: 7.98, img: '/beiyuan-S-A-squid-balls.webp' },
    { id: 'S09', nameEn: 'Takoyaki (Octopus Balls)', nameCn: '章鱼烧', price: 9.49 },
    { id: 'S10', nameEn: 'Spicy Wontons', nameCn: '红油抄手', price: 8.49, img: '/beiyuan-S-A-spicy-wonton.webp' },
    { id: 'S11', nameEn: 'Taiwan Bok Choy / Cabbage', nameCn: '烫青菜', price: 7.98 },
    { id: 'S12', nameEn: 'Green Onion Pancake', nameCn: '葱油饼', price: 7.98, note: '可选加蛋', img: '/beiyuan-S-A-scallion-egg-pancake.webp' },
    { id: 'S13', nameEn: 'Night Market Sausage (3 sticks)', nameCn: '夜市烤香肠（3条）', price: 9.98 },
    { id: 'S14', nameEn: 'Taiwanese Sausages', nameCn: '台式烤香肠', price: 9.98 },
    { id: 'S15', nameEn: 'Beef Wrap', nameCn: '牛肉卷', price: 9.98 },
    { id: 'S18', nameEn: 'Salt & Pepper Squid (400g)', nameCn: '椒盐鱿鱼', price: 10.98 },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 12: Dessert 精致甜点
// ─────────────────────────────────────────────
export const dessert: MenuCategory = {
  id: 'S-B',
  nameEn: 'Dessert',
  nameCn: '精致甜点',
  type: 'items',
  items: [
    { id: 'S-B-01', nameEn: 'Plain Butter Toast', nameCn: '奶油厚片', price: 4.98 },
    { id: 'S-B-02', nameEn: 'Peanut Butter / Strawberry / Condensed Milk Toast', nameCn: '花生/草莓/炼奶吐司', price: 5.98 },
    { id: 'S-B-03', nameEn: 'Sweet Butter Toast', nameCn: '奶油奶酥厚片', price: 5.98 },
    { id: 'S-B-04', nameEn: 'Plum Sweet Potato Fries', nameCn: '梅香地瓜条', price: 8.98, img: '/beiyuan-S-A-sweet-potato.webp' },
    { id: 'S-B-05', nameEn: 'Fried Taro Balls', nameCn: '台式炸芋头丸', price: 8.98 },
    { id: 'S-B-06', nameEn: 'Hot Grass Jelly', nameCn: '烧仙草', price: 7.98 },
    { id: 'S-B-07', nameEn: 'Red Bean Soup w/ Rice Balls', nameCn: '红豆汤圆', price: 7.98 },
    { id: 'S-B-08', nameEn: 'Red Bean Soup w/ Taro Balls', nameCn: '红豆芋圆', price: 7.98 },
    { id: 'S-B-09', nameEn: 'Taro Soup w/ Taro Balls', nameCn: '芋圆红豆烧', price: 7.98 },
    { id: 'S-B-10', nameEn: 'Brown Sugar Sticky Rice Cake (12 pcs)', nameCn: '红糖糍粑', price: 8.98, note: '花生粉或黄豆粉，含过敏源' },
    { id: 'S-B-11', nameEn: 'Honey Osmanthus Jelly (6 pcs)', nameCn: '蜂蜜桂花糕', price: 7.98 },
  ],
};

// ─────────────────────────────────────────────
// CATEGORY 13: Topping 饮料Topping
// ─────────────────────────────────────────────
export const toppings = [
  { id: 'T-01', nameEn: 'Boba / Tapioca', nameCn: '波霸/珍珠', price: 0.75 },
  { id: 'T-02', nameEn: 'Egg Pudding', nameCn: '鸡蛋布丁', price: 1.00 },
  { id: 'T-03', nameEn: 'Red Beans', nameCn: '红豆', price: 1.00 },
  { id: 'T-04', nameEn: 'Green Beans', nameCn: '绿豆', price: 1.00 },
  { id: 'T-06', nameEn: 'Oat', nameCn: '燕麦', price: 1.00 },
  { id: 'T-07', nameEn: 'Purple Rice', nameCn: '紫米', price: 1.00 },
  { id: 'T-10', nameEn: 'Vanilla Ice Cream', nameCn: '香草冰淇淋', price: 1.00 },
  { id: 'T-11', nameEn: 'Matcha Ice Cream', nameCn: '抹茶冰淇淋', price: 1.50 },
  { id: 'T-12', nameEn: 'Mixed Jelly', nameCn: '综合果冻', price: 0.75 },
  { id: 'T-13', nameEn: 'Cheese Milk Cap', nameCn: '芝士奶盖', price: 1.50 },
  { id: 'T-14', nameEn: 'Matcha Milk Cap', nameCn: '抹茶奶盖', price: 1.50 },
  { id: 'T-15', nameEn: 'Aloe', nameCn: '芦荟', price: 0.75 },
  { id: 'T-16', nameEn: 'Aiyu Jelly', nameCn: '爱玉', price: 0.75 },
  { id: 'T-17', nameEn: 'Grass Jelly', nameCn: '仙草', price: 0.75 },
  { id: 'T-19', nameEn: 'Lychee Jelly', nameCn: '荔枝蒟蒻', price: 1.00 },
  { id: 'T-20', nameEn: 'Mocha Jelly', nameCn: '摩卡蒟蒻', price: 1.00 },
  { id: 'T-21', nameEn: 'Rice Balls', nameCn: '汤圆', price: 1.00 },
  { id: 'T-22', nameEn: 'Taro Balls', nameCn: '芋圆', price: 2.00 },
];

// ─────────────────────────────────────────────
// ALL CATEGORIES (for Tab navigation)
// ─────────────────────────────────────────────
export const allCategories = [
  icedFlavoredTea,
  icedMilkTea,
  houseSpecialIced,
  houseSpecialIcedFood,
  hotTea,
  hotMilkTea,
  houseSpecialHot,
  mealSet,
  entreeDishes,
  noodles,
  snacks,
  dessert,
];
