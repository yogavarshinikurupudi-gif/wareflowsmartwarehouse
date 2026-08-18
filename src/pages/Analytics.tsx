import { useMemo } from 'react';
import { TrendingUp, Lightbulb, Activity, Boxes, TriangleAlert, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWarehouse } from '@/store/WarehouseContext';
import { dashboardMetrics } from '@/lib/metrics';
import { stockStatus, stockoutRisk } from '@/lib/inventory';

export function Analytics() {
  const { orders, products, zones, exceptions } = useWarehouse();
  const m = dashboardMetrics(orders, products, exceptions);

  const ordersByHour = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, i) => ({ hour: `${i * 2 + 6}:00`, count: 0 }));
    orders.forEach((o) => {
      const ev = o.timeline[0];
      if (!ev) return;
      const h = parseInt(ev.time.split(':')[0], 10);
      const idx = Math.floor((h - 6) / 2);
      if (idx >= 0 && idx < buckets.length) buckets[idx].count += 1;
    });
    return buckets;
  }, [orders]);

  const maxHour = Math.max(...ordersByHour.map((b) => b.count), 1);

  const zonePerf = useMemo(
    () => zones.map((z) => ({ name: z.name, workload: z.workload, orders: z.activeOrders })).sort((a, b) => b.workload - a.workload),
    [zones]
  );

  const riskBuckets = useMemo(() => {
    const b = { Healthy: 0, Watch: 0, 'High Risk': 0, Stockout: 0 };
    products.forEach((p) => (b[stockStatus(p)] += 1));
    return b;
  }, [products]);

  const exceptionTrend = useMemo(() => {
    return exceptions.slice(0, 8).map((e) => e.type);
  }, [exceptions]);

  return (
    <div className="space-y-6">
      {/* Insight banner */}
      <Card className="overflow-hidden ring-1 ring-violet-100">
        <div className="flex items-start gap-3 bg-gradient-to-br from-violet-50 to-blue-50 p-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
            <Lightbulb className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-purple">Key insight</p>
            <p className="mt-0.5 text-lg font-extrabold text-ink">Zone B is currently the biggest bottleneck.</p>
            <p className="text-sm text-muted">Rebalancing 2 pickers from Zone D would lift throughput by ~18%.</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Fulfillment rate */}
        <Card className="p-5">
          <ChartHeader icon={Gauge} title="Fulfillment rate" tone="green" />
          <div className="mt-4 flex items-center gap-6">
            <Donut value={m.fulfillmentRate} tone="green" />
            <div className="flex-1 space-y-2 text-sm">
              <Row label="Fulfillable" value={`${orders.length - (orders.length - Math.round((m.fulfillmentRate / 100) * orders.length))}`} tone="green" />
              <Row label="At risk" value={String(orders.length - Math.round((m.fulfillmentRate / 100) * orders.length))} tone="red" />
              <Row label="Total orders" value={String(orders.length)} />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">
            <TrendingUp className="mr-1 inline h-3.5 w-3.5 text-brand-green" />
            Fulfillment is healthy. Critical orders are the main risk.
          </p>
        </Card>

        {/* Orders by hour */}
        <Card className="p-5">
          <ChartHeader icon={Activity} title="Orders by hour" tone="blue" />
          <div className="mt-5 flex h-40 items-end gap-2">
            {ordersByHour.map((b) => (
              <div key={b.hour} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-brand-blue/80 transition-all hover:bg-brand-blue"
                  style={{ height: `${(b.count / maxHour) * 100}%`, minHeight: '4px' }}
                  title={`${b.count} orders`}
                />
                <span className="text-[10px] text-muted">{b.hour}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Peak window: mid-morning. Staff accordingly.</p>
        </Card>

        {/* Picking workload */}
        <Card className="p-5">
          <ChartHeader icon={Boxes} title="Picking workload by zone" tone="orange" />
          <div className="mt-4 space-y-3">
            {zonePerf.map((z) => (
              <div key={z.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{z.name}</span>
                  <span className="text-muted">{z.workload}% · {z.orders} orders</span>
                </div>
                <ProgressBar
                  value={z.workload}
                  tone={z.workload >= 80 ? 'red' : z.workload >= 60 ? 'orange' : 'green'}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Inventory risk */}
        <Card className="p-5">
          <ChartHeader icon={Boxes} title="Inventory risk distribution" tone="yellow" />
          <div className="mt-5 flex h-40 items-end gap-3">
            {Object.entries(riskBuckets).map(([label, count]) => {
              const tone = label === 'Healthy' ? 'bg-brand-green' : label === 'Watch' ? 'bg-brand-yellow' : label === 'High Risk' ? 'bg-brand-orange' : 'bg-brand-red';
              const max = Math.max(...Object.values(riskBuckets), 1);
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold text-ink">{count}</span>
                  <div
                    className={`w-full rounded-t-md ${tone}`}
                    style={{ height: `${(count / max) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] text-center text-muted">{label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Watch and High-Risk SKUs should be replenished before the next cycle.</p>
        </Card>

        {/* Exception trends */}
        <Card className="p-5">
          <ChartHeader icon={TriangleAlert} title="Exception trends" tone="red" />
          <div className="mt-4 space-y-2">
            {Object.entries(
              exceptionTrend.reduce<Record<string, number>>((acc, t) => {
                acc[t] = (acc[t] ?? 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const max = Math.max(...Object.values(exceptionTrend.reduce<Record<string, number>>((a, t) => { a[t] = (a[t] ?? 0) + 1; return a; }, {})), 1);
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm text-ink">{type}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-red" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs font-semibold text-muted">{count}</span>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Zone performance summary */}
        <Card className="p-5">
          <ChartHeader icon={Gauge} title="Zone performance" tone="purple" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {zonePerf.map((z) => (
              <div key={z.name} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-bold text-ink">{z.name}</p>
                <p className="text-xs text-muted">{z.orders} active orders</p>
                <ProgressBar
                  value={z.workload}
                  tone={z.workload >= 80 ? 'red' : z.workload >= 60 ? 'orange' : 'blue'}
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChartHeader({ icon: Icon, title, tone }: { icon: typeof Activity; title: string; tone: 'green' | 'blue' | 'orange' | 'yellow' | 'red' | 'purple' }) {
  const map = {
    green: 'bg-green-50 text-brand-green',
    blue: 'bg-blue-50 text-brand-blue',
    orange: 'bg-orange-50 text-brand-orange',
    yellow: 'bg-amber-50 text-brand-yellow',
    red: 'bg-red-50 text-brand-red',
    purple: 'bg-violet-50 text-brand-purple',
  }[tone];
  return (
    <div className="flex items-center gap-2">
      <div className={`grid h-8 w-8 place-items-center rounded-lg ${map}`}>
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-bold text-ink">{title}</h3>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'green' | 'red' }) {
  const color = tone === 'green' ? 'text-brand-green' : tone === 'red' ? 'text-brand-red' : 'text-ink';
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function Donut({ value, tone }: { value: number; tone: 'green' }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#22C55E"
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-2xl font-extrabold text-ink">{value}%</p>
          <p className="text-[10px] text-muted">fulfillable</p>
        </div>
      </div>
    </div>
  );
}
