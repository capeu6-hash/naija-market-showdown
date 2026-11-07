export type GogoProduct = {
  slug: string;
  name: string;
  category: "Phones" | "Laptops";
  price: number;
  oldPrice: number;
  stock: number;
  rating: number;
  image: string;
  description: string;
};

const phones: Array<[string, number]> = [
  ["iPhone 16 Pro Max 256GB", 1950000], ["iPhone 16 Pro 256GB", 1650000],
  ["iPhone 15 Pro Max 256GB", 1550000], ["iPhone 15 128GB", 980000],
  ["iPhone 14 Pro Max 256GB", 1250000], ["Samsung Galaxy S25 Ultra 512GB", 1450000],
  ["Samsung Galaxy S24 Ultra", 1250000], ["Samsung Galaxy S24", 850000],
  ["Samsung Galaxy A55", 520000], ["Samsung Galaxy A35", 380000],
  ["Samsung Galaxy A15", 220000], ["Google Pixel 9 Pro", 1100000],
  ["Google Pixel 8 Pro", 850000], ["OnePlus 12", 980000],
  ["Xiaomi Redmi Note 13 Pro", 420000], ["Xiaomi Redmi Note 13", 280000],
  ["Xiaomi Redmi 13C", 180000], ["Tecno Camon 30 Pro", 350000],
  ["Tecno Spark 20", 180000], ["Infinix Note 40 Pro", 320000],
  ["Infinix Hot 40", 165000], ["Infinix Smart 8", 120000],
  ["Itel P55", 110000], ["Nokia G60", 240000],
  ["Huawei Nova 12", 480000], ["Oppo Reno 11", 450000],
  ["Vivo V30", 480000], ["Realme C55", 210000],
  ["Honor X9b", 380000], ["Motorola G84", 300000],
];

const laptops: Array<[string, number]> = [
  ["MacBook Air M3 13-inch 8GB/256GB", 1650000], ["MacBook Air M2 13-inch", 1350000],
  ["MacBook Pro M3 14-inch", 2450000], ["MacBook Pro M2 13-inch", 1950000],
  ["HP Pavilion 15 Core i5 16GB/512GB", 850000], ["HP EliteBook 840 G9 i7", 1250000],
  ["HP ProBook 450 G10 i5", 780000], ["HP 250 G9 i3", 480000],
  ["Dell XPS 13 i7 16GB/512GB", 1450000], ["Dell Inspiron 15 i5", 750000],
  ["Dell Latitude 5540 i7", 1150000], ["Dell Vostro 3520 i3", 450000],
  ["Lenovo IdeaPad Slim 3 i5", 680000], ["Lenovo ThinkPad X1 Carbon i7", 1550000],
  ["Lenovo Legion 5 RTX 4060", 1850000], ["Lenovo Yoga 7 i7", 1250000],
  ["Asus VivoBook 15 i5", 720000], ["Asus ZenBook 14 i7", 1350000],
  ["Asus ROG Strix G16 RTX 4060", 1950000], ["Asus TUF Gaming F15", 1450000],
  ["Acer Aspire 5 i5", 650000], ["Acer Swift Go 14 i7", 1150000],
  ["Acer Nitro 5 RTX 3050", 1250000], ["MSI Modern 15 i5", 680000],
  ["MSI Katana 15 RTX 4060", 1650000], ["Microsoft Surface Laptop 5 i5", 1250000],
  ["Microsoft Surface Pro 9 i5", 1450000], ["Toshiba Dynabook Tecra i5", 750000],
  ["Samsung Galaxy Book 4 i5", 950000], ["Apple MacBook Air M1", 950000],
];

export function productSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeProduct(name: string, price: number, category: GogoProduct["category"], index: number): GogoProduct {
  const slug = productSlug(name);
  const noun = category === "Phones" ? "smartphone" : "laptop";
  return {
    slug,
    name,
    category,
    price,
    oldPrice: Math.round((price * 1.1) / 1000) * 1000,
    stock: 10 + (index % 16),
    rating: Math.min(5, 4.5 + (index % 6) * 0.1),
    image: `/products/gogo/${slug}.jpg`,
    description: `Shop the genuine ${name} from ShopArena NG, carefully sourced from GoGo Gadget and checked before dispatch. This ${noun} delivers dependable everyday performance, premium value and the peace of mind you deserve. Order today for fast Lagos delivery, secure bank-transfer payment and friendly WhatsApp support.`,
  };
}

export const GOGO_CATALOG: GogoProduct[] = [
  ...phones.map(([name, price], i) => makeProduct(name, price, "Phones", i)),
  ...laptops.map(([name, price], i) => makeProduct(name, price, "Laptops", i + phones.length)),
];
