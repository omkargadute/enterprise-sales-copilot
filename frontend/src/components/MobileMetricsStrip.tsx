import type { CallMetrics } from '../lib/callAnalytics';

interface MobileMetricsStripProps {
  metrics: CallMetrics;
  isLive: boolean;
}

export function MobileMetricsStrip({ metrics, isLive }: MobileMetricsStripProps) {
  const confidencePct =
    metrics.avgConfidence != null ? Math.round(metrics.avgConfidence * 100) : null;

  return (
    <div className="xl:hidden glass-subtle border-b border-border px-4 py-2 shrink-0 overflow-x-auto scrollbar-thin">
      <div className="flex items-center gap-4 min-w-max text-xs">
        {isLive && (
          <span className="flex items-center gap-1.5 text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-blink" aria-hidden="true" />
            Live
          </span>
        )}
        <MetricPill label="Response" value={metrics.questionsDetected > 0 ? `${metrics.avgResponseSec.toFixed(1)}s` : '—'} />
        <MetricPill label="Questions" value={String(metrics.questionsDetected)} />
        <MetricPill label="Confidence" value={confidencePct != null ? `${confidencePct}%` : '—'} />
        <MetricPill label="Lines" value={String(metrics.transcriptLines)} />
        {metrics.repTalkRatio != null && (
          <MetricPill
            label="Rep talk"
            value={`${Math.round(metrics.repTalkRatio * 100)}%`}
          />
        )}
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted">{label}</span>
      <span className="metric-value font-semibold text-text-primary">{value}</span>
    </div>
  );
}
