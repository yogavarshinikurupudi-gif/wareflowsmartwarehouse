import { useMemo, useState } from 'react';
import { Search, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PriorityBadge, StageBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { OrderTimeline } from '@/components/OrderTimeline';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWarehouse } from '@/store/WarehouseContext';
import { useNav } from '@/store/nav';
import { currency, formatDeadline } from '@/lib/metrics';
import type { Order, Priority } from '@/types';

const FILTERS: Array<Priority | 'All'> = ['All', 'Critical', 'High', 'Medium', 'Low'];

export function Orders() {
  const { orders } = useWarehouse();
  const { navigate } = useNav();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Priority | 'All'>('All');
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return orders
      .filter((o) => (filter === 'All' ? true : o.priority === filter))
      .filter(
        (o) =>
          o.id.toLowerCase().includes(query.toLowerCase()) ||
          o.customer.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [orders, filter, query]);

  const live = selected ? orders.find((o) => o.id === selected.id) ?? selected : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order or customer"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-brand-blue/30"
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

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-12 gap-4 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
          <div className="col-span-2">Order</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Deadline</div>
          <div className="col-span-2">Stage</div>
          <div className="col-span-1 text-right">Value</div>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className="grid w-full grid-cols-2 items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 lg:grid-cols-12 lg:gap-4"
            >
              <div className="col-span-1 lg:col-span-2">
                <p className="flex items-center gap-1.5 font-bold text-ink">
                  {o.id}
                  {o.flagged && <span className="h-2 w-2 rounded-full bg-brand-red" />}
                </p>
                <p className="text-xs text-muted">Score {o.priorityScore}</p>
              </div>
              <div className="col-span-1 lg:col-span-3">
                <p className="truncate text-sm font-medium text-ink">{o.customer}</p>
                <p className="text-xs text-muted">{o.tier} · {o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
              </div>
              <div className="col-span-1 lg:col-span-2">
                <PriorityBadge priority={o.priority} />
              </div>
              <div className="col-span-1 lg:col-span-2">
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${o.deadlineMins < 90 ? 'text-brand-red' : 'text-muted'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  {formatDeadline(o.deadlineMins)}
                </span>
              </div>
              <div className="col-span-1 lg:col-span-2">
                <StageBadge stage={o.stage} />
              </div>
              <div className="col-span-1 text-right lg:col-span-1">
                <p className="text-sm font-bold text-ink">{currency(o.value)}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted">No orders match your search.</p>
          )}
        </div>
      </Card>

      <Modal open={!!live} onClose={() => setSelected(null)} title={live?.id} wide>
        {live && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={live.priority} />
                <StageBadge stage={live.stage} />
                {live.flagged && (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-brand-red ring-1 ring-red-200">
                    Flagged
                  </span>
                )}
              </div>
              <h4 className="mt-3 text-xl font-extrabold text-ink">{live.customer}</h4>
              <p className="text-sm text-muted">{live.tier} customer</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="Order value" value={currency(live.value)} />
                <MiniStat label="Priority score" value={String(live.priorityScore)} />
                <MiniStat label="Deadline" value={formatDeadline(live.deadlineMins)} />
                <MiniStat label="Items" value={String(live.items.length)} />
              </div>

              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Priority score</p>
                <ProgressBar
                  value={live.priorityScore}
                  tone={live.priorityScore >= 90 ? 'red' : live.priorityScore >= 70 ? 'orange' : 'blue'}
                />
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Items</p>
                <div className="space-y-2">
                  {live.items.map((it) => (
                    <div key={it.sku} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-ink">{it.name}</span>
                      <span className="text-muted">{it.sku} · x{it.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {live.id === 'ORD-204' && live.stage === 'Inventory' && (
                <button
                  onClick={() => {
                    setSelected(null);
                    navigate('allocation', 'ORD-204');
                  }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-95"
                >
                  <Sparkles className="h-4 w-4" /> Resolve in Smart Allocation <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Fulfillment timeline</p>
              <OrderTimeline order={live} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-lg font-extrabold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
