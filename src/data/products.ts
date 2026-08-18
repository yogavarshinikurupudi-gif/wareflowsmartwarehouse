import type { Product } from '@/types';

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

const CATALOG: Array<[string, string]> = [
  ['Wireless Headphones', 'Electronics'],
  ['Bluetooth Speaker', 'Electronics'],
  ['USB-C Cable 2m', 'Accessories'],
  ['Mechanical Keyboard', 'Electronics'],
  ['Ergonomic Mouse', 'Electronics'],
  ['Laptop Stand', 'Accessories'],
  ['Webcam 1080p', 'Electronics'],
  ['Desk Lamp LED', 'Home'],
  ['Notebook A5', 'Stationery'],
  ['Gel Pen Pack', 'Stationery'],
  ['Water Bottle 1L', 'Lifestyle'],
  ['Travel Backpack', 'Lifestyle'],
  ['Phone Case', 'Accessories'],
  ['Screen Protector', 'Accessories'],
  ['Power Bank 20k', 'Electronics'],
  ['Wireless Charger', 'Electronics'],
  ['Smart Watch', 'Electronics'],
  ['Fitness Band', 'Electronics'],
  ['Coffee Mug', 'Home'],
  ['Thermos Flask', 'Home'],
  ['Yoga Mat', 'Lifestyle'],
  ['Resistance Bands', 'Lifestyle'],
  ['Running Shoes', 'Apparel'],
  ['Cotton T-Shirt', 'Apparel'],
  ['Hooded Sweatshirt', 'Apparel'],
  ['Baseball Cap', 'Apparel'],
  ['Sunglasses', 'Accessories'],
  ['Leather Wallet', 'Accessories'],
  ['Desk Organizer', 'Home'],
  ['Cable Clips', 'Accessories'],
  ['HDMI Cable', 'Accessories'],
  ['Monitor Arm', 'Accessories'],
  ['Standing Desk Mat', 'Home'],
  ['Noise Cancel Earbuds', 'Electronics'],
  ['Portable SSD 1TB', 'Electronics'],
  ['SD Card 256GB', 'Electronics'],
  ['Gaming Mousepad', 'Accessories'],
  ['Laptop Sleeve', 'Accessories'],
  ['Wireless Router', 'Electronics'],
  ['Smart Bulb', 'Home'],
  ['Air Purifier', 'Home'],
  ['Electric Kettle', 'Home'],
  ['Blender Pro', 'Home'],
  ['Toaster 2-Slice', 'Home'],
  ['Vacuum Cleaner', 'Home'],
  ['Desk Fan', 'Home'],
  ['Umbrella Compact', 'Lifestyle'],
  ['Insulated Lunchbox', 'Lifestyle'],
  ['Reusable Straws', 'Lifestyle'],
  ['Plant Pot Ceramic', 'Home'],
];

function seeded(i: number) {
  const x = Math.sin(i * 99.13) * 10000;
  return x - Math.floor(x);
}

export const PRODUCTS: Product[] = CATALOG.map(([name, category], i) => {
  const r = seeded(i + 1);
  const physical = 20 + Math.floor(r * 260);
  const reserved = Math.floor(physical * (0.1 + seeded(i + 2) * 0.35));
  const damaged = Math.floor(seeded(i + 3) * 6);
  const safetyStock = 25 + Math.floor(seeded(i + 4) * 45);
  const projectedDemand = 15 + Math.floor(seeded(i + 5) * 120);
  const incoming = seeded(i + 6) > 0.55 ? 20 + Math.floor(seeded(i + 7) * 90) : 0;
  return {
    sku: `SKU-${100 + i}`,
    name,
    category,
    zone: ZONES[i % ZONES.length],
    physical,
    reserved,
    damaged,
    incoming,
    projectedDemand,
    safetyStock,
  };
});

// Hand-tuned hero SKU used across the ORD-204 scenario: only 7 available.
const hero = PRODUCTS.find((p) => p.sku === 'SKU-102');
if (hero) {
  hero.name = 'USB-C Cable 2m';
  hero.zone = 'Zone B';
  hero.physical = 34;
  hero.reserved = 27;
  hero.damaged = 0;
  hero.incoming = 40;
  hero.projectedDemand = 96;
  hero.safetyStock = 40;
}

export function findProduct(sku: string): Product | undefined {
  return PRODUCTS.find((p) => p.sku === sku);
}
