import { Check } from 'lucide-react';
import type { Order } from '@/types';
import { STAGE_ORDER } from '@/types';

export function OrderTimeline({ order }: { order: Order }) {
  const currentIdx = STAGE_ORDER.indexOf(order.stage);

  return (
    <ol className="relative ml-2 space-y-4 border-l-2 border-slate-100 pl-6">
      {STAGE_ORDER.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const event = [...order.timeline].reverse().find((e) => e.stage === stage);
        return (
          <li key={stage} className="relative">
            <span
              className={`absolute -left-[31px] grid h-5 w-5 place-items-center rounded-full ring-4 ring-white ${
                done
                  ? 'bg-brand-green text-white'
                  : active
                  ? 'bg-brand-blue text-white animate-pulse-ring'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${active ? 'text-brand-blue' : done ? 'text-ink' : 'text-slate-400'}`}>
                {stage}
              </p>
              {event && <span className="text-xs text-muted">{event.time}</span>}
            </div>
            {event?.label && <p className="text-xs text-muted">{event.label}</p>}
          </li>
        );
      })}
    </ol>
  );
}
