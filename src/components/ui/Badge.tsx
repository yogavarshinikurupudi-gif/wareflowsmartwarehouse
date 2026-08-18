import type { Priority, StockStatus, ExceptionStatus, OrderStage } from '@/types';

const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    Critical: 'bg-red-50 text-brand-red ring-1 ring-red-200',
    High: 'bg-orange-50 text-brand-orange ring-1 ring-orange-200',
    Medium: 'bg-amber-50 text-brand-yellow ring-1 ring-amber-200',
    Low: 'bg-slate-100 text-muted ring-1 ring-slate-200',
  };
  return <span className={`${base} ${map[priority]}`}>{priority}</span>;
}

export function StockBadge({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, string> = {
    Healthy: 'bg-green-50 text-brand-green ring-1 ring-green-200',
    Watch: 'bg-amber-50 text-brand-yellow ring-1 ring-amber-200',
    'High Risk': 'bg-orange-50 text-brand-orange ring-1 ring-orange-200',
    Stockout: 'bg-red-50 text-brand-red ring-1 ring-red-200',
  };
  return <span className={`${base} ${map[status]}`}>{status}</span>;
}

export function ExceptionStatusBadge({ status }: { status: ExceptionStatus }) {
  const map: Record<ExceptionStatus, string> = {
    Open: 'bg-red-50 text-brand-red ring-1 ring-red-200',
    'In Progress': 'bg-blue-50 text-brand-blue ring-1 ring-blue-200',
    Resolved: 'bg-green-50 text-brand-green ring-1 ring-green-200',
  };
  return <span className={`${base} ${map[status]}`}>{status}</span>;
}

export function StageBadge({ stage }: { stage: OrderStage }) {
  return (
    <span className={`${base} bg-slate-100 text-ink ring-1 ring-slate-200`}>{stage}</span>
  );
}
