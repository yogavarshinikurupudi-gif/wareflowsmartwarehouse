interface ProgressBarProps {
  value: number;
  tone?: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';
  className?: string;
}

const TONES: Record<string, string> = {
  blue: 'bg-brand-blue',
  green: 'bg-brand-green',
  yellow: 'bg-brand-yellow',
  orange: 'bg-brand-orange',
  red: 'bg-brand-red',
  purple: 'bg-brand-purple',
};

export function ProgressBar({ value, tone = 'blue', className = '' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className={`h-full rounded-full ${TONES[tone]} transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
