interface BulletChartProps {
  label: string;
  value: number;
  max: number;
  target?: number;
  format?: (v: number) => string;
  status?: 'good' | 'warn' | 'neutral';
}

const statusColors = {
  good: 'bg-success',
  warn: 'bg-warning',
  neutral: 'bg-primary',
} as const;

export function BulletChart({
  label,
  value,
  max,
  target,
  format = (v) => String(Math.round(v)),
  status = 'neutral',
}: BulletChartProps) {
  const pct = Math.min((value / max) * 100, 100);
  const targetPct = target != null ? Math.min((target / max) * 100, 100) : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-text-secondary truncate">{label}</span>
        <span className="metric-value text-xs font-medium text-text-primary shrink-0">
          {format(value)}
        </span>
      </div>
      <div
        className="relative h-2 rounded-full bg-white/5 overflow-hidden"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${format(value)}`}
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${statusColors[status]} funnel-bar`}
          style={{ width: `${pct}%` }}
        />
        {targetPct != null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
            style={{ left: `${targetPct}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
