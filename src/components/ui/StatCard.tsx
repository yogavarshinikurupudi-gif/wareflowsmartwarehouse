import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

type Tone = 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: Tone;
  hint?: string;
  trend?: string;
}

const TONE_STYLES: Record<Tone, { chip: string; icon: string }> = {
  blue: { chip: 'bg-blue-50', icon: 'text-brand-blue' },
  green: { chip: 'bg-green-50', icon: 'text-brand-green' },
  yellow: { chip: 'bg-amber-50', icon: 'text-brand-yellow' },
  orange: { chip: 'bg-orange-50', icon: 'text-brand-orange' },
  red: { chip: 'bg-red-50', icon: 'text-brand-red' },
  purple: { chip: 'bg-violet-50', icon: 'text-brand-purple' },
};

export function StatCard({ label, value, icon: Icon, tone, hint, trend }: StatCardProps) {
  const s = TONE_STYLES[tone];
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.chip}`}>
          <Icon className={`h-5 w-5 ${s.icon}`} />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-muted">{trend}</span>
        )}
      </div>
      <div className="mt-4 text-3xl font-extrabold tracking-tight text-ink">{value}</div>
      <div className="mt-1 text-sm font-medium text-muted">{label}</div>
      {hint && <div className="mt-2 text-xs text-slate-400">{hint}</div>}
    </Card>
  );
}
