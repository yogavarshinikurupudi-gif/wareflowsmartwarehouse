import { useState } from 'react';
import {
  ArrowDown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  SplitSquareHorizontal,
  Clock3,
  Check,
  SlidersHorizontal,
  ArrowRight,
  TriangleAlert,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useWarehouse, type AllocationStrategy } from '@/store/WarehouseContext';
import { useNav } from '@/store/nav';
import { findProduct } from '@/data/products';
import { available } from '@/lib/inventory';
import { currency, formatDeadline } from '@/lib/metrics';

interface StrategyDef {
  id: AllocationStrategy;
  title: string;
  desc: string;
  icon: typeof ShieldCheck;
  tone: 'green' | 'yellow' | 'red';
  recommended?: boolean;
}

const STRATEGIES: StrategyDef[] = [
  {
    id: 'critical-first',
    title: 'Critical-First',
    desc: 'Allocate all available units to this critical order now.',
    icon: ShieldCheck,
    tone: 'green',
    recommended: true,
  },
  {
    id: 'split',
    title: 'Split Inventory',
    desc: 'Share available inventory across competing orders.',
    icon: SplitSquareHorizontal,
    tone: 'yellow',
  },
  {
    id: 'wait',
    title: 'Wait for Replenishment',
    desc: 'Hold the order until incoming stock arrives.',
    icon: Clock3,
    tone: 'red',
  },
];

const TONE_CLASSES = {
  green: { ring: 'ring-green-300', chip: 'bg-green-50 text-brand-green', dot: 'bg-brand-green' },
  yellow: { ring: 'ring-amber-300', chip: 'bg-amber-50 text-brand-yellow', dot: 'bg-brand-yellow' },
  red: { ring: 'ring-red-300', chip: 'bg-red-50 text-brand-red', dot: 'bg-brand-red' },
};

export function SmartAllocation() {
  const { orders, approveAllocation } = useWarehouse();
  const { focusOrder, navigate } = useNav();

  const order = orders.find((o) => o.id === (focusOrder ?? 'ORD-204')) ?? orders.find((o) => o.id === 'ORD-204');
  const [selected, setSelected] = useState<AllocationStrategy>('critical-first');
  const [overrideOpen, setOverrideOpen] = useState(false);

  if (!order) return null;

  const product = order.items[0] ? findProduct(order.items[0].sku) : undefined;
  const need = order.items[0]?.qty ?? 0;
  const avail = product ? available(product) : 0;
  const short = Math.max(0, need - avail);
  const resolved = order.stage !== 'Inventory' && order.stage !== 'Allocation';

  if (resolved) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden p-8 text-center animate-scale-in">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-brand-green" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-ink">Decision applied</h2>
          <p className="mt-2 text-sm text-muted">
            {order.id} has been allocated and moved to <span className="font-semibold text-ink">{order.stage}</span>.
            Inventory and dashboard metrics were updated automatically.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('pickpack', order.id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
            >
              Assign a Picker <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('orders')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-slate-200"
            >
              View Order Timeline
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const handleApprove = (strategy: AllocationStrategy) => {
    approveAllocation(order.id, strategy);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Left: situation */}
      <div className="space-y-6 lg:col-span-2">
        <Card className="p-6 ring-1 ring-red-100">
          <div className="flex items-center justify-between">
            <PriorityBadge priority={order.priority} />
            <span className="text-xs font-semibold text-muted">{order.id}</span>
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-ink">{order.customer}</h2>
          <p className="text-sm text-muted">{order.tier} customer · {currency(order.value)}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-muted">Deadline</p>
              <p className="text-lg font-extrabold text-brand-red">{formatDeadline(order.deadlineMins)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-muted">Priority score</p>
              <p className="text-lg font-extrabold text-ink">{order.priorityScore}</p>
            </div>
          </div>

          {/* Flow */}
          <div className="mt-6 space-y-2">
            <FlowRow value={need} label="Required" tone="blue" />
            <ArrowStep />
            <FlowRow value={avail} label="Available" tone="green" />
            <ArrowStep />
            <FlowRow value={short} label="Short" tone="red" />
          </div>
        </Card>
      </div>

      {/* Right: decision */}
      <div className="space-y-5 lg:col-span-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50">
            <Sparkles className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-ink">What should we do?</h3>
            <p className="text-sm text-muted">Pick a strategy. WareFlow has ranked them for you.</p>
          </div>
        </div>

        <div className="space-y-3">
          {STRATEGIES.map((s) => {
            const t = TONE_CLASSES[s.tone];
            const Icon = s.icon;
            const active = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-card ring-2 transition-all hover:-translate-y-0.5 ${
                  active ? t.ring : 'ring-transparent'
                }`}
              >
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${t.chip}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-ink">{s.title}</p>
                    {s.recommended && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-brand-purple">
                        <Sparkles className="h-3 w-3" /> Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted">{s.desc}</p>
                </div>
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                    active ? `border-transparent ${t.dot} text-white` : 'border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="h-4 w-4" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Why / impact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-purple">Why this?</p>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {['Critical priority', 'Premium customer', 'Closest deadline', 'Scarce inventory'].map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-violet-100">
                    <Check className="h-3 w-3 text-brand-purple" />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Expected impact</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                Protects urgent shipment for a premium customer.
              </li>
              <li className="flex items-start gap-2 text-ink">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
                A lower-priority order may be delayed by ~1 cycle.
              </li>
            </ul>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => handleApprove(selected)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01]"
          >
            <CheckCircle2 className="h-5 w-5" /> Approve Decision
          </button>
          <button
            onClick={() => setSelected(selected === 'critical-first' ? 'split' : 'critical-first')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
          >
            <SplitSquareHorizontal className="h-5 w-5 text-brand-yellow" /> Choose Alternative
          </button>
          <button
            onClick={() => setOverrideOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-5 w-5 text-brand-blue" /> Override
          </button>
        </div>
      </div>

      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title="Manual override">
        <p className="text-sm text-muted">
          You are overriding WareFlow's recommendation for {order.id}. This will allocate the available
          {' '}{avail} units and release the order to picking.
        </p>
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-brand-yellow ring-1 ring-amber-200">
          <TriangleAlert className="mb-1 inline h-4 w-4" /> Overrides are logged to the order timeline for audit.
        </div>
        <button
          onClick={() => {
            setOverrideOpen(false);
            handleApprove('critical-first');
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-blue-600"
        >
          Confirm Override
        </button>
      </Modal>
    </div>
  );
}

function FlowRow({ value, label, tone }: { value: number; label: string; tone: 'blue' | 'green' | 'red' }) {
  const map = {
    blue: 'bg-blue-50 text-brand-blue ring-blue-200',
    green: 'bg-green-50 text-brand-green ring-green-200',
    red: 'bg-red-50 text-brand-red ring-red-200',
  }[tone];
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 ring-1 ${map}`}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-2xl font-extrabold">{value}</span>
    </div>
  );
}

function ArrowStep() {
  return (
    <div className="flex justify-center">
      <ArrowDown className="h-4 w-4 text-slate-300" />
    </div>
  );
}
