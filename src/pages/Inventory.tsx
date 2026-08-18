import { useMemo, useState } from 'react';
import { Search, PackagePlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StockBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWarehouse } from '@/store/WarehouseContext';
import { available, stockStatus, stockoutRisk } from '@/lib/inventory';
import type { StockStatus } from '@/types';

const FILTERS: Array<StockStatus | 'All'> = ['All', 'Healthy', 'Watch', 'High Risk', 'Stockout'];

export function Inventory() {
  const { products, replenish } = useWarehouse();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StockStatus | 'All'>('All');

  const rows = useMemo(() => {
    return products
      .map((p) => ({ p, status: stockStatus(p), avail: available(p), risk: stockoutRisk(p) }))
      .filter((r) => (filter === 'All' ? true : r.status === filter))
      .filter(
        (r) =>
          r.p.sku.toLowerCase().includes(query.toLowerCase()) ||
          r.p.name.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.risk - a.risk);
  }, [products, query, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Healthy: 0, Watch: 0, 'High Risk': 0, Stockout: 0 };
    products.forEach((p) => (c[stockStatus(p)] += 1));
    return c;
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryTile label="Healthy" value={counts.Healthy} tone="green" />
        <SummaryTile label="Watch" value={counts.Watch} tone="yellow" />
        <SummaryTile label="High Risk" value={counts['High Risk']} tone="orange" />
        <SummaryTile label="Stockout" value={counts.Stockout} tone="red" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU or product"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                filter === f ? 'bg-ink text-white' : 'bg-white text-muted ring-1 ring-slate-200 hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Product</th>
              <th className="px-3 py-3">Physical</th>
              <th className="px-3 py-3">Reserved</th>
              <th className="px-3 py-3">Damaged</th>
              <th className="px-3 py-3">Available</th>
              <th className="px-3 py-3">Incoming</th>
              <th className="px-3 py-3 w-40">Stockout risk</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ p, status, avail, risk }) => (
              <tr key={p.sku} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-3">
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-muted">{p.sku} · {p.zone}</p>
                </td>
                <td className="px-3 py-3 text-ink">{p.physical}</td>
                <td className="px-3 py-3 text-muted">{p.reserved}</td>
                <td className="px-3 py-3 text-muted">{p.damaged}</td>
                <td className="px-3 py-3 font-bold text-ink">{avail}</td>
                <td className="px-3 py-3 text-brand-blue">{p.incoming || '—'}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={risk}
                      tone={risk >= 70 ? 'red' : risk >= 45 ? 'orange' : 'green'}
                      className="w-20"
                    />
                    <span className="text-xs font-semibold text-muted">{risk}%</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <StockBadge status={status} />
                </td>
                <td className="px-5 py-3 text-right">
                  {(status === 'High Risk' || status === 'Stockout' || status === 'Watch') && (
                    <button
                      onClick={() => replenish(p.sku, Math.max(40, p.safetyStock))}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-blue-100"
                    >
                      <PackagePlus className="h-3.5 w-3.5" /> Replenish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted">No products match your search.</p>
        )}
      </Card>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: 'green' | 'yellow' | 'orange' | 'red' }) {
  const map = {
    green: 'text-brand-green bg-green-50',
    yellow: 'text-brand-yellow bg-amber-50',
    orange: 'text-brand-orange bg-orange-50',
    red: 'text-brand-red bg-red-50',
  }[tone];
  return (
    <Card hover className="p-4">
      <div className={`mb-2 inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${map}`}>{label}</div>
      <p className="text-3xl font-extrabold text-ink">{value}</p>
      <p className="text-xs text-muted">SKUs</p>
    </Card>
  );
}
