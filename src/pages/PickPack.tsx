import { useMemo } from 'react';
import { UserCheck, MapPin, Activity, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StageBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWarehouse } from '@/store/WarehouseContext';
import { useNav } from '@/store/nav';

export function PickPack() {
  const { workers, orders, assignPicker } = useWarehouse();
  const { focusOrder, navigate } = useNav();

  const pickableOrders = useMemo(
    () => orders.filter((o) => o.stage === 'Picking' || o.stage === 'Allocation' || o.stage === 'Inventory'),
    [orders]
  );

  const bestPicker = useMemo(() => {
    return [...workers]
      .filter((w) => w.available)
      .sort((a, b) => {
        const score = (w: typeof a) => w.performance - w.assignedItems * 3;
        return score(b) - score(a);
      })[0];
  }, [workers]);

  const focus = focusOrder ? orders.find((o) => o.id === focusOrder) : undefined;

  return (
    <div className="space-y-6">
      {/* Best picker recommendation */}
      {bestPicker && (
        <Card className="overflow-hidden ring-1 ring-orange-100">
          <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brand-orange ring-1 ring-orange-200">
                <Sparkles className="h-3.5 w-3.5" /> Best picker recommendation
              </div>
              <h3 className="mt-3 text-2xl font-extrabold text-ink">{bestPicker.name}</h3>
              <p className="mt-1 text-sm text-muted">
                Closest to {bestPicker.zone} · Low workload · Available now
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Stat label="Performance" value={`${bestPicker.performance}%`} />
                <Stat label="Active items" value={String(bestPicker.assignedItems)} />
                <Stat label="Zone" value={bestPicker.zone} />
              </div>
              {focus && (
                <button
                  onClick={() => assignPicker(focus.id, bestPicker.id)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  <UserCheck className="h-4 w-4" /> Assign to {focus.id} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Why {bestPicker.name}?</p>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-orange" /> Already stationed in {bestPicker.zone}
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-brand-green" /> Only {bestPicker.assignedItems} active items
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" /> {bestPicker.performance}% pick accuracy
                </li>
              </ul>
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-muted">
                Assigning this picker keeps Zone B workload balanced and protects the 90-minute deadline on the critical order.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Workers */}
      <div>
        <h3 className="mb-3 text-lg font-extrabold text-ink">Warehouse workers</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {workers.map((w) => (
            <Card key={w.id} hover className="p-4">
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-ink">
                  {w.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    w.available ? 'bg-green-50 text-brand-green' : 'bg-slate-100 text-muted'
                  }`}
                >
                  {w.available ? 'Available' : 'Busy'}
                </span>
              </div>
              <p className="mt-3 font-bold text-ink">{w.name}</p>
              <p className="text-xs text-muted">{w.zone}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Performance</span>
                  <span className="font-semibold text-ink">{w.performance}%</span>
                </div>
                <ProgressBar
                  value={w.performance}
                  tone={w.performance >= 90 ? 'green' : w.performance >= 80 ? 'blue' : 'yellow'}
                  className="mt-1"
                />
              </div>
              <p className="mt-2 text-xs text-muted">{w.assignedItems} active items</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Orders ready to pick */}
      <div>
        <h3 className="mb-3 text-lg font-extrabold text-ink">Orders ready to pick</h3>
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {pickableOrders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{o.id} · {o.customer}</p>
                  <p className="text-xs text-muted">{o.items.length} item{o.items.length > 1 ? 's' : ''} · {o.stage}</p>
                </div>
                <StageBadge stage={o.stage} />
                {o.assignedPicker ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-brand-green">
                    <UserCheck className="h-3.5 w-3.5" /> {o.assignedPicker}
                  </span>
                ) : bestPicker ? (
                  <button
                    onClick={() => assignPicker(o.id, bestPicker.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Assign {bestPicker.name.split(' ')[0]}
                  </button>
                ) : null}
                <button
                  onClick={() => navigate('orders', o.id)}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  View
                </button>
              </div>
            ))}
            {pickableOrders.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted">No orders waiting for picking.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 px-3 py-2 ring-1 ring-orange-100">
      <p className="text-base font-extrabold text-ink">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
