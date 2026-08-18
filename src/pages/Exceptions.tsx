import { useMemo, useState } from 'react';
import {
  TriangleAlert,
  PackageX,
  Boxes,
  Clock3,
  PackageCheck,
  ShieldAlert,
  Check,
  ArrowRight,
  Sparkles,
  ListChecks,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ExceptionStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useWarehouse } from '@/store/WarehouseContext';
import type { Exception, ExceptionType } from '@/types';

const TYPE_ICON: Record<ExceptionType, typeof PackageX> = {
  'Missing item': PackageX,
  'Damaged item': ShieldAlert,
  'Stock shortage': Boxes,
  'Picking delay': Clock3,
  'Packing issue': PackageCheck,
  'QC failure': TriangleAlert,
};

const SEVERITY_RING: Record<Exception['severity'], string> = {
  Critical: 'ring-red-200',
  Warning: 'ring-amber-200',
  Info: 'ring-blue-200',
};

export function Exceptions() {
  const { exceptions, startException, advanceException } = useWarehouse();
  const [active, setActive] = useState<Exception | null>(null);

  const grouped = useMemo(() => {
    const open = exceptions.filter((e) => e.status !== 'Resolved');
    const resolved = exceptions.filter((e) => e.status === 'Resolved');
    return { open, resolved };
  }, [exceptions]);

  const live = active ? exceptions.find((e) => e.id === active.id) ?? active : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile label="Open" value={grouped.open.length} tone="red" />
        <Tile label="In Progress" value={grouped.open.filter((e) => e.status === 'In Progress').length} tone="blue" />
        <Tile label="Resolved" value={grouped.resolved.length} tone="green" />
        <Tile label="Critical" value={grouped.open.filter((e) => e.severity === 'Critical').length} tone="orange" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-extrabold text-ink">Open exceptions</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.open.map((e) => {
            const Icon = TYPE_ICON[e.type];
            return (
              <Card key={e.id} hover className={`p-5 ring-1 ${SEVERITY_RING[e.severity]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50">
                      <Icon className="h-5 w-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="font-bold text-ink">{e.type}</p>
                      <p className="text-xs text-muted">{e.orderId} · {e.id}</p>
                    </div>
                  </div>
                  <ExceptionStatusBadge status={e.status} />
                </div>
                <p className="mt-3 text-sm text-muted">{e.detail}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted">{e.steps.length} recommended steps</span>
                  <button
                    onClick={() => {
                      if (e.status === 'Open') startException(e.id);
                      setActive(e);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                  >
                    {e.status === 'Open' ? 'Start Resolution' : 'Continue'} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
          {grouped.open.length === 0 && (
            <Card className="p-8 text-center">
              <Check className="mx-auto h-8 w-8 text-brand-green" />
              <p className="mt-2 font-semibold text-ink">All exceptions resolved.</p>
            </Card>
          )}
        </div>
      </div>

      {grouped.resolved.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-extrabold text-ink">Recently resolved</h3>
          <Card className="divide-y divide-slate-100">
            {grouped.resolved.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <Check className="h-4 w-4 text-brand-green" />
                <span className="font-semibold text-ink">{e.type}</span>
                <span className="text-muted">· {e.orderId}</span>
                <span className="ml-auto text-xs text-muted">{e.id}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      <Modal open={!!live} onClose={() => setActive(null)} title={live ? `${live.id} · ${live.type}` : ''} wide>
        {live && (
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-2">
                <ExceptionStatusBadge status={live.status} />
                <span className="text-xs text-muted">{live.orderId}</span>
              </div>
              <p className="mt-3 text-sm text-ink">{live.detail}</p>
              <div className="mt-4 rounded-xl bg-violet-50 p-4 ring-1 ring-violet-100">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-purple">
                  <Sparkles className="h-3.5 w-3.5" /> Recommendation
                </p>
                <p className="mt-1 text-sm text-ink">
                  Follow the {live.steps.length}-step resolution path. Each step updates the order timeline.
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                <ListChecks className="h-3.5 w-3.5" /> Resolution workflow
              </p>
              <ol className="space-y-2">
                {live.steps.map((step, i) => {
                  const done = i < live.currentStep;
                  const current = i === live.currentStep && live.status !== 'Resolved';
                  return (
                    <li
                      key={i}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                        done
                          ? 'border-green-200 bg-green-50/50 text-muted'
                          : current
                          ? 'border-brand-blue bg-blue-50/50 text-ink'
                          : 'border-slate-200 bg-white text-muted'
                      }`}
                    >
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          done
                            ? 'bg-brand-green text-white'
                            : current
                            ? 'bg-brand-blue text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span className={done ? 'line-through' : ''}>{step}</span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-4 flex gap-3">
                {live.status !== 'Resolved' && (
                  <button
                    onClick={() => advanceException(live.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white hover:brightness-95"
                  >
                    {live.currentStep === 0 ? 'Start Step' : 'Complete Step'} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setActive(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone: 'red' | 'blue' | 'green' | 'orange' }) {
  const map = {
    red: 'text-brand-red bg-red-50',
    blue: 'text-brand-blue bg-blue-50',
    green: 'text-brand-green bg-green-50',
    orange: 'text-brand-orange bg-orange-50',
  }[tone];
  return (
    <Card hover className="p-4">
      <div className={`mb-2 inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${map}`}>{label}</div>
      <p className="text-3xl font-extrabold text-ink">{value}</p>
    </Card>
  );
}
