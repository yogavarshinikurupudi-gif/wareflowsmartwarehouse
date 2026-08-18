import type { Product, StockStatus } from '@/types';

export function available(p: Product): number {
  return Math.max(0, p.physical - p.reserved - p.damaged);
}

export function stockStatus(p: Product): StockStatus {
  const avail = available(p);
  if (avail <= 0) return 'Stockout';
  const projectedAfterDemand = avail + p.incoming - p.projectedDemand;
  if (avail < p.safetyStock * 0.5) return 'High Risk';
  if (projectedAfterDemand < p.safetyStock) return 'Watch';
  return 'Healthy';
}

export function stockoutRisk(p: Product): number {
  const avail = available(p);
  const cover = avail + p.incoming;
  if (cover <= 0) return 100;
  const ratio = p.projectedDemand / cover;
  return Math.min(100, Math.round(ratio * 60));
}
