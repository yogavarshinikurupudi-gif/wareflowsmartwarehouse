import { useMemo, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  SplitSquareHorizontal,
  Clock3,
  ArrowRight,
  TriangleAlert,
  Users,
  PackagePlus,
  Gavel,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useWarehouse, type AllocationStrategy } from '@/store/WarehouseContext';
import { useNav } from '@/store/nav';
import { findProduct } from '@/data/products';
import { available } from '@/lib/inventory';
import { formatDeadline } from '@/lib/metrics';

interface DecisionOption {
  id: AllocationStrategy;
  label: string;
  icon: typeof ShieldCheck;
  tone: 'green' | 'yellow' | 'red';
  recommended?: boolean;
}

const OPTIONS: DecisionOption[] = [
  { id: 'critical-first', label: 'Allocate 7 to ORD-204', icon: ShieldCheck, tone: 'green', recommended: true },
  { id: 'split', label: 'Split inventory across orders', icon: SplitSquareHorizontal, tone: 'yellow' },
  { id: 'wait', label: 'Wait for replenishment', icon: Clock3, tone: 'red' },
];

const TONE = {
  green: { chip: 'bg-green-50 text-brand-green', ring: 'ring-green-200' },
  yellow: { chip: 'bg-amber-50 text-brand-yellow', ring: 'ring-amber-200' },
  red: { chip: 'bg-red-50 text-brand-red', ring: 'ring-red-200' },
};

export function DecisionCenter() {
  const { orders, products, zones, exceptions, approveAllocation, replenish, rebalanceZone } = useWarehouse();
  const { navigate } = useNav();
  const [override, setOverride] = useState(false);

  const allocationDecision = useMemo(() => {
    const order = orders.find((o) => o.id === 'ORD-204');
    if (!order) return null;
    const product = order.items[0] ? findProduct(order.items[0].sku) : undefined;
    const need = order.items[0]?.qty ?? 0;
    const avail = product ? available(product) : 0;
    return { order, product, need, avail, short: Math.max(0, need - avail) };
  }, [orders]);

  const zoneDecision = useMemo(() => zones.find((z) => z.id === 'zone-b'), [zones]);
  const replenishDecision = useMemo(() => products.find((p) => p.sku === 'SKU-102'), [products]);

  const pendingExceptions = exceptions.filter((e) => e.status === 'Open' && e.severity === 'Critical');

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 bg-gradient-to-br from-violet-50 to-blue-50 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm">
            <Gavel className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-ink">Decision Center</h2>
            <p className="text-sm text-muted">Every recommendation here needs your approval before it runs.</p>
          </div>
        </div>
      </Card>

      {/* Allocation decision */}
      {allocationDecision && (
        <Card className="p-6 ring-1 ring-red-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={allocationDecision.order.priority} />
                <span className="text-xs font-semibold text-muted">Inventory conflict</span>
              </div>
              <h3 className="mt-2 text-lg font-extrabold text-ink">{allocationDecision.order.id} · {allocationDecision.order.customer}</h3>
              <p className="text-sm text-muted">
                {allocationDecision.need} required · {allocationDecision.avail} available · {allocationDecision.short} short · {formatDeadline(allocationDecision.order.deadlineMins)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-brand-purple">
              <Sparkles className="h-3.5 w-3.5" /> Recommended: Critical-First
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {OPTIONS.map((o) => {
              const t = TONE[o.tone];
              const Icon = o.icon;
              return (
                <button
                  key={o.id}
                  onClick={() => {
                    if (o.id === 'wait') {
                      approveAllocation(allocationDecision.order.id, 'wait');
                    } else {
                      approveAllocation(allocationDecision.order.id, o.id);
                    }
                  }}
                  className={`flex items-center gap-3 rounded-xl bg-white p-3 text-left ring-1 ${t.ring} transition-transform hover:-translate-y-0.5`}
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-lg ${t.chip}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{o.label}</p>
                    {o.recommended && <p className="text-[11px] font-semibold text-brand-purple">Recommended</p>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-purple">Reason</p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink">
                <li>• Critical priority (score {allocationDecision.order.priorityScore})</li>
                <li>• Premium customer</li>
                <li>• Closest deadline</li>
                <li>• Scarce inventory</li>
              </ul>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Expected impact</p>
              <p className="mt-2 flex items-start gap-2 text-sm text-ink">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                Protects the urgent shipment for a premium customer.
              </p>
              <p className="mt-1.5 flex items-start gap-2 text-sm text-ink">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
                A lower-priority order may be delayed by one cycle.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => approveAllocation(allocationDecision.order.id, 'critical-first')}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:brightness-95"
            >
              <CheckCircle2 className="h-5 w-5" /> Approve
            </button>
            <button
              onClick={() => approveAllocation(allocationDecision.order.id, 'split')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <SplitSquareHorizontal className="h-5 w-5 text-brand-yellow" /> Alternative
            </button>
            <button
              onClick={() => setOverride(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Override
            </button>
          </div>
        </Card>
      )}

      {/* Replenishment decision */}
      {replenishDecision && (
        <Card className="p-6 ring-1 ring-amber-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-brand-yellow">
                <TriangleAlert className="h-3.5 w-3.5" /> Projected stockout
              </span>
              <h3 className="mt-2 text-lg font-extrabold text-ink">Replenish {replenishDecision.sku}</h3>
              <p className="text-sm text-muted">{replenishDecision.name} · may stock out in ~4 hours</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-brand-purple">
              <Sparkles className="h-3.5 w-3.5" /> Replenish 40 units
            </span>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-ink">
            <p className="font-semibold">Reason</p>
            <p className="mt-1 text-muted">Projected demand outpaces available stock before the next shipment window.</p>
          </div>
          <button
            onClick={() => replenish(replenishDecision.sku, 40)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-yellow px-5 py-2.5 text-sm font-bold text-white hover:brightness-95"
          >
            <PackagePlus className="h-4 w-4" /> Approve Replenishment
          </button>
        </Card>
      )}

      {/* Zone rebalance decision */}
      {zoneDecision && zoneDecision.recommendation && (
        <Card className="p-6 ring-1 ring-orange-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-brand-orange">
                Bottleneck
              </span>
              <h3 className="mt-2 text-lg font-extrabold text-ink">Rebalance {zoneDecision.name}</h3>
              <p className="text-sm text-muted">{zoneDecision.workload}% workload · {zoneDecision.activeOrders} orders · {zoneDecision.pickers} pickers</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-brand-purple">
              <Sparkles className="h-3.5 w-3.5" /> Move 2 pickers
            </span>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-ink">
            <p className="font-semibold">Reason</p>
            <p className="mt-1 text-muted">Zone D has idle capacity. Rebalancing protects the 90-minute deadline on ORD-204.</p>
          </div>
          <button
            onClick={() => rebalanceZone(zoneDecision.id)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-bold text-white hover:brightness-95"
          >
            <Users className="h-4 w-4" /> Approve Rebalance
          </button>
        </Card>
      )}

      {/* Critical exceptions needing decisions */}
      {pendingExceptions.length > 0 && (
        <Card className="p-6 ring-1 ring-red-100">
          <h3 className="text-lg font-extrabold text-ink">Critical exceptions awaiting resolution</h3>
          <p className="text-sm text-muted">Each exception has a recommended resolution path.</p>
          <div className="mt-4 space-y-3">
            {pendingExceptions.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{e.type} · {e.orderId}</p>
                  <p className="text-xs text-muted">{e.detail}</p>
                </div>
                <button
                  onClick={() => navigate('exceptions')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-3.5 py-2 text-sm font-semibold text-white hover:brightness-95"
                >
                  Resolve <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={override} onClose={() => setOverride(false)} title="Override decision">
        <p className="text-sm text-muted">
          Overriding will allocate all available units to ORD-204 and release it to picking, bypassing the ranked recommendation.
        </p>
        <button
          onClick={() => {
            setOverride(false);
            if (allocationDecision) approveAllocation(allocationDecision.order.id, 'critical-first');
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-blue-600"
        >
          Confirm Override
        </button>
      </Modal>
    </div>
  );
}
