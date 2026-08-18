import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Truck,
  PackageCheck,
  Boxes,
  Send,
  Users,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWarehouse } from '@/store/WarehouseContext';
import type { Zone, ZoneStatus } from '@/types';

const STATUS_STYLE: Record<ZoneStatus, { ring: string; chip: string; bar: 'green' | 'yellow' | 'orange' | 'red' | 'blue' }> = {
  Balanced: { ring: 'ring-green-200', chip: 'bg-green-50 text-brand-green', bar: 'green' },
  Busy: { ring: 'ring-blue-200', chip: 'bg-blue-50 text-brand-blue', bar: 'blue' },
  Bottleneck: { ring: 'ring-red-200', chip: 'bg-red-50 text-brand-red', bar: 'red' },
  Idle: { ring: 'ring-slate-200', chip: 'bg-slate-100 text-muted', bar: 'yellow' },
};

const ZONE_ICON: Record<string, typeof Truck> = {
  receiving: Truck,
  'zone-a': Boxes,
  'zone-b': Boxes,
  'zone-c': Boxes,
  'zone-d': Boxes,
  packing: PackageCheck,
  qc: PackageCheck,
  dispatch: Send,
};

export function WarehouseMap() {
  const { zones, rebalanceZone } = useWarehouse();

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50">
            <Sparkles className="h-5 w-5 text-brand-orange" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-ink">Live warehouse map</h3>
            <p className="text-sm text-muted">Zones are colored by workload. Recommendations appear inline.</p>
          </div>
        </div>
      </Card>

      {/* Flow diagram */}
      <div className="grid gap-4 lg:grid-cols-8">
        {zones.map((z) => {
          const Icon = ZONE_ICON[z.id] ?? Boxes;
          const s = STATUS_STYLE[z.status];
          return (
            <Card key={z.id} className={`flex flex-col p-4 ring-1 ${s.ring}`}>
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-50">
                  <Icon className="h-4.5 w-4.5 text-brand-orange" />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.chip}`}>{z.status}</span>
              </div>
              <p className="mt-3 font-bold text-ink">{z.name}</p>
              <p className="text-xs text-muted">{z.activeOrders} orders · {z.pickers} pickers</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Workload</span>
                  <span className="font-bold text-ink">{z.workload}%</span>
                </div>
                <ProgressBar value={z.workload} tone={s.bar} className="mt-1" />
              </div>

              {z.recommendation && (
                <div className="mt-3 rounded-lg bg-red-50/60 p-2.5 text-xs">
                  <p className="font-semibold text-brand-red">Bottleneck</p>
                  <p className="mt-0.5 text-muted">{z.recommendation}</p>
                  <button
                    onClick={() => rebalanceZone(z.id)}
                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-brand-red px-2.5 py-1 text-[11px] font-bold text-white hover:brightness-95"
                  >
                    <Users className="h-3 w-3" /> Rebalance
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Flow legend */}
      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Material flow</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {['Receiving', 'Zone A–D', 'Packing', 'QC', 'Dispatch'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-ink">{step}</span>
              {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-slate-300" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Zone summary table */}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Zone</th>
              <th className="px-3 py-3">Workload</th>
              <th className="px-3 py-3">Active orders</th>
              <th className="px-3 py-3">Pickers</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.map((z) => {
              const trend =
                z.workload >= 80 ? (
                  <span className="inline-flex items-center gap-1 text-brand-red"><ArrowUpRight className="h-3.5 w-3.5" />{z.workload}%</span>
                ) : z.workload <= 30 ? (
                  <span className="inline-flex items-center gap-1 text-brand-green"><ArrowDownRight className="h-3.5 w-3.5" />{z.workload}%</span>
                ) : (
                  <span className="text-ink">{z.workload}%</span>
                );
              return (
                <tr key={z.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-ink">{z.name}</td>
                  <td className="px-3 py-3">{trend}</td>
                  <td className="px-3 py-3 text-ink">{z.activeOrders}</td>
                  <td className="px-3 py-3 text-ink">{z.pickers}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[z.status].chip}`}>
                      {z.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{z.recommendation ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
