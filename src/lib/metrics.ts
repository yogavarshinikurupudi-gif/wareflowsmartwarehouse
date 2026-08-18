import type { Order, Product, Exception } from '@/types';
import { available, stockStatus } from '@/lib/inventory';

export function dashboardMetrics(
  orders: Order[],
  products: Product[],
  exceptions: Exception[]
) {
  const activeOrders = orders.filter((o) => o.stage !== 'Dispatch').length;
  const criticalOrders = orders.filter(
    (o) => o.priority === 'Critical' && o.stage !== 'Dispatch'
  ).length;
  const atRiskInventory = products.filter((p) => {
    const s = stockStatus(p);
    return s === 'High Risk' || s === 'Stockout';
  }).length;
  const readyToDispatch = orders.filter(
    (o) => o.stage === 'QC' || o.stage === 'Dispatch'
  ).length;
  const openExceptions = exceptions.filter((e) => e.status !== 'Resolved').length;

  const fulfillable = orders.filter((o) =>
    o.items.every((it) => {
      const p = products.find((x) => x.sku === it.sku);
      return p ? available(p) >= it.qty : false;
    })
  ).length;
  const fulfillmentRate = orders.length
    ? Math.round((fulfillable / orders.length) * 100)
    : 0;

  return {
    activeOrders,
    criticalOrders,
    atRiskInventory,
    readyToDispatch,
    openExceptions,
    fulfillmentRate,
  };
}

export function currency(n: number): string {
  return `$${n.toLocaleString()}`;
}

export function formatDeadline(mins: number): string {
  if (mins <= 0) return 'Overdue';
  if (mins < 60) return `${mins}m left`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m left` : `${h}h left`;
}
