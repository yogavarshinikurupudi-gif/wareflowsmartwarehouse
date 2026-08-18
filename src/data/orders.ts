import type { Order, Priority, CustomerTier, OrderStage } from '@/types';
import { PRODUCTS } from '@/data/products';

const CUSTOMERS: Array<[string, CustomerTier]> = [
  ['Northwind Traders', 'Premium'],
  ['Contoso Retail', 'Premium'],
  ['Fabrikam Inc', 'Standard'],
  ['Adventure Works', 'Standard'],
  ['Tailspin Toys', 'New'],
  ['Wide World Importers', 'Premium'],
  ['Proseware Group', 'Standard'],
  ['Litware Labs', 'New'],
  ['Fourth Coffee', 'Standard'],
  ['Graphic Design Co', 'New'],
  ['Blue Yonder Air', 'Premium'],
  ['Coho Vineyard', 'Standard'],
];

const STAGES: OrderStage[] = ['Priority', 'Inventory', 'Allocation', 'Picking', 'Packing', 'QC'];

function seeded(i: number) {
  const x = Math.sin(i * 51.77) * 10000;
  return x - Math.floor(x);
}

function priorityFromScore(score: number): Priority {
  if (score >= 90) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

function ts(minsAgo: number): string {
  const d = new Date(Date.now() - minsAgo * 60000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildTimeline(stage: OrderStage, createdMinsAgo: number): Order['timeline'] {
  const all: Array<[OrderStage, string]> = [
    ['Created', 'Order received'],
    ['Priority', 'Priority scored'],
    ['Inventory', 'Inventory checked'],
    ['Allocation', 'Stock allocated'],
    ['Picking', 'Assigned to picker'],
    ['Packing', 'Packed'],
    ['QC', 'Quality checked'],
    ['Dispatch', 'Dispatched'],
  ];
  const idx = all.findIndex(([s]) => s === stage);
  return all.slice(0, idx + 1).map(([s, label], i) => ({
    stage: s,
    label,
    time: ts(createdMinsAgo - i * 6),
  }));
}

function generatedOrders(): Order[] {
  const list: Order[] = [];
  for (let i = 0; i < 30; i++) {
    const r = seeded(i + 10);
    const [customer, tier] = CUSTOMERS[i % CUSTOMERS.length];
    const tierBoost = tier === 'Premium' ? 20 : tier === 'Standard' ? 8 : 0;
    const value = 200 + Math.floor(seeded(i + 3) * 9000);
    const score = Math.min(
      98,
      Math.max(20, Math.round(30 + r * 55 + tierBoost + (value > 6000 ? 8 : 0)))
    );
    const itemCount = 1 + Math.floor(seeded(i + 5) * 3);
    const items = Array.from({ length: itemCount }).map((_, k) => {
      const p = PRODUCTS[(i * 3 + k + 5) % PRODUCTS.length];
      return { sku: p.sku, name: p.name, qty: 1 + Math.floor(seeded(i + k + 7) * 5) };
    });
    const stage = STAGES[Math.floor(seeded(i + 8) * STAGES.length)];
    const createdMinsAgo = 20 + Math.floor(seeded(i + 9) * 300);
    const deadlineMins = 45 + Math.floor(seeded(i + 11) * 480);
    list.push({
      id: `ORD-${210 + i}`,
      customer,
      tier,
      value,
      priority: priorityFromScore(score),
      priorityScore: score,
      deadlineMins,
      items,
      stage,
      timeline: buildTimeline(stage, createdMinsAgo),
      flagged: seeded(i + 12) > 0.82,
    });
  }
  return list;
}

const HERO_ORDERS: Order[] = [
  {
    id: 'ORD-204',
    customer: 'Northwind Traders',
    tier: 'Premium',
    value: 8450,
    priority: 'Critical',
    priorityScore: 96,
    deadlineMins: 90,
    items: [{ sku: 'SKU-102', name: 'USB-C Cable 2m', qty: 10 }],
    stage: 'Inventory',
    flagged: true,
    timeline: buildTimeline('Inventory', 40),
  },
  {
    id: 'ORD-205',
    customer: 'Contoso Retail',
    tier: 'Premium',
    value: 5200,
    priority: 'High',
    priorityScore: 84,
    deadlineMins: 150,
    items: [
      { sku: 'SKU-102', name: 'USB-C Cable 2m', qty: 6 },
      { sku: 'SKU-104', name: 'Mechanical Keyboard', qty: 2 },
    ],
    stage: 'Allocation',
    timeline: buildTimeline('Allocation', 55),
  },
  {
    id: 'ORD-201',
    customer: 'Blue Yonder Air',
    tier: 'Premium',
    value: 12300,
    priority: 'Critical',
    priorityScore: 93,
    deadlineMins: 60,
    items: [
      { sku: 'SKU-116', name: 'Wireless Charger', qty: 4 },
      { sku: 'SKU-100', name: 'Wireless Headphones', qty: 3 },
    ],
    stage: 'Packing',
    assignedPicker: 'Meera Nair',
    timeline: buildTimeline('Packing', 90),
  },
  {
    id: 'ORD-202',
    customer: 'Wide World Importers',
    tier: 'Premium',
    value: 6700,
    priority: 'High',
    priorityScore: 81,
    deadlineMins: 200,
    items: [{ sku: 'SKU-134', name: 'Noise Cancel Earbuds', qty: 5 }],
    stage: 'QC',
    assignedPicker: 'Arun Kapoor',
    timeline: buildTimeline('QC', 120),
  },
  {
    id: 'ORD-203',
    customer: 'Fabrikam Inc',
    tier: 'Standard',
    value: 3400,
    priority: 'Medium',
    priorityScore: 62,
    deadlineMins: 320,
    items: [{ sku: 'SKU-108', name: 'Desk Lamp LED', qty: 3 }],
    stage: 'Picking',
    assignedPicker: 'Sofia Reyes',
    timeline: buildTimeline('Picking', 70),
  },
];

export const INITIAL_ORDERS: Order[] = [...HERO_ORDERS, ...generatedOrders()];
