import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import type { ToastKind } from '@/types';
import { useWarehouse } from '@/store/WarehouseContext';

const CONFIG: Record<ToastKind, { icon: typeof Info; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: 'ring-green-200', iconColor: 'text-brand-green' },
  info: { icon: Info, ring: 'ring-blue-200', iconColor: 'text-brand-blue' },
  warning: { icon: AlertTriangle, ring: 'ring-amber-200', iconColor: 'text-brand-yellow' },
  error: { icon: XCircle, ring: 'ring-red-200', iconColor: 'text-brand-red' },
};

export function Toaster() {
  const { toasts, dismissToast } = useWarehouse();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((t) => {
        const c = CONFIG[t.kind];
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-4 shadow-lift ring-1 ${c.ring} animate-slide-in`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${c.iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.message && <p className="mt-0.5 text-sm text-muted">{t.message}</p>}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
