import {
  Package,
  AlertOctagon,
  Boxes,
  Gauge,
  TriangleAlert,
  Truck,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWarehouse } from '@/store/WarehouseContext';
import { useNav } from '@/store/nav';
import { dashboardMetrics } from '@/lib/metrics';
import { findProduct } from '@/data/products';
import { available } from '@/lib/inventory';

export function CommandCenter() {
  const { orders, products, exceptions, replenish, rebalanceZone } = useWarehouse();
  const { navigate } = useNav();
  const m = dashboardMetrics(orders, products, exceptions);

  const hero = orders.find((o) => o.id === 'ORD-204');
  const heroProduct = findProduct('SKU-102');
  const heroAvail = heroProduct ? available(heroProduct) : 0;
  const heroNeed = hero?.items[0]?.qty ?? 10;
  const heroShort = Math.max(0, heroNeed - heroAvail);

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172033] via-[#1e293b] to-[#334155] p-6 text-white sm:p-8 animate-fade-up">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="absolute -bottom-20 right-24 h-52 w-52 rounded-full bg-brand-purple/20 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-slate-300">Good day, Operations Lead</p>
          <h2 className="mt-1 max-w-2xl text-2xl font-extrabold sm:text-3xl">
            Warehouse operations, one decision ahead.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            {m.openExceptions} open exceptions and {m.criticalOrders} critical orders need attention.
            WareFlow has prepared your next moves.
          </p>
          <button
            onClick={() => navigate('decisions')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4 text-brand-purple" />
            Open Decision Center
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active Orders" value={m.activeOrders} icon={Package} tone="blue" />
        <StatCard label="Critical Orders" value={m.criticalOrders} icon={AlertOctagon} tone="red" />
        <StatCard label="At-Risk Inventory" value={m.atRiskInventory} icon={Boxes} tone="orange" />
        <StatCard label="Fulfillment Rate" value={`${m.fulfillmentRate}%`} icon={Gauge} tone="green" />
        <StatCard label="Open Exceptions" value={m.openExceptions} icon={TriangleAlert} tone="yellow" />
        <StatCard label="Ready to Dispatch" value={m.readyToDispatch} icon={Truck} tone="purple" />
      </div>

      {/* What should you do next */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50">
            <Sparkles className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-ink">What should you do next?</h3>
            <p className="text-sm text-muted">Three recommended moves, ranked by impact.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Rec 1 - Allocation */}
          <Card hover className="flex flex-col p-5 ring-1 ring-red-100">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-brand-red">
                <span className="h-2 w-2 rounded-full bg-brand-red" /> Critical
              </span>
              <span className="text-xs font-semibold text-muted">ORD-204</span>
            </div>
            <h4 className="mt-3 font-bold text-ink">Inventory shortage</h4>
            <div className="mt-3 flex items-center gap-4 rounded-xl bg-slate-50 p-3 text-center">
              <div className="flex-1">
                <p className="text-xl font-extrabold text-ink">{heroNeed}</p>
                <p className="text-[11px] font-medium text-muted">Required</p>
              </div>
              <div className="flex-1">
                <p className="text-xl font-extrabold text-brand-green">{heroAvail}</p>
                <p className="text-[11px] font-medium text-muted">Available</p>
              </div>
              <div className="flex-1">
                <p className="text-xl font-extrabold text-brand-red">{heroShort}</p>
                <p className="text-[11px] font-medium text-muted">Short</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">
              Recommended: Allocate {heroAvail} units to ORD-204.
            </p>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">
              Critical priority + premium customer + deadline in 90 minutes.
            </p>
            <button
              onClick={() => navigate('allocation', 'ORD-204')}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Review Decision <ArrowRight className="h-4 w-4" />
            </button>
          </Card>

          {/* Rec 2 - Replenish */}
          <Card hover className="flex flex-col p-5 ring-1 ring-amber-100">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-brand-yellow">
                <span className="h-2 w-2 rounded-full bg-brand-yellow" /> Warning
              </span>
              <span className="text-xs font-semibold text-muted">SKU-102</span>
            </div>
            <h4 className="mt-3 font-bold text-ink">Projected stockout</h4>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50/60 p-3">
              <Clock className="h-5 w-5 text-brand-yellow" />
              <p className="text-sm font-semibold text-ink">May stock out in ~4 hours</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">Recommended: Replenish 40 units.</p>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">
              Projected demand outpaces available stock before the next shipment window.
            </p>
            <button
              onClick={() => replenish('SKU-102', 40)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-95"
            >
              Raise Replenishment <ArrowRight className="h-4 w-4" />
            </button>
          </Card>

          {/* Rec 3 - Rebalance */}
          <Card hover className="flex flex-col p-5 ring-1 ring-orange-100">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-brand-orange">
                <span className="h-2 w-2 rounded-full bg-brand-orange" /> Operations
              </span>
              <span className="text-xs font-semibold text-muted">Zone B</span>
            </div>
            <h4 className="mt-3 font-bold text-ink">Picking bottleneck</h4>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted">Workload</span>
                <span className="text-brand-orange">87%</span>
              </div>
              <ProgressBar value={87} tone="orange" className="mt-1.5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">Recommended: Move 2 pickers to Zone B.</p>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">
              Zone B is at 87% with 18 active orders. Zone D has idle capacity.
            </p>
            <button
              onClick={() => rebalanceZone('zone-b')}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-95"
            >
              <Users className="h-4 w-4" /> Rebalance Pickers
            </button>
          </Card>
        </div>
      </section>
    </div>
  );
}
